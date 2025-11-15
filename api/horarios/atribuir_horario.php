<?php
session_start();
include __DIR__ . '/../config/db.php';

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'professor') {
    header('Content-Type: application/json');
    http_response_code(403);
    echo json_encode(['ok' => false, 'erro' => 'Acesso negado']);
    exit;
}

// Campos do formulário
$alunoId   = isset($_POST['aluno_id']) ? intval($_POST['aluno_id']) : 0;
$nomeAula  = trim($_POST['nome_aula'] ?? '');
$diaSemana = trim($_POST['dia_semana'] ?? '');
$hora      = trim($_POST['hora'] ?? '');
$profId    = intval($_SESSION['user_id']);

if ($alunoId <= 0 || $nomeAula === '' || $diaSemana === '' || $hora === '') {
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'erro' => 'Campos inválidos']);
    exit;
}

// 1) Garantir que o horário exista (cria se não existir)
$nomeAulaEsc = $conn->real_escape_string($nomeAula);
$diaEsc      = $conn->real_escape_string($diaSemana);
$horaEsc     = $conn->real_escape_string($hora);

$sqlBuscaHorario = "SELECT id FROM horarios WHERE nome_aula='$nomeAulaEsc' AND dia_semana='$diaEsc' AND hora='$horaEsc' LIMIT 1";
$resH = $conn->query($sqlBuscaHorario);

if ($resH && $resH->num_rows > 0) {
    $horario = $resH->fetch_assoc();
    $horarioId = intval($horario['id']);
} else {
    $sqlCriaHorario = "INSERT INTO horarios (nome_aula, dia_semana, hora, professor_id) VALUES ('$nomeAulaEsc', '$diaEsc', '$horaEsc', $profId)";
    if (!$conn->query($sqlCriaHorario)) {
        header('Content-Type: application/json');
        echo json_encode(['ok' => false, 'erro' => 'Erro ao criar horário']);
        exit;
    }
    $horarioId = intval($conn->insert_id);
}

// 2) Vincular aluno ao horário via checkins (como vínculo/inscrição)
$sqlExisteVinculo = "SELECT id FROM checkins WHERE aluno_id=$alunoId AND horario_id=$horarioId LIMIT 1";
$resV = $conn->query($sqlExisteVinculo);
if (!$resV || $resV->num_rows === 0) {
    // usa a data atual como data_checkin para representar o vínculo
    $sqlVincula = "INSERT INTO checkins (aluno_id, horario_id, data_checkin, status) VALUES ($alunoId, $horarioId, CURDATE(), 'aprovado')";
    $conn->query($sqlVincula);
}

header('Content-Type: application/json');
echo json_encode(['ok' => true, 'aluno_id' => $alunoId, 'horario_id' => $horarioId, 'nome_aula' => $nomeAula, 'dia_semana' => $diaSemana, 'hora' => $hora]);
exit;
?>


