<?php
session_start();
include 'db.php';

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'professor') {
    die(json_encode(['ok' => false, 'message' => 'Acesso negado!']));
}

$checkin_id = $_POST['checkin_id'] ?? null;
$status = $_POST['status'] ?? null;

if (!$checkin_id || !$status) {
    die(json_encode(['ok' => false, 'message' => 'Dados incompletos!']));
}

// Validar status
$statuses_validos = ['pendente', 'aprovado', 'reprovado'];
if (!in_array($status, $statuses_validos)) {
    die(json_encode(['ok' => false, 'message' => 'Status inválido!']));
}

// Verificar se o check-in existe
$check_checkin = $conn->query("SELECT id FROM checkins WHERE id = $checkin_id");
if (!$check_checkin || $check_checkin->num_rows === 0) {
    die(json_encode(['ok' => false, 'message' => 'Check-in não encontrado!']));
}

try {
    // Atualizar status do check-in
    $sql = "UPDATE checkins SET status = '$status' WHERE id = $checkin_id";
    
    if ($conn->query($sql)) {
        header('Content-Type: application/json');
        echo json_encode([
            'ok' => true, 
            'message' => 'Status atualizado com sucesso!',
            'status' => $status
        ]);
    } else {
        throw new Exception('Erro ao atualizar status: ' . $conn->error);
    }
    
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode([
        'ok' => false, 
        'message' => $e->getMessage()
    ]);
}
?>
