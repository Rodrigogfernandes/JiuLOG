<?php
session_start();
include __DIR__ . '/../config/db.php';

if ($_SESSION['tipo'] != 'professor') {
    header('Content-Type: application/json');
    http_response_code(403);
    echo json_encode(['ok' => false, 'erro' => 'Acesso negado']);
    exit;
}

$aluno_id = $_POST['aluno_id'];
$faixa = $_POST['faixa'];
$graus = $_POST['graus'];

$ok = $conn->query("UPDATE usuarios SET faixa='$faixa', graus=$graus WHERE id=$aluno_id");

header('Content-Type: application/json');
echo json_encode(['ok' => (bool)$ok, 'aluno_id' => (int)$aluno_id, 'faixa' => $faixa, 'graus' => (int)$graus]);
exit;
?>