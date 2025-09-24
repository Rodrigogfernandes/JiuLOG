<?php
session_start();
include 'db.php';

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'professor') {
    header('Content-Type: application/json');
    http_response_code(403);
    echo json_encode(['ok' => false, 'erro' => 'Acesso negado']);
    exit;
}

$alunoId   = isset($_POST['aluno_id']) ? intval($_POST['aluno_id']) : 0;
$horarioId = isset($_POST['horario_id']) ? intval($_POST['horario_id']) : 0;

if ($alunoId <= 0 || $horarioId <= 0) {
    header('Location: ../professor.html?erro=remover_horario_param');
    exit;
}

// Remove o vínculo (checkins) entre aluno e horário
$ok = $conn->query("DELETE FROM checkins WHERE aluno_id=$alunoId AND horario_id=$horarioId");

header('Content-Type: application/json');
echo json_encode(['ok' => (bool)$ok, 'aluno_id' => $alunoId, 'horario_id' => $horarioId]);
exit;
?>


