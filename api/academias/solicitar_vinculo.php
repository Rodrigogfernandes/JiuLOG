<?php
session_start();
include __DIR__ . '/../config/db.php';

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'aluno') {
    die(json_encode(['erro' => 'Acesso negado']));
}

$aluno_id = $_SESSION['user_id'];
$academia_id = isset($_POST['academia_id']) ? intval($_POST['academia_id']) : 0;
if ($academia_id <= 0) {
    die(json_encode(['erro' => 'Academia inválida']));
}

// cria ou reativa pedido
$conn->query("INSERT INTO academia_memberships (aluno_id, academia_id, status) VALUES ($aluno_id, $academia_id, 'pending_professor')
              ON DUPLICATE KEY UPDATE status='pending_professor'");

echo json_encode(['ok' => true]);
?>


