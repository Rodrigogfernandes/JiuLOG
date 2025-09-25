<?php
session_start();
include 'db.php';

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'aluno') {
    die("Acesso negado!");
}

$aluno_id = $_SESSION['user_id'];
$horario_id = $_POST['horario_id'];
$data = $_POST['data'];

// Verifica se já existe check-in neste horário e data
$check = $conn->query("SELECT * FROM checkins WHERE aluno_id=$aluno_id AND horario_id=$horario_id AND data_checkin='$data'");
if ($check->num_rows > 0) {
    die("Você já fez check-in para este horário hoje!");
}

// Insere check-in como "pendente"
$conn->query("INSERT INTO checkins (aluno_id, horario_id, data_checkin, status) VALUES ($aluno_id, $horario_id, '$data', 'pendente')");

// Não atualiza aulas_faltando aqui, só quando o admin aprovar

header("Location: ../dashboard_aluno.html");
exit;
?>