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
                        <h5 style="margin: 1rem 0 0.5rem 0;"><i class="fas fa-plus-circle"></i> Adicionar Novo Horário</h5>
                        <form method="POST" action="php/atribuir_horario.php">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Nome da aula</label>
                                    <input type="text" name="nome_aula" placeholder="Ex: Aula das 7:00" required>
                                </div>
                                <div class="form-group">
                                    <label>Dia da semana</label>
                                    <select name="dia_semana" required>
                                        <option value="">Escolha...</option>
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
                            <button type="submit" class="btn btn-sm"><i class="fas fa-save"></i> Salvar Horário</button>
                        </form>
                    </div>
                </div>
                <form method="POST" action="php/alterar_faixa.php" class="aluno-form">
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
                const temHorario = (info && info.num_horarios && Number(info.num_horarios) > 0);
                const label = temHorario ? 'Alterar Horário' : 'Adicionar Horário';
                const icon = temHorario ? 'fa-pen-to-square' : 'fa-plus';
                actions.innerHTML = `
                    <button type="button" class="btn btn-sm" id="btn-exibir-horarios">
                        <i class="fas fa-calendar"></i> Exibir Horários
                    </button>
                    <button type="button" class="btn btn-sm" id="btn-horario-aluno">
                        <i class="fas ${icon}"></i> ${label}
                    </button>
                `;

                const btn = document.getElementById('btn-horario-aluno');
                const btnExibir = document.getElementById('btn-exibir-horarios');
                if (btn) {
                    btn.addEventListener('click', () => {
                        const area = document.getElementById('aluno-horarios');
                        if (area) {
                            area.style.display = 'block';
                        }
                    });
                }
                if (btnExibir) {
                    btnExibir.addEventListener('click', () => {
                        const area = document.getElementById('aluno-horarios');
                        if (area) {
                            const show = area.style.display === 'none' || area.style.display === '';
                            area.style.display = show ? 'block' : 'none';
                        }
                        // Preencher lista de horários existentes
                        const lista = document.getElementById('aluno-horarios-lista');
                        if (lista) {
                            if (info && Array.isArray(info.horarios) && info.horarios.length) {
                                lista.innerHTML = info.horarios.map(h => `
                                    <div class=\"item-list\" style=\"margin-bottom:.5rem\"> 
                                        <div class=\"item\" style=\"padding:.5rem 0\"><strong>${h.nome_aula}</strong> — ${h.dia_semana} às ${h.hora}</div>
                                    </div>
                                `).join('');
                            } else {
                                lista.innerHTML = '<div class="search-no-results">Nenhum horário vinculado a este aluno</div>';
                            }
                        }
                    });
                }
            })
            .catch(() => {
                // Se falhar, ainda mostra opção de adicionar horário
                const actions = document.getElementById('aluno-actions');
                if (actions) {
                    actions.innerHTML = `
                        <button type="button" class="btn btn-sm" id="btn-exibir-horarios"><i class="fas fa-calendar"></i> Exibir Horários</button>
                        <button type="button" class="btn btn-sm" id="btn-horario-aluno"><i class="fas fa-plus"></i> Adicionar Horário</button>
                    `;
                    const btn = document.getElementById('btn-horario-aluno');
                    const btnExibir = document.getElementById('btn-exibir-horarios');
                    if (btn) {
                        btn.addEventListener('click', () => {
                            const area = document.getElementById('aluno-horarios');
                            if (area) {
                                area.style.display = 'block';
                            }
                        });
                    }
                    if (btnExibir) {
                        btnExibir.addEventListener('click', () => {
                            const area = document.getElementById('aluno-horarios');
                            if (area) {
                                const show = area.style.display === 'none' || area.style.display === '';
                                area.style.display = show ? 'block' : 'none';
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
});