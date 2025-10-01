<?php
session_start();
include 'db.php';

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'aluno') {
    die("Acesso negado!");
}

$aluno_id = $_SESSION['user_id'];
$horario_id = $_POST['horario_id'];
$data = $_POST['data'];

// sanitização básica
$aluno_id = intval($aluno_id);
$horario_id = intval($horario_id);
$data = $conn->real_escape_string($data);

// Verifica se já existe check-in neste horário e data (comparando a data, ignorando hora)
$check = $conn->query("SELECT * FROM checkins WHERE aluno_id=$aluno_id AND horario_id=$horario_id AND DATE(data_checkin) = DATE('$data')");
if ($check && $check->num_rows > 0) {
    if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH'] === 'XMLHttpRequest') {
        http_response_code(400);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Você já fez check-in para este horário hoje!']);
        exit;
    }
    die("Você já fez check-in para este horário hoje!");
}

// Insere check-in como "pendente"
// Insere check-in como "pendente"
$brDate = $data;
try {
    $dt = DateTime::createFromFormat('Y-m-d', $data);
    if ($dt) $brDate = $dt->format('d/m/Y');
    else $brDate = date('d/m/Y', strtotime($data));
} catch (Exception $e) { $brDate = $data; }

$ok = $conn->query("INSERT INTO checkins (aluno_id, horario_id, data_checkin, status) VALUES ($aluno_id, $horario_id, '$data', 'pendente')");

// Se for requisição AJAX, responder JSON
if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH'] === 'XMLHttpRequest') {
    if ($ok) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => true, 'data' => $brDate]);
        exit;
    } else {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Erro ao inserir check-in.']);
        exit;
    }
}

// comportamento legacy: redirecionar para a dashboard
header("Location: ../dashboard_aluno.html");
exit;
?>