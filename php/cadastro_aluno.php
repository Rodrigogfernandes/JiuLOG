<?php
include 'db.php';

$nome = $_POST['nome'];
$email = $_POST['email'];
$senha = $_POST['senha'];

// Verificar se email já existe
$check = $conn->query("SELECT * FROM usuarios WHERE email='$email'");
if ($check->num_rows > 0) {
    die("Email já cadastrado!");
}

// Inserir aluno novo já com faixa branca, 0 graus e 55 aulas faltando
$sql = "INSERT INTO usuarios (nome, email, senha, tipo, faixa, graus, aulas_faltando) 
        VALUES ('$nome', '$email', '$senha', 'aluno', 'Branca', 0, 55)";
$conn->query($sql);

header("Location: ../login_aluno.html");
exit;
?>