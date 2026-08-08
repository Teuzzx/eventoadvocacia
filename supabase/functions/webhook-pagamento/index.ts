// ============================================================
// webhook-pagamento — Recebe a notificação do Mercado Pago
// Quando o PIX é pago, marca a inscrição como 'pago'
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

  try {
    // Mercado Pago envia algo como { "action": "payment.created", "data": { "id": 123 } }
    const body = await req.json()
    const paymentId = body?.data?.id

    if (!paymentId) {
      return new Response('ok', { status: 200, headers: corsHeaders })
    }

    // Consulta o pagamento no Mercado Pago para confirmar o status
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
    })

    if (!mpResponse.ok) {
      return new Response('erro ao consultar pagamento', { status: 400, headers: corsHeaders })
    }

    const payment = await mpResponse.json()

    // Só marca como pago se o status do MP for 'approved'
    if (payment.status !== 'approved') {
      console.log(`Pagamento ${paymentId} não aprovado (status: ${payment.status})`)
      return new Response('ok', { status: 200, headers: corsHeaders })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Busca a inscrição pelo id externo usado na criação do pagamento
    const { data: inscricao } = await supabase
      .from('inscricoes')
      .select('id')
      .eq('id', payment.external_reference)
      .single()

    if (!inscricao) {
      console.warn(`Inscrição não encontrada para external_reference=${payment.external_reference}`)
      return new Response('ok', { status: 200, headers: corsHeaders })
    }

    const { error } = await supabase
      .from('inscricoes')
      .update({ status: 'pago', mp_payment_id: String(paymentId) })
      .eq('id', inscricao.id)

    if (error) throw error

    console.log(`Pagamento ${paymentId} aprovado — inscrição ${inscricao.id} marcada como paga`)
    return new Response('ok', { status: 200, headers: corsHeaders })
  } catch (error) {
    console.error('webhook error:', error)
    return new Response('erro', { status: 500, headers: corsHeaders })
  }
})
