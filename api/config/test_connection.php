<?php
/**
 * Script de teste de conexão com banco de dados
 * Acesse via: http://localhost/jiulog/api/config/test_connection.php
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "jiulog";

echo "<h2>Teste de Conexão com Banco de Dados</h2>";

// Testar conexão
$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo "<p style='color: red;'>❌ <strong>Erro de conexão:</strong> " . $conn->connect_error . "</p>";
    echo "<p>Verifique se:</p>";
    echo "<ul>";
    echo "<li>O MySQL está rodando no XAMPP</li>";
    echo "<li>O banco de dados 'jiulog' existe</li>";
    echo "<li>As credenciais estão corretas em api/config/db.php</li>";
    echo "</ul>";
} else {
    echo "<p style='color: green;'>✅ <strong>Conexão bem-sucedida!</strong></p>";
    
    // Verificar se as tabelas existem
    $tables = ['usuarios', 'academias', 'checkins', 'horarios', 'academia_memberships'];
    echo "<h3>Verificação de Tabelas:</h3><ul>";
    foreach ($tables as $table) {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        if ($result && $result->num_rows > 0) {
            echo "<li style='color: green;'>✅ Tabela '$table' existe</li>";
        } else {
            echo "<li style='color: red;'>❌ Tabela '$table' NÃO existe</li>";
        }
    }
    echo "</ul>";
    
    // Verificar usuários existentes
    $result = $conn->query("SELECT COUNT(*) as total FROM usuarios");
    if ($result) {
        $row = $result->fetch_assoc();
        echo "<p><strong>Total de usuários cadastrados:</strong> " . $row['total'] . "</p>";
    }
}

$conn->close();
?>

