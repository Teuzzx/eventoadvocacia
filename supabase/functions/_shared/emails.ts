// ============================================================
// Compartilhado — Templates de e-mail (HTML) da AMACENTROSUL
// Usado por: enviar-email-brevo e certificado (liberar-certificados)
// ============================================================

const LOGO_URL = 'https://workshopadvocacia.com.br/assets/images/amacentrosul-logo.jpg'
const INSTAGRAM_URL = 'https://instagram.com/amacentrosul'
const WHATSAPP_URL = 'https://wa.me/5589994499408'

export const EVENTO_INFO = {
  titulo: 'AMA 1 Ano: Inspirar, Empreender e Incluir',
  subtitulo: 'Marketing Jurídico e Advocacia Humanizada',
  data: '27 de Agosto de 2026',
  horario: '17:00 às 21:30',
  local: 'Restaurante Zeca',
  cidade: 'Picos / PI',
  organizacao: 'AMACENTROSUL',
}

/* ---------- Utilitários ---------- */
function escapeHtml(texto: string): string {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/* ---------- Layout base ---------- */
function layoutBase(conteudo: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<body style="margin:0;padding:0;background-color:#f4f1ea;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f1ea;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 6px 24px rgba(7,21,39,0.10);">

          <!-- Cabeçalho -->
          <tr>
            <td style="background:linear-gradient(135deg,#4a1224 0%,#3a0e1d 100%);padding:32px 24px 26px;text-align:center;">
              <img src="${LOGO_URL}" alt="AMACENTROSUL" width="150" style="max-width:150px;height:auto;border:0;display:inline-block;">
              <h1 style="margin:16px 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#d8a7b4;line-height:1.3;">${EVENTO_INFO.titulo}</h1>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#a9b4c4;letter-spacing:0.4px;">${EVENTO_INFO.subtitulo}</p>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding:32px 28px;font-family:Arial,Helvetica,sans-serif;color:#2b2b2b;line-height:1.65;font-size:15px;">
              ${conteudo}
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="background:#3a0e1d;padding:24px 28px;text-align:center;">
              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#d8a7b4;font-weight:bold;">Associação das Mulheres Advogadas do Centro Sul do Piauí</p>
              <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8b96a8;">Realização: ${EVENTO_INFO.organizacao} · ${EVENTO_INFO.cidade}</p>
              <a href="${INSTAGRAM_URL}" style="display:inline-block;margin:0 6px;padding:8px 16px;background:#4a1224;border:1px solid #d8a7b4;border-radius:20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#d8a7b4;text-decoration:none;">📸 @amacentrosul</a>
              <a href="${WHATSAPP_URL}" style="display:inline-block;margin:0 6px;padding:8px 16px;background:#4a1224;border:1px solid #d8a7b4;border-radius:20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#d8a7b4;text-decoration:none;">💬 Fale conosco</a>
            </td>
          </tr>

        </table>
        <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#9a937f;margin:14px 0 0;">Este e-mail é enviado automaticamente pelo sistema de inscrições do evento.</p>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/* ---------- E-mail de confirmação da inscrição ---------- */
export function montarEmailConfirmacao(dados: {
  nome: string
  codigo_acesso: string
  tipo_inscricao?: string
  valor_pago?: string
}): { assunto: string; html: string } {
  const conteudo = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td align="center">
          <span style="display:inline-block;padding:8px 20px;background:rgba(91,26,46,0.12);border:1px solid #5b1a2e;border-radius:24px;font-size:13px;font-weight:bold;color:#5b1a2e;letter-spacing:0.6px;">✅ INSCRIÇÃO CONFIRMADA</span>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px;">Olá, <strong style="color:#4a1224;">${escapeHtml(dados.nome)}</strong>!</p>
    <p style="margin:0 0 22px;">Sua inscrição no <strong>${EVENTO_INFO.titulo}</strong> foi <strong>confirmada com sucesso</strong>. Estamos muito felizes em ter você com a gente nessa noite especial!</p>

    <!-- Senha de acesso -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0ea;border:2px dashed #5b1a2e;border-radius:12px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px;text-align:center;">
          <p style="margin:0 0 6px;font-size:12px;color:#5b1a2e;letter-spacing:1px;font-weight:bold;">🔑 SUA SENHA DE ACESSO AO EVENTO</p>
          <p style="margin:0 0 6px;font-family:Consolas,'Courier New',monospace;font-size:34px;font-weight:bold;color:#4a1224;letter-spacing:8px;">${escapeHtml(dados.codigo_acesso)}</p>
          <p style="margin:0;font-size:12px;color:#6b6b6b;">Apresente esta senha no seu celular na <strong>entrada do evento</strong> — dia 27/08/2026.</p>
        </td>
      </tr>
    </table>

    <!-- Detalhes do evento -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f5;border-radius:10px;margin-bottom:18px;">
      <tr><td style="padding:18px 20px 6px;font-size:13px;font-weight:bold;color:#4a1224;letter-spacing:0.5px;">📋 DETALHES DO EVENTO</td></tr>
      <tr><td style="padding:2px 20px;font-size:14px;color:#3c3c3c;">📅 <strong>Data:</strong> ${EVENTO_INFO.data}</td></tr>
      <tr><td style="padding:2px 20px;font-size:14px;color:#3c3c3c;">⏰ <strong>Horário:</strong> ${EVENTO_INFO.horario}</td></tr>
      <tr><td style="padding:2px 20px 18px;font-size:14px;color:#3c3c3c;">📍 <strong>Local:</strong> ${EVENTO_INFO.local} — ${EVENTO_INFO.cidade}</td></tr>
    </table>

    <!-- Pagamento -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f5;border-radius:10px;margin-bottom:24px;">
      <tr><td style="padding:18px 20px 6px;font-size:13px;font-weight:bold;color:#4a1224;letter-spacing:0.5px;">💰 INFORMAÇÕES DE PAGAMENTO</td></tr>
      <tr><td style="padding:2px 20px;font-size:14px;color:#3c3c3c;">🎫 <strong>Inscrição:</strong> ${escapeHtml(dados.tipo_inscricao || 'Inscrição Normal')}</td></tr>
      <tr><td style="padding:2px 20px 18px;font-size:14px;color:#3c3c3c;">💵 <strong>Valor pago:</strong> ${escapeHtml(dados.valor_pago || '')}</td></tr>
    </table>

    <p style="margin:0 0 8px;">Em breve enviaremos mais informações sobre o evento.</p>
    <p style="margin:0 0 24px;font-weight:bold;color:#4a1224;">Agradecemos sua participação! 🤝</p>
  `

  return {
    assunto: `✅ Inscrição confirmada - ${EVENTO_INFO.titulo}`,
    html: layoutBase(conteudo),
  }
}

/* ---------- E-mail do certificado ---------- */
export function montarEmailCertificado(dados: {
  nome: string
}): { assunto: string; html: string } {
  const conteudo = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td align="center">
          <span style="display:inline-block;padding:8px 20px;background:rgba(91,26,46,0.12);border:1px solid #5b1a2e;border-radius:24px;font-size:13px;font-weight:bold;color:#5b1a2e;letter-spacing:0.6px;">🎓 CERTIFICADO DISPONÍVEL</span>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px;">Olá, <strong style="color:#4a1224;">${escapeHtml(dados.nome)}</strong>!</p>
    <p style="margin:0 0 16px;">Parabéns pela participação no <strong>${EVENTO_INFO.titulo}</strong>! 🎉 Sua presença foi fundamental para o sucesso desta noite tão especial para a advocacia do Centro Sul do Piauí.</p>
    <p style="margin:0 0 22px;">Para registrar sua participação, enviamos o seu <strong>certificado digital em PDF</strong> anexado a este e-mail. Guarde-o com carinho — é a prova da sua trajetória conosco!</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f5;border-radius:10px;margin-bottom:24px;">
      <tr><td style="padding:18px 20px 6px;font-size:13px;font-weight:bold;color:#4a1224;letter-spacing:0.5px;">📜 SEU CERTIFICADO</td></tr>
      <tr><td style="padding:2px 20px;font-size:14px;color:#3c3c3c;">📅 <strong>Evento:</strong> ${EVENTO_INFO.titulo}</td></tr>
      <tr><td style="padding:2px 20px;font-size:14px;color:#3c3c3c;">🗓️ <strong>Data:</strong> ${EVENTO_INFO.data}</td></tr>
      <tr><td style="padding:2px 20px 18px;font-size:14px;color:#3c3c3c;">🕓 <strong>Carga horária:</strong> 4h30</td></tr>
    </table>

    <p style="margin:0 0 8px;">Não recebeu o anexo ou encontrou algum problema? É só responder este e-mail ou falar com a gente no WhatsApp.</p>
    <p style="margin:0 0 24px;font-weight:bold;color:#4a1224;">Continue inspirando, empreendendo e incluindo! ✨</p>
  `

  return {
    assunto: `🎓 Seu certificado chegou - ${EVENTO_INFO.titulo}`,
    html: layoutBase(conteudo),
  }
}
