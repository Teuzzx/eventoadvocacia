// ============================================================
// create-payment — Cria o pagamento PIX no Mercado Pago
// Chamada pelo site de inscrições (fetch POST com JSON)
// ============================================================
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (!MP_ACCESS_TOKEN) {
    return new Response(
      JSON.stringify({ error: 'Mercado Pago não configurado (falta MP_ACCESS_TOKEN)' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const { nome, email, whatsapp, oab_cpf, valor, tipo_inscricao, cupom, desconto, inscricao_id } = await req.json()

    if (!nome || !email || !valor || valor <= 0) {
      return new Response(JSON.stringify({ error: 'Dados inválidos' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 1. Reaproveita a inscrição já criada pelo site (evita duplicar).
    //    Se não vier id válido, cria a inscrição aqui mesmo (status: pendente).
    let inscricao = null

    if (inscricao_id) {
      const { data: existente } = await supabase
        .from('inscricoes')
        .select('id')
        .eq('id', inscricao_id)
        .maybeSingle()

      if (existente) inscricao = existente
    }

    if (!inscricao) {
      const { data: criada, error: insertError } = await supabase
        .from('inscricoes')
        .insert({
          nome,
          email,
          whatsapp: whatsapp || '',
          oab_cpf: oab_cpf || '',
          tipo_inscricao: tipo_inscricao || 'Inscrição Normal',
          valor_pago: valor,
          cupom_utilizado: cupom || null,
          desconto_aplicado: desconto || 'Nenhum',
        })
        .select('id')
        .single()

      if (insertError) throw insertError
      inscricao = criada
    }

    // 2. Cria o pagamento PIX no Mercado Pago
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction_amount: Number(valor),
        description: `Inscrição Workshop Previdenciário - ${nome}`,
        payment_method_id: 'pix',
        payer: { email },
        external_reference: inscricao.id,
        notification_url: `${SUPABASE_URL}/functions/v1/webhook-pagamento`,
      }),
    })

    const payment = await mpResponse.json()

    if (!mpResponse.ok || !payment.id) {
      throw new Error(`Mercado Pago: ${JSON.stringify(payment)}`)
    }

    // 3. Guarda o id do pagamento na inscrição
    await supabase
      .from('inscricoes')
      .update({ mp_payment_id: String(payment.id) })
      .eq('id', inscricao.id)

    const transactionData = payment.point_of_interaction?.transaction_data || {}

    return new Response(
      JSON.stringify({
        inscricao_id: inscricao.id,
        payment_id: payment.id,
        qr_code: transactionData.qr_code || '',
        qr_base64: transactionData.qr_code_base64 || '',
        valor: Number(valor),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('create-payment error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
