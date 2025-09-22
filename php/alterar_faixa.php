<?php
session_start();
include 'db.php';

if ($_SESSION['tipo'] != 'professor') die("Acesso negado");

$aluno_id = $_POST['aluno_id'];
$faixa = $_POST['faixa'];
$graus = $_POST['graus'];

$conn->query("UPDATE usuarios SET faixa='$faixa', graus=$graus WHERE id=$aluno_id");

header("Location: ../professor.html");
exit;
?>