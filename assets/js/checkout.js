/* =============================================
   CHECKOUT — Supabase + Mercado Pago (QR PIX dinâmico)
   Fluxo: salva inscrição → cria pagamento PIX →
   mostra QR dinâmico → aguarda confirmação (webhook)
   ============================================= */

(() => {
    'use strict';

    const SUPABASE_CONFIGURADO = () => Boolean(CONFIG.supabase && CONFIG.supabase.url && CONFIG.supabase.anonKey);
    const MP_CONFIGURADO = () => Boolean(CONFIG.mercadopago && CONFIG.mercadopago.publicKey);

    const modal = document.getElementById('pixModal');
    const modalClose = document.getElementById('pixModalClose');
    const pixQrImage = document.getElementById('pixQrImage');
    const pixCopyCode = document.getElementById('pixCopyCode');
    const pixCopyBtn = document.getElementById('pixCopyBtn');
    const pixQrValor = document.getElementById('pixQrValor');
    const pixQrNome = document.getElementById('pixQrNome');
    const pixStatus = document.getElementById('pixStatus');

    let pollTimer = null;
    let inscricaoId = null;
    let opcoesAtuais = null;

    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle' };
        toast.innerHTML = `<i class="fas ${icons[type] || icons.success}"></i><span>${message}</span>`;
        toast.className = `toast show ${type}`;
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.remove('show'), 4200);
    }

    function abrirModal() {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function fecharModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
        if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
        }
    }

    modalClose?.addEventListener('click', fecharModal);
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) fecharModal();
    });

    function setStatusSucesso() {
        if (!pixStatus) return;
        pixStatus.className = 'pix-status success';
        pixStatus.innerHTML = `
            <i class="fas fa-circle-check"></i>
            <span>Pagamento confirmado! Sua inscrição está registrada.</span>
        `;
    }

    function setStatusAguardando() {
        if (!pixStatus) return;
        pixStatus.className = 'pix-status';
        pixStatus.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <span>Aguardando confirmação do pagamento...</span>
        `;
    }

    /* ---------- Polling do status ---------- */
    async function verificarStatus() {
        if (!inscricaoId) return;

        try {
            const response = await fetch(
                `${CONFIG.supabase.url}/functions/v1/consultar-status`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${CONFIG.supabase.anonKey}`,
                        'apikey': CONFIG.supabase.anonKey
                    },
                    body: JSON.stringify({ id: inscricaoId })
                }
            );
            const result = await response.json();

            if (result.status === 'pago' || result.status === 'confirmado') {
                clearInterval(pollTimer);
                pollTimer = null;
                setStatusSucesso();
                showToast('Pagamento confirmado! Inscrição realizada com sucesso.');
                if (opcoesAtuais && typeof opcoesAtuais.onSuccess === 'function') {
                    try { await opcoesAtuais.onSuccess(); } catch (err) { console.warn('Erro nas confirmações pós-pagamento:', err); }
                }
                setTimeout(() => {
                    fecharModal();
                    const form = document.getElementById('formInscricao');
                    if (form) form.reset();
                    const btn = document.getElementById('btnGerarPix');
                    if (btn) btn.disabled = true;
                }, 3000);
            }
        } catch (err) {
            console.warn('Falha ao consultar status:', err);
        }
    }

    /* ---------- Gera o ID da inscrição no navegador ---------- */
    function gerarIdInscricao() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    /* ---------- Fluxo principal ---------- */
    async function iniciar(dados, opcoes = {}) {
        if (!SUPABASE_CONFIGURADO() || !MP_CONFIGURADO()) {
            return null;
        }

        opcoesAtuais = opcoes;

        try {
            inscricaoId = gerarIdInscricao();

            // 1. Salva a inscrição no Supabase (status: pendente)
            const insertResponse = await fetch(
                `${CONFIG.supabase.url}/rest/v1/inscricoes`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': CONFIG.supabase.anonKey,
                        'Authorization': `Bearer ${CONFIG.supabase.anonKey}`,
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        id: inscricaoId,
                        nome: dados.nome,
                        email: dados.email,
                        whatsapp: dados.whatsapp,
                        oab_cpf: dados.oab,
                        codigo_acesso: dados.codigo_acesso,
                        tipo_inscricao: dados.tipo_inscricao,
                        valor_pago: dados.valor_pago,
                        cupom_utilizado: dados.cupom_utilizado === 'Não utilizado' ? null : dados.cupom_utilizado,
                        desconto_aplicado: dados.desconto_aplicado,
                        lgpd_aceito: dados.lgpd ? 'Sim' : 'Não'
                    })
                }
            );

            if (!insertResponse.ok) {
                const err = new Error(`Falha ao salvar inscrição (HTTP ${insertResponse.status})`);
                err.name = 'ErroInscricao';
                throw err;
            }

            // 2. Cria o pagamento PIX no Mercado Pago
            const paymentResponse = await fetch(
                `${CONFIG.supabase.url}/functions/v1/create-payment`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${CONFIG.supabase.anonKey}`,
                        'apikey': CONFIG.supabase.anonKey
                    },
                    body: JSON.stringify({
                        inscricao_id: inscricaoId,
                        nome: dados.nome,
                        email: dados.email,
                        whatsapp: dados.whatsapp,
                        oab_cpf: dados.oab,
                        valor: dados.valor_pago,
                        tipo_inscricao: dados.tipo_inscricao,
                        cupom: dados.cupom_utilizado === 'Não utilizado' ? null : dados.cupom_utilizado,
                        desconto: dados.desconto_aplicado
                    })
                }
            );

            let paymentResult = null;
            try {
                paymentResult = await paymentResponse.json();
            } catch (err) {
                console.warn('Resposta inválida do create-payment:', err);
            }

            if (!paymentResponse.ok || !paymentResult) {
                const detalhe = (paymentResult && paymentResult.error) || `HTTP ${paymentResponse.status}`;
                const erro = new Error(detalhe);
                erro.name = 'ErroPagamento';
                throw erro;
            }

            // 3. Mostra o QR Code dinâmico no modal
            if (pixQrImage && paymentResult.qr_base64) {
                pixQrImage.src = `data:image/png;base64,${paymentResult.qr_base64}`;
            } else if (pixQrImage) {
                pixQrImage.alt = 'QR Code indisponível — use o código PIX';
                pixQrImage.src = '';
            }

            if (pixCopyCode) {
                pixCopyCode.value = paymentResult.qr_code || '';
            }
            if (pixQrValor) {
                pixQrValor.textContent = `R$ ${Number(paymentResult.valor).toFixed(2).replace('.', ',')}`;
            }
            if (pixQrNome) {
                pixQrNome.textContent = dados.nome;
            }

            setStatusAguardando();
            abrirModal();

            // 4. Polling: verifica o pagamento a cada 5 segundos
            pollTimer = setInterval(verificarStatus, 5000);

            return { inscricaoId, modal: true };
        } catch (err) {
            console.error('Erro no checkout:', err);
            if (err && err.name === 'ErroPagamento') {
                showToast('Não foi possível gerar o QR Code PIX. O pagamento está temporariamente indisponível — fale com a organização no WhatsApp: (89) 99449-9408.', 'error');
                return { error: err.message };
            }
            showToast('Erro ao registrar a inscrição. Tente novamente.', 'error');
            return { error: (err && err.message) || 'Erro desconhecido' };
        }
    }

    /* ---------- Copiar código PIX do modal ---------- */
    async function copiarCodigoPix() {
        const text = pixCopyCode.value;
        if (!text) return;

        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(text);
                showToast('Código PIX copiado!');
                return;
            } catch (err) {
                console.warn(err);
            }
        }

        pixCopyCode.select();
        pixCopyCode.setSelectionRange(0, 99999);
        try {
            document.execCommand('copy');
            showToast('Código PIX copiado!');
        } catch (err) {
            showToast('Selecione o código e copie manualmente.', 'error');
        }
    }

    pixCopyBtn?.addEventListener('click', copiarCodigoPix);

    window.CheckoutMP = { iniciar };
})();
