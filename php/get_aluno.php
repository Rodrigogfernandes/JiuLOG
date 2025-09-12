<?php
session_start();
include 'db.php';

if($_SESSION['tipo'] != 'aluno') die(json_encode(['erro'=>'Acesso negado']));

$aluno_id = $_SESSION['user_id'];

// Pegar nome e aulas_faltando
$res = $conn->query("SELECT nome, aulas_faltando FROM usuarios WHERE id=$aluno_id");
$aluno = $res->fetch_assoc();

// Pegar horários disponíveis
$horarios_res = $conn->query("SELECT * FROM horarios WHERE ativa=1 ORDER BY FIELD(dia_semana,'Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'), hora ASC");
$horarios = [];
while($row = $horarios_res->fetch_assoc()){
    $horarios[] = $row;
}

// Pegar check-ins feitos
$checkins_res = $conn->query("SELECT c.id, h.nome_aula, h.dia_semana, h.hora, c.data, c.status 
                              FROM checkins c 
                              JOIN horarios h ON c.horario_id = h.id 
                              WHERE c.aluno_id=$aluno_id 
                              ORDER BY c.data DESC");
$checkins = [];
while($row = $checkins_res->fetch_assoc()){
    $checkins[] = $row;
}

// Retornar JSON
echo json_encode([
    'aluno' => $aluno,
    'horarios' => $horarios,
    'checkins' => $checkins
]);
?>