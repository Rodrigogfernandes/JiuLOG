<?php
include 'db.php';

$nome = $_POST['nome'];
$email = $_POST['email'];
$senha = $_POST['senha'];

$check = $conn->query("SELECT * FROM usuarios WHERE email='$email'");
if($check->num_rows > 0){
    die("Email já cadastrado!");
}

$sql = "INSERT INTO usuarios (nome,email,senha,tipo,aulas_faltando) VALUES ('$nome','$email','$senha','professor',0)";
$conn->query($sql);

header("Location: ../login_professor.html");
exit;
?>