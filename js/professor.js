window.addEventListener('load', () => {
    fetch('php/get_professor.php')
        .then(res => res.json())
        .then(data => {
            const professorNome = document.getElementById('professor_nome');
            const horariosContainer = document.getElementById('horarios_container');
            const checkinsContainer = document.getElementById('checkins_container');
            const alunosContainer = document.getElementById('alunos_container');

            if (professorNome && data.user.nome) {
                professorNome.textContent = data.user.nome;
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
                            <button name=\"acao\" value=\"aprovar\">Aprovar</button>\n\
                            <button name=\"acao\" value=\"reprovar\">Reprovar</button>\n\
                        </form>
                    `;
                    checkinsContainer.appendChild(div);
                });
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

    // Função para exibir apenas o aluno selecionado
    function exibirAlunoSelecionado(aluno) {
        const alunosContainer = document.getElementById('alunos_container');
        
        alunosContainer.innerHTML = `
            <div class="aluno-selecionado">
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
                                        <label>Nome da aula</label>
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
                <form class="aluno-form" id="form-atualiza-aluno">
                    <input type="hidden" name="aluno_id" value="${aluno.id}">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Faixa:</label>
                            <select name="faixa">
                                <option value="Branca" ${aluno.faixa === 'Branca' ? 'selected' : ''}>Branca</option>
                                <option value="Azul" ${aluno.faixa === 'Azul' ? 'selected' : ''}>Azul</option>
                                <option value="Roxa" ${aluno.faixa === 'Roxa' ? 'selected' : ''}>Roxa</option>
                                <option value="Marrom" ${aluno.faixa === 'Marrom' ? 'selected' : ''}>Marrom</option>
                                <option value="Preta" ${aluno.faixa === 'Preta' ? 'selected' : ''}>Preta</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Graus:</label>
                            <input type="number" name="graus" min="0" max="4" value="${aluno.graus}">
                        </div>
                    </div>
                    <button type="submit" class="btn btn-sm">
                        <i class="fas fa-save"></i> Atualizar Aluno
                    </button>
                </form>
            </div>
        `;

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
                                                <th>Nome da Aula</th>
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


    // Delegar envio do formulário de atualização do aluno via fetch
    document.addEventListener('submit', function(e) {
        const form = e.target;
        if (form && form.id === 'form-atualiza-aluno') {
            e.preventDefault();
            const data = new URLSearchParams(new FormData(form));
            fetch('php/alterar_faixa.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: data.toString()
            })
            .then(r => r.json())
            .then(resp => {
                if (resp && resp.ok) {
                    const stats = document.querySelector('.aluno-stats');
                    if (stats) {
                        stats.innerHTML = `
                            <span class="badge badge-info">${resp.faixa}</span>
                            <span class="badge badge-warning">${resp.graus} graus</span>
                            <span class="badge badge-danger">${document.querySelector('.aluno-stats .badge-danger')?.textContent || ''}</span>
                        `;
                    }
                }
            })
            .catch(() => {});
        }
        
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
                                                <th>Nome da Aula</th>
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
                                                <th>Nome da Aula</th>
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
});