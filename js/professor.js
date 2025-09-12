window.addEventListener('load', () => {
    fetch('php/get_professor.php')
    .then(res => res.json())
    .then(data => {
        const professorNome = document.getElementById('professor_nome');
        const horariosContainer = document.getElementById('horarios_container');
        const checkinsContainer = document.getElementById('checkins_container');

        professorNome.textContent = `Bem-vindo, ${data.user.nome}`;

        // Horários existentes
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

        // Check-ins pendentes
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
    });
});