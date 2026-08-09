/* =============================================
   ADMIN — Lógica do painel da coordenação
   Login (Supabase Auth) + dashboard + ações
   ============================================= */

(() => {
    'use strict';

    const isConfigured = () => Boolean(CONFIG.supabase.url && CONFIG.supabase.anonKey);

    let supabase = null;
    let inscricoes = [];

    /* ---------- Elementos ---------- */
    const loginScreen = document.getElementById('loginScreen');
    const dashboard = document.getElementById('dashboard');
    const loginForm = document.getElementById('loginForm');
    const loginEmail = document.getElementById('loginEmail');
    const loginSenha = document.getElementById('loginSenha');
    const loginError = document.getElementById('loginError');
    const loginBtn = document.getElementById('loginBtn');
    const tableBody = document.getElementById('tableBody');
    const filterStatus = document.getElementById('filterStatus');
    const searchInput = document.getElementById('searchInput');
    const toast = document.getElementById('toast');

    function showToast(message, type = 'success') {
        const icons = { success: 'fa-circle-check', error: 'fa-circle-exclamation', warning: 'fa-triangle-exclamation' };
        toast.innerHTML = `<i class="fas ${icons[type] || icons.success}"></i><span>${message}</span>`;
        toast.className = `toast show ${type}`;
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
    }

    function formatarData(iso) {
        if (!iso) return '-';
        const d = new Date(iso);
        return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
    }

    function formatarMoeda(valor) {
        return `R$ ${Number(valor || 0).toFixed(2).replace('.', ',')}`;
    }

    const STATUS_LABELS = {
        pendente: 'Pendente',
        pago: 'Pago',
        confirmado: 'Confirmado',
        cancelado: 'Cancelado'
    };

    /* ---------- Estatísticas ---------- */
    function atualizarStats() {
        const total = inscricoes.length;
        const pendentes = inscricoes.filter(i => i.status === 'pendente').length;
        const pagos = inscricoes.filter(i => i.status === 'pago').length;
        const confirmados = inscricoes.filter(i => i.status === 'confirmado').length;
        const certificados = inscricoes.filter(i => i.certificado_liberado).length;

        document.getElementById('statTotal').textContent = total;
        document.getElementById('statPendentes').textContent = pendentes;
        document.getElementById('statPagos').textContent = pagos;
        document.getElementById('statConfirmados').textContent = confirmados;
        document.getElementById('statCertificados').textContent = certificados;
    }

    /* ---------- Render da tabela ---------- */
    function renderTabela() {
        const filtro = filterStatus.value;
        const busca = searchInput.value.trim().toLowerCase();

        let lista = inscricoes;

        if (filtro) lista = lista.filter(i => i.status === filtro);
        if (busca) {
            lista = lista.filter(i =>
                (i.nome || '').toLowerCase().includes(busca) ||
                (i.email || '').toLowerCase().includes(busca) ||
                (i.oab_cpf || '').toLowerCase().includes(busca) ||
                (i.whatsapp || '').toLowerCase().includes(busca)
            );
        }

        if (!lista.length) {
            tableBody.innerHTML = `
                <tr><td colspan="7" class="table-empty">
                    <i class="fas fa-inbox"></i> Nenhuma inscrição encontrada
                </td></tr>`;
            atualizarStats();
            return;
        }

        tableBody.innerHTML = lista.map(insc => `
            <tr>
                <td>
                    <strong class="cell-name">${insc.nome || '-'}</strong>
                    ${insc.temas ? `<small class="cell-sub">${insc.temas}</small>` : ''}
                </td>
                <td>
                    <span class="cell-line"><i class="fas fa-envelope"></i> ${insc.email || '-'}</span>
                    <span class="cell-line"><i class="fab fa-whatsapp"></i> ${insc.whatsapp || '-'}</span>
                </td>
                <td>${insc.oab_cpf || '-'}</td>
                <td>
                    <span class="cell-line">${insc.tipo_inscricao || 'Inscrição Normal'}</span>
                    <span class="cell-line cell-value">${formatarMoeda(insc.valor_pago)}${insc.cupom_utilizado ? ' · ' + insc.cupom_utilizado : ''}</span>
                </td>
                <td>
                    <select class="status-select status-${insc.status}" data-id="${insc.id}" aria-label="Alterar status">
                        ${Object.entries(STATUS_LABELS).map(([value, label]) =>
                            `<option value="${value}" ${insc.status === value ? 'selected' : ''}>${label}</option>`
                        ).join('')}
                    </select>
                </td>
                <td>
                    <label class="toggle">
                        <input type="checkbox" data-cert="${insc.id}" ${insc.certificado_liberado ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                    <small class="toggle-label">${insc.certificado_liberado ? 'Liberado' : 'Bloqueado'}</small>
                </td>
                <td class="cell-date">${formatarData(insc.created_at)}</td>
            </tr>
        `).join('');

        tableBody.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const novoStatus = e.target.value;
                await atualizarStatus(e.target.dataset.id, novoStatus, e.target);
            });
        });

        tableBody.querySelectorAll('[data-cert]').forEach(checkbox => {
            checkbox.addEventListener('change', async (e) => {
                await alternarCertificado(e.target.dataset.cert, e.target.checked);
            });
        });

        atualizarStats();
    }

    /* ---------- Ações ---------- */
    async function atualizarStatus(id, novoStatus, select) {
        select.disabled = true;

        const item = inscricoes.find(i => i.id === id);

        const { error } = await supabase
            .from('inscricoes')
            .update({ status: novoStatus })
            .eq('id', id);

        select.disabled = false;
        if (error) {
            showToast('Erro ao atualizar status: ' + error.message, 'error');
            renderTabela();
            return;
        }
        select.className = `status-select status-${novoStatus}`;
        if (item) item.status = novoStatus;
        showToast('Status atualizado para "' + STATUS_LABELS[novoStatus] + '"');
        atualizarStats();
    }

    async function alternarCertificado(id, liberado) {
        const item = inscricoes.find(i => i.id === id);

        const { error } = await supabase
            .from('inscricoes')
            .update({ certificado_liberado: liberado })
            .eq('id', id);

        if (error) {
            showToast('Erro ao liberar certificado: ' + error.message, 'error');
            renderTabela();
            return;
        }
        if (item) item.certificado_liberado = liberado;
        showToast(liberado ? 'Certificado liberado!' : 'Certificado bloqueado');
        atualizarStats();
    }

    async function acaoEmLote(acao) {
        const authToken = (await supabase.auth.getSession()).data.session?.access_token;
        if (!authToken) return;

        try {
            const response = await fetch(
                `${CONFIG.supabase.url}/functions/v1/liberar-certificados`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ acao })
                }
            );

            const result = await response.json();
            if (!response.ok || !result.ok) {
                throw new Error(result.error || 'Erro na operação');
            }

            if (acao === 'liberar') {
                const falhas = result.falhas || [];
                if (falhas.length) {
                    const nomes = falhas.slice(0, 3).map(f => f.nome).join(', ');
                    showToast(`Enviados: ${result.enviados} · Falhas: ${falhas.length} (${nomes}...)`, 'warning');
                    console.warn('Falhas no envio de certificados:', falhas);
                } else {
                    showToast(`Certificados gerados e enviados por e-mail: ${result.enviados}`);
                }
            } else {
                showToast(`Certificados bloqueados: ${result.total}`);
            }

            await carregarInscricoes();
        } catch (err) {
            showToast('Erro: ' + err.message, 'error');
        }
    }

    function exportarCsv() {
        if (!inscricoes.length) {
            showToast('Nenhuma inscrição para exportar', 'warning');
            return;
        }

        const headers = ['Nome', 'Email', 'WhatsApp', 'OAB/CPF', 'Senha de Acesso', 'Tipo', 'Valor', 'Cupom', 'Status', 'Certificado', 'Data Inscrição'];
        const linhas = inscricoes.map(i => [
            i.nome, i.email, i.whatsapp, i.oab_cpf, i.codigo_acesso || '',
            i.tipo_inscricao, i.valor_pago, i.cupom_utilizado,
            STATUS_LABELS[i.status] || i.status,
            i.certificado_liberado ? 'Liberado' : 'Bloqueado',
            i.created_at
        ]);

        const csv = [headers, ...linhas]
            .map(linha => linha.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';'))
            .join('\n');

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inscricoes-ama-1-ano-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('CSV exportado com sucesso!');
    }

    /* ---------- Carregamento ---------- */
    async function carregarInscricoes(tentativa = 1) {
        const { data, error } = await supabase
            .from('inscricoes')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1000);

        if (error) {
            // Token desatualizado/inválido: renova a sessão e tenta de novo
            if (tentativa === 1 && error.code === 'PGRST301') {
                const { data: { session } } = await supabase.auth.refreshSession();
                if (session) {
                    carregarInscricoes(2);
                    return;
                }
            }
            tableBody.innerHTML = `
                <tr><td colspan="7" class="table-empty">
                    <i class="fas fa-triangle-exclamation"></i> Erro: ${error.message}
                </td></tr>`;
            return;
        }

        inscricoes = data || [];
        renderTabela();
    }

    /* ---------- Check-in na portaria ---------- */
    const checkinInput = document.getElementById('checkinInput');
    const checkinResult = document.getElementById('checkinResult');
    let checkinAlvo = null;

    function escHtml(texto) {
        return String(texto ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function renderCheckinResult(insc) {
        checkinAlvo = insc;

        if (!insc) {
            checkinResult.innerHTML = `
                <div class="checkin-msg error">
                    <i class="fas fa-circle-exclamation"></i>
                    Nenhum inscrito encontrado com essa senha.
                </div>`;
            return;
        }

        const jaConfirmado = insc.status === 'confirmado';
        const cancelado = insc.status === 'cancelado';
        const pagamentoPendente = insc.status === 'pendente';

        checkinResult.innerHTML = `
            <div class="checkin-person">
                <div class="checkin-person-head">
                    <strong>${escHtml(insc.nome)}</strong>
                    <span class="status-badge status-${insc.status}">${STATUS_LABELS[insc.status] || insc.status}</span>
                </div>
                <p><i class="fas fa-envelope"></i> ${escHtml(insc.email)}</p>
                <p><i class="fas fa-id-card"></i> ${escHtml(insc.oab_cpf)}</p>
                <p><i class="fas fa-tag"></i> ${escHtml(insc.tipo_inscricao)} · ${formatarMoeda(insc.valor_pago)}</p>
                ${jaConfirmado ? `<p class="checkin-ok"><i class="fas fa-circle-check"></i> Já confirmado em ${formatarData(insc.checkin_at)}</p>` : ''}
            </div>
            ${!jaConfirmado && !cancelado ? `
                <button id="btnCheckinConfirmar" class="btn btn-gold btn-lg">
                    ${pagamentoPendente
                        ? '<i class="fas fa-triangle-exclamation"></i> Pagamento pendente — confirmar mesmo assim?'
                        : '<i class="fas fa-user-check"></i> Confirmar Presença'}
                </button>
            ` : ''}
        `;

        document.getElementById('btnCheckinConfirmar')?.addEventListener('click', confirmarPresenca);
    }

    async function buscarPorCodigo() {
        const codigo = checkinInput.value.trim().toUpperCase();
        if (codigo.length < 4) {
            showToast('Digite a senha que o inscrito mostra no celular.', 'warning');
            checkinInput.focus();
            return;
        }

        checkinInput.value = codigo;

        const { data, error } = await supabase
            .from('inscricoes')
            .select('*')
            .eq('codigo_acesso', codigo)
            .maybeSingle();

        if (error) {
            showToast('Erro na busca: ' + error.message, 'error');
            return;
        }

        renderCheckinResult(data || null);
    }

    async function confirmarPresenca() {
        if (!checkinAlvo) return;

        const agora = new Date().toISOString();
        const nome = checkinAlvo.nome;

        const { error } = await supabase
            .from('inscricoes')
            .update({ status: 'confirmado', checkin_at: agora })
            .eq('id', checkinAlvo.id);

        if (error) {
            showToast('Erro ao confirmar: ' + error.message, 'error');
            renderCheckinResult(checkinAlvo);
            return;
        }

        showToast(`Presença confirmada: ${nome}`);
        renderTabela();
        renderCheckinResult({ ...checkinAlvo, status: 'confirmado', checkin_at: agora });
    }

    /* ---------- Sessão ---------- */
    async function iniciarSessao() {
        supabase = window.supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);

        // Primeiro tenta restaurar a sessão salva (getUser valida o token
        // no servidor e renova automaticamente se estiver expirado).
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (!userError && user) {
                    mostrarDashboard();
                    return;
                }
            }

            console.warn('Sem sessão válida salva — exibindo login.');
        } catch (err) {
            console.warn('Falha ao recuperar sessão:', err);
        }

        // Ainda sem sessão: fica ouvindo. Se a sessão for restaurada ou
        // renovada depois (ex.: ao recarregar), abre o dashboard sozinho.
        supabase.auth.onAuthStateChange((event, session) => {
            if (session && event !== 'SIGNED_OUT') {
                mostrarDashboard();
            }
        });
    }

    function mostrarDashboard() {
        loginScreen.style.display = 'none';
        dashboard.style.display = 'block';
        carregarInscricoes();
    }

    /* ---------- Eventos ---------- */
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!isConfigured()) {
            loginError.textContent = 'Sistema ainda não configurado.';
            return;
        }

        loginError.textContent = '';
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span>Entrando...</span> <i class="fas fa-spinner fa-spin"></i>';

        const { error } = await supabase.auth.signInWithPassword({
            email: loginEmail.value.trim(),
            password: loginSenha.value
        });

        loginBtn.disabled = false;
        loginBtn.innerHTML = '<span>Entrar</span> <i class="fas fa-arrow-right"></i>';

        if (error) {
            loginError.textContent = 'E-mail ou senha incorretos.';
            return;
        }

        mostrarDashboard();
        showToast('Bem-vindo(a) ao painel!');
    });

    document.getElementById('btnLogout')?.addEventListener('click', async () => {
        await supabase.auth.signOut();
        dashboard.style.display = 'none';
        loginScreen.style.display = 'flex';
        loginForm.reset();
        showToast('Sessão encerrada.');
    });

    document.getElementById('btnLiberarCertificados')?.addEventListener('click', () => acaoEmLote('liberar'));
    document.getElementById('btnBloquearCertificados')?.addEventListener('click', () => acaoEmLote('bloquear'));
    document.getElementById('btnExportCsv')?.addEventListener('click', exportarCsv);

    document.getElementById('btnCheckinBuscar')?.addEventListener('click', buscarPorCodigo);
    checkinInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            buscarPorCodigo();
        }
    });
    checkinInput?.addEventListener('input', () => {
        checkinInput.value = checkinInput.value.toUpperCase();
        if (checkinAlvo) {
            checkinAlvo = null;
            checkinResult.innerHTML = '';
        }
    });

    filterStatus?.addEventListener('change', renderTabela);
    searchInput?.addEventListener('input', renderTabela);

    iniciarSessao();
})();
