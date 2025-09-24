<?php
session_start();
include 'db.php';

// Verificar se é professor
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'professor') {
    die(json_encode(['erro' => 'Acesso negado']));
}

$termo = $_GET['q'] ?? '';
$resultados = [];

if (!empty($termo)) {
    // Buscar alunos por nome ou email
    $sql = "SELECT id, nome, email, faixa, graus, aulas_faltando, created_at 
            FROM usuarios 
            WHERE tipo='aluno' 
            AND (nome LIKE '%$termo%' OR email LIKE '%$termo%')
            ORDER BY nome ASC
            LIMIT 20";
    
    $result = $conn->query($sql);
    
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $resultados[] = [
                'id' => $row['id'],
                'nome' => $row['nome'],
                'email' => $row['email'],
                'faixa' => $row['faixa'],
                'graus' => $row['graus'],
                'aulas_faltando' => $row['aulas_faltando'],
                'created_at' => $row['created_at']
            ];
        }
    }
}

// Retornar JSON
header('Content-Type: application/json');
echo json_encode([
    'resultados' => $resultados,
    'total' => count($resultados),
    'termo' => $termo
]);
?>
