<?php
session_start();
include __DIR__ . '/../config/db.php';

// Verificar se o método é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: ../../index.html");
    exit;
}

// Verificar se os campos foram enviados
if (!isset($_POST['nome']) || !isset($_POST['email']) || !isset($_POST['senha'])) {
    header("Location: ../../index.html?erro=1");
    exit;
}

// Campos básicos
$nome = $conn->real_escape_string(trim($_POST['nome']));
$email = $conn->real_escape_string(trim($_POST['email']));
$senha = $conn->real_escape_string($_POST['senha']);
$academia_nome = isset($_POST['academia_nome']) ? trim($conn->real_escape_string($_POST['academia_nome'])) : '';
$academia_id = isset($_POST['academia_id']) ? intval($_POST['academia_id']) : 0;

// Validar campos
if (empty($nome) || empty($email) || empty($senha)) {
    header("Location: ../../index.html?erro=1");
    exit;
}

// Checar e-mail existente
$check = $conn->query("SELECT id FROM usuarios WHERE email='$email'");
if ($check && $check->num_rows > 0) {
    header("Location: ../../index.html?erro=1");
    exit;
}

// Criar professor
$sql = "INSERT INTO usuarios (nome,email,senha,tipo,faixa,graus,aulas_faltando) VALUES (?,?,?,?,NULL,0,55)";
$stmt = $conn->prepare($sql);
$tipo = 'professor';
$stmt->bind_param('ssss', $nome, $email, $senha, $tipo);
if (!$stmt->execute()) {
    error_log("Erro ao cadastrar professor: " . $stmt->error);
    header("Location: ../../index.html?erro=1");
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

// Se academia_id foi fornecido, associar professor à academia existente
if ($academia_id > 0) {
    // Verificar se a academia existe
    $check_academia = $conn->query("SELECT id FROM academias WHERE id=$academia_id");
    if ($check_academia && $check_academia->num_rows > 0) {
        // Atualizar a academia para associar ao novo professor
        // Nota: Isso pode substituir o professor anterior. Ajuste conforme necessário.
        $stmt2 = $conn->prepare("UPDATE academias SET professor_id=? WHERE id=?");
        $stmt2->bind_param('ii', $professor_id, $academia_id);
        $stmt2->execute();
        
        // Se houver logo, atualizar também
        if ($logo_path) {
            $stmt3 = $conn->prepare("UPDATE academias SET logo_path=? WHERE id=?");
            $stmt3->bind_param('si', $logo_path, $academia_id);
            $stmt3->execute();
        }
    }
} 
// Se academia_nome foi fornecido, criar nova academia
elseif ($academia_nome !== '') {
    $stmt2 = $conn->prepare("INSERT INTO academias (nome, logo_path, professor_id) VALUES (?,?,?)");
    $stmt2->bind_param('ssi', $academia_nome, $logo_path, $professor_id);
    $stmt2->execute();
}

header("Location: ../../index.html");
exit;
?>