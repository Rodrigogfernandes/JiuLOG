<?php
include 'db.php';

$nome = $_POST['nome'];
$email = $_POST['email'];
$senha = $_POST['senha'];

// Verifica se o email já existe
$check = $conn->query("SELECT * FROM usuarios WHERE email='$email'");
if($check->num_rows > 0){
    die("Email já cadastrado!");
}

// Insere o novo aluno com aulas_faltando e total_aulas_graduacao = 55
$sql = "INSERT INTO usuarios (nome,email,senha,tipo,aulas_faltando,total_aulas_graduacao) 
        VALUES ('$nome','$email','$senha','aluno',55,55)";
$conn->query($sql);

header("Location: ../login_aluno.html");
exit;
?>