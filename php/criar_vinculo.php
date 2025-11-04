<?php
session_start();
include 'db.php';

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'professor') {
    die(json_encode(['erro' => 'Acesso negado']));
}

$professor_id = $_SESSION['user_id'];
$aluno_id = isset($_POST['aluno_id']) ? intval($_POST['aluno_id']) : 0;
$academia_id = isset($_POST['academia_id']) ? intval($_POST['academia_id']) : 0;

if ($aluno_id <= 0 || $academia_id <= 0) {
    die(json_encode(['erro' => 'Aluno ou academia inválidos']));
}

// Verificar se a academia pertence ao professor
$check_academia = $conn->query("SELECT id FROM academias WHERE id=$academia_id AND professor_id=$professor_id");
if (!$check_academia || $check_academia->num_rows === 0) {
    die(json_encode(['erro' => 'Academia não encontrada ou sem permissão']));
}

// Verificar se o aluno existe
$check_aluno = $conn->query("SELECT id FROM usuarios WHERE id=$aluno_id AND tipo='aluno'");
if (!$check_aluno || $check_aluno->num_rows === 0) {
    die(json_encode(['erro' => 'Aluno não encontrado']));
}

// Verificar se já existe um vínculo (ativo ou não)
$check_membership = $conn->query("SELECT id, status FROM academia_memberships WHERE aluno_id=$aluno_id AND academia_id=$academia_id");
if ($check_membership && $check_membership->num_rows > 0) {
    $membership = $check_membership->fetch_assoc();
    // Se já existe e está aprovado, retornar sucesso
    if ($membership['status'] === 'approved') {
        echo json_encode(['ok' => true, 'message' => 'Vínculo já existe e está aprovado', 'membership_id' => $membership['id']]);
        exit;
    }
    // Se existe mas não está aprovado, atualizar para approved
    $conn->query("UPDATE academia_memberships SET status='approved' WHERE id={$membership['id']}");
    echo json_encode(['ok' => true, 'message' => 'Vínculo atualizado e aprovado', 'membership_id' => $membership['id']]);
    exit;
}

// Criar novo vínculo com status approved (professor cria diretamente)
$stmt = $conn->prepare("INSERT INTO academia_memberships (aluno_id, academia_id, status) VALUES (?, ?, 'approved')");
$stmt->bind_param('ii', $aluno_id, $academia_id);
if ($stmt->execute()) {
    $membership_id = $conn->insert_id;
    echo json_encode(['ok' => true, 'message' => 'Vínculo criado com sucesso', 'membership_id' => $membership_id]);
} else {
    echo json_encode(['erro' => 'Erro ao criar vínculo: ' . $conn->error]);
}
?>

