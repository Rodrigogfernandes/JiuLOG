<?php
session_start();
include 'db.php';

$email = $_POST['email'];
$senha = $_POST['senha'];

$sql = "SELECT * FROM usuarios WHERE email='$email' AND senha='$senha' AND tipo='professor'";
$result = $conn->query($sql);

if($result->num_rows > 0){
    $user = $result->fetch_assoc();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['tipo'] = $user['tipo'];
    header("Location: ../professor.html");
} else {
    header("Location: ../login_aluno.html?erro=1");
    exit;
}
?>