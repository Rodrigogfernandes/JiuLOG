<?php
session_start();
include __DIR__ . '/../config/db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || !isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'aluno') {
    echo json_encode(['error' => 'Sessão expirada ou acesso negado. Faça login novamente.']);
    exit;
}

$aluno_id = $_SESSION['user_id'];

$updates = [];
$params = [];
$types = '';

try {
    // Nome
    if (!empty($_POST['nome'])) {
        $nome = trim($_POST['nome']);
        if (strlen($nome) < 2) {
            echo json_encode(['error' => 'Nome deve ter pelo menos 2 caracteres.']);
            exit;
        }
        $updates[] = 'nome = ?';
        $params[] = $nome;
        $types .= 's';
    }

    // Email
    if (!empty($_POST['email'])) {
        $email = trim($_POST['email']);
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['error' => 'Email inválido.']);
            exit;
        }
        // Verificar se email já existe para outro usuario
        $stmt = $conn->prepare('SELECT id FROM usuarios WHERE email = ? AND id != ?');
        $stmt->bind_param('si', $email, $aluno_id);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            echo json_encode(['error' => 'Este email já está em uso.']);
            exit;
        }
        $updates[] = 'email = ?';
        $params[] = $email;
        $types .= 's';
    }

    // Senha
    if (!empty($_POST['nova_senha'])) {
        if (empty($_POST['senha_atual'])) {
            echo json_encode(['error' => 'Senha atual é obrigatória para alterar a senha.']);
            exit;
        }
        $senha_atual = $_POST['senha_atual'];
        $nova_senha = $_POST['nova_senha'];

        // Verificar senha atual
        $stmt = $conn->prepare('SELECT senha FROM usuarios WHERE id = ?');
        $stmt->bind_param('i', $aluno_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows === 0) {
            echo json_encode(['error' => 'Usuário não encontrado.']);
            exit;
        }
        $row = $result->fetch_assoc();
        if (!password_verify($senha_atual, $row['senha'])) {
            echo json_encode(['error' => 'Senha atual incorreta.']);
            exit;
        }

        // Validar nova senha
        if (strlen($nova_senha) < 6) {
            echo json_encode(['error' => 'Nova senha deve ter pelo menos 6 caracteres.']);
            exit;
        }

        $hashed_senha = password_hash($nova_senha, PASSWORD_DEFAULT);
        $updates[] = 'senha = ?';
        $params[] = $hashed_senha;
        $types .= 's';
    }


    if (empty($updates)) {
        echo json_encode(['error' => 'Nenhuma alteração foi feita.']);
        exit;
    }

    // Executar update
    $sql = 'UPDATE usuarios SET ' . implode(', ', $updates) . ' WHERE id = ?';
    $params[] = $aluno_id;
    $types .= 'i';

    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'Erro ao atualizar dados.']);
    }

} catch (Exception $e) {
    error_log('Erro em update_aluno.php: ' . $e->getMessage());
    echo json_encode(['error' => 'Erro interno do servidor.']);
}
?>