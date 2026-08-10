// ============================================================
// webhook-pagamento — Recebe a notificação do Mercado Pago
// Quando o PIX é pago, marca a inscrição como 'pago'
// e envia o e-mail de confirmação (senha de acesso)
// ============================================================
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { montarEmailConfirmacao } from '../_shared/emails.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
const SENDER_EMAIL = Deno.env.get('BREVO_SENDER_EMAIL') || 'adv.laianelaurinda@hotmail.com'
const SENDER_NAME = Deno.env.get('BREVO_SENDER_NAME') || 'AMACENTROSUL'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function enviarEmailConfirmacao(inscricao: any): Promise<void> {
  if (!BREVO_API_KEY) {
    console.warn('BREVO_API_KEY ausente — e-mail de confirmação não enviado')
    return
  }

  const { assunto, html } = montarEmailConfirmacao({
    nome: inscricao.nome,
    codigo_acesso: inscricao.codigo_acesso || '',
    tipo_inscricao: inscricao.tipo_inscricao || 'Inscrição Normal',
    valor_pago: `R$ ${Number(inscricao.valor_pago || 0).toFixed(2).replace('.', ',')}`,
  })

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: inscricao.email, name: inscricao.nome || '' }],
      subject: assunto,
      htmlContent: html,
    }),
  })

  if (!response.ok) {
    const texto = await response.text()
    throw new Error(`Brevo ${response.status}: ${texto.slice(0, 300)}`)
  }
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
      .select('id, nome, email, whatsapp, oab_cpf, codigo_acesso, tipo_inscricao, valor_pago, status')
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

    // Só envia os e-mails se a inscrição ainda não estava paga
    // (o Mercado Pago notifica várias vezes o mesmo pagamento)
    if (inscricao.status !== 'pago') {
      try {
        await enviarEmailConfirmacao(inscricao)
        console.log(`E-mail de confirmação enviado para ${inscricao.email}`)
      } catch (err) {
        console.error('Falha ao enviar e-mail de confirmação:', err)
      }

      try {
        const textoOrganizacao = `NOVA INSCRIÇÃO PAGA - AMA 1 ANO

👤 Nome: ${inscricao.nome}
📧 E-mail: ${inscricao.email}
📱 WhatsApp: ${inscricao.whatsapp || '-'}
⚖️ OAB/CPF: ${inscricao.oab_cpf || '-'}
🔑 Senha de acesso: ${inscricao.codigo_acesso || '-'}

💰 Pagamento confirmado via PIX (Mercado Pago)
💵 Valor: R$ ${Number(inscricao.valor_pago || 0).toFixed(2).replace('.', ',')}

Pagamento confirmado automaticamente.`
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': BREVO_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: SENDER_NAME, email: SENDER_EMAIL },
            to: [{ email: SENDER_EMAIL, name: 'Coordenação' }],
            subject: '🎉 Inscrição PAGA - AMA 1 Ano',
            textContent: textoOrganizacao,
          }),
        })
        if (!response.ok) {
          const texto = await response.text()
          console.warn(`Falha no e-mail para a organização: ${response.status} ${texto.slice(0, 200)}`)
        } else {
          console.log('E-mail de notificação enviado para a organização')
        }
      } catch (err) {
        console.error('Falha no e-mail para a organização:', err)
      }
    }

    console.log(`Pagamento ${paymentId} aprovado — inscrição ${inscricao.id} marcada como paga`)
    return new Response('ok', { status: 200, headers: corsHeaders })
  } catch (error) {
    console.error('webhook error:', error)
    return new Response('erro', { status: 500, headers: corsHeaders })
  }
})
