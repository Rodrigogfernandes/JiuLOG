<?php
$servername = "localhost";
$username = "root"; // padrão XAMPP
$password = "";     // padrão XAMPP
$dbname = "jiulog";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Conexão falhou: " . $conn->connect_error);
}
?>