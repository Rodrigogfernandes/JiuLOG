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

        // Agrupar horários por dia da semana
        const horariosPorDia = {};
        data.horarios.forEach(h => {
            if (!horariosPorDia[h.dia_semana]) {
                horariosPorDia[h.dia_semana] = [];
            }
            horariosPorDia[h.dia_semana].push(h);
        });

        // Ordem dos dias da semana
        const ordemDias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
        
        // Exibir horários organizados por dia
        ordemDias.forEach(dia => {
            if (horariosPorDia[dia]) {
                // Título do dia
                const diaDiv = document.createElement('div');
                diaDiv.classList.add('dia-semana');
                diaDiv.innerHTML = `<h4><i class="fas fa-calendar-day"></i> ${dia}</h4>`;
                horariosContainer.appendChild(diaDiv);

                // Horários do dia
                horariosPorDia[dia].forEach(h => {
                    // Checa se já existe check-in para este horário hoje
                    const checkinHoje = data.checkins.find(c => c.horario_id == h.id && c.data_checkin == dataHoje);

                    const div = document.createElement('div');
                    div.classList.add('horario');

                    if(checkinHoje){
                        // Mostra status do check-in
                        let statusClass = '';
                        let statusText = '';
                        let statusIcon = '';
                        
                        switch(checkinHoje.status) {
                            case 'aprovado':
                                statusClass = 'checkin-aprovado';
                                statusText = 'Check-in aprovado!';
                                statusIcon = 'fas fa-check-circle';
                                break;
                            case 'reprovado':
                                statusClass = 'checkin-reprovado';
                                statusText = 'Check-in reprovado';
                                statusIcon = 'fas fa-times-circle';
                                break;
                            case 'pendente':
                            default:
                                statusClass = 'checkin-pendente';
                                statusText = 'Check-in pendente de aprovação';
                                statusIcon = 'fas fa-clock';
                                break;
                        }
                        
                        div.classList.add(statusClass);
                        div.innerHTML = `
                            <strong>${h.nome_aula}</strong> - ${h.hora}<br>
                            <em><i class="${statusIcon}"></i> ${statusText}</em>
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
            }
        });

        // Adicionar opção de check-in livre (sem horário específico)
        const checkinLivreDiv = document.createElement('div');
        checkinLivreDiv.classList.add('horario', 'checkin-livre');
        checkinLivreDiv.innerHTML = `
            <strong><i class="fas fa-plus-circle"></i> Check-in Livre</strong><br>
            <em>Fazer check-in sem horário específico</em><br>
            <form method="POST" action="php/checkin_livre.php">
                <input type="hidden" name="data" value="${dataHoje}">
                <button type="submit" class="btn-checkin-livre">
                    <i class="fas fa-sign-in-alt"></i> Fazer Check-in
                </button>
            </form>
        `;
        horariosContainer.appendChild(checkinLivreDiv);

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