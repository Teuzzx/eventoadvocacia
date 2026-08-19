// ============================================================
// create-payment — Cria o pagamento PIX no Mercado Pago
// Usa a API de ORDERS (/v1/orders) — contas novas do MP (2026+)
// só aceitam essa API; o endpoint antigo /v1/payments retorna
// 403 PA_UNAUTHORIZED_RESULT_FROM_POLICIES.
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

    // 2. Cria o pagamento PIX no Mercado Pago (API de Orders)
    // Dados completos do pagador (nome + CPF/CNPJ) aumentam a aprovação
    const payer: Record<string, unknown> = { email }
    const nomePartes = String(nome || '').trim().split(/\s+/)
    if (nomePartes.length) {
      payer.first_name = nomePartes[0]
      payer.last_name = nomePartes.slice(1).join(' ') || ' '
    }
    const docDigits = String(oab_cpf || '').replace(/\D/g, '')
    if (docDigits.length === 11) {
      payer.identification = { type: 'CPF', number: docDigits }
    } else if (docDigits.length === 14) {
      payer.identification = { type: 'CNPJ', number: docDigits }
    }

    const valorFormatado = Number(valor).toFixed(2)

    const orderResponse = await fetch('https://api.mercadopago.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': String(inscricao.id),
      },
      body: JSON.stringify({
        type: 'online',
        external_reference: inscricao.id,
        total_amount: valorFormatado,
        payer,
        transactions: {
          payments: [{
            amount: valorFormatado,
            payment_method: { id: 'pix', type: 'bank_transfer' },
          }],
        },
      }),
    })

    const order = await orderResponse.json()

    if (!orderResponse.ok || !order.id) {
      throw new Error(`Mercado Pago: ${JSON.stringify(order)}`)
    }

    const paymentInfo = order.transactions?.payments?.[0] || {}
    const paymentMethod = paymentInfo.payment_method || {}
    const transactionData = paymentInfo.transaction_data || {}

    // 3. Guarda o id da order na inscrição (o webhook recebe o id da order)
    await supabase
      .from('inscricoes')
      .update({ mp_payment_id: String(order.id) })
      .eq('id', inscricao.id)

    return new Response(
      JSON.stringify({
        inscricao_id: inscricao.id,
        payment_id: paymentInfo.id || order.id,
        order_id: order.id,
        qr_code: paymentMethod.qr_code || transactionData.qr_code || '',
        qr_base64: paymentMethod.qr_code_base64 || transactionData.qr_code_base64 || '',
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
