<?php
session_start();
include 'db.php';

if(!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'aluno') {
    die(json_encode(['erro'=>'Acesso negado']));
}

$aluno_id = $_SESSION['user_id'];

// Pegar dados do aluno
$res = $conn->query("SELECT nome, aulas_faltando FROM usuarios WHERE id=$aluno_id");
$aluno = $res->fetch_assoc();

// Horários do dia atual
$diasSemana = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
$hoje_num = date('w'); // 0 = domingo, 1 = segunda, ...
$hoje_nome = $diasSemana[$hoje_num];

$horarios_res = $conn->query("SELECT * FROM horarios WHERE ativa=1 AND dia_semana='$hoje_nome' ORDER BY hora ASC");
$horarios = [];
while($row = $horarios_res->fetch_assoc()){
    $horarios[] = $row;
}

// Check-ins do aluno
$checkins_res = $conn->query("SELECT c.id, h.nome_aula, h.dia_semana, h.hora, c.data, c.status, c.horario_id
                              FROM checkins c
                              JOIN horarios h ON c.horario_id = h.id 
                              WHERE c.aluno_id=$aluno_id 
                              ORDER BY c.data DESC");
$checkins = [];
$checkins_aprovados = 0;
while($row = $checkins_res->fetch_assoc()){
    $checkins[] = $row;
    if($row['status'] === 'aprovado') {
        $checkins_aprovados++;
    }
}

// Atualizar aulas faltando considerando check-ins aprovados
$aluno['aulas_faltando'] = max(0, $aluno['aulas_faltando'] - $checkins_aprovados);

// Retornar JSON
echo json_encode([
    'aluno' => $aluno,
    'horarios' => $horarios,
    'checkins' => $checkins
]);
?>