<?php
session_start();
include 'db.php';

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'professor') {
    die(json_encode(['ok' => false, 'message' => 'Acesso negado!']));
}

$aluno_id = $_POST['aluno_id'] ?? null;

if (!$aluno_id) {
    die(json_encode(['ok' => false, 'message' => 'ID do aluno não fornecido!']));
}

// Verificar se o aluno existe
$check_aluno = $conn->query("SELECT nome FROM usuarios WHERE id = $aluno_id AND tipo = 'aluno'");
if (!$check_aluno || $check_aluno->num_rows === 0) {
    die(json_encode(['ok' => false, 'message' => 'Aluno não encontrado!']));
}

$aluno_nome = $check_aluno->fetch_assoc()['nome'];

try {
    // Iniciar transação
    $conn->begin_transaction();
    
    // 1. Remover todos os check-ins do aluno
    $conn->query("DELETE FROM checkins WHERE aluno_id = $aluno_id");
    
    // 2. Remover horários vinculados ao aluno (se houver)
    // Primeiro, buscar horários que só têm este aluno
    $horarios_solo = $conn->query("
        SELECT h.id 
        FROM horarios h 
        LEFT JOIN checkins c ON h.id = c.horario_id 
        WHERE h.professor_id = {$_SESSION['user_id']}
        GROUP BY h.id 
        HAVING COUNT(c.aluno_id) <= 1 AND SUM(CASE WHEN c.aluno_id = $aluno_id THEN 1 ELSE 0 END) > 0
    ");
    
    if ($horarios_solo && $horarios_solo->num_rows > 0) {
        while ($horario = $horarios_solo->fetch_assoc()) {
            $conn->query("DELETE FROM horarios WHERE id = {$horario['id']}");
        }
    }
    
    // 3. Excluir pasta do usuário e todas as fotos
    excluirPastaUsuario($aluno_id);
    
    // 4. Remover o aluno da tabela usuarios
    $conn->query("DELETE FROM usuarios WHERE id = $aluno_id");
    
    // Confirmar transação
    $conn->commit();
    
    header('Content-Type: application/json');
    echo json_encode([
        'ok' => true, 
        'message' => "Aluno '{$aluno_nome}' excluído com sucesso!",
        'aluno_nome' => $aluno_nome
    ]);
    
} catch (Exception $e) {
    // Reverter transação em caso de erro
    $conn->rollback();
    
    header('Content-Type: application/json');
    echo json_encode([
        'ok' => false, 
        'message' => 'Erro ao excluir aluno: ' . $e->getMessage()
    ]);
}
?>
