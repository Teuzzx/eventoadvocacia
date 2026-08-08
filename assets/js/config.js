/* =============================================
   CONFIGURAÇÃO CENTRAL DO SITE
   Altere tudo aqui: e-mails, números, valores,
   cupons, datas e integrações.
   ============================================= */

const CONFIG = {
    // Email que receberá as inscrições (FormSubmit)
    emailDestino: 'contatoworkshoppi@gmail.com',

    // WhatsApp para notificações (formato: 55 + DDD + número)
    whatsappNumero: '558999384039',

    // EmailJS (e-mail de confirmação automático para o inscrito)
    emailjs: {
        publicKey: 'vQeaHCpz7bWJDHNQ',
        serviceId: 'service_confirmacao',
        templateId: 'template_inscricao'
    },

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
        publicKey: ''
    },

    // Valores e descontos
    valores: {
        normal: 90.00,
        desconto: 80.00
    },

    // Cupons válidos (adicione/remova códigos aqui)
    cuponsValidos: ['ASSOCIADA2024', 'CENTROSUL', 'ADVOGADA10'],

    // Dados do evento
    evento: {
        data: '24 de Outubro de 2025',
        horario: '13:30 às 18:00',
        local: 'Auditório do Senac',
        cidade: 'Picos/PI',
        pixRecebedor: 'Laiane Laurinda de Sousa'
    }
};
