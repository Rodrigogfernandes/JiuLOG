<?php
include 'db.php';

// Campos básicos
$nome = $_POST['nome'];
$email = $_POST['email'];
$senha = $_POST['senha'];
$academia_nome = isset($_POST['academia_nome']) ? trim($_POST['academia_nome']) : '';

// Checar e-mail existente
$check = $conn->query("SELECT id FROM usuarios WHERE email='".$conn->real_escape_string($email)."'");
if ($check && $check->num_rows > 0) {
    die("Email já cadastrado!");
}

// Criar professor
$sql = "INSERT INTO usuarios (nome,email,senha,tipo,faixa,graus,aulas_faltando) VALUES (?,?,?,?,NULL,0,55)";
$stmt = $conn->prepare($sql);
$tipo = 'professor';
$stmt->bind_param('ssss', $nome, $email, $senha, $tipo);
$stmt->execute();
$professor_id = $conn->insert_id;

// Criar pasta individual do usuário para fotos
if ($professor_id > 0) {
    criarPastaUsuario($professor_id);
}

// Upload simples de logo (opcional)
$logo_path = NULL;
if (!empty($_FILES['academia_logo']['name'])) {
    $uploadDir = __DIR__ . '/../uploads';
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0777, true);
    }
    $ext = pathinfo($_FILES['academia_logo']['name'], PATHINFO_EXTENSION);
    $safeName = 'logo_acad_' . $professor_id . '_' . time() . '.' . preg_replace('/[^a-zA-Z0-9]+/','', $ext);
    $dest = $uploadDir . '/' . $safeName;
    if (move_uploaded_file($_FILES['academia_logo']['tmp_name'], $dest)) {
        $logo_path = 'uploads/' . $safeName;
    }
}

// Criar academia
if ($academia_nome !== '') {
    $stmt2 = $conn->prepare("INSERT INTO academias (nome, logo_path, professor_id) VALUES (?,?,?)");
    $stmt2->bind_param('ssi', $academia_nome, $logo_path, $professor_id);
    $stmt2->execute();
}

header("Location: ../login_professor.html");
exit;
?>