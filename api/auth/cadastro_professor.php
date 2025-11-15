<?php
session_start();
include __DIR__ . '/../config/db.php';

// Verificar se o método é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: ../../public/auth/cadastro_professor.html");
    exit;
}

// Verificar se os campos foram enviados
if (!isset($_POST['nome']) || !isset($_POST['email']) || !isset($_POST['senha'])) {
    header("Location: ../../public/auth/cadastro_professor.html?erro=1");
    exit;
}

// Campos básicos
$nome = $conn->real_escape_string(trim($_POST['nome']));
$email = $conn->real_escape_string(trim($_POST['email']));
$senha = $conn->real_escape_string($_POST['senha']);
$academia_nome = isset($_POST['academia_nome']) ? trim($conn->real_escape_string($_POST['academia_nome'])) : '';

// Validar campos
if (empty($nome) || empty($email) || empty($senha)) {
    header("Location: ../../public/auth/cadastro_professor.html?erro=1");
    exit;
}

// Checar e-mail existente
$check = $conn->query("SELECT id FROM usuarios WHERE email='$email'");
if ($check && $check->num_rows > 0) {
    header("Location: ../../public/auth/cadastro_professor.html?erro=1");
    exit;
}

// Criar professor
$sql = "INSERT INTO usuarios (nome,email,senha,tipo,faixa,graus,aulas_faltando) VALUES (?,?,?,?,NULL,0,55)";
$stmt = $conn->prepare($sql);
$tipo = 'professor';
$stmt->bind_param('ssss', $nome, $email, $senha, $tipo);
if (!$stmt->execute()) {
    error_log("Erro ao cadastrar professor: " . $stmt->error);
    header("Location: ../../public/auth/cadastro_professor.html?erro=1");
    exit;
}
$professor_id = $conn->insert_id;

// Criar pasta individual do usuário para fotos
if ($professor_id > 0) {
    criarPastaUsuario($professor_id);
}

// Upload simples de logo (opcional)
$logo_path = NULL;
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
    }
}

// Criar academia
if ($academia_nome !== '') {
    $stmt2 = $conn->prepare("INSERT INTO academias (nome, logo_path, professor_id) VALUES (?,?,?)");
    $stmt2->bind_param('ssi', $academia_nome, $logo_path, $professor_id);
    $stmt2->execute();
}

header("Location: ../../public/auth/login_professor.html");
exit;
?>