/* =============================================
   FORM — Inscrição: dados → QR Code PIX dinâmico
   O botão de pagamento só libera quando todos
   os campos obrigatórios estão preenchidos.
   ============================================= */

(() => {
    'use strict';

    /* ---------- Estado do formulário ---------- */
    let valorAtual = CONFIG.valores.normal;

    /* ============ Toast ============ */
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle' };

        toast.innerHTML = `<i class="fas ${icons[type] || icons.success}"></i><span>${message}</span>`;
        toast.className = `toast show ${type}`;

        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.remove('show'), 4200);
    }

    /* ============ Máscara WhatsApp ============ */
    const whatsappInput = document.getElementById('whatsapp');

    whatsappInput?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '').slice(0, 11);

        if (value.length > 6) {
            value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        } else if (value.length > 0) {
            value = value.replace(/(\d{0,2})/, '($1');
        }

        e.target.value = value;
    });

    /* ============ Formatação OAB ============ */
    const oabInput = document.getElementById('oab');
    oabInput?.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
    });

    /* ============ Validações ============ */
    function validarEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validarWhatsApp(valor) {
        const digitos = valor.replace(/\D/g, '');
        return digitos.length >= 10 && digitos.length <= 11;
    }

    /* ============ Senha de acesso ao evento ============ */
    // Código único (6 caracteres) que o inscrito apresenta no celular na entrada.
    // Sem letras/números confusos (0, O, 1, I) pra digitar rápido.
    const CODIGO_ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    function gerarCodigoAcesso() {
        let codigo = '';
        const rand = new Uint32Array(6);

        if (window.crypto && crypto.getRandomValues) {
            crypto.getRandomValues(rand);
        } else {
            for (let i = 0; i < rand.length; i++) rand[i] = Math.floor(Math.random() * 0xffffffff);
        }

        for (let i = 0; i < 6; i++) {
            codigo += CODIGO_ALFABETO[rand[i] % CODIGO_ALFABETO.length];
        }
        return codigo;
    }

    function formatarMoeda(valor) {
        return `R$ ${valor.toFixed(2).replace('.', ',')}`;
    }

    /* ============ Envio: Brevo (e-mail de confirmação + organização) ============ */
    function montarTextoOrganizacao(dados) {
        return `NOVA INSCRIÇÃO - AMA 1 ANO

👤 Nome: ${dados.nome}
📧 E-mail: ${dados.email}
📱 WhatsApp: ${dados.whatsapp}
⚖️ OAB/CPF: ${dados.oab}
🔑 Senha de acesso: ${dados.codigo_acesso}

💰 INFORMAÇÕES DE PAGAMENTO:
🎫 Tipo: ${dados.tipo_inscricao}
💵 Valor: ${formatarMoeda(dados.valor_pago)}

🕐 Inscrição realizada em: ${dados.data}

Inscrição realizada via formulário do site (pagamento via Mercado Pago).`;
    }

    async function enviarPorBrevo(dados) {
        const emails = [
            {
                para: { email: CONFIG.emailDestino, nome: 'Coordenação' },
                assunto: '🎉 Nova Inscrição - AMA 1 Ano: Inspirar, Empreender e Incluir',
                texto: montarTextoOrganizacao(dados)
            },
            {
                para: { email: dados.email, nome: dados.nome },
                template: 'confirmacao',
                dados: {
                    nome: dados.nome,
                    codigo_acesso: dados.codigo_acesso,
                    tipo_inscricao: dados.tipo_inscricao,
                    valor_pago: formatarMoeda(dados.valor_pago)
                }
            }
        ];

        const response = await fetch(
            `${CONFIG.supabase.url}/functions/v1/enviar-email-brevo`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.supabase.anonKey}`,
                    'apikey': CONFIG.supabase.anonKey
                },
                body: JSON.stringify({ emails })
            }
        );

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Erro ao enviar e-mails');

        const falhas = (result.resultados || []).filter(r => !r.ok);
        if (falhas.length) throw new Error('Falha em parte dos e-mails');
        return result;
    }

    /* ============ Envio: WhatsApp ============ */
    function enviarPorWhatsApp(dados) {
        const mensagem = [
            '🎉 *NOVA INSCRIÇÃO - AMA 1 ANO*',
            '',
            '👤 *Nome:* ' + dados.nome,
            '📧 *E-mail:* ' + dados.email,
            '📱 *WhatsApp:* ' + dados.whatsapp,
            '⚖️ *OAB/CPF:* ' + dados.oab,
            '🔑 *Senha de acesso:* ' + dados.codigo_acesso,
            '',
            '💰 *INFORMAÇÕES DE PAGAMENTO:*',
            '🎫 *Tipo:* ' + dados.tipo_inscricao,
            '💵 *Valor:* ' + formatarMoeda(dados.valor_pago),
            '',
            '✅ *Pagamento confirmado via PIX*',
            '🕐 *Inscrição realizada em:* ' + dados.data,
            '',
            '_Inscrição realizada via formulário do site._'
        ].filter(Boolean).join('\n');

        const url = `https://wa.me/${CONFIG.whatsappNumero}?text=${encodeURIComponent(mensagem)}`;

        setTimeout(() => window.open(url, '_blank'), 1500);
    }

    /* ============ Submit do formulário ============ */
    const formInscricao = document.getElementById('formInscricao');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const lgpdInput = document.getElementById('lgpd');
    const btnGerarPix = document.getElementById('btnGerarPix');

    /* Após pagamento aprovado: notifica a organização no WhatsApp.
       O e-mail de confirmação (com a senha de acesso) é enviado pelo
       webhook no servidor — funciona mesmo se fechar a página. */
    async function aposPagamentoConfirmado(formData) {
        enviarPorWhatsApp(formData);
    }

    /* Botão de pagamento só libera com os dados preenchidos */
    function camposValidos() {
        const nome = nomeInput?.value.trim() || '';
        const email = emailInput?.value.trim() || '';
        const whats = whatsappInput?.value.trim() || '';
        const oab = oabInput?.value.trim() || '';

        return Boolean(
            nome &&
            validarEmail(email) &&
            validarWhatsApp(whats) &&
            oab &&
            lgpdInput?.checked
        );
    }

    function atualizarEstadoBotao() {
        if (!btnGerarPix) return;
        btnGerarPix.disabled = !camposValidos();
    }

    [nomeInput, emailInput, whatsappInput, oabInput].forEach((el) => {
        el?.addEventListener('input', atualizarEstadoBotao);
    });
    lgpdInput?.addEventListener('change', atualizarEstadoBotao);

    if (formInscricao) {
        formInscricao.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!camposValidos()) {
                showToast('Preencha todos os campos para gerar o pagamento!', 'error');
                return;
            }

            const formData = {
                nome: nomeInput?.value.trim() || '',
                email: emailInput?.value.trim() || '',
                whatsapp: whatsappInput?.value.trim() || '',
                oab: oabInput?.value.trim() || '',
                codigo_acesso: gerarCodigoAcesso(),
                lgpd: lgpdInput?.checked || false,
                tipo_inscricao: 'Inscrição Normal',
                valor_pago: valorAtual,
                cupom_utilizado: 'Não utilizado',
                desconto_aplicado: 'Nenhum',
                data: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
            };

            /* Checkout disponível? (Supabase + Mercado Pago configurados) */
            const checkoutDisponivel = window.CheckoutMP &&
                Boolean(CONFIG.supabase?.url && CONFIG.supabase?.anonKey && CONFIG.mercadopago?.publicKey);

            if (!checkoutDisponivel) {
                showToast('Pagamento indisponível no momento. Tente novamente mais tarde.', 'error');
                return;
            }

            /* Estado de envio */
            btnGerarPix.disabled = true;
            btnGerarPix.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando pagamento...';

            /* FLUXO: Supabase + Mercado Pago (QR PIX dinâmico) */
            const checkout = await window.CheckoutMP.iniciar(formData, {
                onSuccess: () => aposPagamentoConfirmado(formData)
            });

            btnGerarPix.disabled = !camposValidos();
            btnGerarPix.innerHTML = '<span>Gerar QR Code de Pagamento</span> <i class="fas fa-qrcode"></i>';

            if (checkout) return;

            /* Se falhou, tenta o fluxo manual (e-mail + WhatsApp) */
            showToast('Erro ao gerar o pagamento. Tente novamente.', 'error');
        });
    }

    /* ============ Inicialização ============ */
    atualizarEstadoBotao();

    console.log('%c⚖️ Site carregado com sucesso!', 'color: #c9a227; font-size: 16px; font-weight: bold;');
})();
