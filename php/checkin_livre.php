<?php
session_start();
include 'db.php';

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'aluno') {
    die("Acesso negado!");
}

$aluno_id = $_SESSION['user_id'];
$data = $_POST['data'];

// Verifica se já existe check-in livre nesta data
$check = $conn->query("SELECT * FROM checkins WHERE aluno_id=$aluno_id AND horario_id IS NULL AND data_checkin='$data'");
if ($check->num_rows > 0) {
    die("Você já fez check-in livre hoje!");
}

// Insere check-in livre como "pendente" (sem horario_id)
$conn->query("INSERT INTO checkins (aluno_id, horario_id, data_checkin, status) VALUES ($aluno_id, NULL, '$data', 'pendente')");

header("Location: ../dashboard_aluno.html");
exit;
?>
