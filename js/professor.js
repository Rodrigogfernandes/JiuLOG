window.addEventListener('load', () => {
    fetch('php/get_professor.php')
        .then(res => res.json())
        .then(data => {
            const professorNome = document.getElementById('professor_nome');
            const horariosContainer = document.getElementById('horarios_container');
            const checkinsContainer = document.getElementById('checkins_container');
            const alunosContainer = document.getElementById('alunos_container');

            professorNome.textContent = `Bem-vindo, ${data.user.nome}`;

            // -----------------------------
            // HORÁRIOS EXISTENTES
            // -----------------------------
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

            // -----------------------------
            // CHECK-INS PENDENTES
            // -----------------------------
            checkinsContainer.innerHTML = "";
            data.checkins.forEach(c => {
                const div = document.createElement('div');
                div.classList.add('checkin');
                div.innerHTML = `
                    <strong>${c.aluno_nome}</strong> → ${c.nome_aula} <br>
                    Data: ${c.data} | Hora: ${c.hora}
                    <form method="POST" action="php/aprovar.php" style="display:inline;">
                        <input type="hidden" name="checkin_id" value="${c.id}">
                        <button name="acao" value="aprovar">Aprovar</button>
                        <button name="acao" value="reprovar">Reprovar</button>
                    </form>
                `;
                checkinsContainer.appendChild(div);
            });

            // -----------------------------
            // LISTAR ALUNOS PARA ALTERAR FAIXA
            // -----------------------------
            if (data.alunos) {
                alunosContainer.innerHTML = "";
                data.alunos.forEach(a => {
                    const div = document.createElement('div');
                    div.classList.add('aluno');
                    div.innerHTML = `
                        <strong>${a.nome}</strong><br>
                        Faixa atual: ${a.faixa} | Graus: ${a.graus}
                        <form method="POST" action="php/alterar_faixa.php" style="margin-top:5px;">
                            <input type="hidden" name="aluno_id" value="${a.id}">
                            <label>Faixa:
                                <select name="faixa">
                                    <option ${a.faixa === 'Branca' ? 'selected' : ''}>Branca</option>
                                    <option ${a.faixa === 'Azul' ? 'selected' : ''}>Azul</option>
                                    <option ${a.faixa === 'Roxa' ? 'selected' : ''}>Roxa</option>
                                    <option ${a.faixa === 'Marrom' ? 'selected' : ''}>Marrom</option>
                                    <option ${a.faixa === 'Preta' ? 'selected' : ''}>Preta</option>
                                </select>
                            </label>
                            <label>Graus:
                                <input type="number" name="graus" min="0" max="4" value="${a.graus}">
                            </label>
                            <button type="submit">Atualizar</button>
                        </form>
                    `;
                    alunosContainer.appendChild(div);
                });
            }
        })
        .catch(err => {
            console.error("Erro ao carregar dados do professor:", err);
        });
});