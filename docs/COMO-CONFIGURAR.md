# Como Configurar o Sistema — Workshop de Prática Previdenciária

Sistema completo: site de inscrições + painel admin (Supabase) + pagamento PIX (Mercado Pago) + envio automático de certificados por e-mail.

## Estrutura do projeto

```
├── index.html                  → Site de inscrições
├── assets/                     → CSS, JS e imagens do site
│   └── js/config.js            → ⚠️ PREENCHER (site)
├── painel-admin/               → Painel da coordenação
│   └── assets/js/config.js     → ⚠️ PREENCHER (painel)
├── supabase/
│   ├── schema.sql              → Banco de dados (rodar 1x)
│   └── functions/
│       ├── create-payment/     → Gera PIX no Mercado Pago
│       ├── webhook-pagamento/  → Confirma pagamento
│       ├── consultar-status/   → Site consulta o pagamento
│       └── liberar-certificados/ → Gera PDF + envia e-mail
└── docs/
```

---

## 1. Supabase (banco + painel + certificados)

1. Crie uma conta grátis em https://supabase.com → **New Project** (nomeie, região São Paulo).
2. Em **SQL Editor**, abra o conteúdo de `supabase/schema.sql` e clique em **Run**.
3. Em **Authentication → Users**, clique em **Add user** e crie o login da coordenação (e-mail + senha). Esse é o login do painel.
4. Em **Edge Functions**, faça deploy das 4 funções (pasta `supabase/functions/`):

   ```bash
   supabase login
   supabase functions deploy create-payment
   supabase functions deploy webhook-pagamento
   supabase functions deploy consultar-status
   supabase functions deploy liberar-certificados
   ```

   (Ou use a própria interface do Supabase: criar/colar cada arquivo em Edge Functions.)

5. Em **Settings → API**, copie a **Project URL** e a **anon public key**.

6. **Segredos das funções** (Settings → Edge Functions → Secrets):

   | Variável | Valor |
   |---|---|
   | `MP_ACCESS_TOKEN` | Token de acesso do Mercado Pago (passo 2) |
   | `SMTP_USER` | `adv.laianelaurinda@hotmail.com` |
   | `SMTP_PASS` | Senha de app do Gmail (passo 3) |

7. Preencha `assets/js/config.js` (site) e `painel-admin/assets/js/config.js` (painel) com a URL e a anon key.

> Enquanto os campos estiverem vazios, o site funciona no **modo manual**: PIX estático + confirmações por e-mail/WhatsApp. O painel fica disponível em **Modo Demonstração**.

---

## 2. Mercado Pago (pagamento PIX automático)

1. Conta em https://mercadopago.com.br (da coordenação) → **Developer → Credenciais**.
2. **Access Token** (produção) → vira o segredo `MP_ACCESS_TOKEN` no Supabase.
3. **Public Key** → copia para `assets/js/config.js` (`mercadopago.publicKey`).
4. No painel do Mercado Pago: **Webhooks** → adicione:

   ```
   https://SEU-PROJETO.supabase.co/functions/v1/webhook-pagamento
   ```

   com evento **Pagamentos** (payment.created / payment.updated).

> Cartão de crédito também é possível, mas o Mercado Pago exige que a conta tenha **CNPJ/MEI** validado. Sem isso, só PIX.

---

## 3. Senha de app do Gmail (envio dos certificados)

1. Ative a **Verificação em 2 etapas** em https://myaccount.google.com/security (obrigatória).
2. Em https://myaccount.google.com/apppasswords → crie uma senha para "Outro (nome personalizado)", ex.: `Certificados`.
3. Copie a senha de 16 caracteres → vira o segredo `SMTP_PASS` (o `SMTP_USER` é o e-mail `adv.laianelaurinda@hotmail.com`).

---

## 4. Senha de acesso ao evento (check-in)

Na inscrição, o site gera uma **senha única de 6 caracteres** para cada inscrito (ex.: `K7M2P9`):

- O inscrito recebe a senha no e-mail de confirmação e vê no modal de pagamento;
- No dia do evento, mostra a senha no celular na portaria;
- No painel, o **card "Check-in na Portaria"** (no topo, bom pra celular): digita a senha → mostra os dados da pessoa → "Confirmar Presença" (vira **confirmado** e grava a hora do check-in).

> Para o e-mail de confirmação (EmailJS), adicione a variável `{{codigo_acesso}}` no template `template_inscricao` no painel do EmailJS — ela já é enviada pelo site.

---

## 5. Como funciona o envio de certificados

1. No painel, cada inscrito pago vira **Confirmado** (no check-in da portaria ou pelo select de status).
2. Clicando em **"Liberar e Enviar Certificados"**:
   - O sistema gera o PDF do certificado (logo, nome, OAB/CPF, texto do evento, assinaturas);
   - Envia por e-mail para o inscrito, com o PDF anexado **e mensagem de agradecimento** pela participação;
   - Só marca como liberado quem recebeu (falhas aparecem no aviso e podem ser reenviadas clicando de novo — quem já recebeu não recebe duplicado).
3. O modelo do certificado (texto, carga horária, assinaturas) fica em `supabase/functions/_shared/certificado.ts`, na variável `EVENTO` e na seção de assinaturas.

---

## 6. Publicar o site (GitHub Pages)

1. Envie a pasta do projeto para um repositório no GitHub (a raiz contém `index.html`).
2. **Settings → Pages** → Source: `main` / root.
3. O domínio `workshopadvocacia.com.br` já está apontado via CNAME para o Pages.

---

## Fluxo do participante

1. Faz a inscrição no site → salva no Supabase como **pendente** → aparece o QR PIX (Mercado Pago) e a **senha de acesso ao evento**.
2. Paga → o webhook atualiza para **pago** → e-mail/WhatsApp de confirmação (com a senha de acesso).
3. No dia: mostra a senha no celular na portaria → coordenação confirma no painel → **confirmado** (com hora do check-in).
4. Após o evento, coordenação clica em "Liberar e Enviar Certificados" → cada inscrito recebe o e-mail de agradecimento com o certificado PDF.
