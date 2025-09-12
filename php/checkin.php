<?php
session_start();
include 'db.php';

if($_SESSION['tipo'] != 'aluno') die("Acesso negado");

$aluno_id = $_SESSION['user_id'];
$horario_id = $_POST['horario_id'];
$data = $_POST['data'];

$conn->query("INSERT INTO checkins (aluno_id,horario_id,data) VALUES ($aluno_id,$horario_id,'$data')");

header("Location: ../dashboard_aluno.html");
exit;
?>