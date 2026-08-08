// ============================================================
// Compartilhado — Certificado
// Gera o PDF do certificado e envia por e-mail (SMTP Gmail)
//
// VARIÁVEIS DE AMBIENTE (no Supabase → Edge Functions → Secrets):
//   SMTP_USER = contatoworkshoppi@gmail.com
//   SMTP_PASS = senha de app do Gmail (gerar em:
//               https://myaccount.google.com/apppasswords)
// ============================================================
import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'npm:pdf-lib@1.17.1'
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts'
import { LOGO_BASE64 } from './logo-b64.ts'

// Dados do evento — ajuste aqui quando quiser (ou quando mandar o modelo)
const EVENTO = {
  titulo: 'I Workshop de Prática Previdenciária',
  local: 'Auditório do Senac',
  cidade: 'Picos – PI',
  data: '24 de outubro de 2025',
  cargaHoraria: '4 horas',
  organizacao: 'Coordenação do Evento',
}

export interface InscritoCertificado {
  id: string
  nome: string
  email: string
  oab_cpf: string | null
}

/* ---------- Geração do PDF ---------- */
export async function gerarCertificadoPDF(insc: InscritoCertificado): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const page = doc.addPage([595.28, 841.89]) // A4 retrato

  const helv = await doc.embedFont(StandardFonts.Helvetica)
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold)

  const navy = rgb(0.027, 0.118, 0.227)   // #071527
  const gold = rgb(0.788, 0.635, 0.153)   // #c9a227
  const dark = rgb(0.15, 0.17, 0.21)
  const gray = rgb(0.45, 0.48, 0.52)

  // Borda dupla (navy + dourado)
  page.drawRectangle({ x: 26, y: 26, width: 543.28, height: 789.89, borderColor: navy, borderWidth: 2.2 })
  page.drawRectangle({ x: 33, y: 33, width: 529.28, height: 775.89, borderColor: gold, borderWidth: 1 })

  // Logo centralizado no topo
  const logoBytes = Uint8Array.from(atob(LOGO_BASE64), (c) => c.charCodeAt(0))
  const logo = await doc.embedPng(logoBytes)
  const logoW = 130
  const logoH = (logo.height / logo.width) * logoW
  page.drawImage(logo, { x: (595.28 - logoW) / 2, y: 668, width: logoW, height: logoH })

  const centerX = 595.28 / 2

  // Título
  const titulo = 'C E R T I F I C A D O'
  page.drawText(titulo, {
    x: centerX - helvBold.widthOfTextAtSize(titulo, 20) / 2,
    y: 620,
    size: 20,
    font: helvBold,
    color: navy,
  })

  // Linha dourada sob o título
  page.drawLine({
    start: { x: centerX - 120, y: 608 },
    end: { x: centerX + 120, y: 608 },
    thickness: 1.2,
    color: gold,
  })

  // Corpo
  const corpo = `Certificamos que ${insc.nome}, ${insc.oab_cpf ? insc.oab_cpf + ', ' : ''}participou do ${EVENTO.titulo}, realizado em ${EVENTO.data}, no ${EVENTO.local}, em ${EVENTO.cidade}, com carga horária de ${EVENTO.cargaHoraria}.`
  const corpoLines = quebrarTexto(page, helv, corpo, 13, 430)

  let y = 545
  page.drawText('Certificamos que', {
    x: centerX - helv.widthOfTextAtSize('Certificamos que', 13) / 2,
    y,
    size: 13,
    font: helv,
    color: gray,
  })
  y -= 28

  // Nome em destaque
  page.drawText(insc.nome.toUpperCase(), {
    x: centerX - helvBold.widthOfTextAtSize(insc.nome.toUpperCase(), 21) / 2,
    y,
    size: 21,
    font: helvBold,
    color: navy,
  })
  y -= 26

  if (insc.oab_cpf) {
    page.drawText(insc.oab_cpf, {
      x: centerX - helv.widthOfTextAtSize(insc.oab_cpf, 12) / 2,
      y,
      size: 12,
      font: helv,
      color: gray,
    })
    y -= 26
  }

  y -= 10
  for (const linha of corpoLines) {
    page.drawText(linha, {
      x: centerX - helv.widthOfTextAtSize(linha, 13) / 2,
      y,
      size: 13,
      font: helv,
      color: dark,
      lineHeight: 20,
    })
    y -= 20
  }

  // Local e data
  y -= 22
  const localData = `${EVENTO.cidade}, ${EVENTO.data}.`
  page.drawText(localData, {
    x: centerX - helv.widthOfTextAtSize(localData, 12) / 2,
    y,
    size: 12,
    font: helv,
    color: gray,
  })

  // Assinaturas
  const assinaturaY = 130
  const colW = 200

  page.drawText('_______________________', {
    x: centerX - colW / 2 - 10,
    y: assinaturaY,
    size: 13,
    font: helv,
    color: dark,
  })
  page.drawText('_______________________', {
    x: centerX + 10,
    y: assinaturaY,
    size: 13,
    font: helv,
    color: dark,
  })

  page.drawText('Coordenador(a) Geral', {
    x: centerX - colW / 2 - 10 + 38,
    y: assinaturaY - 22,
    size: 11,
    font: helvBold,
    color: navy,
  })
  page.drawText('Presidente(a) da AMACENTROSUL', {
    x: centerX + 10 + 22,
    y: assinaturaY - 22,
    size: 11,
    font: helvBold,
    color: navy,
  })

  return doc.save()
}

/* ---------- Quebra de texto simples (por palavras) ---------- */
function quebrarTexto(
  page: PDFPage,
  font: PDFFont,
  texto: string,
  size: number,
  maxLargura: number,
): string[] {
  const palavras = texto.split(' ')
  const linhas: string[] = []
  let atual = ''

  for (const palavra of palavras) {
    const teste = atual ? atual + ' ' + palavra : palavra
    if (font.widthOfTextAtSize(teste, size) > maxLargura) {
      if (atual) linhas.push(atual)
      atual = palavra
    } else {
      atual = teste
    }
  }
  if (atual) linhas.push(atual)
  return linhas
}

/* ---------- Envio por e-mail (SMTP Gmail) ---------- */
export async function enviarCertificadoPorEmail(
  insc: InscritoCertificado,
  pdf: Uint8Array,
): Promise<void> {
  const user = Deno.env.get('SMTP_USER')
  const pass = Deno.env.get('SMTP_PASS')

  if (!user || !pass) {
    throw new Error('SMTP não configurado (SMTP_USER / SMTP_PASS)')
  }

  const client = new SmtpClient()
  await client.connect({
    hostname: 'smtp.gmail.com',
    port: 465,
    tls: true,
    username: user,
    password: pass,
  })

  try {
    await client.send({
      from: `Workshop Previdenciário <${user}>`,
      to: insc.email,
      subject: `Seu certificado — ${EVENTO.titulo}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.6; max-width: 560px;">
          <p>Olá, <strong>${escapeHtml(insc.nome)}</strong>!</p>
          <p>Obrigado por participar do <strong>${EVENTO.titulo}</strong>! 🎉
             Sua presença foi fundamental para o sucesso do evento.</p>
          <p>Para registrar a sua participação, segue o seu <strong>certificado em PDF</strong> anexado
             a este e-mail.</p>
          <p>Em caso de dúvidas, é só responder este e-mail.</p>
          <p>Atenciosamente,<br>
             <strong>Coordenação do ${EVENTO.titulo}</strong></p>
        </div>
      `,
      attachments: [
        {
          filename: `certificado-${slugify(insc.nome)}.pdf`,
          content: pdf,
          contentType: 'application/pdf',
        },
      ],
    })
  } finally {
    await client.close()
  }
}

/* ---------- Utilitários ---------- */
function escapeHtml(texto: string): string {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function slugify(texto: string): string {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}
