<?php
session_start();
include __DIR__ . '/../config/db.php';

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'aluno') {
    // Se for requisição AJAX, responder JSON com erro
    if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH'] === 'XMLHttpRequest') {
        http_response_code(403);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Acesso negado']);
        exit;
    }
    die("Acesso negado!");
}

$aluno_id = $_SESSION['user_id'];
$data = $_POST['data'];
$force = isset($_POST['force']) && ($_POST['force'] === '1' || $_POST['force'] === 1);

// Sanitização básica
$aluno_id = intval($aluno_id);
$data = $conn->real_escape_string($data);

// Se não for forçado, verificar duplicidade por data
if (!$force) {
    $check = $conn->query("SELECT * FROM checkins WHERE aluno_id=$aluno_id AND horario_id IS NULL AND DATE(data_checkin) = DATE('$data')");
    if ($check && $check->num_rows > 0) {
        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH'] === 'XMLHttpRequest') {
            http_response_code(400);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['error' => 'Você já fez check-in livre hoje!']);
            exit;
        }
        die("Você já fez check-in livre hoje!");
    }
}

// Formatar data BR para retorno
$brDate = $data;
try {
    $dt = DateTime::createFromFormat('Y-m-d', $data);
    if ($dt) $brDate = $dt->format('d/m/Y');
    else $brDate = date('d/m/Y', strtotime($data));
} catch (Exception $e) { $brDate = $data; }

// Inserir check-in livre como pendente
$ok = $conn->query("INSERT INTO checkins (aluno_id, horario_id, data_checkin, status) VALUES ($aluno_id, NULL, '$data', 'pendente')");

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
header("Location: ../../public/dashboard/dashboard_aluno.html");
exit;


