// ============================================================
// enviar-email-brevo — Envia e-mails pelo Brevo (ex-Sendinblue)
// Chamada pelo site de inscrições (fetch POST com JSON).
//
// Formatos aceitos por e-mail:
//   { para: {email, nome}, template: 'confirmacao', dados: {...} }
//   { para: {email, nome}, template: 'certificado', dados: {...} }
//   { para: {email, nome}, assunto, texto?, html?, anexo? }
//
// VARIÁVEIS DE AMBIENTE (no Supabase → Edge Functions → Secrets):
//   BREVO_API_KEY      = xkeysib-... (Brevo → Configurações → API → SMTP & API)
//   BREVO_SENDER_EMAIL = remetente verificado (ex.: adv.laianelaurinda@hotmail.com)
//   BREVO_SENDER_NAME  = ex.: AMACENTROSUL
// ============================================================
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { montarEmailCertificado, montarEmailConfirmacao } from '../_shared/emails.ts'

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
const SENDER_EMAIL = Deno.env.get('BREVO_SENDER_EMAIL') || 'adv.laianelaurinda@hotmail.com'
const SENDER_NAME = Deno.env.get('BREVO_SENDER_NAME') || 'AMACENTROSUL'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function resolverTemplate(email: any): { assunto: string; html: string } {
  if (email.template === 'confirmacao') {
    return montarEmailConfirmacao(email.dados || {})
  }
  if (email.template === 'certificado') {
    return montarEmailCertificado(email.dados || {})
  }
  return { assunto: email.assunto, html: email.html || '' }
}

async function enviarBrevo(email: any): Promise<void> {
  const { assunto, html } = resolverTemplate(email)

  const body: any = {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email: email.para.email, name: email.para.nome || '' }],
    subject: assunto,
  }

  if (html) {
    body.htmlContent = html
  } else if (email.texto) {
    body.textContent = email.texto
  } else {
    throw new Error('E-mail sem conteúdo (html ou texto)')
  }

  if (email.anexo) {
    body.attachment = [
      { name: email.anexo.nome, content: email.anexo.base64, type: email.anexo.tipo || 'application/octet-stream' },
    ]
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
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

  if (!BREVO_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Brevo não configurado (falta BREVO_API_KEY)' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { emails } = await req.json()

    if (!Array.isArray(emails) || emails.length === 0) {
      return new Response(JSON.stringify({ error: 'emails obrigatório (array não vazio)' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const resultados = []
    for (const email of emails) {
      if (!email?.para?.email) {
        resultados.push({ ok: false, erro: 'destinatário ausente', para: email?.para?.email })
        continue
      }
      try {
        await enviarBrevo(email)
        resultados.push({ ok: true, para: email.para.email })
      } catch (err) {
        resultados.push({ ok: false, erro: err.message, para: email.para.email })
      }
    }

    return new Response(JSON.stringify({ resultados }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('enviar-email-brevo error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
