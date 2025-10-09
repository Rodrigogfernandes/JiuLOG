// ==================== UTILITÁRIOS ====================


function formatDateBr(dateInput) {
    if (!dateInput) return '';

    if (dateInput instanceof Date) {
        const dd = String(dateInput.getDate()).padStart(2, '0');
        const mm = String(dateInput.getMonth() + 1).padStart(2, '0');
        const yyyy = dateInput.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    }

    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        return dateInput.split('-').reverse().join('/');
    }

    // ISO datetime
    if (/^\d{4}-\d{2}-\d{2}T/.test(dateInput)) {
        return dateInput.slice(0, 10).split('-').reverse().join('/');
    }

    // Já está em DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateInput)) {
        return dateInput;
    }

    // Fallback: tentar parse
    const parsed = new Date(dateInput);
    if (!isNaN(parsed)) return formatDateBr(parsed);

    return String(dateInput);
}


function getTodayISO() {
    return new Date().toISOString().slice(0, 10);
}

// ==================== GESTÃO DE ESTADO ====================

const AppState = {
    isActionModalOpen: false,
    processingCheckin: false,

    setModalOpen(value) {
        this.isActionModalOpen = value;
        document.body.style.overflow = value ? 'hidden' : 'auto';
    },

    setProcessingCheckin(value) {
        this.processingCheckin = value;
    }
};

// ==================== API REQUESTS ====================

async function requestCheckin({ horarioId = null, data, force = false }) {
    const endpoint = horarioId ? 'php/checkin.php' : 'php/checkin_livre.php';
    const body = new URLSearchParams();

    if (horarioId) body.append('horario_id', horarioId);
    body.append('data', data);
    if (force) body.append('force', '1');

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: body.toString()
    });

    const text = await response.text();

    try {
        return JSON.parse(text);
    } catch (e) {
        // Resposta não-JSON (legacy): considerar sucesso
        return { success: true, legacy: true };
    }
}


async function fetchAlunoData() {
    const response = await fetch('php/get_aluno.php');
    return response.json();
}


async function fetchAcademias() {
    const response = await fetch('php/get_academias.php');
    return response.json();
}



async function requestVinculo(academiaId) {
    const response = await fetch('php/solicitar_vinculo.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `academia_id=${encodeURIComponent(academiaId)}`
    });
    return response.json();
}


async function confirmVinculo(acao, membershipId) {
    const response = await fetch('php/confirmar_vinculo.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `acao=${encodeURIComponent(acao)}&membership_id=${encodeURIComponent(membershipId)}`
    });
    return response.json();
}

// ==================== CHECKIN HANDLERS ====================

async function handleCheckinLivre(button, force = false) {
    // Prevenir múltiplos cliques
    if (AppState.processingCheckin || button.disabled) return;

    const data = getTodayISO();
    const dataBr = formatDateBr(data);

    const message = force
        ? `Você já fez um check-in livre em ${dataBr} hoje. Deseja marcar outro?`
        : `Marcar presença livre para hoje (${dataBr})?`;

    if (!await window.confirmModal(message)) return;

    // Marcar como processando
    AppState.setProcessingCheckin(true);
    button.disabled = true;
    const originalHtml = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    try {
        const result = await requestCheckin({ data, force });

        if (result.success || result.legacy) {
            const dateBr = result.data || dataBr;
            await window.showAlert(`Presença registrada em ${dateBr}.`);
            location.reload();
        } else if (result.error) {
            await window.showAlert(result.error || 'Erro ao marcar presença.');
        } else {
            location.reload();
        }
    } catch (error) {
        console.error('Erro ao enviar checkin livre:', error);
        await window.showAlert('Erro ao marcar presença. Tente novamente.');
    } finally {
        // Restaurar estado apenas se não recarregou a página
        AppState.setProcessingCheckin(false);
        button.disabled = false;
        button.innerHTML = originalHtml;
    }
}


async function handleCheckinHorario(horarioId) {
    const data = getTodayISO();
    const dataBr = formatDateBr(data);

    if (!await window.confirmModal(`Marcar presença para o horário selecionado em ${dataBr}?`)) {
        return;
    }

    try {
        const result = await requestCheckin({ horarioId, data });

        if (result.success || result.legacy) {
            const dateBr = result.data || formatDateBr(data);
            await window.showAlert(`Presença registrada em ${dateBr}.`);
            location.reload();
        } else if (result.error) {
            await window.showAlert(result.error || 'Erro ao marcar presença.');
        } else {
            location.reload();
        }
    } catch (error) {
        console.error('Erro ao marcar presença:', error);
        await window.showAlert('Erro ao marcar presença. Tente novamente.');
    }
}


function setupCheckinLivreButton(button, checkins) {
    if (!button) return;

    const todayIso = getTodayISO();
    const todayBr = formatDateBr(todayIso);

    // Verificar se já houve checkin livre hoje
    const hasFreeToday = (checkins || []).some(c => {
        const isFree = (
            c.horario_id === null ||
            c.horario_id === undefined ||
            c.horario_id === '' ||
            (c.nome_aula && c.nome_aula.toLowerCase().includes('livre'))
        );
        if (!isFree) return false;

        const cd = String(c.data || '');
        return cd === todayIso || cd === todayBr;
    });

    if (hasFreeToday) {
        button.setAttribute('title', 'Já houve check-in livre hoje – clique para confirmar outro');
        button.innerHTML = '<i class="fas fa-check"></i> Já fez check-in hoje (clique para confirmar outro)';
        button.addEventListener('click', (e) => {
            e.preventDefault();
            handleCheckinLivre(button, true);
        });
    } else {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            handleCheckinLivre(button, false);
        });
    }
}

// ==================== RENDERIZAÇÃO ====================


function renderAcademiaHeader(membership) {
    const academiaInfo = document.getElementById('academia_info_aluno');
    const academiaInfoMain = document.getElementById('academia_info');
    const academiaLogoMain = document.getElementById('academia_logo');
    const academiaNomeMain = document.getElementById('academia_nome');

    if (!membership || !membership.academia_nome) {
        if (academiaInfo) academiaInfo.innerHTML = '';
        if (academiaInfoMain) {
            if (academiaLogoMain) academiaLogoMain.innerHTML = '';
            if (academiaNomeMain) academiaNomeMain.textContent = '';
        }
        return;
    }

    const logo = membership.logo_path
        ? `<img src="${membership.logo_path}" alt="logo" style="height:28px;border-radius:4px">`
        : `<i class="fas fa-building" style="opacity:.7"></i>`;

    // Header antigo (compatibilidade)
    if (academiaInfo) {
        academiaInfo.innerHTML = `${logo} <span>${membership.academia_nome}</span>`;
    }

    // Header principal
    if (academiaInfoMain && academiaNomeMain) {
        if (academiaLogoMain) {
            academiaLogoMain.innerHTML = membership.logo_path
                ? `<img src="${membership.logo_path}" alt="Logo">`
                : `<i class="fas fa-building" style="opacity:.7"></i>`;
        }
        academiaNomeMain.textContent = membership.academia_nome || '';
    }
}


function renderAcademia(membership, container) {
    if (!container) return;

    if (!membership) {
        container.innerHTML = '<div class="table-loading"><i class="fas fa-info-circle"></i> Nenhuma academia vinculada.</div>';
        return;
    }

    const statusMap = {
        approved: { label: 'Aprovado', icon: 'fa-check-circle' },
        pending_professor: { label: 'Pendente professor', icon: 'fa-hourglass-half' },
        pending_aluno: { label: 'Aguardando sua confirmação', icon: 'fa-handshake' },
        rejected: { label: 'Rejeitado', icon: 'fa-times-circle' },
        cancelled: { label: 'Cancelado', icon: 'fa-ban' }
    };

    const info = statusMap[membership.status] || { label: membership.status, icon: 'fa-question-circle' };
    const logo = membership.logo_path
        ? `<img src="${membership.logo_path}" alt="logo" style="height:40px;vertical-align:middle;margin-right:8px">`
        : '';

    const actionButtons = membership.status === 'pending_aluno'
        ? `<button class="btn btn-small" id="btnAceitarAcad"><i class="fas fa-check"></i> Confirmar</button>
           <button class="btn btn-small btn-outline" id="btnRejeitarAcad"><i class="fas fa-times"></i> Rejeitar</button>`
        : '';

    container.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            ${logo}
            <strong>${membership.academia_nome}</strong>
            <span class="status-badge status-${membership.status}"><i class="fas ${info.icon}"></i> ${info.label}</span>
            ${actionButtons}
        </div>
    `;

    // Configurar handlers de confirmação
    if (membership.status === 'pending_aluno') {
        const btnAceitar = document.getElementById('btnAceitarAcad');
        const btnRejeitar = document.getElementById('btnRejeitarAcad');

        if (btnAceitar) {
            btnAceitar.addEventListener('click', async () => {
                try {
                    await confirmVinculo('aluno_aceitar', membership.membership_id);
                    container.innerHTML = '<div class="table-loading"><i class="fas fa-check"></i> Atualizado. Recarregue a página.</div>';
                } catch (error) {
                    console.error('Erro ao aceitar vínculo:', error);
                    await window.showAlert('Erro ao confirmar vínculo.');
                }
            });
        }

        if (btnRejeitar) {
            btnRejeitar.addEventListener('click', async () => {
                if (!await window.confirmModal('Tem certeza que deseja rejeitar este vínculo?')) return;
                try {
                    await confirmVinculo('aluno_rejeitar', membership.membership_id);
                    container.innerHTML = '<div class="table-loading"><i class="fas fa-check"></i> Atualizado. Recarregue a página.</div>';
                } catch (error) {
                    console.error('Erro ao rejeitar vínculo:', error);
                    await window.showAlert('Erro ao rejeitar vínculo.');
                }
            });
        }
    }
}

function criarTabelaHorariosTreino(horarios, container) {
    if (!horarios || horarios.length === 0) {
        container.innerHTML = `
            <div class="table-loading">
                <i class="fas fa-calendar-times"></i>
                Nenhum horário de treino cadastrado
            </div>
        `;
        return;
    }

    // Ordenar horários
    const ordemDias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const horariosOrdenados = horarios.sort((a, b) => {
        const diaA = ordemDias.indexOf(a.dia_semana);
        const diaB = ordemDias.indexOf(b.dia_semana);
        if (diaA !== diaB) return diaA - diaB;
        return a.hora.localeCompare(b.hora);
    });

    const tabelaHTML = `
        <table class="aluno-table">
            <thead>
                <tr>
                    <th><i class="fas fa-calendar-day"></i> Dia da Semana</th>
                    <th><i class="fas fa-clock"></i> Horário</th>
                    <th><i class="fas fa-dumbbell"></i> Tipo de Treino</th>
                </tr>
            </thead>
            <tbody>
                ${horariosOrdenados.map(h => `
                    <tr data-horario-id="${h.id}" style="cursor:pointer;" title="Clique para ações">
                        <td><strong>${h.dia_semana}</strong></td>
                        <td>${h.hora}</td>
                        <td>${h.nome_aula}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = tabelaHTML;

    // Adicionar event listeners
    container.querySelectorAll('tbody tr').forEach(tr => {
        tr.addEventListener('click', () => {
            if (AppState.isActionModalOpen) return;
            const horarioId = tr.getAttribute('data-horario-id');
            showActionModal(horarioId);
        });
    });
}


function criarTabelaHistoricoPresenca(checkins, container) {
    if (!checkins || checkins.length === 0) {
        container.innerHTML = `
            <div class="table-loading">
                <i class="fas fa-history"></i>
                Nenhum histórico de presença encontrado
            </div>
        `;
        return;
    }

    // Ordenar check-ins por data (mais recente primeiro)
    const checkinsOrdenados = checkins.sort((a, b) => {
        const dataA = new Date(a.data.split('/').reverse().join('-'));
        const dataB = new Date(b.data.split('/').reverse().join('-'));
        return dataB - dataA;
    });

    const tabelaHTML = `
        <table class="aluno-table">
            <thead>
                <tr>
                    <th><i class="fas fa-calendar"></i> Data</th>
                    <th><i class="fas fa-dumbbell"></i> Tipo de Treino</th>
                    <th><i class="fas fa-clock"></i> Horário</th>
                    <th><i class="fas fa-check-circle"></i> Status</th>
                </tr>
            </thead>
            <tbody>
                ${checkinsOrdenados.map(c => `
                    <tr>
                        <td><strong>${c.data}</strong></td>
                        <td>${c.nome_aula}</td>
                        <td>${c.hora || '-'}</td>
                        <td>
                            <span class="status-badge status-${c.status}">
                                <i class="fas ${getStatusIcon(c.status)}"></i>
                                ${c.status}
                            </span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = tabelaHTML;
}

function getStatusIcon(status) {
    const icons = {
        aprovado: 'fa-check-circle',
        reprovado: 'fa-times-circle',
        pendente: 'fa-clock',
        livre: 'fa-sign-in-alt'
    };
    return icons[status] || 'fa-question-circle';
}

// ==================== MODAL DE AÇÕES ====================

function showActionModal(horarioId) {
    // Prevenir abertura se já houver modal aberto
    if (AppState.isActionModalOpen) return;

    const modalId = 'action-modal';
    let modal = document.getElementById(modalId);

    if (!modal) {
        modal = createActionModal();
    }

    const btnConfirmar = document.getElementById('action-confirmar');
    const btnEditar = document.getElementById('action-editar');
    const btnExcluir = document.getElementById('action-excluir');
    const btnCancel = document.getElementById('action-cancel');

    AppState.setModalOpen(true);
    modal.style.display = 'flex';

    // Remover event listeners antigos (se existirem)
    const newBtnConfirmar = btnConfirmar.cloneNode(true);
    const newBtnEditar = btnEditar.cloneNode(true);
    const newBtnExcluir = btnExcluir.cloneNode(true);
    const newBtnCancel = btnCancel.cloneNode(true);

    btnConfirmar.replaceWith(newBtnConfirmar);
    btnEditar.replaceWith(newBtnEditar);
    btnExcluir.replaceWith(newBtnExcluir);
    btnCancel.replaceWith(newBtnCancel);

    // Função para fechar modal
    const hideModal = () => {
        modal.style.display = 'none';
        AppState.setModalOpen(false);
    };

    // Configurar novos event listeners
    newBtnCancel.addEventListener('click', hideModal);

    newBtnConfirmar.addEventListener('click', async () => {
        hideModal();
        await handleCheckinHorario(horarioId);
    });

    newBtnEditar.addEventListener('click', async () => {
        hideModal();
        await window.showAlert('Edição de horário só pode ser feita pelo professor.');
    });

    newBtnExcluir.addEventListener('click', async () => {
        hideModal();
        if (!await window.confirmModal('Tem certeza que deseja excluir este horário?')) return;
        await window.showAlert('Exclusão de horário só pode ser feita pelo professor.');
    });

    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });
}

function createActionModal() {
    const modal = document.createElement('div');
    modal.id = 'action-modal';
    modal.className = 'custom-confirm-modal';
    modal.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;display:none;align-items:center;justify-content:center;z-index:100000;background:rgba(0,0,0,0.45);';

    modal.innerHTML = `
        <div class="custom-confirm-modal-content" style="position:relative;background:#fff;color:#111;border-radius:8px;max-width:520px;width:90%;box-shadow:0 12px 36px rgba(0,0,0,0.25);padding:1rem;z-index:1;">
            <div style="white-space:pre-wrap;font-size:1rem;margin-bottom:.75rem;" id="action-modal-body">
                Escolha uma ação para este horário:
            </div>
            <div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;">
                <button id="action-confirmar" style="padding:.45rem .8rem;border-radius:4px;cursor:pointer;background:#007bff;color:#fff;border:none;">
                    <i class="fas fa-check"></i> Confirmar presença
                </button>
                <button id="action-editar" style="padding:.45rem .8rem;border-radius:4px;cursor:pointer;background:transparent;border:1px solid #ccc;">
                    <i class="fas fa-edit"></i> Editar horário
                </button>
                <button id="action-excluir" style="padding:.45rem .8rem;border-radius:4px;cursor:pointer;background:transparent;border:1px solid #ccc;">
                    <i class="fas fa-trash"></i> Excluir horário
                </button>
                <button id="action-cancel" style="padding:.45rem .8rem;border-radius:4px;cursor:pointer;background:transparent;border:1px solid #ccc;">
                    Cancelar
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    return modal;
}

// ==================== CONFIGURAÇÃO DE TROCA DE ACADEMIA ====================

async function setupTrocaAcademia(selectElement, buttonElement, container) {
    if (!selectElement || !buttonElement) return;

    try {
        const data = await fetchAcademias();

        selectElement.innerHTML = '<option value="">Selecionar nova academia...</option>';
        (data.academias || []).forEach(a => {
            const opt = document.createElement('option');
            opt.value = a.id;
            opt.textContent = a.nome;
            selectElement.appendChild(opt);
        });

        buttonElement.addEventListener('click', async () => {
            const id = parseInt(selectElement.value || '0', 10);
            if (!id) {
                await window.showAlert('Selecione uma academia.');
                return;
            }

            try {
                await requestVinculo(id);
                if (container) {
                    container.innerHTML = '<div class="table-loading">Solicitação enviada. Aguarde aprovação do professor.</div>';
                }
            } catch (error) {
                console.error('Erro ao solicitar vínculo:', error);
                await window.showAlert('Erro ao solicitar vínculo. Tente novamente.');
            }
        });
    } catch (error) {
        console.error('Erro ao carregar academias:', error);
    }
}

function setupTabs() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.tab-btn');
        if (!btn) return;

        const tabName = btn.getAttribute('data-tab');

        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        btn.classList.add('active');

        const target = document.getElementById('tab-' + tabName);
        if (target) target.classList.add('active');
    });
}


// ==================== CARREGAMENTO INICIAL ====================
async function loadAlunoData() {
    try {
        const data = await fetchAlunoData();

        // Elementos do DOM
        const alunoNome = document.getElementById('aluno_nome_text');
        const faixaAluno = document.getElementById('faixa_aluno');
        const aulasFaltando = document.getElementById('aulas_faltando');
        const horariosTreinoContainer = document.getElementById('horarios_treino_container');
        const historicoPresencaContainer = document.getElementById('historico_presenca_container');
        const academiaContainer = document.getElementById('academia_container');
        const btnCheckinLivre = document.getElementById('btn-checkin-livre');

        // Nome do aluno
        if (alunoNome) {
            alunoNome.innerHTML = ` ${data.aluno.nome}`;
        }

        // Faixa e grau
        if (faixaAluno) {
            const faixaClass = `faixa-${data.aluno.faixa.toLowerCase()}`;
            faixaAluno.innerHTML = `<span class="faixa ${faixaClass}"> Faixa ${data.aluno.faixa} - ${data.aluno.graus}° Grau </span>`;
        }

        // Aulas faltando
        if (aulasFaltando) {
            aulasFaltando.textContent = `Faltam ${data.aluno.aulas_faltando} aulas para a próxima graduação`;
        }

        // Academia (header)
        renderAcademiaHeader(data.membership);

        // Minha Academia (seção)
        renderAcademia(data.membership, academiaContainer);

        // Tabelas
        criarTabelaHorariosTreino(data.horarios, horariosTreinoContainer);
        criarTabelaHistoricoPresenca(data.checkins, historicoPresencaContainer);

        // Botão de checkin livre
        setupCheckinLivreButton(btnCheckinLivre, data.checkins);

        // Troca de academia
        const selTroca = document.getElementById('trocar_academia_select');
        const btnTroca = document.getElementById('btn_trocar_academia');
        await setupTrocaAcademia(selTroca, btnTroca, academiaContainer);

        // Conta
        const alunoNomeConta = document.getElementById('aluno-nome-conta');
        const professorNome = document.getElementById('professor-nome');
        const academiaNomeConta = document.getElementById('academia-nome-conta');
        const formConta = document.getElementById('form-conta');
        const nomeInput = document.getElementById('nome');
        const emailInput = document.getElementById('email');

        if (alunoNomeConta) alunoNomeConta.textContent = data.aluno?.nome || '';
        if (professorNome) professorNome.textContent = data.professor?.nome || 'Não informado';
        if (academiaNomeConta) academiaNomeConta.textContent = data.membership?.academia_nome || 'Não vinculado';
        if (nomeInput) nomeInput.value = data.aluno?.nome || '';
        if (emailInput) emailInput.value = data.aluno?.email || '';

        if (formConta) {
            formConta.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData();

                // Sempre enviar nome se preenchido
                const nome = nomeInput.value.trim();
                if (nome) formData.append('nome', nome);

                // Enviar email apenas se preenchido
                const email = emailInput.value.trim();
                if (email) formData.append('email', email);

                // Enviar senha apenas se nova senha preenchida
                const senhaAtual = document.getElementById('senha-atual').value.trim();
                const novaSenha = document.getElementById('nova-senha').value.trim();
                if (novaSenha) {
                    if (!senhaAtual) {
                        await window.showAlert('Para alterar a senha, informe a senha atual.');
                        return;
                    }
                    formData.append('senha_atual', senhaAtual);
                    formData.append('nova_senha', novaSenha);
                }

                // Verificar se algo foi alterado
                if (formData.has('nome') || formData.has('email') || formData.has('nova_senha')) {
                    try {
                        const response = await fetch('php/update_aluno.php', {
                            method: 'POST',
                            body: formData
                        });
                        const text = await response.text();
                        let result;
                        try {
                            result = JSON.parse(text);
                        } catch (e) {
                            result = { error: 'Resposta inválida do servidor. Verifique se o backend está implementado.' };
                        }
                        if (result.success) {
                            await window.showAlert('Dados atualizados com sucesso!');
                            location.reload();
                        } else {
                            await window.showAlert(result.error || 'Erro ao atualizar dados.');
                        }
                    } catch (error) {
                        console.error('Erro ao atualizar conta:', error);
                        await window.showAlert('Erro ao atualizar conta.');
                    }
                } else {
                    await window.showAlert('Nenhuma alteração foi feita.');
                }
            });
        }

    } catch (error) {
        console.error('Erro ao carregar dados do aluno:', error);

        const horariosTreinoContainer = document.getElementById('horarios_treino_container');
        const historicoPresencaContainer = document.getElementById('historico_presenca_container');

        if (horariosTreinoContainer) {
            horariosTreinoContainer.innerHTML = '<div class="table-loading"><i class="fas fa-exclamation-triangle"></i> Erro ao carregar dados</div>';
        }
        if (historicoPresencaContainer) {
            historicoPresencaContainer.innerHTML = '<div class="table-loading"><i class="fas fa-exclamation-triangle"></i> Erro ao carregar dados</div>';
        }
    }
}

window.addEventListener('load', () => {
    console.debug('[aluno.js] Inicializando aplicação...');

    // Configurar tabs
    setupTabs();

    // Carregar dados do aluno
    loadAlunoData();
});

// ==================== EXPORTS (para testes, se necessário) ====================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatDateBr,
        getTodayISO,
        requestCheckin,
        handleCheckinLivre,
        handleCheckinHorario,
        criarTabelaHorariosTreino,
        criarTabelaHistoricoPresenca,
        renderAcademia,
        showActionModal
    };
}