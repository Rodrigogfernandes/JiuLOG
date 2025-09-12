<?php
session_start();
include 'db.php';

if($_SESSION['tipo'] != 'professor') die("Acesso negado");

$checkin_id = $_POST['checkin_id'];
$acao = $_POST['acao']; // aprovar ou reprovar

$status = $acao == 'aprovar' ? 'aprovado' : 'reprovado';

$conn->query("UPDATE checkins SET status='$status' WHERE id=$checkin_id");

header("Location: ../professor.html");
exit;
?>