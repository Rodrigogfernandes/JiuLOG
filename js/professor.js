window.addEventListener('load', () => {
    // Buscar dados iniciais do professor (nome, academias, solicitações)
    fetch('php/get_professor.php')
        .then(r => r.json())
        .then(data => {
            // Guardar para uso posterior
            window._professorData = data || {};

            // Nome do professor (apelido se disponível)
            const profNomeEl = document.getElementById('professor_nome');
            if (profNomeEl) {
                const prof = data.professor || data.user || {};
                profNomeEl.textContent = prof.apelido || prof.nome || '';
            }

            // Informações da academia
            const academiaNomeEl = document.getElementById('academia_nome');
            const academiaLogoEl = document.getElementById('academia_logo');
            const academias = data.academias || [];
            if (academiaNomeEl && academias.length) {
                academiaNomeEl.textContent = academias[0].nome || '';
            }
            if (academiaLogoEl && academias.length && academias[0].logo) {
                // Inserir img se existir caminho
                academiaLogoEl.innerHTML = `<img src="${academias[0].logo}" alt="Logo" style="height:36px;">`;
            }

            // Renderizar solicitações (se houver)
            const solicitacoesContainer = document.getElementById('solicitacoes_container');
            if (solicitacoesContainer) {
                const solicitacoes = data.solicitacoes || [];
                if (!solicitacoes.length) {
                    solicitacoesContainer.innerHTML = '<div class="search-no-results">Nenhuma solicitação no momento</div>';
                } else {
                    solicitacoesContainer.innerHTML = `
                        <table class="aluno-table">
                            <thead>
                                <tr>
                                    <th>Aluno</th>
                                    <th>Academia</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${solicitacoes.map(s => `
                                    <tr>
                                        <td>${escapeHtml(s.aluno_nome)}</td>
                                        <td>${escapeHtml(s.academia_nome)}</td>
                                        <td>
                                            <button class="btn btn-sm" data-approve="${s.membership_id}"><i class="fas fa-check"></i> Aprovar</button>
                                            <button class="btn btn-sm btn-outline" data-reject="${s.membership_id}"><i class="fas fa-times"></i> Rejeitar</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `;

                    solicitacoesContainer.querySelectorAll('[data-approve]').forEach(btn => {
                        btn.addEventListener('click', () => {
                            const id = btn.getAttribute('data-approve');
                            fetch('php/confirmar_vinculo.php', {
                                method: 'POST',
                                headers: {'Content-Type':'application/x-www-form-urlencoded'},
                                body: 'acao=' + encodeURIComponent('prof_aceitar') + '&membership_id=' + encodeURIComponent(id)
                            }).then(r=>r.json()).then(()=>location.reload());
                        });
                    });
                    solicitacoesContainer.querySelectorAll('[data-reject]').forEach(btn => {
                        btn.addEventListener('click', () => {
                            const id = btn.getAttribute('data-reject');
                            fetch('php/confirmar_vinculo.php', {
                                method: 'POST',
                                headers: {'Content-Type':'application/x-www-form-urlencoded'},
                                body: 'acao=' + encodeURIComponent('prof_rejeitar') + '&membership_id=' + encodeURIComponent(id)
                            }).then(r=>r.json()).then(()=>location.reload());
                        });
                    });
                }
            }
        })
        .catch(err => {
            console.error("Erro ao carregar dados do professor:", err);
        });

    // -----------------------------
    // FUNCIONALIDADE DE BUSCA
    // -----------------------------
    const searchInput = document.getElementById('search');
    const searchResults = document.getElementById('search-results');
    let searchTimeout;

    // Desativar completamente o autocomplete
    searchInput.setAttribute('autocomplete', 'off');
    searchInput.setAttribute('spellcheck', 'false');
    searchInput.setAttribute('autocorrect', 'off');
    searchInput.setAttribute('autocapitalize', 'off');
    searchInput.setAttribute('data-lpignore', 'true');

    searchInput.addEventListener('input', function() {
        const termo = this.value.trim();
        
        // Limpar timeout anterior
        clearTimeout(searchTimeout);
        
        if (termo.length < 2) {
            searchResults.style.display = 'none';
            return;
        }
        
        // Mostrar loading
        searchResults.style.display = 'block';
        searchResults.innerHTML = '<div class="search-loading">Buscando...</div>';
        
        // Debounce - aguardar 300ms após parar de digitar
        searchTimeout = setTimeout(() => {
            buscarAlunos(termo);
        }, 300);
    });

    function buscarAlunos(termo) {
        fetch(`php/buscar_alunos.php?q=${encodeURIComponent(termo)}`)
            .then(res => res.json())
            .then(data => {
                exibirResultados(data);
            })
            .catch(err => {
                console.error("Erro na busca:", err);
                searchResults.innerHTML = '<div class="search-no-results">Erro ao buscar alunos</div>';
            });
    }

    function exibirResultados(data) {
        searchResults.style.display = 'block';
        
        if (data.total === 0) {
            searchResults.innerHTML = '<div class="search-no-results">Nenhum aluno encontrado</div>';
            return;
        }
        
        let html = '';
        data.resultados.forEach(aluno => {
            html += `
                <div class="search-result-item" onclick="selecionarAluno(${aluno.id}, '${aluno.nome}', '${aluno.email}', '${aluno.faixa}', ${aluno.graus}, ${aluno.aulas_faltando})">
                    <div class="search-result-name">${aluno.nome}</div>
                    <div class="search-result-email">${aluno.email}</div>
                    <div class="search-result-info">
                        <span class="search-result-badge">${aluno.faixa}</span>
                        <span>Graus: ${aluno.graus}</span>
                        <span>Aulas restantes: ${aluno.aulas_faltando}</span>
                    </div>
                </div>
            `;
        });
        
        searchResults.innerHTML = html;
    }

    // Função para selecionar aluno
    // membershipId é opcional e representa o id do vínculo (membership) com a academia
    window.selecionarAluno = function(id, nome, email, faixa, graus, aulas_faltando, membershipId) {
        // Fechar resultados da busca
        searchResults.style.display = 'none';
        searchInput.value = nome; // Mostrar nome selecionado na busca
        
        // Exibir apenas o aluno selecionado no card de gerenciamento
        exibirAlunoSelecionado({
            id: id,
            nome: nome,
            email: email,
            faixa: faixa,
            graus: graus,
            aulas_faltando: aulas_faltando,
            membership_id: membershipId || null
        });
    };

    // Função para carregar histórico de presença (reimplementada)
    function carregarHistoricoPresenca(alunoId, aluno = null) {
        const url = `php/get_historico_presenca.php?aluno_id=${encodeURIComponent(alunoId)}`;
        fetch(url)
            .then(r => r.json())
            .then(data => {
                const originalContainer = document.getElementById('historico-container');
                if (!originalContainer) return;

                const checkins = (data && Array.isArray(data.checkins)) ? data.checkins : [];

                // Construir HTML do histórico
                let rowsHtml = '';
                if (checkins.length) {
                    rowsHtml = checkins.map(c => `
                        <tr class="historico-row" data-checkin-id="${escapeHtml(c.id)}" data-checkin-data="${escapeHtml(c.data)}" data-checkin-aula="${escapeHtml(c.nome_aula)}" data-checkin-hora="${escapeHtml(c.hora)}" data-checkin-status="${escapeHtml(c.status)}">
                            <td>${escapeHtml(c.data)}</td>
                            <td>${escapeHtml(c.nome_aula)}</td>
                            <td>${escapeHtml(c.hora)}</td>
                            <td>
                                <span class="status-badge status-${escapeHtml(c.status)}">
                                    <i class="fas ${c.status === 'aprovado' ? 'fa-check-circle' : c.status === 'reprovado' ? 'fa-times-circle' : 'fa-clock'}"></i>
                                    ${escapeHtml(c.status)}
                                </span>
                            </td>
                        </tr>
                    `).join('');
                }

                const html = checkins.length ? `
                    <table class="historico-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Tipo do Treino</th>
                                <th>Horário</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                    <div class="historico-actions">
                        <button type="button" class="btn btn-sm btn-danger" id="btn-excluir-aluno">
                            <i class="fas fa-trash"></i> Excluir Aluno
                        </button>
                    </div>
                ` : `
                    <div class="search-no-results">Nenhum histórico de presença encontrado</div>
                    <div class="historico-actions">
                        <button type="button" class="btn btn-sm btn-danger" id="btn-excluir-aluno">
                            <i class="fas fa-trash"></i> Excluir Aluno
                        </button>
                    </div>
                `;

                // Substituir o container por um clone vazio para limpar event listeners antigos
                const fresh = originalContainer.cloneNode(false);
                fresh.innerHTML = html;
                originalContainer.parentNode.replaceChild(fresh, originalContainer);

                // Re-referenciar o container atual
                const container = document.getElementById('historico-container');
                if (!container) return;

                // Configurar botão de excluir aluno (se houver)
                const btnExcluir = container.querySelector('#btn-excluir-aluno');
                if (btnExcluir && aluno) {
                    btnExcluir.addEventListener('click', () => {
                        if (!confirm(`Tem certeza que deseja excluir o aluno "${aluno.nome}"?\n\nEsta ação não pode ser desfeita e removerá:\n- Todos os horários do aluno\n- Todo o histórico de presença\n- Todos os check-ins`)) return;
                        if (!confirm('ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\nConfirma a exclusão do aluno?')) return;

                        const originalText = btnExcluir.innerHTML;
                        btnExcluir.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Excluindo...';
                        btnExcluir.disabled = true;

                        fetch('php/excluir_aluno.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: `aluno_id=${encodeURIComponent(aluno.id)}`
                        })
                        .then(r => r.json())
                        .then(resp => {
                            if (resp && resp.ok) {
                                const alunosContainer = document.getElementById('alunos_container');
                                if (alunosContainer) {
                                    alunosContainer.innerHTML = `
                                        <div class="search-no-results">
                                            <i class="fas fa-check-circle" style="color: #28a745; font-size: 2rem; margin-bottom: 1rem;"></i>
                                            <h4>Aluno excluído com sucesso!</h4>
                                            <p>O aluno "${escapeHtml(aluno.nome)}" foi removido do sistema.</p>
                                            <button type="button" class="btn btn-sm" onclick="location.reload()">
                                                <i class="fas fa-refresh"></i> Atualizar Página
                                            </button>
                                        </div>
                                    `;
                                }
                            } else {
                                alert('Erro ao excluir aluno: ' + (resp.message || 'Erro desconhecido'));
                                btnExcluir.innerHTML = originalText;
                                btnExcluir.disabled = false;
                            }
                        })
                        .catch(err => {
                            console.error('Erro:', err);
                            alert('Erro ao excluir aluno. Tente novamente.');
                            btnExcluir.innerHTML = originalText;
                            btnExcluir.disabled = false;
                        });
                    });
                }

                // Implementar detecção de duplo clique via timing como fallback
                let lastClick = { time: 0, row: null };
                const DOUBLE_CLICK_MS = 350; // threshold

                container.addEventListener('click', (e) => {
                    const row = e.target && e.target.closest ? e.target.closest('.historico-row') : null;
                    if (!row) return;

                    const now = Date.now();

                    // Se o mesmo elemento foi clicado novamente dentro do threshold, tratar como dblclick
                    if (lastClick.row === row && (now - lastClick.time) <= DOUBLE_CLICK_MS) {
                        console.debug('Fallback dblclick detectado via timing para row', row);

                        // Resetar estado
                        lastClick.time = 0;
                        lastClick.row = null;

                        // Garantir seleção visual
                        const prev = container.querySelector('.historico-row.selected');
                        if (prev && prev !== row) prev.classList.remove('selected');
                        if (!row.classList.contains('selected')) row.classList.add('selected');

                        const checkin = {
                            id: row.getAttribute('data-checkin-id'),
                            data: row.getAttribute('data-checkin-data'),
                            aula: row.getAttribute('data-checkin-aula'),
                            hora: row.getAttribute('data-checkin-hora'),
                            status: row.getAttribute('data-checkin-status')
                        };

                        console.debug('Fallback abrirModalCheckin:', checkin);

                        try {
                            if (typeof abrirModalCheckin === 'function') {
                                abrirModalCheckin(checkin);
                            } else {
                                console.error('abrirModalCheckin não disponível (fallback)');
                            }
                        } catch (err) {
                            console.error('Erro ao abrir modal de checkin (fallback):', err);
                        }

                        return;
                    }

                    // Caso não seja duplo clique ainda, apenas atualizar estado e fazer seleção simples
                    lastClick.time = now;
                    lastClick.row = row;

                    const prev = container.querySelector('.historico-row.selected');
                    if (prev && prev !== row) prev.classList.remove('selected');

                    row.classList.toggle('selected');
                });

                // Também manter o listener nativo de dblclick para o comportamento padrão
                container.addEventListener('dblclick', (e) => {
                    const row = e.target && e.target.closest ? e.target.closest('.historico-row') : null;
                    if (!row) return;

                    console.debug('Evento nativo dblclick recebido para row', row);

                    // Garantir seleção visual
                    const prev = container.querySelector('.historico-row.selected');
                    if (prev && prev !== row) prev.classList.remove('selected');
                    if (!row.classList.contains('selected')) row.classList.add('selected');

                    const checkin = {
                        id: row.getAttribute('data-checkin-id'),
                        data: row.getAttribute('data-checkin-data'),
                        aula: row.getAttribute('data-checkin-aula'),
                        hora: row.getAttribute('data-checkin-hora'),
                        status: row.getAttribute('data-checkin-status')
                    };

                    console.debug('Native dblclick abrirModalCheckin:', checkin);

                    try {
                        if (typeof abrirModalCheckin === 'function') {
                            abrirModalCheckin(checkin);
                        } else {
                            console.error('abrirModalCheckin não disponível (native)');
                        }
                    } catch (err) {
                        console.error('Erro ao abrir modal de checkin (native):', err);
                    }
                });
            })
            .catch(err => {
                console.error('Erro ao carregar histórico:', err);
                const container = document.getElementById('historico-container');
                if (container) {
                    container.innerHTML = `
                        <div class="search-no-results">Erro ao carregar histórico de presença</div>
                        <div class="historico-actions">
                            <button type="button" class="btn btn-sm btn-danger" id="btn-excluir-aluno">
                                <i class="fas fa-trash"></i> Excluir Aluno
                            </button>
                        </div>
                    `;
                }
            });
    }

    // Função para exibir apenas o aluno selecionado
    function exibirAlunoSelecionado(aluno) {
        const alunosContainer = document.getElementById('alunos_container');
        
        alunosContainer.innerHTML = `
            <div class="aluno-selecionado">
                <button type="button" class="btn-fechar-card" id="btn-fechar-card" title="Fechar card">
                    <i class="fas fa-times"></i>
                </button>
                <div class="aluno-info">
                    <h4><i class="fas fa-user"></i> ${aluno.nome}</h4>
                    <p><i class="fas fa-envelope"></i> ${aluno.email}</p>
                    <div class="aluno-stats">
                        <span class="badge badge-info">${aluno.faixa}</span>
                        <span class="badge badge-warning">${aluno.graus} graus</span>
                        <span class="badge badge-danger">${aluno.aulas_faltando} aulas restantes</span>
                    </div>
                </div>
                <div class="aluno-actions" id="aluno-actions"></div>
                <div class="aluno-horarios" id="aluno-horarios" style="display:none;">
                    <div class="aluno-horarios-lista" id="aluno-horarios-lista"></div>
                    <div class="aluno-horarios-form" id="aluno-horarios-form">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <button type="button" class="btn btn-xs btn-secondary" id="btn-adicionar-horarios">
                                <i class="fas fa-plus-circle"></i> Novos Horários
                            </button>
                        </div>
                     
                        <div class="aluno-novos-horarios" id="aluno-novos-horarios" style="display:none;">
                            <h5 style="margin: 1rem 0 0.5rem 0;"><i class="fas fa-calendar-plus"></i> Adicionar Novos Horários para o Aluno</h5>
                            <form id="form-novos-horarios" method="POST" action="php/atribuir_horario.php">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Tipo do Treino</label>
                                        <input type="text" name="nome_aula" placeholder="Ex: Aula das 7:00" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Dia da semana</label>
                                        <select name="dia_semana" required>
                                            <option value="">Escolha o dia da semana</option>
                                            <option value="Segunda">Segunda-feira</option>
                                            <option value="Terça">Terça-feira</option>
                                            <option value="Quarta">Quarta-feira</option>
                                            <option value="Quinta">Quinta-feira</option>
                                            <option value="Sexta">Sexta-feira</option>
                                            <option value="Sábado">Sábado</option>
                                            <option value="Domingo">Domingo</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Hora</label>
                                        <input type="time" name="hora" required>
                                    </div>
                                </div>
                                <input type="hidden" name="aluno_id" value="${aluno.id}">
                                <button type="submit" class="btn btn-sm">
                                    <i class="fas fa-plus"></i> Adicionar Horário para o Aluno
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="aluno-actions-edit">
                    <button type="button" class="btn btn-sm btn-primary" id="btn-editar-aluno">
                        <i class="fas fa-user-edit"></i> Editar Aluno
                    </button>
                </div>
                
                <!-- Histórico de Presença -->
                <div class="aluno-historico" id="aluno-historico">
                    <h5 style="margin: 1.5rem 0 1rem 0;"><i class="fas fa-history"></i> Histórico de Presença</h5>
                    <div id="historico-container">
                        <div class="search-loading">Carregando histórico...</div>
                    </div>
                </div>
            </div>
        `;

        // Carregar histórico de presença
        carregarHistoricoPresenca(aluno.id, aluno);

        // Event listener para fechar card
        const btnFecharCard = document.getElementById('btn-fechar-card');
        if (btnFecharCard) {
            btnFecharCard.addEventListener('click', () => {
                // Limpar área de alunos e mostrar mensagem inicial
                const alunosContainer = document.getElementById('alunos_container');
                alunosContainer.innerHTML = `
                    <div class="no-aluno-selected">
                        <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                        <h3>Selecione um aluno</h3>
                        <p>Use a barra de pesquisa acima para encontrar e selecionar um aluno.</p>
                    </div>
                `;
            });
        }

        // Event listener para editar aluno
        const btnEditarAluno = document.getElementById('btn-editar-aluno');
        if (btnEditarAluno) {
            btnEditarAluno.addEventListener('click', () => {
                abrirModalEdicao(aluno);
            });
        }

        // Buscar se o aluno possui horários atribuídos e renderizar seção dinâmica
        fetch(`php/get_aluno_horarios.php?aluno_id=${encodeURIComponent(aluno.id)}`)
            .then(r => r.json())
            .then(info => {
                const actions = document.getElementById('aluno-actions');
                actions.innerHTML = `
                    <button type="button" class="btn btn-sm" id="btn-exibir-horarios">
                        <i class="fas fa-calendar"></i> Exibir Horários
                    </button>
                    <button type="button" class="btn btn-sm btn-danger" id="btn-remover-vinculo" ${aluno.membership_id ? '' : 'disabled'} style="margin-left:0.5rem;">
                        <i class="fas fa-trash"></i> Remover vínculo
                    </button>
                `;

                const btnExibir = document.getElementById('btn-exibir-horarios');
                const btnAdicionarHorarios = document.getElementById('btn-adicionar-horarios');
                const btnRemoverVinculo = document.getElementById('btn-remover-vinculo');
                
                if (btnExibir) {
                    btnExibir.addEventListener('click', () => {
                        const area = document.getElementById('aluno-horarios');
                        if (area) {
                            const show = area.style.display === 'none' || area.style.display === '';
                            area.style.display = show ? 'block' : 'none';
                        }
                        // Preencher tabela de horários existentes
                        const lista = document.getElementById('aluno-horarios-lista');
                        if (lista) {
                            if (info && Array.isArray(info.horarios) && info.horarios.length) {
                                lista.innerHTML = `
                                    <table class="horarios-table">
                                        <thead>
                                            <tr>
                                                <th>Tipo do Treino</th>
                                                <th>Dia da Semana</th>
                                                <th>Horário</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${info.horarios.map(h => `
                                                <tr class="horario-row" data-horario-id="${h.id}" data-nome="${h.nome_aula}" data-dia="${h.dia_semana}" data-hora="${h.hora}">
                                                    <td>${h.nome_aula}</td>
                                                    <td>${h.dia_semana}</td>
                                                    <td>${h.hora}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                    <div class="horarios-actions">
                                        <button type="button" class="btn btn-sm btn-warning" id="btn-editar-horario" disabled>
                                            <i class="fas fa-pen"></i> Editar Horário Selecionado
                                        </button>
                                        <button type="button" class="btn btn-sm btn-danger" id="btn-remover-horario" disabled>
                                            <i class="fas fa-trash"></i> Remover Horário Selecionado
                                        </button>
                                    </div>
                                `;
                                
                                // Adicionar seleção de linha
                                lista.querySelectorAll('.horario-row').forEach(row => {
                                    row.addEventListener('click', () => {
                                        const isSelected = row.classList.contains('selected');
                                        
                                        if (isSelected) {
                                            // Segundo clique: remover seleção
                                            row.classList.remove('selected');
                                            
                                            // Desabilitar botões
                                            const btnEditar = document.getElementById('btn-editar-horario');
                                            const btnRemover = document.getElementById('btn-remover-horario');
                                            if (btnEditar) btnEditar.disabled = true;
                                            if (btnRemover) btnRemover.disabled = true;
                                        } else {
                                            // Primeiro clique: selecionar linha
                                            lista.querySelectorAll('.horario-row').forEach(r => r.classList.remove('selected'));
                                            row.classList.add('selected');
                                            
                                            // Habilitar botões
                                            const btnEditar = document.getElementById('btn-editar-horario');
                                            const btnRemover = document.getElementById('btn-remover-horario');
                                            if (btnEditar) btnEditar.disabled = false;
                                            if (btnRemover) btnRemover.disabled = false;
                                        }
                                    });
                                });
                                
                                // Event listener para editar
                                const btnEditar = document.getElementById('btn-editar-horario');
                                if (btnEditar) {
                                    btnEditar.addEventListener('click', () => {
                                        const linhaSelecionada = lista.querySelector('.horario-row.selected');
                                        if (!linhaSelecionada) return;
                                        
                                        const form = document.getElementById('form-novos-horarios');
                                        if (!form) return;
                                        
                                        const isEditing = form.getAttribute('data-edit-id');
                                        
                                        if (isEditing) {
                                            // Segundo clique: limpar formulário
                                            form.reset();
                                            form.removeAttribute('data-edit-id');
                                            
                                            const submitBtn = form.querySelector('button[type="submit"]');
                                            if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Horário para o Aluno';
                                            
                                            // Ocultar formulário
                                            const areaForm = document.getElementById('aluno-novos-horarios');
                                            if (areaForm) areaForm.style.display = 'none';
                                            
                                            // Alterar botão toggle
                                            const btnToggle = document.getElementById('btn-adicionar-horarios');
                                            if (btnToggle) {
                                                btnToggle.innerHTML = '<i class="fas fa-plus-circle"></i> Novos Horários';
                                            }
                                        } else {
                                            // Primeiro clique: preencher formulário
                                            const nome = linhaSelecionada.getAttribute('data-nome');
                                            const dia = linhaSelecionada.getAttribute('data-dia');
                                            const hora = linhaSelecionada.getAttribute('data-hora');
                                            const horarioId = linhaSelecionada.getAttribute('data-horario-id');

                                            form.querySelector('input[name="nome_aula"]').value = nome;
                                            form.querySelector('select[name="dia_semana"]').value = dia;
                                            form.querySelector('input[name="hora"]').value = hora;

                                            // marcar estado de edição
                                            form.setAttribute('data-edit-id', horarioId);
                                            const submitBtn = form.querySelector('button[type="submit"]');
                                            if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Atualizar Horário';
                                            
                                            // Mostrar formulário
                                            const areaForm = document.getElementById('aluno-novos-horarios');
                                            if (areaForm) areaForm.style.display = 'block';
                                            
                                            // Alterar botão toggle
                                            const btnToggle = document.getElementById('btn-adicionar-horarios');
                                            if (btnToggle) {
                                                btnToggle.innerHTML = '<i class="fas fa-minus-circle"></i> Ocultar';
                                            }
                                        }
                                    });
                                }
                                
                                // Event listener para remover
                                const btnRemover = document.getElementById('btn-remover-horario');
                                if (btnRemover) {
                                    btnRemover.addEventListener('click', () => {
                                        const linhaSelecionada = lista.querySelector('.horario-row.selected');
                                        if (!linhaSelecionada) return;
                                        
                                        if (!confirm('Remover este horário do aluno?')) return;
                                        
                                        const horarioId = linhaSelecionada.getAttribute('data-horario-id');
                                        fetch('php/remover_horario.php', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                            body: `aluno_id=${encodeURIComponent(aluno.id)}&horario_id=${encodeURIComponent(horarioId)}`
                                        })
                                        .then(r => r.json())
                                        .then(resp => {
                                            if (resp && resp.ok) {
                                                linhaSelecionada.remove();
                                                // Desabilitar botões se não há mais linhas
                                                if (!lista.querySelector('.horario-row')) {
                                                    lista.innerHTML = '<div class="search-no-results">Nenhum horário vinculado a este aluno</div>';
                                                } else {
                                                    // Desabilitar botões após remoção
                                                    const btnEditar = document.getElementById('btn-editar-horario');
                                                    const btnRemover = document.getElementById('btn-remover-horario');
                                                    if (btnEditar) btnEditar.disabled = true;
                                                    if (btnRemover) btnRemover.disabled = true;
                                                }
                                            }
                                        })
                                        .catch(() => {});
                                    });
                                }
                            } else {
                                lista.innerHTML = '<div class="search-no-results">Nenhum horário vinculado a este aluno</div>';
                            }
                        }
                    });
                }

                // Handler para remover vínculo (apenas se existir membership_id)
                if (btnRemoverVinculo) {
                    btnRemoverVinculo.addEventListener('click', () => {
                        const membershipId = aluno.membership_id || null;
                        if (!membershipId) {
                            alert('ID do vínculo não disponível para este aluno.');
                            return;
                        }

                        if (!confirm('Remover vínculo deste aluno com a academia?')) return;

                        const originalHtml = btnRemoverVinculo.innerHTML;
                        btnRemoverVinculo.disabled = true;
                        btnRemoverVinculo.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Removendo...';

                        fetch('php/confirmar_vinculo.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: 'acao=' + encodeURIComponent('prof_rejeitar') + '&membership_id=' + encodeURIComponent(membershipId)
                        })
                        .then(r => r.json())
                        .then(resp => {
                            if (resp && resp.ok) {
                                // Fechar card de aluno selecionado
                                const btnFecharCard = document.getElementById('btn-fechar-card');
                                if (btnFecharCard) {
                                    btnFecharCard.click();
                                } else {
                                    const alunosContainer = document.getElementById('alunos_container');
                                    if (alunosContainer) {
                                        alunosContainer.innerHTML = `
                                            <div class="no-aluno-selected">
                                                <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                                                <h3>Selecione um aluno</h3>
                                                <p>Use a barra de pesquisa acima para encontrar e selecionar um aluno.</p>
                                            </div>
                                        `;
                                    }
                                }

                                // Recarregar lista de alunos
                                try { loadAlunosAcademia(true); } catch (e) { console.warn('Não foi possível recarregar a lista de alunos:', e); }
                            } else {
                                alert('Erro ao remover vínculo: ' + (resp && resp.erro ? resp.erro : (resp && resp.message ? resp.message : 'Erro desconhecido')));
                                btnRemoverVinculo.disabled = false;
                                btnRemoverVinculo.innerHTML = originalHtml;
                            }
                        })
                        .catch(err => {
                            console.error('Erro ao remover vínculo:', err);
                            alert('Erro ao remover vínculo. Veja o console para mais detalhes.');
                            btnRemoverVinculo.disabled = false;
                            btnRemoverVinculo.innerHTML = originalHtml;
                        });
                    });
                }
                if (btnAdicionarHorarios) {
                    btnAdicionarHorarios.addEventListener('click', () => {
                        const area = document.getElementById('aluno-novos-horarios');
                        if (area) {
                            const isVisible = area.style.display !== 'none';
                            area.style.display = isVisible ? 'none' : 'block';
                            
                            // Alterar texto do botão
                            const icon = isVisible ? 'fa-plus-circle' : 'fa-minus-circle';
                            const text = isVisible ? 'Novos Horários' : 'Ocultar';
                            
                            btnAdicionarHorarios.innerHTML = `
                                <i class="fas ${icon}"></i> ${text}
                            `;
                        }
                    });
                }
            })
            .catch(() => {
                // Se falhar, ainda mostra opção de exibir horários
                const actions = document.getElementById('aluno-actions');
                if (actions) {
                    actions.innerHTML = `
                        <button type="button" class="btn btn-sm" id="btn-exibir-horarios"><i class="fas fa-calendar"></i> Exibir Horários</button>
                    `;
                    const btnExibir = document.getElementById('btn-exibir-horarios');
                    const btnAdicionarHorarios = document.getElementById('btn-adicionar-horarios');
                    
                    if (btnExibir) {
                        btnExibir.addEventListener('click', () => {
                            const area = document.getElementById('aluno-horarios');
                            if (area) {
                                const show = area.style.display === 'none' || area.style.display === '';
                                area.style.display = show ? 'block' : 'none';
                                
                                // Se não há horários, mostrar mensagem
                                const lista = document.getElementById('aluno-horarios-lista');
                                if (lista && !lista.innerHTML.trim()) {
                                    lista.innerHTML = '<div class="search-no-results">Nenhum horário vinculado a este aluno</div>';
                                }
                            }
                        });
                    }
                    if (btnAdicionarHorarios) {
                        btnAdicionarHorarios.addEventListener('click', () => {
                            const area = document.getElementById('aluno-novos-horarios');
                            if (area) {
                                const isVisible = area.style.display !== 'none';
                                area.style.display = isVisible ? 'none' : 'block';
                                
                                // Alterar texto do botão
                                const icon = isVisible ? 'fa-plus-circle' : 'fa-minus-circle';
                                const text = isVisible ? 'Novos Horários' : 'Ocultar';
                                
                                btnAdicionarHorarios.innerHTML = `
                                    <i class="fas ${icon}"></i> ${text}
                                `;
                            }
                        });
                    }
                }
            });
    }

    // Fechar resultados ao clicar fora
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });

    // Funções do modal de edição
    function abrirModalEdicao(aluno) {
        const modal = document.getElementById('modal-editar-aluno');
        const form = document.getElementById('form-editar-aluno');
        
        // Preencher formulário com dados do aluno
        document.getElementById('modal-aluno-id').value = aluno.id;
        document.getElementById('modal-aluno-nome').value = aluno.nome;
        document.getElementById('modal-aluno-email').value = aluno.email;
        document.getElementById('modal-aluno-faixa').value = aluno.faixa;
        document.getElementById('modal-aluno-graus').value = aluno.graus;
        document.getElementById('modal-aluno-aulas').value = aluno.aulas_faltando;
        
        // Adicionar event listeners se ainda não foram adicionados
        adicionarEventListenersModal();
        
        // Mostrar modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function adicionarEventListenersModal() {
        const modal = document.getElementById('modal-editar-aluno');
        const btnFecharModal = document.getElementById('btn-fechar-modal');
        const btnCancelar = document.getElementById('btn-cancelar-edicao');
        const btnSalvar = document.getElementById('btn-salvar-edicao');
        const form = document.getElementById('form-editar-aluno');

        // Verificar se os event listeners já foram adicionados
        if (modal.dataset.listenersAdded === 'true') {
            return;
        }

        // Marcar que os listeners foram adicionados
        modal.dataset.listenersAdded = 'true';

        if (btnFecharModal) {
            btnFecharModal.addEventListener('click', fecharModalEdicao);
        }

        if (btnCancelar) {
            btnCancelar.addEventListener('click', fecharModalEdicao);
        }

        // Fechar modal ao clicar fora
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    fecharModalEdicao();
                }
            });
        }

        // Fechar modal com tecla ESC
        const escHandler = function(e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                fecharModalEdicao();
            }
        };
        document.addEventListener('keydown', escHandler);

        // Salvar alterações
        if (btnSalvar) {
            btnSalvar.addEventListener('click', function() {
                const formData = new FormData(form);
                const data = new URLSearchParams(formData);
                
                // Mostrar loading no botão
                const originalText = btnSalvar.innerHTML;
                btnSalvar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
                btnSalvar.disabled = true;
                
                fetch('php/editar_aluno.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: data
                })
                .then(r => r.json())
                .then(resp => {
                    if (resp && resp.ok) {
                        // Fechar modal
                        fecharModalEdicao();
                        
                        // Atualizar dados do aluno no card
                        const alunoId = formData.get('aluno_id');
                        const alunoAtualizado = {
                            id: alunoId,
                            nome: formData.get('nome'),
                            email: formData.get('email'),
                            faixa: formData.get('faixa'),
                            graus: formData.get('graus'),
                            aulas_faltando: formData.get('aulas_faltando')
                        };
                        
                        // Recarregar o card do aluno com dados atualizados
                        exibirAlunoSelecionado(alunoAtualizado);
                        
                        // Mostrar mensagem de sucesso
                        // alert('Aluno atualizado com sucesso!');
                    } else {
                        alert('Erro ao atualizar aluno: ' + (resp.message || 'Erro desconhecido'));
                        btnSalvar.innerHTML = originalText;
                        btnSalvar.disabled = false;
                    }
                })
                .catch(err => {
                    console.error('Erro:', err);
                    alert('Erro ao atualizar aluno. Tente novamente.');
                    btnSalvar.innerHTML = originalText;
                    btnSalvar.disabled = false;
                });
            });
        }
    }

    function fecharModalEdicao() {
        const modal = document.getElementById('modal-editar-aluno');
        const btnSalvar = document.getElementById('btn-salvar-edicao');
        
        // Resetar estado do botão salvar
        if (btnSalvar) {
            btnSalvar.innerHTML = '<i class="fas fa-save"></i> Salvar Alterações';
            btnSalvar.disabled = false;
        }
        
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Funções do modal de gerenciar check-in
    function abrirModalCheckin(checkin) {
        const modal = document.getElementById('modal-gerenciar-checkin');
        const checkinInfo = document.getElementById('checkin-info');
        const statusSelect = document.getElementById('checkin-status');

        if (!modal) {
            console.error('abrirModalCheckin: elemento #modal-gerenciar-checkin não encontrado');
            return;
        }
        if (!checkinInfo) {
            console.error('abrirModalCheckin: elemento #checkin-info não encontrado');
            return;
        }
        if (!statusSelect) {
            console.error('abrirModalCheckin: elemento #checkin-status não encontrado');
            return;
        }

        console.debug('abrirModalCheckin recebendo:', checkin);

        // Preencher informações do check-in
        checkinInfo.innerHTML = `
            <div class="checkin-details">
                <h4><i class="fas fa-calendar-day"></i> Detalhes do Check-in</h4>
                <div class="detail-item">
                    <strong>Data:</strong> ${checkin.data}
                </div>
                <div class="detail-item">
                    <strong>Aula:</strong> ${checkin.aula}
                </div>
                <div class="detail-item">
                    <strong>Horário:</strong> ${checkin.hora}
                </div>
                <div class="detail-item">
                    <strong>Status Atual:</strong> 
                    <span class="status-badge status-${checkin.status}">
                        <i class="fas ${checkin.status === 'aprovado' ? 'fa-check-circle' : checkin.status === 'reprovado' ? 'fa-times-circle' : 'fa-clock'}"></i>
                        ${checkin.status}
                    </span>
                </div>
            </div>
        `;

        // Definir status atual no select
        try {
            statusSelect.value = checkin.status;
        } catch (err) {
            console.warn('Não foi possível definir value do select #checkin-status:', err);
        }

        // Armazenar dados do check-in para uso posterior
        modal.dataset.checkinId = checkin.id || '';
        modal.dataset.checkinData = checkin.data || '';
        modal.dataset.checkinAula = checkin.aula || '';
        modal.dataset.checkinHora = checkin.hora || '';
        modal.dataset.checkinStatus = checkin.status || '';

        // Adicionar event listeners se ainda não foram adicionados
        adicionarEventListenersModalCheckin();

        // Mostrar modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function fecharModalCheckin() {
        const modal = document.getElementById('modal-gerenciar-checkin');
        const btnSalvar = document.getElementById('btn-salvar-status');
        
        // Resetar estado dos botões
        if (btnSalvar) {
            btnSalvar.innerHTML = '<i class="fas fa-save"></i> Salvar Status';
            btnSalvar.disabled = false;
        }
        
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        // Remover seleção visual do histórico ao fechar modal (evita estado residual)
        const historicoContainerEl = document.getElementById('historico-container');
        if (historicoContainerEl) {
            const selected = historicoContainerEl.querySelector('.historico-row.selected');
            if (selected) selected.classList.remove('selected');
        }
    }

    function adicionarEventListenersModalCheckin() {
        const modal = document.getElementById('modal-gerenciar-checkin');
        const btnFecharModal = document.getElementById('btn-fechar-modal-checkin');
        const btnCancelar = document.getElementById('btn-cancelar-checkin');
        const btnExcluir = document.getElementById('btn-excluir-checkin');
        const btnSalvar = document.getElementById('btn-salvar-status');

        // Verificar se os event listeners já foram adicionados
        if (modal.dataset.listenersAddedCheckin === 'true') {
            return;
        }

        // Marcar que os listeners foram adicionados
        modal.dataset.listenersAddedCheckin = 'true';

        if (btnFecharModal) {
            btnFecharModal.addEventListener('click', fecharModalCheckin);
        }

        if (btnCancelar) {
            btnCancelar.addEventListener('click', fecharModalCheckin);
        }

        // Fechar modal ao clicar fora
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    fecharModalCheckin();
                }
            });
        }

        // Fechar modal com tecla ESC
        const escHandler = function(e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                fecharModalCheckin();
            }
        };
        document.addEventListener('keydown', escHandler);

        // Excluir check-in
        if (btnExcluir) {
            btnExcluir.addEventListener('click', function() {
                const checkinId = modal.dataset.checkinId;
                
                if (!confirm('Tem certeza que deseja excluir este check-in?\n\nEsta ação não pode ser desfeita.')) {
                    return;
                }
                
                // Mostrar loading no botão
                const originalText = btnExcluir.innerHTML;
                btnExcluir.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Excluindo...';
                btnExcluir.disabled = true;
                
                fetch('php/excluir_checkin.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `checkin_id=${encodeURIComponent(checkinId)}`
                })
                .then(r => r.json())
                .then(resp => {
                    if (resp && resp.ok) {
                        // Fechar modal
                        fecharModalCheckin();
                        
                        // Recarregar histórico
                        const alunoId = document.querySelector('.aluno-selecionado')?.querySelector('input[name="aluno_id"]')?.value;
                        if (alunoId) {
                            carregarHistoricoPresenca(alunoId, { id: alunoId });
                        }
                        
                        // alert('Check-in excluído com sucesso!');
                    } else {
                        alert('Erro ao excluir check-in: ' + (resp.message || 'Erro desconhecido'));
                        btnExcluir.innerHTML = originalText;
                        btnExcluir.disabled = false;
                    }
                })
                .catch(err => {
                    console.error('Erro:', err);
                    alert('Erro ao excluir check-in. Tente novamente.');
                    btnExcluir.innerHTML = originalText;
                    btnExcluir.disabled = false;
                });
            });
        }

        // Salvar status
        if (btnSalvar) {
            btnSalvar.addEventListener('click', function() {
                const checkinId = modal.dataset.checkinId;
                const novoStatus = document.getElementById('checkin-status').value;
                
                // Mostrar loading no botão
                const originalText = btnSalvar.innerHTML;
                btnSalvar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
                btnSalvar.disabled = true;
                
                fetch('php/alterar_status_checkin.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `checkin_id=${encodeURIComponent(checkinId)}&status=${encodeURIComponent(novoStatus)}`
                })
                .then(r => r.json())
                .then(resp => {
                    if (resp && resp.ok) {
                        // Fechar modal
                        fecharModalCheckin();
                        
                        // Recarregar histórico
                        const alunoId = document.querySelector('.aluno-selecionado')?.querySelector('input[name="aluno_id"]')?.value;
                        if (alunoId) {
                            carregarHistoricoPresenca(alunoId, { id: alunoId });
                        }
                        
                        // alert('Status atualizado com sucesso!');
                    } else {
                        alert('Erro ao atualizar status: ' + (resp.message || 'Erro desconhecido'));
                        btnSalvar.innerHTML = originalText;
                        btnSalvar.disabled = false;
                    }
                })
                .catch(err => {
                    console.error('Erro:', err);
                    alert('Erro ao atualizar status. Tente novamente.');
                    btnSalvar.innerHTML = originalText;
                    btnSalvar.disabled = false;
                });
            });
        }
    }



    // Delegar envio do formulário de atualização do aluno via fetch
    document.addEventListener('submit', function(e) {
        const form = e.target;
        
        if (form && form.id === 'form-adicionar-horario') {
            e.preventDefault();
            const data = new URLSearchParams(new FormData(form));
            const editId = form.getAttribute('data-edit-id');
            const url = editId ? 'php/editar_horario.php' : 'php/atribuir_horario.php';
            if (editId) data.append('horario_id', editId);
            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: data.toString()
            })
            .then(r => r.json())
            .then(resp => {
                if (resp && resp.ok) {
                    // limpar estado
                    form.reset();
                    form.removeAttribute('data-edit-id');
                    const submitBtn = form.querySelector('button[type="submit"]');
                    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Salvar Horário';
                    // re-render tabela
                    const alunoId = data.get('aluno_id');
                    return fetch(`php/get_aluno_horarios.php?aluno_id=${encodeURIComponent(alunoId)}`)
                        .then(r => r.json())
                        .then(info => {
                            const lista = document.getElementById('aluno-horarios-lista');
                            if (!lista) return;
                            if (info && Array.isArray(info.horarios) && info.horarios.length) {
                                lista.innerHTML = `
                                    <table class="horarios-table">
                                        <thead>
                                            <tr>
                                                <th>Tipo do Treino</th>
                                                <th>Dia da Semana</th>
                                                <th>Horário</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${info.horarios.map(h => `
                                                <tr class="horario-row" data-horario-id="${h.id}" data-nome="${h.nome_aula}" data-dia="${h.dia_semana}" data-hora="${h.hora}">
                                                    <td>${h.nome_aula}</td>
                                                    <td>${h.dia_semana}</td>
                                                    <td>${h.hora}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                    <div class="horarios-actions">
                                        <button type="button" class="btn btn-sm btn-warning" id="btn-editar-horario" disabled>
                                            <i class="fas fa-pen"></i> Editar Horário Selecionado
                                        </button>
                                        <button type="button" class="btn btn-sm btn-danger" id="btn-remover-horario" disabled>
                                            <i class="fas fa-trash"></i> Remover Horário Selecionado
                                        </button>
                                    </div>
                                `;
                                
                                // Re-wire seleção de linha
                                lista.querySelectorAll('.horario-row').forEach(row => {
                                    row.addEventListener('click', () => {
                                        const isSelected = row.classList.contains('selected');
                                        
                                        if (isSelected) {
                                            // Segundo clique: remover seleção
                                            row.classList.remove('selected');
                                            
                                            // Desabilitar botões
                                            const btnEditar = document.getElementById('btn-editar-horario');
                                            const btnRemover = document.getElementById('btn-remover-horario');
                                            if (btnEditar) btnEditar.disabled = true;
                                            if (btnRemover) btnRemover.disabled = true;
                                        } else {
                                            // Primeiro clique: selecionar linha
                                            lista.querySelectorAll('.horario-row').forEach(r => r.classList.remove('selected'));
                                            row.classList.add('selected');
                                            
                                            // Habilitar botões
                                            const btnEditar = document.getElementById('btn-editar-horario');
                                            const btnRemover = document.getElementById('btn-remover-horario');
                                            if (btnEditar) btnEditar.disabled = false;
                                            if (btnRemover) btnRemover.disabled = false;
                                        }
                                    });
                                });
                                
                                // Re-wire botões
                                const btnEditar = document.getElementById('btn-editar-horario');
                                const btnRemover = document.getElementById('btn-remover-horario');
                                
                                if (btnEditar) {
                                    btnEditar.addEventListener('click', () => {
                                        const linhaSelecionada = lista.querySelector('.horario-row.selected');
                                        if (!linhaSelecionada) return;
                                        
                                        const form = document.getElementById('form-novos-horarios');
                                        if (!form) return;
                                        
                                        const isEditing = form.getAttribute('data-edit-id');
                                        
                                        if (isEditing) {
                                            // Segundo clique: limpar formulário
                                            form.reset();
                                            form.removeAttribute('data-edit-id');
                                            
                                            const submitBtn = form.querySelector('button[type="submit"]');
                                            if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Horário para o Aluno';
                                            
                                            // Ocultar formulário
                                            const areaForm = document.getElementById('aluno-novos-horarios');
                                            if (areaForm) areaForm.style.display = 'none';
                                            
                                            // Alterar botão toggle
                                            const btnToggle = document.getElementById('btn-adicionar-horarios');
                                            if (btnToggle) {
                                                btnToggle.innerHTML = '<i class="fas fa-plus-circle"></i> Novos Horários';
                                            }
                                        } else {
                                            // Primeiro clique: preencher formulário
                                            const nome = linhaSelecionada.getAttribute('data-nome');
                                            const dia = linhaSelecionada.getAttribute('data-dia');
                                            const hora = linhaSelecionada.getAttribute('data-hora');
                                            const horarioId = linhaSelecionada.getAttribute('data-horario-id');

                                            form.querySelector('input[name="nome_aula"]').value = nome;
                                            form.querySelector('select[name="dia_semana"]').value = dia;
                                            form.querySelector('input[name="hora"]').value = hora;

                                            form.setAttribute('data-edit-id', horarioId);
                                            const submitBtn = form.querySelector('button[type="submit"]');
                                            if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Atualizar Horário';
                                            
                                            const areaForm = document.getElementById('aluno-novos-horarios');
                                            if (areaForm) areaForm.style.display = 'block';
                                            
                                            const btnToggle = document.getElementById('btn-adicionar-horarios');
                                            if (btnToggle) {
                                                btnToggle.innerHTML = '<i class="fas fa-minus-circle"></i> Ocultar';
                                            }
                                        }
                                    });
                                }
                                
                                if (btnRemover) {
                                    btnRemover.addEventListener('click', () => {
                                        const linhaSelecionada = lista.querySelector('.horario-row.selected');
                                        if (!linhaSelecionada) return;
                                        
                                        if (!confirm('Remover este horário do aluno?')) return;
                                        
                                        const horarioId = linhaSelecionada.getAttribute('data-horario-id');
                                        fetch('php/remover_horario.php', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                            body: `aluno_id=${encodeURIComponent(alunoId)}&horario_id=${encodeURIComponent(horarioId)}`
                                        })
                                        .then(r => r.json())
                                        .then(resp => {
                                            if (resp && resp.ok) {
                                                linhaSelecionada.remove();
                                                if (!lista.querySelector('.horario-row')) {
                                                    lista.innerHTML = '<div class="search-no-results">Nenhum horário vinculado a este aluno</div>';
                                                } else {
                                                    const btnEditar = document.getElementById('btn-editar-horario');
                                                    const btnRemover = document.getElementById('btn-remover-horario');
                                                    if (btnEditar) btnEditar.disabled = true;
                                                    if (btnRemover) btnRemover.disabled = true;
                                                }
                                            }
                                        })
                                        .catch(() => {});
                                    });
                                }
                            } else {
                                lista.innerHTML = '<div class="search-no-results">Nenhum horário vinculado a este aluno</div>';
                            }
                        });
                }
            })
            .catch(() => {});
        }
        
        if (form && form.id === 'form-novos-horarios') {
            e.preventDefault();
            const data = new URLSearchParams(new FormData(form));
            fetch('php/atribuir_horario.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: data.toString()
            })
            .then(r => r.json())
            .then(resp => {
                if (resp && resp.ok) {
                    // limpar formulário
                    form.reset();
                    // re-render tabela
                    const alunoId = data.get('aluno_id');
                    return fetch(`php/get_aluno_horarios.php?aluno_id=${encodeURIComponent(alunoId)}`)
                        .then(r => r.json())
                        .then(info => {
                            const lista = document.getElementById('aluno-horarios-lista');
                            if (!lista) return;
                            if (info && Array.isArray(info.horarios) && info.horarios.length) {
                                lista.innerHTML = `
                                    <table class="horarios-table">
                                        <thead>
                                            <tr>
                                                <th>Tipo do Treino</th>
                                                <th>Dia da Semana</th>
                                                <th>Horário</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${info.horarios.map(h => `
                                                <tr class="horario-row" data-horario-id="${h.id}" data-nome="${h.nome_aula}" data-dia="${h.dia_semana}" data-hora="${h.hora}">
                                                    <td>${h.nome_aula}</td>
                                                    <td>${h.dia_semana}</td>
                                                    <td>${h.hora}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                    <div class="horarios-actions">
                                        <button type="button" class="btn btn-sm btn-warning" id="btn-editar-horario" disabled>
                                            <i class="fas fa-pen"></i> Editar Horário Selecionado
                                        </button>
                                        <button type="button" class="btn btn-sm btn-danger" id="btn-remover-horario" disabled>
                                            <i class="fas fa-trash"></i> Remover Horário Selecionado
                                        </button>
                                    </div>
                                `;
                                
                                // Re-wire seleção de linha
                                lista.querySelectorAll('.horario-row').forEach(row => {
                                    row.addEventListener('click', () => {
                                        const isSelected = row.classList.contains('selected');
                                        
                                        if (isSelected) {
                                            // Segundo clique: remover seleção
                                            row.classList.remove('selected');
                                            
                                            // Desabilitar botões
                                            const btnEditar = document.getElementById('btn-editar-horario');
                                            const btnRemover = document.getElementById('btn-remover-horario');
                                            if (btnEditar) btnEditar.disabled = true;
                                            if (btnRemover) btnRemover.disabled = true;
                                        } else {
                                            // Primeiro clique: selecionar linha
                                            lista.querySelectorAll('.horario-row').forEach(r => r.classList.remove('selected'));
                                            row.classList.add('selected');
                                            
                                            // Habilitar botões
                                            const btnEditar = document.getElementById('btn-editar-horario');
                                            const btnRemover = document.getElementById('btn-remover-horario');
                                            if (btnEditar) btnEditar.disabled = false;
                                            if (btnRemover) btnRemover.disabled = false;
                                        }
                                    });
                                });
                                
                                // Re-wire botões
                                const btnEditar = document.getElementById('btn-editar-horario');
                                const btnRemover = document.getElementById('btn-remover-horario');
                                
                                if (btnEditar) {
                                    btnEditar.addEventListener('click', () => {
                                        const linhaSelecionada = lista.querySelector('.horario-row.selected');
                                        if (!linhaSelecionada) return;
                                        
                                        const form = document.getElementById('form-novos-horarios');
                                        if (!form) return;
                                        
                                        const isEditing = form.getAttribute('data-edit-id');
                                        
                                        if (isEditing) {
                                            // Segundo clique: limpar formulário
                                            form.reset();
                                            form.removeAttribute('data-edit-id');
                                            
                                            const submitBtn = form.querySelector('button[type="submit"]');
                                            if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar Horário para o Aluno';
                                            
                                            // Ocultar formulário
                                            const areaForm = document.getElementById('aluno-novos-horarios');
                                            if (areaForm) areaForm.style.display = 'none';
                                            
                                            // Alterar botão toggle
                                            const btnToggle = document.getElementById('btn-adicionar-horarios');
                                            if (btnToggle) {
                                                btnToggle.innerHTML = '<i class="fas fa-plus-circle"></i> Novos Horários';
                                            }
                                        } else {
                                            // Primeiro clique: preencher formulário
                                            const nome = linhaSelecionada.getAttribute('data-nome');
                                            const dia = linhaSelecionada.getAttribute('data-dia');
                                            const hora = linhaSelecionada.getAttribute('data-hora');
                                            const horarioId = linhaSelecionada.getAttribute('data-horario-id');

                                            form.querySelector('input[name="nome_aula"]').value = nome;
                                            form.querySelector('select[name="dia_semana"]').value = dia;
                                            form.querySelector('input[name="hora"]').value = hora;

                                            form.setAttribute('data-edit-id', horarioId);
                                            const submitBtn = form.querySelector('button[type="submit"]');
                                            if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Atualizar Horário';
                                            
                                            const areaForm = document.getElementById('aluno-novos-horarios');
                                            if (areaForm) areaForm.style.display = 'block';
                                            
                                            const btnToggle = document.getElementById('btn-adicionar-horarios');
                                            if (btnToggle) {
                                                btnToggle.innerHTML = '<i class="fas fa-minus-circle"></i> Ocultar';
                                            }
                                        }
                                    });
                                }
                                
                                if (btnRemover) {
                                    btnRemover.addEventListener('click', () => {
                                        const linhaSelecionada = lista.querySelector('.horario-row.selected');
                                        if (!linhaSelecionada) return;
                                        
                                        if (!confirm('Remover este horário do aluno?')) return;
                                        
                                        const horarioId = linhaSelecionada.getAttribute('data-horario-id');
                                        fetch('php/remover_horario.php', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                            body: `aluno_id=${encodeURIComponent(alunoId)}&horario_id=${encodeURIComponent(horarioId)}`
                                        })
                                        .then(r => r.json())
                                        .then(resp => {
                                            if (resp && resp.ok) {
                                                linhaSelecionada.remove();
                                                if (!lista.querySelector('.horario-row')) {
                                                    lista.innerHTML = '<div class="search-no-results">Nenhum horário vinculado a este aluno</div>';
                                                } else {
                                                    const btnEditar = document.getElementById('btn-editar-horario');
                                                    const btnRemover = document.getElementById('btn-remover-horario');
                                                    if (btnEditar) btnEditar.disabled = true;
                                                    if (btnRemover) btnRemover.disabled = true;
                                                }
                                            }
                                        })
                                        .catch(() => {});
                                    });
                                }
                            } else {
                                lista.innerHTML = '<div class="search-no-results">Nenhum horário vinculado a este aluno</div>';
                            }
                        });
                }
            })
            .catch(() => {});
        }
    });

    // Tab switching (use closest to support clicks nos ícones/textos internos)
    document.addEventListener('click', function(e) {
        const btn = e.target.closest && e.target.closest('.tab-btn');
        if (!btn) return;

        const tabName = btn.getAttribute('data-tab');
        console.log('Tab clicked (resolved):', tabName);

        // Remove active from all tabs and content
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active to clicked tab and corresponding content
        btn.classList.add('active');
        const targetContent = document.getElementById('tab-' + tabName);
        if (targetContent) {
            targetContent.classList.add('active');
            console.log('Tab activated:', tabName);
            // Se ativou a aba de alunos, carregar a tabela de alunos associados
            if (tabName === 'alunos') {
                loadAlunosAcademia();
            }
        } else {
            console.error('Tab content not found:', 'tab-' + tabName);
        }
    });

    // Carregar alunos da academia (apenas aprovados) com cache simples
    let alunosAcademiaCache = null;
    function loadAlunosAcademia(forceReload = false) {
        const tableContainer = document.getElementById('alunos_table_container');
        const tableArea = document.getElementById('alunos_table_area');
        if (!tableArea || !tableContainer) return;

        tableContainer.style.display = 'block';

        if (alunosAcademiaCache && !forceReload) {
            renderAlunosTable(alunosAcademiaCache, tableArea);
            return;
        }

        tableArea.innerHTML = '<div class="table-loading"><i class="fas fa-spinner fa-spin"></i> Carregando alunos...</div>';

        fetch('php/get_alunos_academia.php')
            .then(r => {
                if (!r.ok) throw new Error('Resposta HTTP: ' + r.status);
                return r.json();
            })
            .then(data => {
                console.log('Resposta get_alunos_academia:', data);
                if (data && data.erro) {
                    tableArea.innerHTML = `<div class="search-no-results">Erro: ${data.erro}</div>`;
                    return;
                }

                if (!Array.isArray(data) || data.length === 0) {
                    // fallback: usar lista de alunos retornada por get_professor.php (não filtrada)
                    const fallback = window._professorData && Array.isArray(window._professorData.alunos) ? window._professorData.alunos : null;
                    if (fallback && fallback.length) {
                        tableArea.innerHTML = '<div class="search-no-results">Nenhum vínculo aprovado encontrado — exibindo lista geral de alunos (fallback)</div>';
                        renderAlunosTable(fallback, tableArea);
                        alunosAcademiaCache = fallback;
                        return;
                    }

                    tableArea.innerHTML = '<div class="search-no-results">Nenhum aluno vinculado a esta academia</div>';
                    alunosAcademiaCache = [];
                    return;
                }

                alunosAcademiaCache = data;
                renderAlunosTable(data, tableArea);
            })
            .catch(err => {
                console.error('Erro ao carregar alunos da academia:', err);
                tableArea.innerHTML = '<div class="search-no-results">Erro ao carregar alunos. Veja o console para detalhes.</div>';
            });
    }

    function renderAlunosTable(data, tableArea) {
        // Mostrar apenas: Nome, Email, Faixa, Grau
        const rows = data.map(a => `
            <tr data-id="${a.id}" data-membership="${a.membership_id || ''}" data-nome="${encodeURIComponent(a.nome || '')}" data-email="${encodeURIComponent(a.email || '')}" data-faixa="${encodeURIComponent(a.faixa || '')}" data-graus="${a.graus || 0}" data-aulas="${typeof a.aulas_faltando !== 'undefined' ? a.aulas_faltando : 0}">
                <td>${escapeHtml(a.nome)}</td>
                <td>${escapeHtml(a.email)}</td>
                <td>${escapeHtml(a.faixa || '')}</td>
                <td>${a.graus || 0}</td>
            </tr>
        `).join('');

        tableArea.innerHTML = `
            <table class="aluno-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Faixa</th>
                        <th>Grau</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;

        // Tornar linhas clicáveis e exibir dados no card de aluno
        const linhas = tableArea.querySelectorAll('table.aluno-table tbody tr');
        linhas.forEach(row => {
            row.style.cursor = 'default';

            // Abrir via botão 'Abrir'
            const btnOpen = row.querySelector('.btn-open-row');
            if (btnOpen) {
                btnOpen.addEventListener('click', (e) => {
                    e.stopPropagation();
                    linhas.forEach(r => r.classList.remove('selected'));
                    row.classList.add('selected');

                    const id = row.getAttribute('data-id');
                    const nome = decodeURIComponent(row.getAttribute('data-nome') || '');
                    const email = decodeURIComponent(row.getAttribute('data-email') || '');
                    const faixa = decodeURIComponent(row.getAttribute('data-faixa') || '');
                    const graus = parseInt(row.getAttribute('data-graus') || '0', 10);
                    const aulas = parseInt(row.getAttribute('data-aulas') || '0', 10);
                    const membership = row.getAttribute('data-membership') || null;

                    if (window.selecionarAluno) {
                        window.selecionarAluno(id, nome, email, faixa, graus, aulas, membership);
                    } else if (typeof exibirAlunoSelecionado === 'function') {
                        exibirAlunoSelecionado({ id: id, nome: nome, email: email, faixa: faixa, graus: graus, aulas_faltando: aulas, membership_id: membership });
                    }
                });
            }

            // Remover vínculo
            const btnRemove = row.querySelector('.btn-remove-membership');
            if (btnRemove) {
                btnRemove.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const membershipId = row.getAttribute('data-membership');
                    if (!membershipId) {
                        alert('Membership ID não disponível para este registro');
                        return;
                    }

                    if (!confirm('Remover vínculo deste aluno com a academia?')) return;

                    btnRemove.disabled = true;
                    btnRemove.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Removendo...';

                    fetch('php/confirmar_vinculo.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: `acao=${encodeURIComponent('prof_rejeitar')}&membership_id=${encodeURIComponent(membershipId)}`
                    })
                    .then(r => r.json())
                    .then(resp => {
                        if (resp && resp.ok) {
                            // remover a linha da tabela
                            row.remove();
                        } else {
                            alert('Erro ao remover vínculo: ' + (resp && resp.erro ? resp.erro : (resp && resp.message ? resp.message : 'Erro desconhecido')));
                            btnRemove.disabled = false;
                            btnRemove.innerHTML = 'Remover vínculo';
                        }
                    })
                    .catch(err => {
                        console.error('Erro ao remover vínculo:', err);
                        alert('Erro ao remover vínculo. Veja console.');
                        btnRemove.disabled = false;
                        btnRemove.innerHTML = 'Remover vínculo';
                    });
                });
            }

            // Duplo clique na linha: abrir diretamente no card do aluno
            row.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                const id = row.getAttribute('data-id');
                const nome = decodeURIComponent(row.getAttribute('data-nome') || '');
                const email = decodeURIComponent(row.getAttribute('data-email') || '');
                const faixa = decodeURIComponent(row.getAttribute('data-faixa') || '');
                const graus = parseInt(row.getAttribute('data-graus') || '0', 10);
                const aulas = parseInt(row.getAttribute('data-aulas') || '0', 10);

                console.debug('alunos table dblclick abrir aluno:', { id, nome, email, faixa, graus, aulas });

                if (window.selecionarAluno) {
                    window.selecionarAluno(id, nome, email, faixa, graus, aulas);
                } else if (typeof exibirAlunoSelecionado === 'function') {
                    exibirAlunoSelecionado({ id: id, nome: nome, email: email, faixa: faixa, graus: graus, aulas_faltando: aulas });
                }
            });
        });
    }

    // Pequena função utilitária para escapar HTML em valores inseridos na tabela
    function escapeHtml(str) {
        if (!str && str !== 0) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Ligar botão de recarregar alunos
    const btnRecarregarAlunos = document.getElementById('btn-recarregar-alunos');
    if (btnRecarregarAlunos) {
        btnRecarregarAlunos.addEventListener('click', () => loadAlunosAcademia(true));
    }

    // Se a aba 'alunos' já estiver ativa ao carregar a página, carregue a tabela
    document.addEventListener('DOMContentLoaded', () => {
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab && activeTab.getAttribute('data-tab') === 'alunos') {
            loadAlunosAcademia();
        }
    });

    // Account management
    const formConta = document.getElementById('form-editar-conta');
    const btnExcluirConta = document.getElementById('btn-excluir-conta');

    console.log('Form elements found:', {formConta: !!formConta, btnExcluirConta: !!btnExcluirConta});

    if (formConta) {
        // Load current account data
        fetch('php/get_professor.php')
            .then(res => res.json())
            .then(data => {
                const prof = data.professor || data.user || {};
                const academias = data.academias || [];
                const acad = academias[0];

                document.getElementById('conta-nome').value = prof.nome || '';
                document.getElementById('conta-apelido').value = prof.apelido || '';
                document.getElementById('conta-email').value = prof.email || '';
                if (acad) {
                    document.getElementById('conta-academia').value = acad.nome || '';
                }
            });

        // Handle form submission
        formConta.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(formConta);
            const novaSenha = formData.get('nova_senha');
            const confirmarSenha = formData.get('confirmar_senha');
            
            if (novaSenha && novaSenha !== confirmarSenha) {
                alert('As senhas não coincidem!');
                return;
            }
            
            if (!novaSenha) {
                formData.delete('nova_senha');
                formData.delete('confirmar_senha');
            }

            fetch('php/editar_professor.php', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data.ok) {
                    alert('Conta atualizada com sucesso!');
                    location.reload();
                } else {
                    alert('Erro: ' + (data.message || 'Erro desconhecido'));
                }
            })
            .catch(err => {
                console.error('Erro:', err);
                alert('Erro ao atualizar conta');
            });
        });
    }

    if (btnExcluirConta) {
        btnExcluirConta.addEventListener('click', function() {
            if (!confirm('ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\nTem certeza que deseja excluir sua conta?\n\nIsso removerá:\n- Sua conta de professor\n- Todas as academias associadas\n- Todos os dados relacionados')) {
                return;
            }

            if (!confirm('ÚLTIMA CONFIRMAÇÃO: Excluir conta permanentemente?')) {
                return;
            }

            fetch('php/excluir_professor.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: 'confirmar=1'
            })
            .then(res => res.json())
            .then(data => {
                if (data.ok) {
                    alert('Conta excluída. Redirecionando...');
                    window.location.href = 'index.html';
                } else {
                    alert('Erro: ' + (data.message || 'Erro desconhecido'));
                }
            })
            .catch(err => {
                console.error('Erro:', err);
                alert('Erro ao excluir conta');
            });
        });
    }

    // Listener global delegado para dblclick em linhas do histórico.
    // Isso garante que, mesmo após re-renderizações ou problemas de binding local,
    // um duplo clique em `.historico-row` abra o modal de gerenciamento do check-in.
    document.addEventListener('dblclick', function(e) {
        try {
            const row = e.target && e.target.closest ? e.target.closest('.historico-row') : null;
            if (!row) return; // não é uma linha do histórico

            const modal = document.getElementById('modal-gerenciar-checkin');
            if (modal && modal.style.display === 'flex') {
                // Modal já aberto, ignorar
                console.debug('dblclick: modal já aberto, ignorando');
                return;
            }

            // Assegurar que a linha esteja dentro do container esperado
            const historicoContainerEl = row.closest('#historico-container');
            if (!historicoContainerEl) {
                console.debug('dblclick: linha historico não está dentro de #historico-container, ignorando');
                return;
            }

            console.debug('dblclick global detectado em .historico-row:', row);

            // Seleção visual
            const prev = historicoContainerEl.querySelector('.historico-row.selected');
            if (prev && prev !== row) prev.classList.remove('selected');
            if (!row.classList.contains('selected')) row.classList.add('selected');

            // Extrair atributos do data-*
            const checkinId = row.getAttribute('data-checkin-id');
            const checkinData = row.getAttribute('data-checkin-data');
            const checkinAula = row.getAttribute('data-checkin-aula');
            const checkinHora = row.getAttribute('data-checkin-hora');
            const checkinStatus = row.getAttribute('data-checkin-status');

            console.debug('dblclick: abrir modal checkin id=', checkinId, 'data=', checkinData, 'aula=', checkinAula, 'hora=', checkinHora, 'status=', checkinStatus);

            // Pequeno delay para percepção da animação de seleção
            setTimeout(() => {
                try {
                    if (typeof abrirModalCheckin === 'function') {
                        abrirModalCheckin({ id: checkinId, data: checkinData, aula: checkinAula, hora: checkinHora, status: checkinStatus });
                    } else {
                        console.error('abrirModalCheckin não é uma função ou não está no escopo');
                    }
                } catch (err) {
                    console.error('Erro ao chamar abrirModalCheckin via listener global:', err);
                }
            }, 80);
        } catch (err) {
            console.error('Erro no handler global de dblclick:', err);
        }
    });

});