<?php
session_start();
include __DIR__ . '/../config/db.php';

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'professor') {
    die(json_encode(['erro' => 'Acesso negado']));
}

$professor_id = $_SESSION['user_id'];

// aceitar academia_id via GET (opcional)
$academia_id = isset($_GET['academia_id']) ? intval($_GET['academia_id']) : 0;

if ($academia_id <= 0) {
    // tentar obter a primeira academia do professor
    $res = $conn->query("SELECT id FROM academias WHERE professor_id=$professor_id ORDER BY criada_em DESC LIMIT 1");
    if ($res && $res->num_rows > 0) {
        $row = $res->fetch_assoc();
        $academia_id = intval($row['id']);
    }
}

if ($academia_id <= 0) {
    echo json_encode([]);
    exit;
}

// Buscar alunos com vínculo aprovado nessa academia
$sql = "SELECT u.id, u.nome, u.email, u.faixa, u.graus, u.aulas_faltando, m.status, m.id AS membership_id, u.apelido
    FROM academia_memberships m
    JOIN usuarios u ON u.id = m.aluno_id
    WHERE m.academia_id = " . intval($academia_id) . " AND m.status = 'approved'
    ORDER BY u.nome ASC";

$res = $conn->query($sql);
$alunos = [];
while ($row = $res->fetch_assoc()) {
    $alunos[] = $row;
}

echo json_encode($alunos);
?>