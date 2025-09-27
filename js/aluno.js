window.addEventListener('load', () => {
    // Garantir que `alert()` dentro deste escopo use o modal customizado quando disponível
    try {
        const _alert = (window.showAlert || window.alert).bind(window);
        // eslint-disable-next-line no-shadow
        const alert = _alert;
    } catch (e) {}

    // Abas na página do aluno: comportamento simples
    document.addEventListener('click', function(e) {
        const btn = e.target.closest && e.target.closest('.tab-btn');
        if (!btn) return;
        const tabName = btn.getAttribute('data-tab');
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById('tab-' + tabName);
        if (target) target.classList.add('active');
    });

    // Handler para checkin livre (data atual)
    const btnCheckinLivre = document.getElementById('btn-checkin-livre');
    if (btnCheckinLivre) {
        btnCheckinLivre.addEventListener('click', async () => {
            const data = new Date().toISOString().slice(0,10); // YYYY-MM-DD
            if (!await window.confirmModal('Marcar presença livre para hoje (' + data + ')?')) return;
            btnCheckinLivre.disabled = true;
            btnCheckinLivre.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            fetch('php/checkin_livre.php', {
                method: 'POST',
                headers: {'Content-Type':'application/x-www-form-urlencoded'},
                body: 'data=' + encodeURIComponent(data)
            }).then(r => {
                // redirecionamentos do PHP devolvem HTML; forçar reload
                location.reload();
            }).catch(err => {
                console.error('Erro ao enviar checkin livre:', err);
                window.showAlert('Erro ao marcar presença. Veja console.');
                btnCheckinLivre.disabled = false;
                btnCheckinLivre.innerHTML = '<i class="fas fa-check"></i> Marcar presença (Livre)';
            });
        });
    }
    fetch('php/get_aluno.php')
    .then(response => response.json())
    .then(data => {
        const alunoNome = document.getElementById('aluno_nome');
        const aulasFaltando = document.getElementById('aulas_faltando');
        const horariosTreinoContainer = document.getElementById('horarios_treino_container');
        const historicoPresencaContainer = document.getElementById('historico_presenca_container');
        const academiaInfo = document.getElementById('academia_info_aluno');
        const academiaContainer = document.getElementById('academia_container');
        const selTroca = document.getElementById('trocar_academia_select');
        const btnTroca = document.getElementById('btn_trocar_academia');

        // Nome, faixa e graus
        alunoNome.textContent = `Bem-vindo, ${data.aluno.nome} - Faixa ${data.aluno.faixa} ${data.aluno.graus} grau`;

        // Aulas faltando
        aulasFaltando.textContent = `Faltam ${data.aluno.aulas_faltando} aulas para a próxima graduação`;

        // Criar tabela de horários de treino
        criarTabelaHorariosTreino(data.horarios, horariosTreinoContainer);

        // Criar tabela de histórico de presença
        criarTabelaHistoricoPresenca(data.checkins, historicoPresencaContainer);

        // Academia no header
        if (academiaInfo) {
            const m = data.membership;
            if (m && m.academia_nome) {
                const logo = m.logo_path ? `<img src="${m.logo_path}" alt="logo" style="height:28px;border-radius:4px">` : `<i class="fas fa-building" style="opacity:.7"></i>`;
                academiaInfo.innerHTML = `${logo} <span>${m.academia_nome}</span>`;
            } else {
                academiaInfo.innerHTML = '';
            }
        }

        // Minha academia
        renderAcademia(data.membership, academiaContainer);

        // Carregar lista para troca
        fetch('php/get_academias.php')
          .then(r => r.json())
          .then(d => {
            if (selTroca) {
                selTroca.innerHTML = '<option value="">Selecionar nova academia...</option>';
                (d.academias||[]).forEach(a => {
                    const opt = document.createElement('option');
                    opt.value = a.id;
                    opt.textContent = a.nome;
                    selTroca.appendChild(opt);
                });
            }
          });

        if (btnTroca) {
            btnTroca.addEventListener('click', () => {
                const id = parseInt(selTroca.value || '0', 10);
                if (!id) return;
                fetch('php/solicitar_vinculo.php', {
                    method: 'POST',
                    headers: {'Content-Type':'application/x-www-form-urlencoded'},
                    body: 'academia_id=' + encodeURIComponent(id)
                })
                .then(r => r.json())
                .then(() => {
                    academiaContainer.innerHTML = '<div class="table-loading">Solicitação enviada. Aguarde aprovação do professor.</div>';
                });
            });
        }
    })
    .catch(error => {
        console.error('Erro ao carregar dados do aluno:', error);
        document.getElementById('horarios_treino_container').innerHTML = 
            '<div class="table-loading">Erro ao carregar dados</div>';
        document.getElementById('historico_presenca_container').innerHTML = 
            '<div class="table-loading">Erro ao carregar dados</div>';
    });
});

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

    // Ordenar horários por dia da semana e hora
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
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${horariosOrdenados.map(h => `
                    <tr data-horario-id="${h.id}">
                        <td><strong>${h.dia_semana}</strong></td>
                        <td>${h.hora}</td>
                        <td>${h.nome_aula}</td>
                        <td style="white-space:nowrap;">
                            <button class="btn btn-sm btn-primary btn-marcar-presenca" data-horario-id="${h.id}"><i class="fas fa-check"></i> Marcar presença</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = tabelaHTML;

    // Adicionar listeners para botões de marcar presença por horário
    container.querySelectorAll('.btn-marcar-presenca').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const horarioId = btn.getAttribute('data-horario-id');
            const data = new Date().toISOString().slice(0,10);
            if (!await window.confirmModal('Marcar presença para o horário selecionado em ' + data + '?')) return;
            btn.disabled = true;
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

            fetch('php/checkin.php', {
                method: 'POST',
                headers: {'Content-Type':'application/x-www-form-urlencoded'},
                body: 'horario_id=' + encodeURIComponent(horarioId) + '&data=' + encodeURIComponent(data)
            }).then(r => {
                // O backend redireciona para a dashboard; forçar reload para ver atualização
                location.reload();
            }).catch(err => {
                console.error('Erro ao marcar presença:', err);
                window.showAlert('Erro ao marcar presença. Veja console.');
                btn.disabled = false;
                btn.innerHTML = original;
            });
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
    switch(status) {
        case 'aprovado':
            return 'fa-check-circle';
        case 'reprovado':
            return 'fa-times-circle';
        case 'pendente':
            return 'fa-clock';
        case 'livre':
            return 'fa-sign-in-alt';
        default:
            return 'fa-question-circle';
    }
}

function renderAcademia(membership, container) {
    if (!container) return;
    if (!membership) {
        container.innerHTML = '<div class="table-loading"><i class="fas fa-info-circle"></i> Nenhuma academia vinculada.</div>';
        return;
    }
    const statusMap = {
        approved: {label: 'Aprovado', icon: 'fa-check-circle'},
        pending_professor: {label: 'Pendente professor', icon: 'fa-hourglass-half'},
        pending_aluno: {label: 'Aguardando sua confirmação', icon: 'fa-handshake'},
        rejected: {label: 'Rejeitado', icon: 'fa-times-circle'},
        cancelled: {label: 'Cancelado', icon: 'fa-ban'}
    };
    const info = statusMap[membership.status] || {label: membership.status, icon:'fa-question-circle'};
    const logo = membership.logo_path ? `<img src="${membership.logo_path}" alt="logo" style="height:40px;vertical-align:middle;margin-right:8px">` : '';
    container.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            ${logo}
            <strong>${membership.academia_nome}</strong>
            <span class="status-badge status-${membership.status}"><i class="fas ${info.icon}"></i> ${info.label}</span>
            ${membership.status === 'pending_aluno' ? `<button class="btn btn-small" id="btnAceitarAcad"><i class="fas fa-check"></i> Confirmar</button>
            <button class="btn btn-small btn-outline" id="btnRejeitarAcad"><i class="fas fa-times"></i> Rejeitar</button>` : ''}
        </div>
    `;

    if (membership.status === 'pending_aluno') {
        const accept = document.getElementById('btnAceitarAcad');
        const reject = document.getElementById('btnRejeitarAcad');
        const handler = (acao) => {
            fetch('php/confirmar_vinculo.php', {
                method: 'POST',
                headers: {'Content-Type':'application/x-www-form-urlencoded'},
                body: 'acao=' + encodeURIComponent(acao) + '&membership_id=' + encodeURIComponent(membership.membership_id)
            }).then(r=>r.json()).then(()=>{
                container.innerHTML = '<div class="table-loading"><i class="fas fa-check"></i> Atualizado. Recarregue a página.</div>';
            });
        };
        accept && accept.addEventListener('click', () => handler('aluno_aceitar'));
        reject && reject.addEventListener('click', () => handler('aluno_rejeitar'));
    }
}