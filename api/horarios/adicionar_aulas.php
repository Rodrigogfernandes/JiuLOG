<?php
session_start();
include __DIR__ . '/../config/db.php';

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'professor') {
    die(json_encode(['ok' => false, 'message' => 'Acesso negado!']));
}

$aluno_id = $_POST['aluno_id'] ?? null;
$num_aulas = $_POST['num_aulas'] ?? null;

if (!$aluno_id || !$num_aulas || !is_numeric($num_aulas) || $num_aulas < 1) {
    die(json_encode(['ok' => false, 'message' => 'Dados inválidos!']));
}

try {
    // Adicionar aulas ao aluno
    $conn->query("UPDATE usuarios SET aulas_faltando = aulas_faltando + $num_aulas WHERE id=$aluno_id");

    header('Content-Type: application/json');
    echo json_encode([
        'ok' => true,
        'message' => "$num_aulas aulas adicionadas com sucesso!"
    ]);
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode([
        'ok' => false,
        'message' => 'Erro ao adicionar aulas: ' . $e->getMessage()
    ]);
}
?>