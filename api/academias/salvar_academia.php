<?php
session_start();
include __DIR__ . '/../config/db.php';

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'professor') {
    die(json_encode(['erro' => 'Acesso negado']));
}

$professor_id = $_SESSION['user_id'];
$nome = isset($_POST['nome']) ? trim($_POST['nome']) : '';
if ($nome === '') {
    die(json_encode(['erro' => 'Nome da academia é obrigatório']));
}

// Upload de logo opcional
$logo_path = null;
if (!empty($_FILES['logo']['name'])) {
    $uploadDir = __DIR__ . '/../../public/uploads';
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0777, true);
    }
    $ext = pathinfo($_FILES['logo']['name'], PATHINFO_EXTENSION);
    $safeName = 'logo_acad_' . $professor_id . '_' . time() . '.' . preg_replace('/[^a-zA-Z0-9]+/','', $ext);
    $dest = $uploadDir . '/' . $safeName;
    if (move_uploaded_file($_FILES['logo']['tmp_name'], $dest)) {
        $logo_path = 'public/uploads/' . $safeName;
    }
}

// Verifica se já existe academia do professor
$res = $conn->query("SELECT id FROM academias WHERE professor_id=$professor_id LIMIT 1");
if ($res && $res->num_rows > 0) {
    $row = $res->fetch_assoc();
    $id = intval($row['id']);
    if ($logo_path) {
        $stmt = $conn->prepare("UPDATE academias SET nome=?, logo_path=? WHERE id=?");
        $stmt->bind_param('ssi', $nome, $logo_path, $id);
    } else {
        $stmt = $conn->prepare("UPDATE academias SET nome=? WHERE id=?");
        $stmt->bind_param('si', $nome, $id);
    }
    $stmt->execute();
    echo json_encode(['ok' => true, 'id' => $id, 'logo_path' => $logo_path]);
    exit;
}

// Cria nova
$stmt = $conn->prepare("INSERT INTO academias (nome, logo_path, professor_id) VALUES (?,?,?)");
$stmt->bind_param('ssi', $nome, $logo_path, $professor_id);
$stmt->execute();
$id = $conn->insert_id;

echo json_encode(['ok' => true, 'id' => $id, 'logo_path' => $logo_path]);
?>


