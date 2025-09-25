<?php
session_start();
include 'db.php';

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'aluno') {
    die(json_encode(['erro' => 'Acesso negado']));
}

$aluno_id = $_SESSION['user_id'];

// Dias da semana
$diasSemana = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
$hoje_num = date('w'); // 0 = domingo, 1 = segunda, ...
$hoje_nome = $diasSemana[$hoje_num];

// Garantir que o contador nunca seja negativo
$conn->query("UPDATE usuarios 
              SET aulas_faltando = 55 
              WHERE id=$aluno_id AND aulas_faltando <= 0");

// Dados do aluno
$res = $conn->query("SELECT nome, aulas_faltando, faixa, graus FROM usuarios WHERE id=$aluno_id");
$aluno = $res->fetch_assoc();

// Todos os horários da semana
$horarios_res = $conn->query("SELECT * FROM horarios 
                              ORDER BY FIELD(dia_semana,'Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'), hora ASC");
$horarios = [];
while ($row = $horarios_res->fetch_assoc()) {
    $horarios[] = $row;
}

// Check-ins do aluno (incluindo check-ins livres)
$checkins_res = $conn->query("SELECT c.id, 
                                     COALESCE(h.nome_aula, 'Check-in Livre') as nome_aula,
                                     COALESCE(h.dia_semana, '') as dia_semana, 
                                     COALESCE(h.hora, '') as hora, 
                                     c.data_checkin as data, 
                                     c.status, 
                                     c.horario_id
                              FROM checkins c
                              LEFT JOIN horarios h ON c.horario_id = h.id 
                              WHERE c.aluno_id=$aluno_id 
                              ORDER BY c.data_checkin DESC");
$checkins = [];
while ($row = $checkins_res->fetch_assoc()) {
    $checkins[] = $row;
}

// Retornar JSON
echo json_encode([
    'aluno' => $aluno,
    'horarios' => $horarios,
    'checkins' => $checkins
]);
?>