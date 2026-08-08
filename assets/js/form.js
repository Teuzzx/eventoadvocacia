/* =============================================
   FORM — Inscrição: cupom, PIX, upload e envio
   ============================================= */

(() => {
    'use strict';

    /* ---------- Estado do formulário ---------- */
    let valorAtual = CONFIG.valores.normal;
    let cupomAplicado = false;

    /* ---------- EmailJS ---------- */
    if (typeof emailjs !== 'undefined') {
        emailjs.init(CONFIG.emailjs.publicKey);
    }

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

    /* ============ Cupom de desconto ============ */
    const cupomInput = document.getElementById('cupomDesconto');
    const btnAplicarCupom = document.getElementById('btnAplicarCupom');
    const valorAtualTexto = document.getElementById('valorAtualTexto');
    const valorFinal = document.getElementById('valorFinal');
    const descontoInfo = document.getElementById('descontoInfo');
    const qrCodeImage = document.getElementById('qrCodeImage');
    const pixKeyInput = document.getElementById('pixKey');

    function formatarMoeda(valor) {
        return `R$ ${valor.toFixed(2).replace('.', ',')}`;
    }

    function aplicarCupom() {
        const cupom = cupomInput.value.trim().toUpperCase();

        if (!cupom) {
            showToast('Digite um código de cupom válido!', 'error');
            reverterParaPadrao();
            return;
        }

        if (CONFIG.cuponsValidos.includes(cupom)) {
            valorAtual = CONFIG.valores.desconto;
            cupomAplicado = true;

            valorAtualTexto.textContent = formatarMoeda(valorAtual);
            valorFinal.textContent = formatarMoeda(valorAtual);
            descontoInfo.style.display = 'flex';

            qrCodeImage.src = qrCodeImage.dataset.discountSrc;
            pixKeyInput.value = pixKeyInput.dataset.discountKey;

            cupomInput.disabled = true;
            btnAplicarCupom.disabled = true;
            btnAplicarCupom.textContent = 'Aplicado ✓';

            showToast('Cupom aplicado! Valor com desconto: ' + formatarMoeda(valorAtual), 'success');
        } else {
            showToast('Código de cupom inválido. Verifique e tente novamente.', 'error');
            reverterParaPadrao();
        }
    }

    function reverterParaPadrao() {
        valorAtual = CONFIG.valores.normal;
        cupomAplicado = false;

        valorAtualTexto.textContent = formatarMoeda(valorAtual);
        valorFinal.textContent = formatarMoeda(valorAtual);
        descontoInfo.style.display = 'none';

        qrCodeImage.src = qrCodeImage.dataset.defaultSrc;
        pixKeyInput.value = pixKeyInput.dataset.defaultKey;

        cupomInput.disabled = false;
        cupomInput.value = '';
        btnAplicarCupom.disabled = false;
        btnAplicarCupom.textContent = 'Aplicar';
    }

    btnAplicarCupom?.addEventListener('click', aplicarCupom);

    cupomInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            aplicarCupom();
        }
    });

    /* ============ Copiar chave PIX ============ */
    async function copiarChavePix() {
        const text = pixKeyInput.value;

        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(text);
                showToast('Chave PIX copiada para a área de transferência!', 'success');
                return;
            } catch (err) {
                console.warn('Clipboard API falhou, usando fallback:', err);
            }
        }

        pixKeyInput.select();
        pixKeyInput.setSelectionRange(0, 99999);
        try {
            document.execCommand('copy');
            showToast('Chave PIX copiada para a área de transferência!', 'success');
        } catch (err) {
            showToast('Não foi possível copiar. Selecione e copie manualmente.', 'error');
        }
    }

    document.getElementById('btnCopyPix')?.addEventListener('click', copiarChavePix);

    /* ============ Upload de comprovante ============ */
    const comprovanteInput = document.getElementById('comprovante');
    const fileUploadBox = document.getElementById('fileUploadBox');
    const filePreview = document.getElementById('filePreview');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileIcon = document.getElementById('fileIcon');
    const btnRemoveFile = document.getElementById('btnRemoveFile');
    const filePreviewContent = document.getElementById('filePreviewContent');

    function formatarTamanhoArquivo(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function mostrarErroPreview(mensagem) {
        filePreviewContent.innerHTML = `
            <div class="file-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${mensagem}</p>
            </div>
        `;
    }

    function mostrarPreviewArquivo(file) {
        fileName.textContent = file.name;
        fileSize.textContent = formatarTamanhoArquivo(file.size);

        const isImage = file.type.startsWith('image/');
        const isPDF = file.type === 'application/pdf';

        fileIcon.className = isImage ? 'fas fa-file-image' : (isPDF ? 'fas fa-file-pdf' : 'fas fa-file');

        fileUploadBox.style.display = 'none';
        filePreview.classList.add('show');

        filePreviewContent.innerHTML = `
            <div class="file-loading">
                <div class="spinner"></div>
                <p>Carregando preview...</p>
            </div>
        `;

        if (isImage) {
            const reader = new FileReader();
            reader.onload = (e) => {
                filePreviewContent.innerHTML = `
                    <div class="image-preview">
                        <img src="${e.target.result}" alt="Prévia do comprovante">
                    </div>
                `;
            };
            reader.onerror = () => mostrarErroPreview('Erro ao carregar a imagem');
            reader.readAsDataURL(file);
        } else if (isPDF) {
            filePreviewContent.innerHTML = `
                <div class="pdf-preview">
                    <i class="fas fa-file-pdf pdf-icon"></i>
                    <h4>Documento PDF</h4>
                    <p>Arquivo PDF carregado com sucesso · ${formatarTamanhoArquivo(file.size)}</p>
                </div>
            `;
        } else {
            mostrarErroPreview('Tipo de arquivo não suportado para preview');
        }
    }

    function limparArquivo() {
        comprovanteInput.value = '';
        fileUploadBox.style.display = 'flex';
        filePreview.classList.remove('show');
        filePreviewContent.innerHTML = '';
    }

    if (comprovanteInput && fileUploadBox) {
        fileUploadBox.addEventListener('click', () => comprovanteInput.click());

        fileUploadBox.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadBox.classList.add('drag-over');
        });

        fileUploadBox.addEventListener('dragleave', () => {
            fileUploadBox.classList.remove('drag-over');
        });

        fileUploadBox.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadBox.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    showToast('Arquivo muito grande! Tamanho máximo: 5MB', 'error');
                    return;
                }
                const dt = new DataTransfer();
                dt.items.add(file);
                comprovanteInput.files = dt.files;
                mostrarPreviewArquivo(file);
            }
        });

        comprovanteInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
                showToast('Arquivo muito grande! Tamanho máximo: 5MB', 'error');
                comprovanteInput.value = '';
                return;
            }
            mostrarPreviewArquivo(file);
        });

        btnRemoveFile?.addEventListener('click', (e) => {
            e.stopPropagation();
            limparArquivo();
        });
    }

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

    /* ============ Envio: EmailJS (confirmação ao inscrito) ============ */
    async function enviarConfirmacaoEmailJS(dados) {
        const templateParams = {
            to_email: dados.email,
            to_name: dados.nome,
            codigo_acesso: dados.codigo_acesso,
            event_date: CONFIG.evento.data,
            event_time: CONFIG.evento.horario,
            event_location: `${CONFIG.evento.local} - ${CONFIG.evento.cidade}`,
            tipo_inscricao: dados.tipo_inscricao,
            valor_pago: formatarMoeda(dados.valor_pago),
            cupom_utilizado: dados.cupom_utilizado,
            desconto_aplicado: dados.desconto_aplicado,
            whatsapp: dados.whatsapp,
            oab: dados.oab
        };

        const response = await emailjs.send(
            CONFIG.emailjs.serviceId,
            CONFIG.emailjs.templateId,
            templateParams
        );
        console.log('Email de confirmação enviado:', response);
    }

    /* ============ Envio: Google Sheets ============ */
    async function salvarNaPlanilha(dados) {
        const dadosParaPlanilha = {
            timestamp: new Date().toLocaleString('pt-BR'),
            nome: dados.nome,
            email: dados.email,
            whatsapp: dados.whatsapp,
            oab: dados.oab,
            tipo_inscricao: dados.tipo_inscricao,
            valor_pago: formatarMoeda(dados.valor_pago),
            cupom_utilizado: dados.cupom_utilizado,
            desconto_aplicado: dados.desconto_aplicado,
            temas_interesse: dados.temas,
            duracao_preferida: dados.duracao,
            autoriza_contato: dados.autoriza_contato,
            comprovante_anexado: dados.comprovante_anexado,
            lgpd_aceito: dados.lgpd ? 'Sim' : 'Não'
        };

        // no-cors: não conseguimos ler a resposta, mas a planilha recebe os dados.
        await fetch(CONFIG.googleSheetsUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosParaPlanilha)
        });
        console.log('Dados enviados para a planilha Google Sheets');
    }

    /* ============ Envio: FormSubmit (email com comprovante) ============ */
    async function enviarPorEmail(dados, arquivo) {
        const configsFormSubmit = {
            '_subject': '🎓 Nova Inscrição - Workshop de Prática Previdenciária',
            '_captcha': 'false',
            '_template': 'table',
            '_autoresponse': `Olá ${dados.nome}!

Sua inscrição no Workshop de Prática Previdenciária foi confirmada com sucesso!

🔑 SUA SENHA DE ACESSO AO EVENTO: ${dados.codigo_acesso}
Apresente esta senha no seu celular na entrada do evento (dia 24/10/2025).

📋 DETALHES DA INSCRIÇÃO:
📅 Data: ${CONFIG.evento.data}
⏰ Horário: ${CONFIG.evento.horario}
📍 Local: ${CONFIG.evento.local} - ${CONFIG.evento.cidade}

💰 INFORMAÇÕES DE PAGAMENTO:
🎫 Tipo: ${dados.tipo_inscricao}
💵 Valor: ${formatarMoeda(dados.valor_pago)}
${dados.cupom_utilizado !== 'Não utilizado' ? '🎟️ Cupom: ' + dados.cupom_utilizado + '\n' : ''}${dados.desconto_aplicado !== 'Nenhum' ? '💸 Desconto: ' + dados.desconto_aplicado + '\n' : ''}${arquivo ? '✅ Comprovante de pagamento recebido!\n' : '⚠️ Aguardando comprovante de pagamento\n'}
📧 Recebedor PIX: ${CONFIG.evento.pixRecebedor}

Em breve enviaremos mais informações sobre o evento.

Agradecemos sua participação!
Equipe Workshop Previdenciário`
        };

        const formData = new FormData();
        Object.entries({ ...dados, ...configsFormSubmit }).forEach(([key, value]) => {
            formData.append(key, value);
        });

        if (arquivo) formData.append('attachment', arquivo);

        // AJAX: envia sem navegar a página (FormSubmit retorna JSON)
        const response = await fetch(`https://formsubmit.co/${CONFIG.emailDestino}`, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('FormSubmit respondeu com status ' + response.status);
        }

        console.log('Email enviado via FormSubmit');
    }

    /* ============ Envio: WhatsApp ============ */
    function enviarPorWhatsApp(dados) {
        const temComprovante = dados.comprovante_anexado && dados.comprovante_anexado !== 'Não anexado';

        const mensagem = [
            '🎓 *NOVA INSCRIÇÃO - WORKSHOP PREVIDENCIÁRIO*',
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
            dados.cupom_utilizado !== 'Não utilizado' ? '🎟️ *Cupom:* ' + dados.cupom_utilizado : null,
            dados.desconto_aplicado !== 'Nenhum' ? '💸 *Desconto:* ' + dados.desconto_aplicado : null,
            temComprovante ? '✅ *COMPROVANTE ANEXADO:* ' + dados.comprovante_anexado : '⚠️ *Comprovante:* Não anexado',
            '',
            '📚 *Temas de Interesse:*',
            dados.temas,
            '',
            '⏱️ *Duração Preferida:*',
            dados.duracao,
            '',
            '📨 *Autoriza Contato:* ' + dados.autoriza_contato,
            '🕐 *Inscrição realizada em:* ' + dados.data,
            '',
            temComprovante ? '📎 _Comprovante enviado por email_' : '💰 _Aguardando envio do comprovante_',
            '_Inscrição realizada via formulário do site._'
        ].filter(Boolean).join('\n');

        const url = `https://wa.me/${CONFIG.whatsappNumero}?text=${encodeURIComponent(mensagem)}`;

        setTimeout(() => window.open(url, '_blank'), 1500);
    }

    /* ============ Submit do formulário ============ */
    const formInscricao = document.getElementById('formInscricao');

    /* Confirmações após pagamento aprovado (fluxo Mercado Pago) */
    async function enviarConfirmacoes(formData) {
        try {
            await enviarConfirmacaoEmailJS(formData);
        } catch (err) {
            console.warn('E-mail de confirmação não enviado (não crítico):', err);
        }
        enviarPorWhatsApp(formData);
    }

    if (formInscricao) {
        formInscricao.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                nome: document.getElementById('nome')?.value.trim() || '',
                email: document.getElementById('email')?.value.trim() || '',
                whatsapp: document.getElementById('whatsapp')?.value.trim() || '',
                oab: document.getElementById('oab')?.value.trim() || '',
                codigo_acesso: gerarCodigoAcesso(),
                temas: document.getElementById('temas')?.value.trim() || 'Não informado',
                duracao: document.querySelector('input[name="duracao"]:checked')?.value || 'Não informado',
                autoriza_contato: document.getElementById('autorizaContato')?.checked ? 'Sim' : 'Não',
                lgpd: document.getElementById('lgpd')?.checked || false,
                comprovante_anexado: comprovanteInput?.files[0] ? 'Sim - ' + comprovanteInput.files[0].name : 'Não anexado',
                tipo_inscricao: cupomAplicado ? 'Inscrição com Desconto AMACENTROSUL' : 'Inscrição Normal',
                valor_pago: valorAtual,
                cupom_utilizado: cupomAplicado ? (cupomInput?.value || 'N/A') : 'Não utilizado',
                desconto_aplicado: cupomAplicado ? 'R$ 10,00' : 'Nenhum',
                data: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
            };

            /* Validações */
            if (!formData.nome || !formData.email || !formData.whatsapp || !formData.oab) {
                showToast('Por favor, preencha todos os campos obrigatórios!', 'error');
                return;
            }

            if (!validarEmail(formData.email)) {
                showToast('Por favor, insira um e-mail válido!', 'error');
                return;
            }

            if (!validarWhatsApp(formData.whatsapp)) {
                showToast('Por favor, insira um WhatsApp válido com DDD!', 'error');
                return;
            }

            if (!formData.lgpd) {
                showToast('Você precisa aceitar os termos de uso de dados (LGPD)!', 'error');
                return;
            }

            /* Checkout disponível? (Supabase + Mercado Pago configurados) */
            const checkoutDisponivel = window.CheckoutMP &&
                Boolean(CONFIG.supabase?.url && CONFIG.supabase?.anonKey && CONFIG.mercadopago?.publicKey);

            if (!checkoutDisponivel && (!comprovanteInput || !comprovanteInput.files?.length)) {
                showToast('Por favor, anexe o comprovante de pagamento para prosseguir!', 'error');
                return;
            }

            /* Estado de envio */
            const btnSubmit = formInscricao.querySelector('.btn-submit');
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';

            /* NOVO FLUXO: Supabase + Mercado Pago (QR PIX dinâmico) */
            if (checkoutDisponivel) {
                const checkout = await window.CheckoutMP.iniciar(formData, comprovanteInput?.files[0], {
                    onSuccess: () => enviarConfirmacoes(formData)
                });

                btnSubmit.disabled = false;
                btnSubmit.innerHTML = '<span>Confirmar Inscrição</span> <i class="fas fa-paper-plane"></i>';

                if (checkout) return;
                // Se falhou, continua com o fluxo manual abaixo
            }

            const erros = [];

            /* 1. Google Sheets */
            try {
                await salvarNaPlanilha(formData);
            } catch (err) {
                console.error('Erro na planilha:', err);
                erros.push('planilha');
            }

            /* 2. Email com comprovante (FormSubmit) */
            try {
                await enviarPorEmail(formData, comprovanteInput?.files[0]);
            } catch (err) {
                console.error('Erro no envio do email:', err);
                erros.push('email');
            }

            /* 3. Confirmação automática ao inscrito (EmailJS) */
            try {
                await enviarConfirmacaoEmailJS(formData);
            } catch (err) {
                console.warn('Email de confirmação não enviado (não crítico):', err);
            }

            /* 4. Notificação WhatsApp */
            enviarPorWhatsApp(formData);

            /* Resultado */
            const msgSucesso = `Inscrição realizada! Sua senha de acesso: ${formData.codigo_acesso} — verifique também seu e-mail.`;
            if (erros.includes('planilha')) {
                showToast('Inscrição enviada! Obs.: a planilha pode estar indisponível no momento.', 'warning');
            } else {
                showToast(msgSucesso, 'success');
            }

            formInscricao.reset();
            limparArquivo();
            reverterParaPadrao();

            btnSubmit.disabled = false;
            btnSubmit.innerHTML = '<span>Confirmar Inscrição</span> <i class="fas fa-paper-plane"></i>';

            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 300);
        });
    }

    /* ============ Inicialização ============ */
    if (cupomInput) reverterParaPadrao();

    console.log('%c⚖️ Site carregado com sucesso!', 'color: #c9a227; font-size: 16px; font-weight: bold;');
})();
