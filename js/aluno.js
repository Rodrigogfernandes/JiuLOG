window.addEventListener('load', () => {
    fetch('php/get_aluno.php')
    .then(response => response.json())
    .then(data => {
        const alunoNome = document.getElementById('aluno_nome');
        const aulasFaltando = document.getElementById('aulas_faltando');
        const horariosContainer = document.getElementById('horarios_container');
        const checkinsContainer = document.getElementById('checkins_container');

        // Nome, faixa e graus
        alunoNome.textContent = `Bem-vindo, ${data.aluno.nome} - Faixa ${data.aluno.faixa} ${data.aluno.graus} grau`;

        // Aulas faltando
        aulasFaltando.textContent = `Faltam ${data.aluno.aulas_faltando} aulas para a próxima graduação`;

        // Limpar containers
        horariosContainer.innerHTML = '';
        checkinsContainer.innerHTML = '';

        const hoje = new Date();
        const dataHoje = hoje.toISOString().split('T')[0];

        // Horários do dia atual
        data.horarios.forEach(h => {
            // Checa se já existe check-in para este horário hoje
            const checkinHoje = data.checkins.find(c => c.horario_id == h.id && c.data == dataHoje);

            const div = document.createElement('div');
            div.classList.add('horario');

            if(checkinHoje){
                div.classList.add('checkin-feito'); 
                div.innerHTML = `
                    <strong>${h.nome_aula}</strong> - ${h.hora}<br>
                    <em>Você já fez check-in nesta aula hoje.</em>
                `;
            } else {
                div.innerHTML = `
                    <strong>${h.nome_aula}</strong> - ${h.hora}<br>
                    <form method="POST" action="php/checkin.php">
                        <input type="hidden" name="horario_id" value="${h.id}">
                        <input type="date" name="data" value="${dataHoje}" readonly>
                        <button type="submit">Fazer Check-in</button>
                    </form>
                `;
            }

            horariosContainer.appendChild(div);
        });

        // Lista de check-ins
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