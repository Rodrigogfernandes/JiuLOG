<?php
session_start();
include 'db.php';

if(!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'aluno') {
    die("Acesso negado");
}

$aluno_id = $_SESSION['user_id'];
$horario_id = $_POST['horario_id'];
$data = $_POST['data'];

// Verifica duplicidade
$stmt = $conn->prepare("SELECT * FROM checkins WHERE aluno_id = ? AND horario_id = ? AND data = ?");
$stmt->bind_param("iis", $aluno_id, $horario_id, $data);
$stmt->execute();
$result = $stmt->get_result();

if($result->num_rows > 0){
    $_SESSION['msg'] = "Você já fez check-in nesta aula hoje.";
    header("Location: ../dashboard_aluno.html");
    exit;
}

// Inserir check-in com status 'pendente'
$stmt = $conn->prepare("INSERT INTO checkins (aluno_id, horario_id, data, status) VALUES (?, ?, ?, 'pendente')");
$stmt->bind_param("iis", $aluno_id, $horario_id, $data);
$stmt->execute();

$_SESSION['msg'] = "Check-in realizado com sucesso! Aguardando aprovação do professor.";
header("Location: ../dashboard_aluno.html");
exit;
?>