// ============================================================
// liberar-certificados — Ação manual do painel admin
// acao: 'liberar'  → gera o PDF, ENVIA por e-mail e libera
//                    (somente inscritos confirmados ainda não
//                    liberados — clicar de novo não reenvia)
// acao: 'bloquear' → apenas bloqueia o certificado de todos
//                    os confirmados (não envia e-mail)
//
// Exige login (JWT de um usuário autenticado no Supabase)
// ============================================================
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { enviarCertificadoPorEmail, gerarCertificadoPDF } from '../_shared/certificado.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization') || ''

    // Valida que quem chamou é um usuário logado no Supabase
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const { data: userData, error: userError } = await client.auth.getUser(authHeader.replace('Bearer ', ''))

    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { acao = 'liberar' } = await req.json()

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    if (acao === 'bloquear') {
      const { data, error } = await supabase
        .from('inscricoes')
        .update({ certificado_liberado: false })
        .eq('status', 'confirmado')
        .select('id')

      if (error) throw error

      return new Response(
        JSON.stringify({ ok: true, total: data?.length || 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Busca confirmados que ainda não receberam o certificado
    const { data: lista, error } = await supabase
      .from('inscricoes')
      .select('id, nome, email, oab_cpf, certificado_liberado')
      .eq('status', 'confirmado')
      .eq('certificado_liberado', false)

    if (error) throw error

    const enviados: string[] = []
    const falhas: Array<{ nome: string; erro: string }> = []

    for (const insc of lista || []) {
      try {
        const pdf = await gerarCertificadoPDF(insc)
        await enviarCertificadoPorEmail(insc, pdf)

        const { error: updateError } = await supabase
          .from('inscricoes')
          .update({ certificado_liberado: true })
          .eq('id', insc.id)

        if (updateError) throw updateError

        enviados.push(insc.nome)
      } catch (err) {
        console.error(`Falha ao enviar certificado de ${insc.nome}:`, err)
        falhas.push({ nome: insc.nome, erro: err.message })
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        total: lista?.length || 0,
        enviados: enviados.length,
        falhas,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('liberar-certificados error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
