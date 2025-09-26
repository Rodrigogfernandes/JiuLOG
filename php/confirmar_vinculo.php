<?php
session_start();
include 'db.php';

$acao = isset($_POST['acao']) ? $_POST['acao'] : '';
$membership_id = isset($_POST['membership_id']) ? intval($_POST['membership_id']) : 0;

if ($membership_id <= 0 || !in_array($acao, ['aluno_aceitar','aluno_rejeitar','prof_aceitar','prof_rejeitar'])) {
    die(json_encode(['erro' => 'Requisição inválida']));
}

$tipo = isset($_SESSION['tipo']) ? $_SESSION['tipo'] : '';
if (!in_array($tipo, ['aluno','professor'])) {
    die(json_encode(['erro' => 'Acesso negado']));
}

// Carrega membership e valida permissão
$m = $conn->query("SELECT m.*, a.professor_id FROM academia_memberships m JOIN academias a ON a.id=m.academia_id WHERE m.id=$membership_id");
if (!$m || $m->num_rows === 0) die(json_encode(['erro' => 'Vínculo não encontrado']));
$membership = $m->fetch_assoc();

if ($acao === 'prof_aceitar' || $acao === 'prof_rejeitar') {
    if ($tipo !== 'professor' || $_SESSION['user_id'] != $membership['professor_id']) {
        die(json_encode(['erro' => 'Sem permissão']));
    }
    if ($acao === 'prof_aceitar') {
        $conn->query("UPDATE academia_memberships SET status='pending_aluno' WHERE id=$membership_id");
    } else {
        $conn->query("UPDATE academia_memberships SET status='rejected' WHERE id=$membership_id");
    }
} else {
    if ($tipo !== 'aluno' || $_SESSION['user_id'] != $membership['aluno_id']) {
        die(json_encode(['erro' => 'Sem permissão']));
    }
    if ($acao === 'aluno_aceitar') {
        $conn->query("UPDATE academia_memberships SET status='approved' WHERE id=$membership_id");
    } else {
        $conn->query("UPDATE academia_memberships SET status='rejected' WHERE id=$membership_id");
    }
}

echo json_encode(['ok' => true]);
?>


