# Passo a Passo do Mercado Pago (bem simples! 😊)

Oie! Pra gente fazer a cobrança automática da inscrição no site, preciso que você faça 4 coisinhas bem rapidinhas. Não precisa entender o porquê de nada — é só seguir a ordem e me mandar o que eu pedir. Leva uns 10 minutinhos!

---

## Passo 1 — Entrar no Mercado Pago

Acesse o site **mercadopago.com.br** e faça login com a conta da associação (ou crie uma, se ainda não tiver).

> ⚠️ Importante: a conta precisa ter o **CNPJ da associação** cadastrado e aprovado. Sem isso, o Mercado Pago não libera as cobranças de verdade.

## Passo 2 — Achar as "Credenciais"

1. No menu do site, clique em **Desenvolvedores** (ou "Developers").
2. Dentro dele, clique em **Credenciais**.
3. Confira que está na aba **Produção** — e **não** na aba "Testes"! (essa parte costuma confundir)

## Passo 3 — Copiar os 2 códigos

Na tela de Credenciais, você vai ver dois textos:
- um chamado **Access Token**
- outro chamado **Public Key**

Cada um tem um botãozinho de **copiar** ao lado. Copie os dois e me **mande pelo WhatsApp**. Só isso! ✂️

## Passo 4 — Criar o "Webhook" (o mais chato, mas é rápido!)

Ainda em **Desenvolvedores**, clique em **Webhooks** e depois em **Criar webhook**. Vai pedir pra preencher:

- **URL:** cole exatamente este texto aqui ↓
  `https://gytgtglsrsevlutyvtdr.supabase.co/functions/v1/webhook-pagamento`
- **Evento:** escolha **Pagamentos**
- **Ativar:** deixe o botãozinho ligado ✅

Por fim, clique em **Salvar**. Pronto!

---

## E acabou! 🎉

Me mande os **2 códigos do Passo 3** e me avise quando terminar o Passo 4, que eu cuido de todo o resto pra você. Não precisa se preocupar com mais nada!

> 💡 Se a associação não tiver CNPJ aprovado no Mercado Pago, me avisa também — nesse caso a gente usa o PIX normal (do jeito que já funciona hoje) e eu te explico direitinho.
