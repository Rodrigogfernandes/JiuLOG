window.addEventListener('load', () => {
    fetch('php/get_professor.php')
        .then(res => res.json())
        .then(data => {
            console.log('Dados recebidos:', data); // Debug
            
            const professorNome = document.getElementById('professor_nome');
            const academiaLogo = document.getElementById('academia_logo');
            const academiaNome = document.getElementById('academia_nome');
            const horariosContainer = document.getElementById('horarios_container');
            const checkinsContainer = document.getElementById('checkins_container');
            const alunosContainer = document.getElementById('alunos_container');
            const solicitacoesContainer = document.getElementById('solicitacoes_container');

            // Ajuste conforme get_professor.php
            const prof = (data && (data.professor || data.user)) || {};
            const academias = (data && data.academias) || [];

            console.log('Professor:', prof); // Debug
            console.log('Academias:', academias); // Debug

            // Nome do professor
            if (professorNome) {
                professorNome.textContent = prof.nome || 'Professor';
                console.log('Nome do professor definido:', professorNome.textContent); // Debug
            }

            // Logo e nome da academia
            const acad = academias && academias.length ? academias[0] : null;
            console.log('Academia selecionada:', acad); // Debug
            
            if (academiaLogo && academiaNome) {
                if (acad && acad.logo_path) {
                    academiaLogo.innerHTML = `<img src="${acad.logo_path}" alt="Logo da academia" style="height:32px;border-radius:4px">`;
                    console.log('Logo da academia carregada:', acad.logo_path); // Debug
                } else {
                    academiaLogo.innerHTML = `<i class="fas fa-building" style="font-size:24px;opacity:0.7"></i>`;
                    console.log('Ícone padrão da academia exibido'); // Debug
                }
                
                if (acad && acad.nome) {
                    academiaNome.textContent = acad.nome;
                    console.log('Nome da academia definido:', academiaNome.textContent); // Debug
                } else {
                    academiaNome.textContent = 'Nenhuma academia';
                    console.log('Nenhuma academia encontrada'); // Debug
                }
            }

            // -----------------------------
            // HORÁRIOS EXISTENTES (render global opcional)
            // -----------------------------
            if (horariosContainer && Array.isArray(data.horarios)) {
                horariosContainer.innerHTML = "";
                data.horarios.forEach(h => {
                    const div = document.createElement('div');
                    div.classList.add('horario');
                    div.innerHTML = `
                        <strong>${h.nome_aula}</strong><br>
                        Dia: ${h.dia_semana} | Horário: ${h.hora}
                        <form method="POST" action="php/aula.php" style="display:inline;">
                            <input type="hidden" name="horario_id" value="${h.id}">
                            <button type="submit" name="remove_aula">Remover</button>
                        </form>
                    `;
                    horariosContainer.appendChild(div);
                });
            }

            // -----------------------------
            // CHECK-INS PENDENTES
            // -----------------------------
            if (checkinsContainer && Array.isArray(data.checkins)) {
                checkinsContainer.innerHTML = "";
                data.checkins.forEach(c => {
                    const div = document.createElement('div');
                    div.classList.add('checkin');
                    div.innerHTML = `
                        <strong>${c.aluno_nome}</strong> → ${c.nome_aula} <br>
                        Data: ${c.data} | Hora: ${c.hora}
                        <form method=\"POST\" action=\"php/aprovar.php\" style=\"display:inline;\">\n\
                            <input type=\"hidden\" name=\"checkin_id\" value=\"${c.id}\">\n\
                            <button name=\"acao\" value=\"aprovar\" class=\"btn btn-checkin btn-aprovar\"><i class=\"fas fa-check\"></i> Aprovar</button>\n\
                            <button name=\"acao\" value=\"reprovar\" class=\"btn btn-checkin btn-reprovar\"><i class=\"fas fa-times\"></i> Reprovar</button>\n\
                        </form>
                    `;
                    checkinsContainer.appendChild(div);
                });
            }

            // -----------------------------
            // SOLICITAÇÕES DE ACADEMIA
            // -----------------------------
            if (solicitacoesContainer) {
                const solicitacoes = Array.isArray(data.solicitacoes) ? data.solicitacoes : [];
                if (!solicitacoes.length) {
                    solicitacoesContainer.innerHTML = '<div class="search-no-results">Nenhuma solicitação pendente</div>';
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
                                        <td>${s.aluno_nome}</td>
                                        <td>${s.academia_nome}</td>
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

            // -----------------------------
            // CARD DE GERENCIAR ALUNO SELECIONADO
            // -----------------------------
            // Inicialmente vazio - só mostra aluno quando selecionado na busca
            alunosContainer.innerHTML = `
                <div class="no-aluno-selected">
                    <i class="fas fa-search"></i>
                    <h4>Nenhum aluno selecionado</h4>
                    <p>Use a barra de pesquisa acima para encontrar e selecionar um aluno</p>
                </div>
            `;
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
    window.selecionarAluno = function(id, nome, email, faixa, graus, aulas_faltando) {
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
            aulas_faltando: aulas_faltando
        });
    };

    // Função para carregar histórico de presença
    function carregarHistoricoPresenca(alunoId, aluno = null) {
        fetch(`php/get_historico_presenca.php?aluno_id=${encodeURIComponent(alunoId)}`)
            .then(r => r.json())
            .then(data => {
                const container = document.getElementById('historico-container');
                if (!container) return;

                if (data && Array.isArray(data.checkins) && data.checkins.length > 0) {
                    container.innerHTML = `
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
                                ${data.checkins.map(c => `
                                    <tr class="historico-row" data-checkin-id="${c.id}" data-checkin-data="${c.data}" data-checkin-aula="${c.nome_aula}" data-checkin-hora="${c.hora}" data-checkin-status="${c.status}">
                                        <td>${c.data}</td>
                                        <td>${c.nome_aula}</td>
                                        <td>${c.hora}</td>
                                        <td>
                                            <span class="status-badge status-${c.status}">
                                                <i class="fas ${c.status === 'aprovado' ? 'fa-check-circle' : c.status === 'reprovado' ? 'fa-times-circle' : 'fa-clock'}"></i>
                                                ${c.status}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <div class="historico-actions">
                            <button type="button" class="btn btn-sm btn-danger" id="btn-excluir-aluno">
                                <i class="fas fa-trash"></i> Excluir Aluno
                            </button>
                        </div>
                    `;
                } else {
                    container.innerHTML = `
                        <div class="search-no-results">Nenhum histórico de presença encontrado</div>
                        <div class="historico-actions">
                            <button type="button" class="btn btn-sm btn-danger" id="btn-excluir-aluno">
                                <i class="fas fa-trash"></i> Excluir Aluno
                            </button>
                        </div>
                    `;
                }
            })
            .catch(err => {
                console.error("Erro ao carregar histórico:", err);
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
            
            // Adicionar event listeners
            setTimeout(() => {
                // Event listener para o botão de excluir aluno
                const btnExcluir = document.getElementById('btn-excluir-aluno');
                if (btnExcluir && aluno) {
                    // Remover event listener anterior se existir
                    btnExcluir.replaceWith(btnExcluir.cloneNode(true));
                    const newBtnExcluir = document.getElementById('btn-excluir-aluno');
                    
                    newBtnExcluir.addEventListener('click', () => {
                        if (!confirm(`Tem certeza que deseja excluir o aluno "${aluno.nome}"?\n\nEsta ação não pode ser desfeita e removerá:\n- Todos os horários do aluno\n- Todo o histórico de presença\n- Todos os check-ins`)) {
                            return;
                        }
                        
                        if (!confirm('ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\nConfirma a exclusão do aluno?')) {
                            return;
                        }
                        
                        // Mostrar loading no botão
                        const originalText = newBtnExcluir.innerHTML;
                        newBtnExcluir.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Excluindo...';
                        newBtnExcluir.disabled = true;
                        
                        fetch('php/excluir_aluno.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: `aluno_id=${encodeURIComponent(aluno.id)}`
                        })
                        .then(r => r.json())
                        .then(resp => {
                            if (resp && resp.ok) {
                                // Limpar área de alunos e mostrar mensagem
                                const alunosContainer = document.getElementById('alunos_container');
                                alunosContainer.innerHTML = `
                                    <div class="search-no-results">
                                        <i class="fas fa-check-circle" style="color: #28a745; font-size: 2rem; margin-bottom: 1rem;"></i>
                                        <h4>Aluno excluído com sucesso!</h4>
                                        <p>O aluno "${aluno.nome}" foi removido do sistema.</p>
                                        <button type="button" class="btn btn-sm" onclick="location.reload()">
                                            <i class="fas fa-refresh"></i> Atualizar Página
                                        </button>
                                    </div>
                                `;
                            } else {
                                alert('Erro ao excluir aluno: ' + (resp.message || 'Erro desconhecido'));
                                newBtnExcluir.innerHTML = originalText;
                                newBtnExcluir.disabled = false;
                            }
                        })
                        .catch(err => {
                            console.error('Erro:', err);
                            alert('Erro ao excluir aluno. Tente novamente.');
                            newBtnExcluir.innerHTML = originalText;
                            newBtnExcluir.disabled = false;
                        });
                    });
                }

                // Event listeners para duplo clique nas linhas da tabela
                const historicoRows = document.querySelectorAll('.historico-row');
                historicoRows.forEach(row => {
                    // Remover event listener anterior se existir
                    row.replaceWith(row.cloneNode(true));
                });
                
                // Re-buscar as linhas após o replaceWith
                const newHistoricoRows = document.querySelectorAll('.historico-row');
                newHistoricoRows.forEach(row => {
                    row.addEventListener('dblclick', () => {
                        const checkinId = row.getAttribute('data-checkin-id');
                        const checkinData = row.getAttribute('data-checkin-data');
                        const checkinAula = row.getAttribute('data-checkin-aula');
                        const checkinHora = row.getAttribute('data-checkin-hora');
                        const checkinStatus = row.getAttribute('data-checkin-status');
                        
                        abrirModalCheckin({
                            id: checkinId,
                            data: checkinData,
                            aula: checkinAula,
                            hora: checkinHora,
                            status: checkinStatus
                        });
                    });
                });
            }, 100);
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
                `;

                const btnExibir = document.getElementById('btn-exibir-horarios');
                const btnAdicionarHorarios = document.getElementById('btn-adicionar-horarios');
                
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
        statusSelect.value = checkin.status;
        
        // Armazenar dados do check-in para uso posterior
        modal.dataset.checkinId = checkin.id;
        modal.dataset.checkinData = checkin.data;
        modal.dataset.checkinAula = checkin.aula;
        modal.dataset.checkinHora = checkin.hora;
        modal.dataset.checkinStatus = checkin.status;
        
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

    // Tab switching
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('tab-btn')) {
            console.log('Tab clicked:', e.target.getAttribute('data-tab'));
            const tabName = e.target.getAttribute('data-tab');
            
            // Remove active from all tabs and content
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active to clicked tab and corresponding content
            e.target.classList.add('active');
            const targetContent = document.getElementById('tab-' + tabName);
            if (targetContent) {
                targetContent.classList.add('active');
                console.log('Tab activated:', tabName);
            } else {
                console.error('Tab content not found:', 'tab-' + tabName);
            }
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
});