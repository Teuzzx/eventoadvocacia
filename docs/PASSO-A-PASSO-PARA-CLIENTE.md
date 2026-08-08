# Passo a Passo para a Cliente — Mercado Pago

**Como me enviar os dados do Mercado Pago** (leva ~10 minutos):

1. Acesse **https://mercadopago.com.br** e **crie a conta da associação** (ou entre se já tiver).
   Importante: para receber pagamentos PIX automáticos, a conta precisa ser validada (CNPJ da associação).
2. No menu, vá em **Desenvolvedores** (ou "Developers") → **Credenciais**.
3. Certifique-se de que está na aba **Produção** (não "Testes").
4. Copie o **Access Token** e me envie.
5. Copie a **Public Key** e me envie.
6. Ainda em **Desenvolvedores** → **Webhooks** → **Criar webhook**:
   - URL: `https://gytgtglsrsevlutyvtdr.supabase.co/functions/v1/webhook-pagamento`
   - Evento: **Pagamentos** (payment.created e payment.updated)
   - Ative o botão do webhook.
7. Me envie os dois textos (Access Token + Public Key).

**Sem o CNPJ validado**, o Mercado Pago só libera a conta de testes — se a associação
não tiver CNPJ, usar o fluxo de PIX manual.

---

# E-mail (certificados) — senha de app do Gmail

Conta: `contatoworkshoppi@gmail.com`

1. Acesse **https://myaccount.google.com/security** com essa conta → ative **Verificação em 2 etapas** (obrigatório).
2. Acesse **https://myaccount.google.com/apppasswords**
3. Em "Selecionar aplicativo" → **Outro (nome personalizado)** → digite `Certificados` → **Gerar**.
4. O Google mostra uma **senha de 16 letras** → copie e envie.

A senha vai para o Supabase como segredo `SMTP_PASS` (com `SMTP_USER` = `contatoworkshoppi@gmail.com`).

---

# O que falta configurar (checklist Norion)

- [ ] `MP_ACCESS_TOKEN` → Supabase Secrets (Settings → Edge Functions → Secrets)
- [ ] `mercadopago.publicKey` → `assets/js/config.js`
- [ ] Webhook no painel do Mercado Pago (URL acima)
- [ ] `SMTP_USER` / `SMTP_PASS` → Supabase Secrets
- [ ] Confirmar serviço `service_confirmacao` e template `template_inscricao` no EmailJS
