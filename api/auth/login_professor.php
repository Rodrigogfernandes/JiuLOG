<?php
session_start();
include __DIR__ . '/../config/db.php';

// Verificar se o método é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: ../../index.html");
    exit;
}

// Verificar se os campos foram enviados
if (!isset($_POST['email']) || !isset($_POST['senha'])) {
    header("Location: ../../index.html?erro=1");
    exit;
}

$email = $conn->real_escape_string(trim($_POST['email']));
$senha = $conn->real_escape_string($_POST['senha']);

$sql = "SELECT * FROM usuarios WHERE email='$email' AND senha='$senha' AND tipo='professor'";
$result = $conn->query($sql);

if($result->num_rows > 0){
    $user = $result->fetch_assoc();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['tipo'] = $user['tipo'];
    header("Location: ../../public/dashboard/professor.html");
} else {
    header("Location: ../../index.html?erro=1");
    exit;
}
?>