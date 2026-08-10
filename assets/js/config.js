/* =============================================
   CONFIGURAÇÃO CENTRAL DO SITE
   Altere tudo aqui: e-mails, números, valores,
   cupons, datas e integrações.
   ============================================= */

const CONFIG = {
    // Email que receberá as inscrições (FormSubmit)
    emailDestino: 'adv.laianelaurinda@hotmail.com',

    // WhatsApp para notificações (formato: 55 + DDD + número)
    whatsappNumero: '5589994499408',

    // Supabase (banco de dados das inscrições + painel admin + certificados)
    // Como obter: https://supabase.com/dashboard → Settings → API
    // url:    Ex.: 'https://abcdefghijklm.supabase.co'
    // anonKey: Public anon key (começa com 'eyJ...')
    // Enquanto estiver vazio, o site usa o fluxo manual (PIX estático + e-mail)
    supabase: {
        url: 'https://gytgtglsrsevlutyvtdr.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5dGd0Z2xzcnNldmx1dHl2dGRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxNDQ3ODYsImV4cCI6MjEwMTcyMDc4Nn0.EJZMN3lUCe_tgTh8hy-igu5saO86Z1D9cgWrP3mMv_o'
    },

    // Mercado Pago (pagamento PIX dinâmico + cartão)
    // Como obter: https://www.mercadopago.com.br → Developers → Credenciais
    // publicKey:  Public key (começa com 'APP_USR-...' em produção)
    // O Access Token (secreto) fica no Supabase: Edge Functions → Secrets → MP_ACCESS_TOKEN
    mercadopago: {
        publicKey: 'APP_USR-01dec728-7005-4e39-a5a3-e7d0de31ff4c'
    },

    // Valores e descontos
    valores: {
        normal: 60.00,
        desconto: null
    },

    // Cupons válidos (adicione/remova códigos aqui)
    cuponsValidos: [],

    // Dados do evento
    evento: {
        data: '27 de Agosto de 2026',
        horario: '17:00 às 21:30',
        local: 'Restaurante Zeca',
        cidade: 'Picos/PI'
    }
};
