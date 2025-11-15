<?php
session_start();
include __DIR__ . '/../config/db.php';

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'professor') {
    die(json_encode(['erro' => 'Acesso negado']));
}

$res = $conn->query("SELECT id, nome, faixa, graus FROM usuarios WHERE tipo='aluno'");
$alunos = [];
while ($row = $res->fetch_assoc()) {
    $alunos[] = $row;
}

echo json_encode($alunos);
?>