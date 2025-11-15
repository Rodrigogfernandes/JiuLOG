<?php
session_start();
include __DIR__ . '/../config/db.php';

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'professor') {
    die(json_encode(['erro' => 'Acesso negado']));
}

$professor_id = $_SESSION['user_id'];
$nome = trim($_POST['nome'] ?? '');
$email = trim($_POST['email'] ?? '');
$apelido = trim($_POST['apelido'] ?? '');
$nova_senha = trim($_POST['nova_senha'] ?? '');
$academia_nome = trim($_POST['academia_nome'] ?? '');

if (empty($nome) || empty($email)) {
    die(json_encode(['erro' => 'Nome e email são obrigatórios']));
}

// Verificar se email já existe em outro usuário
$check = $conn->query("SELECT id FROM usuarios WHERE email='".$conn->real_escape_string($email)."' AND id != $professor_id");
if ($check && $check->num_rows > 0) {
    die(json_encode(['erro' => 'Email já está em uso por outro usuário']));
}

// Atualizar dados do professor
$sql = "UPDATE usuarios SET nome=?, email=?, apelido=?";
$params = [$nome, $email, $apelido];
$types = "sss";

if (!empty($nova_senha)) {
    $sql .= ", senha=?";
    $params[] = $nova_senha;
    $types .= "s";
}

$sql .= " WHERE id=?";
$params[] = $professor_id;
$types .= "i";

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);
$stmt->execute();

// Atualizar academia se fornecida
if (!empty($academia_nome)) {
    // Verificar se já existe academia
    $res = $conn->query("SELECT id FROM academias WHERE professor_id=$professor_id LIMIT 1");
    
    if ($res && $res->num_rows > 0) {
        // Atualizar academia existente
        $stmt2 = $conn->prepare("UPDATE academias SET nome=? WHERE professor_id=?");
        $stmt2->bind_param('si', $academia_nome, $professor_id);
        $stmt2->execute();
    } else {
        // Criar nova academia
        $stmt2 = $conn->prepare("INSERT INTO academias (nome, professor_id) VALUES (?, ?)");
        $stmt2->bind_param('si', $academia_nome, $professor_id);
        $stmt2->execute();
    }
}

// Upload de logo se fornecido
if (!empty($_FILES['academia_logo']['name'])) {
    $uploadDir = __DIR__ . '/../../public/uploads';
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0777, true);
    }
    
    $ext = pathinfo($_FILES['academia_logo']['name'], PATHINFO_EXTENSION);
    $safeName = 'logo_acad_' . $professor_id . '_' . time() . '.' . preg_replace('/[^a-zA-Z0-9]+/','', $ext);
    $dest = $uploadDir . '/' . $safeName;
    
    if (move_uploaded_file($_FILES['academia_logo']['tmp_name'], $dest)) {
        $logo_path = 'public/uploads/' . $safeName;
        $stmt3 = $conn->prepare("UPDATE academias SET logo_path=? WHERE professor_id=?");
        $stmt3->bind_param('si', $logo_path, $professor_id);
        $stmt3->execute();
    }
}

echo json_encode(['ok' => true]);
?>
