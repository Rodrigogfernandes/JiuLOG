<?php
session_start();
include 'db.php';

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'professor') {
    die(json_encode(['ok' => false, 'message' => 'Acesso negado!']));
}

$aluno_id = $_POST['aluno_id'] ?? null;
$nome = $_POST['nome'] ?? null;
$email = $_POST['email'] ?? null;
$faixa = $_POST['faixa'] ?? null;
$graus = $_POST['graus'] ?? null;
$aulas_faltando = $_POST['aulas_faltando'] ?? null;

if (!$aluno_id || !$nome || !$email || !$faixa || !$graus || !$aulas_faltando) {
    die(json_encode(['ok' => false, 'message' => 'Dados incompletos!']));
}

// Verificar se o aluno existe
$check_aluno = $conn->query("SELECT id FROM usuarios WHERE id = $aluno_id AND tipo = 'aluno'");
if (!$check_aluno || $check_aluno->num_rows === 0) {
    die(json_encode(['ok' => false, 'message' => 'Aluno não encontrado!']));
}

// Verificar se o email já existe em outro aluno
$check_email = $conn->query("SELECT id FROM usuarios WHERE email = '$email' AND id != $aluno_id AND tipo = 'aluno'");
if ($check_email && $check_email->num_rows > 0) {
    die(json_encode(['ok' => false, 'message' => 'Este email já está sendo usado por outro aluno!']));
}

// Sanitizar dados
$nome = $conn->real_escape_string(trim($nome));
$email = $conn->real_escape_string(trim($email));
$faixa = $conn->real_escape_string($faixa);
$graus = intval($graus);
$aulas_faltando = intval($aulas_faltando);

// Validar dados
if (strlen($nome) < 2) {
    die(json_encode(['ok' => false, 'message' => 'Nome deve ter pelo menos 2 caracteres!']));
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    die(json_encode(['ok' => false, 'message' => 'Email inválido!']));
}

if ($graus < 0 || $graus > 4) {
    die(json_encode(['ok' => false, 'message' => 'Grau deve estar entre 0 e 4!']));
}

if ($aulas_faltando < 0 || $aulas_faltando > 100) {
    die(json_encode(['ok' => false, 'message' => 'Aulas para subir de nível deve estar entre 0 e 100!']));
}

try {
    // Atualizar dados do aluno
    $sql = "UPDATE usuarios SET 
            nome = '$nome',
            email = '$email',
            faixa = '$faixa',
            graus = $graus,
            aulas_faltando = $aulas_faltando
            WHERE id = $aluno_id AND tipo = 'aluno'";
    
    if ($conn->query($sql)) {
        header('Content-Type: application/json');
        echo json_encode([
            'ok' => true, 
            'message' => 'Aluno atualizado com sucesso!',
            'aluno' => [
                'id' => $aluno_id,
                'nome' => $nome,
                'email' => $email,
                'faixa' => $faixa,
                'graus' => $graus,
                'aulas_faltando' => $aulas_faltando
            ]
        ]);
    } else {
        throw new Exception('Erro ao atualizar aluno: ' . $conn->error);
    }
    
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode([
        'ok' => false, 
        'message' => $e->getMessage()
    ]);
}
?>
