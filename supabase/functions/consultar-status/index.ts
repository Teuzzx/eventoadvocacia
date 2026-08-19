// ============================================================
// consultar-status — Usado pelo site de inscrições para saber
// se o pagamento PIX já foi aprovado (polling)
// Se o webhook atrasou, consulta o Mercado Pago direto
// e atualiza o banco sozinho.
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

async function consultarMercadoPago(id: string): Promise<{ pago: boolean; status: string }> {
  if (!MP_ACCESS_TOKEN) return { pago: false, status: 'nao_verificado' }

  try {
    if (/^(ORD|PAY)/i.test(id)) {
      const resp = await fetch(`https://api.mercadopago.com/v1/orders/${id}`, {
        headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
      })
      if (resp.ok) {
        const order = await resp.json()
        const pago = order.status === 'paid' ||
          order.transactions?.payments?.some?.((p: any) => p.status === 'approved') ||
          false
        return { pago, status: pago ? 'pago' : (order.status || 'pendente') }
      }
    } else {
      const resp = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
      })
      if (resp.ok) {
        const payment = await resp.json()
        return { pago: payment.status === 'approved', status: payment.status || 'pendente' }
      }
    }
  } catch (err) {
    console.error('Erro ao consultar Mercado Pago:', err)
  }
  return { pago: false, status: 'nao_verificado' }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { id } = await req.json()

    if (!id) {
      return new Response(JSON.stringify({ error: 'id obrigatório' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const { data, error } = await supabase
      .from('inscricoes')
      .select('id, status, mp_payment_id')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error

    let status = data?.status || 'nao_encontrado'

    // Se ainda não pagou e já tem id do MP, consulta direto (webhook pode ter atrasado)
    if (data && status !== 'pago' && status !== 'confirmado' && data.mp_payment_id) {
      const mp = await consultarMercadoPago(String(data.mp_payment_id))
      if (mp.pago) {
        const { error: updError } = await supabase
          .from('inscricoes')
          .update({ status: 'pago' })
          .eq('id', data.id)
        if (!updError) status = 'pago'
      }
    }

    return new Response(
      JSON.stringify({ id, status }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('consultar-status error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
