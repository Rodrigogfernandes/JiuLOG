<?php
session_start();
include 'db.php';

// Apenas professor pode consultar
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'professor') {
    die(json_encode(['erro' => 'Acesso negado']));
}

$alunoId = isset($_GET['aluno_id']) ? intval($_GET['aluno_id']) : 0;

if ($alunoId <= 0) {
    die(json_encode(['erro' => 'Aluno inválido']));
}

// Consideramos que o aluno tem horário atribuído se houver qualquer registro de checkin para ele
$sql = "SELECT COUNT(DISTINCT horario_id) AS num_horarios FROM checkins WHERE aluno_id = $alunoId";
$res = $conn->query($sql);
$row = $res ? $res->fetch_assoc() : ['num_horarios' => 0];

// Listar horários distintos do aluno (com nome/dia/hora)
$lista = [];
$sqlList = "SELECT DISTINCT h.id, h.nome_aula, h.dia_semana, h.hora
            FROM checkins c
            JOIN horarios h ON h.id = c.horario_id
            WHERE c.aluno_id = $alunoId
            ORDER BY FIELD(h.dia_semana,'Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'), h.hora";
$resList = $conn->query($sqlList);
if ($resList) {
    while ($r = $resList->fetch_assoc()) {
        $lista[] = $r;
    }
}

header('Content-Type: application/json');
echo json_encode([
    'aluno_id' => $alunoId,
    'num_horarios' => intval($row['num_horarios'] ?? 0),
    'horarios' => $lista
]);
?>


