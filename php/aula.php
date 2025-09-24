<?php
session_start();
include 'db.php';

if($_SESSION['tipo'] != 'professor') die("Acesso negado");

if(isset($_POST['add_aula'])){
    $nome = $_POST['nome_aula'];
    $dia = $_POST['dia_semana'];
    $hora = $_POST['hora'];
    $horario_id = $_POST['horario_id'] ?? null;

    if($horario_id){
		$conn->query("UPDATE horarios SET nome_aula='$nome', dia_semana='$dia', hora='$hora' WHERE id=$horario_id");
    } else {
		$professor_id = intval($_SESSION['user_id']);
		$conn->query("INSERT INTO horarios (nome_aula,dia_semana,hora,professor_id) VALUES ('$nome','$dia','$hora',$professor_id)");
    }
    header("Location: ../professor.html");
    exit;
}

if(isset($_POST['remove_aula'])){
    $horario_id = $_POST['horario_id'];
	$conn->query("DELETE FROM horarios WHERE id=$horario_id");
    header("Location: ../professor.html");
    exit;
}
?>