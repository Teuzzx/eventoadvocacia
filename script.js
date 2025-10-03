// Inicializar AOS (Animate On Scroll)
AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    offset: 100
});

// Menu Mobile Toggle
const menuToggle = document.getElementById('menuToggle');
const nav = document.querySelector('.nav');

menuToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
    const icon = menuToggle.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

// Fechar menu ao clicar em um link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(0, 0, 0, 0.98)';
        header.style.padding = '0.5rem 0';
    } else {
        header.style.background = 'rgba(0, 0, 0, 0.95)';
        header.style.padding = '1rem 0';
    }
});

// Formatação de telefone
const telefoneInput = document.getElementById('telefone');
telefoneInput.addEventListener('input', (e) => {
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

// Formatação OAB
const oabInput = document.getElementById('oab');
oabInput.addEventListener('input', (e) => {
    let value = e.target.value.toUpperCase();
    e.target.value = value;
});

// Função para mostrar toast
function showToast(message, type = 'success') {
    const backgroundColor = type === 'success' 
        ? 'linear-gradient(135deg, #d4af37 0%, #f4e5a8 100%)'
        : 'linear-gradient(135deg, #ff4444 0%, #ff6666 100%)';
    
    Toastify({
        text: message,
        duration: 4000,
        gravity: 'top',
        position: 'right',
        stopOnFocus: true,
        style: {
            background: backgroundColor,
            color: '#000',
            fontWeight: 'bold',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }
    }).showToast();
}

// ==========================
// CONFIGURAÇÃO GOOGLE SHEETS
// ==========================
// 👉 Cole aqui a URL gerada no Apps Script (Implantar como App da Web)
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/SEU_ID_AQUI/exec';

// Função para enviar dados para Google Sheets
async function enviarParaGoogleSheets(dados) {
    try {
        const response = await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados)
        });
        console.log('Dados enviados para Google Sheets:', dados);
        return true;
    } catch (error) {
        console.error('Erro ao enviar para Google Sheets:', error);
        return false;
    }
}

// ==========================
// FORMULÁRIO DE INSCRIÇÃO
// ==========================
const formInscricao = document.getElementById('formInscricao');
formInscricao.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const dados = {
        nome: document.getElementById('nome').value,
        telefone: document.getElementById('telefone').value,
        email: document.getElementById('email').value,
        oab: document.getElementById('oab').value || 'Não informado',
        data: new Date().toLocaleString('pt-BR')
    };
    
    if (!dados.nome || !dados.telefone || !dados.email) {
        showToast('Por favor, preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dados.email)) {
        showToast('Por favor, insira um e-mail válido!', 'error');
        return;
    }
    
    await enviarParaGoogleSheets({ tipo: 'inscricao', ...dados });
    
    const mensagemWhatsApp = `
*Nova Inscrição - Evento de Advocacia 2025*

📝 *Nome:* ${dados.nome}
📱 *Telefone:* ${dados.telefone}
📧 *E-mail:* ${dados.email}
⚖️ *OAB:* ${dados.oab}
🕐 *Data/Hora:* ${dados.data}
    `.trim();
    
    const numeroWhatsApp = '558999384039';
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagemWhatsApp)}`;
    
    showToast('Inscrição registrada! Você será redirecionado para o WhatsApp.', 'success');
    formInscricao.reset();
    
    setTimeout(() => {
        window.open(urlWhatsApp, '_blank');
    }, 1500);
});

// ==========================
// FORMULÁRIO DE COMPROVANTE
// ==========================
const comprovanteInput = document.getElementById('comprovante');
const fileNameDisplay = document.getElementById('fileName');

if (comprovanteInput) {
    comprovanteInput.addEventListener('change', (e) => {
        const fileName = e.target.files[0]?.name;
        fileNameDisplay.textContent = fileName ? fileName : 'Selecione o comprovante (imagem ou PDF)';
    });
}

const formComprovante = document.getElementById('formComprovante');
if (formComprovante) {
    formComprovante.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nomeComprovante = document.getElementById('nomeComprovante').value;
        const comprovanteFile = document.getElementById('comprovante').files[0];
        
        if (!comprovanteFile) {
            showToast('Por favor, selecione um comprovante!', 'error');
            return;
        }
        
        if (comprovanteFile.size > 5 * 1024 * 1024) {
            showToast('O arquivo deve ter no máximo 5MB!', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = async function(event) {
            const fileBase64 = event.target.result;
            
            const dados = {
                nome: nomeComprovante,
                nomeArquivo: comprovanteFile.name,
                tipoArquivo: comprovanteFile.type,
                tamanhoArquivo: (comprovanteFile.size / 1024).toFixed(2) + ' KB',
                data: new Date().toLocaleString('pt-BR'),
                base64: fileBase64
            };
            
            await enviarParaGoogleSheets({ tipo: 'comprovante', ...dados });
            
            const mensagemWhatsApp = `
*Comprovante de Pagamento - Evento de Advocacia 2025*

📝 *Nome:* ${dados.nome}
📎 *Arquivo:* ${dados.nomeArquivo}
📊 *Tamanho:* ${dados.tamanhoArquivo}
🕐 *Data/Hora:* ${dados.data}

_Obs: O comprovante foi anexado e registrado na planilha._
            `.trim();
            
            const numeroWhatsApp = '558999384039';
            const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagemWhatsApp)}`;
            
            showToast('Comprovante enviado com sucesso! Redirecionando para o WhatsApp...', 'success');
            formComprovante.reset();
            fileNameDisplay.textContent = 'Selecione o comprovante (imagem ou PDF)';
            
            setTimeout(() => {
                window.open(urlWhatsApp, '_blank');
            }, 1500);
        };
        
        reader.readAsDataURL(comprovanteFile);
    });
}

// Log
console.log('%c🎓 Evento de Advocacia 2025 ', 'background: #d4af37; color: #000; font-size: 20px; font-weight: bold; padding: 10px;');
console.log('%cDesenvolvido com ❤️ para Dra. Andréa Moura', 'color: #d4af37; font-size: 14px;');
