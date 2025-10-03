// ===================================
// CONFIGURAÇÕES IMPORTANTES
// ===================================

// 1. Configure o FormSubmit (serviço GRATUITO para envio de emails)
// Acesse: https://formsubmit.co/
// Substitua 'SEU_EMAIL_AQUI' pelo email que receberá as inscrições
const EMAIL_DESTINO = 'contatoworkshoppi@gmail.com';

// 2. Número do WhatsApp para notificações (formato: 5511999999999)
const WHATSAPP_NUMERO = '558999384039';

// 3. URL do Google Apps Script para salvar na planilha
// INSTRUÇÕES PARA CONFIGURAR:
// 1. Acesse: https://script.google.com/
// 2. Crie um novo projeto
// 3. Cole o código fornecido no arquivo de instruções
// 4. Publique como Web App
// 5. Substitua a URL abaixo pela URL do seu Web App
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyOph-CClNuW_ooGMWQOA8PMQNBewMhKqQKU_grJH1EjxpIOu16Ea9Oqf3DmdDTQxjx/exec';

// ===================================
// MENU MOBILE
// ===================================
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        }
    });

    // Fechar menu ao clicar em um link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });
}

// ===================================
// HEADER SCROLL EFFECT
// ===================================
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (header) {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
});

// ===================================
// SMOOTH SCROLL
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===================================
// FORMATAÇÃO DE CAMPOS
// ===================================

// Formatação de WhatsApp
const whatsappInput = document.getElementById('whatsapp');
if (whatsappInput) {
    whatsappInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        if (value.length > 6) {
            value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        } else if (value.length > 0) {
            value = value.replace(/(\d{0,2})/, '($1');
        }
        
        e.target.value = value;
    });
}

// Formatação OAB
const oabInput = document.getElementById('oab');
if (oabInput) {
    oabInput.addEventListener('input', (e) => {
        let value = e.target.value.toUpperCase();
        e.target.value = value;
    });
}

// ===================================
// SISTEMA DE TOAST
// ===================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// ===================================
// VALIDAÇÃO DE EMAIL
// ===================================
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// ===================================
// UPLOAD DE ARQUIVO
// ===================================
const comprovanteInput = document.getElementById('comprovante');
const fileUploadBox = document.getElementById('fileUploadBox');
const filePreview = document.getElementById('filePreview');
const fileName = document.getElementById('fileName');
const btnRemoveFile = document.getElementById('btnRemoveFile');

if (comprovanteInput && fileUploadBox) {
    // Click no box para abrir seletor
    fileUploadBox.addEventListener('click', () => comprovanteInput.click());

    // Drag and drop
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
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            comprovanteInput.files = files;
            mostrarPreviewArquivo(files[0]);
        }
    });

    // Seleção de arquivo
    comprovanteInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tamanho (5MB)
            if (file.size > 5 * 1024 * 1024) {
                showToast('Arquivo muito grande! Tamanho máximo: 5MB', 'error');
                comprovanteInput.value = '';
                return;
            }
            mostrarPreviewArquivo(file);
        }
    });

    // Remover arquivo
    if (btnRemoveFile) {
        btnRemoveFile.addEventListener('click', (e) => {
            e.stopPropagation();
            comprovanteInput.value = '';
            fileUploadBox.style.display = 'flex';
            filePreview.style.display = 'none';
            
            // Limpar preview content
            const filePreviewContent = document.getElementById('filePreviewContent');
            if (filePreviewContent) {
                filePreviewContent.innerHTML = '';
            }
        });
    }
}

function mostrarPreviewArquivo(file) {
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileIcon = document.getElementById('fileIcon');
    const filePreviewContent = document.getElementById('filePreviewContent');
    
    // Atualizar informações do arquivo
    fileName.textContent = file.name;
    fileSize.textContent = formatarTamanhoArquivo(file.size);
    
    // Determinar tipo de arquivo e ícone
    const fileType = file.type;
    const isImage = fileType.startsWith('image/');
    const isPDF = fileType === 'application/pdf';
    
    // Atualizar ícone
    if (isImage) {
        fileIcon.className = 'fas fa-file-image';
    } else if (isPDF) {
        fileIcon.className = 'fas fa-file-pdf';
    } else {
        fileIcon.className = 'fas fa-file';
    }
    
    // Mostrar loading
    filePreviewContent.innerHTML = `
        <div class="file-loading">
            <div class="spinner"></div>
            <p>Carregando preview...</p>
        </div>
    `;
    
    // Mostrar preview
    fileUploadBox.style.display = 'none';
    filePreview.style.display = 'flex';
    
    // Gerar preview baseado no tipo
    if (isImage) {
        gerarPreviewImagem(file);
    } else if (isPDF) {
        gerarPreviewPDF(file);
    } else {
        mostrarErroPreview('Tipo de arquivo não suportado para preview');
    }
}

function formatarTamanhoArquivo(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function gerarPreviewImagem(file) {
    const filePreviewContent = document.getElementById('filePreviewContent');
    const reader = new FileReader();
    
    reader.onload = function(e) {
        filePreviewContent.innerHTML = `
            <div class="image-preview">
                <img src="${e.target.result}" alt="Preview da imagem" />
            </div>
        `;
    };
    
    reader.onerror = function() {
        mostrarErroPreview('Erro ao carregar a imagem');
    };
    
    reader.readAsDataURL(file);
}

function gerarPreviewPDF(file) {
    const filePreviewContent = document.getElementById('filePreviewContent');
    
    filePreviewContent.innerHTML = `
        <div class="pdf-preview">
            <i class="fas fa-file-pdf pdf-icon"></i>
            <div class="pdf-info">
                <h4>Documento PDF</h4>
                <p>Arquivo PDF carregado com sucesso</p>
                <p><strong>Tamanho:</strong> ${formatarTamanhoArquivo(file.size)}</p>
            </div>
        </div>
    `;
}

function mostrarErroPreview(mensagem) {
    const filePreviewContent = document.getElementById('filePreviewContent');
    
    filePreviewContent.innerHTML = `
        <div class="file-error">
            <i class="fas fa-exclamation-triangle error-icon"></i>
            <p>${mensagem}</p>
        </div>
    `;
}

// ===================================
// ENVIO DO FORMULÁRIO
// ===================================
const formInscricao = document.getElementById('formInscricao');

if (formInscricao) {
    formInscricao.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Coletar dados do formulário
        const formData = {
            nome: document.getElementById('nome')?.value || '',
            email: document.getElementById('email')?.value || '',
            whatsapp: document.getElementById('whatsapp')?.value || '',
            oab: document.getElementById('oab')?.value || '',
            temas: document.getElementById('temas')?.value || 'Não informado',
            duracao: document.querySelector('input[name="duracao"]:checked')?.value || 'Não informado',
            autoriza_contato: document.getElementById('autorizaContato')?.checked ? 'Sim' : 'Não',
            lgpd: document.getElementById('lgpd')?.checked,
            comprovante_anexado: comprovanteInput?.files[0] ? 'Sim - ' + comprovanteInput.files[0].name : 'Não anexado',
            data: new Date().toLocaleString('pt-BR', { 
                dateStyle: 'short', 
                timeStyle: 'short' 
            })
        };
        
        // Validações
        if (!formData.nome || !formData.email || !formData.whatsapp || !formData.oab) {
            showToast('Por favor, preencha todos os campos obrigatórios!', 'error');
            return;
        }
        
        if (!validarEmail(formData.email)) {
            showToast('Por favor, insira um e-mail válido!', 'error');
            return;
        }
        
        if (!formData.lgpd) {
            showToast('Você precisa aceitar os termos de uso de dados!', 'error');
            return;
        }
        
        // Desabilitar botão durante envio
        const btnSubmit = formInscricao.querySelector('.btn-submit');
        const btnOriginalText = btnSubmit.innerHTML;
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span>Enviando...</span> <i class="fas fa-spinner fa-spin"></i>';
        
        try {
            // MÉTODO 1: Salvar na planilha Google Sheets
            await salvarNaPlanilha(formData);
            
            // MÉTODO 2: Enviar via FormSubmit (Email com anexo)
            await enviarPorEmail(formData, comprovanteInput?.files[0]);
            
            // MÉTODO 3: Notificar via WhatsApp
            enviarPorWhatsApp(formData);
            
            // Sucesso
            showToast('Inscrição realizada com sucesso! Dados salvos na planilha e e-mail enviado.', 'success');
            formInscricao.reset();
            
            // Resetar upload de arquivo
            if (comprovanteInput) {
                comprovanteInput.value = '';
                fileUploadBox.style.display = 'flex';
                filePreview.style.display = 'none';
            }
            
            // Scroll para o topo
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            showToast('Erro ao enviar inscrição. Por favor, tente novamente ou entre em contato via WhatsApp.', 'error');
        } finally {
            // Reabilitar botão
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = btnOriginalText;
        }
    });
}

// ===================================
// SALVAR NA PLANILHA GOOGLE SHEETS
// ===================================
async function salvarNaPlanilha(dados) {
    // Verificar se a URL do Google Sheets está configurada
    if (GOOGLE_SHEETS_URL.includes('SEU_SCRIPT_ID_AQUI')) {
        console.warn('⚠️ Google Sheets não configurado. Pulando salvamento na planilha.');
        return;
    }
    
    try {
        const dadosParaPlanilha = {
            timestamp: new Date().toLocaleString('pt-BR'),
            nome: dados.nome,
            email: dados.email,
            whatsapp: dados.whatsapp,
            oab: dados.oab,
            temas_interesse: dados.temas,
            duracao_preferida: dados.duracao,
            autoriza_contato: dados.autoriza_contato,
            comprovante_anexado: dados.comprovante_anexado,
            lgpd_aceito: dados.lgpd ? 'Sim' : 'Não'
        };
        
        const response = await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            mode: 'no-cors', // Necessário para Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosParaPlanilha)
        });
        
        console.log('✅ Dados enviados para a planilha Google Sheets');
        
    } catch (error) {
        console.error('❌ Erro ao salvar na planilha:', error);
        // Não interromper o processo se a planilha falhar
        showToast('Dados salvos localmente. Planilha pode estar indisponível.', 'warning');
    }
}

// ===================================
// ENVIAR POR EMAIL (FormSubmit)
// ===================================
async function enviarPorEmail(dados, arquivo) {
    // Criar formulário oculto para envio via FormSubmit
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `https://formsubmit.co/${EMAIL_DESTINO}`;
    form.enctype = 'multipart/form-data';
    form.style.display = 'none';
    
    // Configurações do FormSubmit
    const configs = {
        '_subject': '🎓 Nova Inscrição - Workshop de Prática Previdenciária',
        '_captcha': 'false',
        '_template': 'table',
        '_autoresponse': `Olá ${dados.nome}!\n\nSua inscrição no Workshop de Prática Previdenciária foi confirmada com sucesso!\n\n📅 Data: 24 de Outubro de 2025\n⏰ Horário: 13:30 às 18:00\n📍 Local: Auditório do Senac - Picos/PI\n\n${arquivo ? '✅ Comprovante de pagamento recebido!\n\n' : ''}Em breve enviaremos mais informações sobre o evento.\n\nAgradecemos sua participação!\n\nEquipe Workshop Previdenciário`
    };
    
    // Adicionar dados e configurações
    const todosOsDados = { ...dados, ...configs };
    
    for (const [key, value] of Object.entries(todosOsDados)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
    }
    
    // Adicionar arquivo se existir
    if (arquivo) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.name = 'attachment';
        fileInput.style.display = 'none';
        
        // Transferir o arquivo para o novo input
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(arquivo);
        fileInput.files = dataTransfer.files;
        
        form.appendChild(fileInput);
    }
    
    document.body.appendChild(form);
    form.submit();
    
    // Remover formulário após envio
    setTimeout(() => {
        document.body.removeChild(form);
    }, 1000);
}

// ===================================
// ENVIAR POR WHATSAPP
// ===================================
function enviarPorWhatsApp(dados) {
    const temComprovante = dados.comprovante_anexado && dados.comprovante_anexado !== 'Não anexado';
    
    const mensagem = `
🎓 *NOVA INSCRIÇÃO - WORKSHOP PREVIDENCIÁRIO*

👤 *Nome:* ${dados.nome}
📧 *E-mail:* ${dados.email}
📱 *WhatsApp:* ${dados.whatsapp}
⚖️ *OAB:* ${dados.oab}

${temComprovante ? '✅ *COMPROVANTE ANEXADO:* ' + dados.comprovante_anexado + '\n' : '⚠️ *Comprovante:* Não anexado\n'}
📚 *Temas de Interesse:*
${dados.temas}

⏱️ *Duração Preferida:*
${dados.duracao}

📨 *Autoriza Contato:* ${dados.autoriza_contato}

🕐 *Data/Hora da Inscrição:*
${dados.data}

${temComprovante ? '📎 _Comprovante enviado por email_' : '💰 _Aguardando envio do comprovante_'}
_Inscrição realizada via formulário do site._
    `.trim();
    
    const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;
    
    // Abrir WhatsApp em nova aba após 2 segundos
    setTimeout(() => {
        window.open(url, '_blank');
    }, 2000);
}

// ===================================
// ANIMAÇÕES AO SCROLL
// ===================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observar elementos que devem animar ao scroll
document.querySelectorAll('.info-card, .temas-list li, .contato-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ===================================
// CONSOLE LOG
// ===================================
console.log('%c🎓 Workshop de Prática Previdenciária', 
    'background: linear-gradient(135deg, #d4af37, #f4e5a8); color: #1a1a2e; font-size: 20px; font-weight: bold; padding: 15px; border-radius: 5px;');
console.log('%c📅 24 de Outubro de 2025 | 📍 Picos/PI', 
    'color: #d4af37; font-size: 14px; font-weight: bold;');
console.log('%cDesenvolvido para Dra. Andréa Moura ⚖️', 
    'color: #666; font-size: 12px;');

// ===================================
// INSTRUÇÕES DE CONFIGURAÇÃO
// ===================================
console.log('%c\n⚙️ CONFIGURAÇÃO NECESSÁRIA:', 
    'color: #ff6666; font-size: 16px; font-weight: bold;');
console.log('%c1. Substitua EMAIL_DESTINO no script.js pelo seu email', 
    'color: #666; font-size: 12px;');
console.log('%c2. Verifique o número do WhatsApp em WHATSAPP_NUMERO', 
    'color: #666; font-size: 12px;');
console.log('%c3. Configure GOOGLE_SHEETS_URL com seu Google Apps Script', 
    'color: #666; font-size: 12px;');
console.log('%c4. No primeiro envio via FormSubmit, confirme o email', 
    'color: #666; font-size: 12px;');