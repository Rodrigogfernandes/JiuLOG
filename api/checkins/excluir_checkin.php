<?php
session_start();
include __DIR__ . '/../config/db.php';

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'professor') {
    die(json_encode(['ok' => false, 'message' => 'Acesso negado!']));
}

$checkin_id = $_POST['checkin_id'] ?? null;

if (!$checkin_id) {
    die(json_encode(['ok' => false, 'message' => 'ID do check-in não fornecido!']));
}

// Verificar se o check-in existe
$check_checkin = $conn->query("SELECT id FROM checkins WHERE id = $checkin_id");
if (!$check_checkin || $check_checkin->num_rows === 0) {
    die(json_encode(['ok' => false, 'message' => 'Check-in não encontrado!']));
}

try {
    // Excluir check-in
    $sql = "DELETE FROM checkins WHERE id = $checkin_id";
    
    if ($conn->query($sql)) {
        header('Content-Type: application/json');
        echo json_encode([
            'ok' => true, 
            'message' => 'Check-in excluído com sucesso!'
        ]);
    } else {
        throw new Exception('Erro ao excluir check-in: ' . $conn->error);
    }
    
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode([
        'ok' => false, 
        'message' => $e->getMessage()
    ]);
}
?>
