<?php
session_start();
include __DIR__ . '/../config/db.php';

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'professor') {
    header('Content-Type: application/json');
    http_response_code(403);
    echo json_encode(['ok' => false, 'erro' => 'Acesso negado']);
    exit;
}

$horarioId = isset($_POST['horario_id']) ? intval($_POST['horario_id']) : 0;
$nomeAula  = trim($_POST['nome_aula'] ?? '');
$diaSemana = trim($_POST['dia_semana'] ?? '');
$hora      = trim($_POST['hora'] ?? '');

if ($horarioId <= 0 || $nomeAula === '' || $diaSemana === '' || $hora === '') {
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'erro' => 'Campos inválidos']);
    exit;
}

$nomeAulaEsc = $conn->real_escape_string($nomeAula);
$diaEsc      = $conn->real_escape_string($diaSemana);
$horaEsc     = $conn->real_escape_string($hora);

$ok = $conn->query("UPDATE horarios SET nome_aula='$nomeAulaEsc', dia_semana='$diaEsc', hora='$horaEsc' WHERE id=$horarioId");

header('Content-Type: application/json');
echo json_encode(['ok' => (bool)$ok, 'horario_id' => $horarioId, 'nome_aula' => $nomeAula, 'dia_semana' => $diaSemana, 'hora' => $hora]);
exit;
?>


