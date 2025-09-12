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
        $conn->query("UPDATE horarios SET nome_aula='$nome', dia_semana='$dia', hora='$hora', ativa=1 WHERE id=$horario_id");
    } else {
        $conn->query("INSERT INTO horarios (nome_aula,dia_semana,hora,ativa) VALUES ('$nome','$dia','$hora',1)");
    }
    header("Location: ../professor.html");
    exit;
}

if(isset($_POST['remove_aula'])){
    $horario_id = $_POST['horario_id'];
    $conn->query("UPDATE horarios SET ativa=0 WHERE id=$horario_id");
    header("Location: ../professor.html");
    exit;
}
?>