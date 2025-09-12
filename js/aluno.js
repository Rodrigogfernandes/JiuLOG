window.addEventListener('load', () => {
    fetch('php/get_aluno.php')
    .then(response => response.json())
    .then(data => {
        const alunoNome = document.getElementById('aluno_nome');
        const aulasFaltando = document.getElementById('aulas_faltando');
        const horariosContainer = document.getElementById('horarios_container');
        const checkinsContainer = document.getElementById('checkins_container');

        // Definir nome e aulas faltando
        alunoNome.textContent = `Bem-vindo, ${data.aluno.nome}`;
        aulasFaltando.textContent = data.aluno.aulas_faltando;

        // Listar horários disponíveis
        data.horarios.forEach(h => {
            const div = document.createElement('div');
            div.classList.add('horario');
            div.innerHTML = `
                <strong>${h.nome_aula}</strong><br>
                Dia: ${h.dia_semana} | Horário: ${h.hora}
                <form method="POST" action="php/checkin.php">
                    <input type="hidden" name="horario_id" value="${h.id}">
                    <input type="date" name="data" required
                           min="${new Date().toISOString().split('T')[0]}"
                           max="${new Date(Date.now()+86400000).toISOString().split('T')[0]}">
                    <button type="submit">Fazer Check-in</button>
                </form>
            `;
            horariosContainer.appendChild(div);
        });

        // Listar check-ins
        data.checkins.forEach(c => {
            const div = document.createElement('div');
            div.classList.add('checkin');
            div.innerHTML = `
                <strong>${c.nome_aula}</strong><br>
                Dia: ${c.dia_semana} | Horário: ${c.hora} | Data: ${c.data} | Status: ${c.status}
            `;
            checkinsContainer.appendChild(div);
        });
    });
});