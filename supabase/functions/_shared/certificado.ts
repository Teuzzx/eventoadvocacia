// ============================================================
// Compartilhado — Certificado
// Gera o PDF do certificado e envia por e-mail (via Brevo)
//
// VARIÁVEIS DE AMBIENTE (no Supabase → Edge Functions → Secrets):
//   BREVO_API_KEY = xkeysib-... (Brevo → Configurações → API → SMTP & API)
// ============================================================
import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'npm:pdf-lib@1.17.1'
import { encodeBase64 } from 'https://deno.land/std@0.224.0/encoding/base64.ts'
import { LOGO_BASE64 } from './logo-b64.ts'
import { montarEmailCertificado } from './emails.ts'

// Dados do evento — ajuste aqui quando quiser (ou quando mandar o modelo)
const EVENTO = {
  titulo: 'AMA 1 Ano: Inspirar, Empreender e Incluir',
  local: 'Restaurante Zeca',
  cidade: 'Picos – PI',
  data: '27 de agosto de 2026',
  cargaHoraria: '4h30',
  organizacao: 'AMACENTROSUL',
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

  const navy = rgb(0.228, 0.071, 0.114)   // #3a0e1d (vinho profundo)
  const gold = rgb(0.357, 0.102, 0.18)    // #5b1a2e (vinho)
  const dark = rgb(0.15, 0.17, 0.21)
  const gray = rgb(0.45, 0.48, 0.52)

  // Borda dupla (vinho + vinho claro)
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

/* ---------- Envio por e-mail (Brevo) ---------- */
export async function enviarCertificadoPorEmail(
  insc: InscritoCertificado,
  pdf: Uint8Array,
): Promise<void> {
  const apiKey = Deno.env.get('BREVO_API_KEY')

  if (!apiKey) {
    throw new Error('Brevo não configurado (falta BREVO_API_KEY)')
  }

  const { assunto, html } = montarEmailCertificado({ nome: insc.nome })

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'AMACENTROSUL', email: Deno.env.get('BREVO_SENDER_EMAIL') || 'adv.laianelaurinda@hotmail.com' },
      to: [{ email: insc.email, name: insc.nome }],
      subject: assunto,
      htmlContent: html,
      attachment: [
        {
          name: `certificado-${slugify(insc.nome)}.pdf`,
          content: encodeBase64(pdf),
          type: 'application/pdf',
        },
      ],
    }),
  })

  if (!response.ok) {
    const texto = await response.text()
    throw new Error(`Brevo ${response.status}: ${texto.slice(0, 300)}`)
  }
}

/* ---------- Utilitários ---------- */
function slugify(texto: string): string {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}
