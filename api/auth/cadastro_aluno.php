<?php
session_start();
include __DIR__ . '/../config/db.php';

// Verificar se o método é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: ../../public/auth/cadastro_aluno.html");
    exit;
}

// Verificar se os campos foram enviados
if (!isset($_POST['nome']) || !isset($_POST['email']) || !isset($_POST['senha'])) {
    header("Location: ../../public/auth/cadastro_aluno.html?erro=1");
    exit;
}

$nome = $conn->real_escape_string(trim($_POST['nome']));
$email = $conn->real_escape_string(trim($_POST['email']));
$senha = $conn->real_escape_string($_POST['senha']);
$academia_id = isset($_POST['academia_id']) ? intval($_POST['academia_id']) : 0;

// Verificar se email já existe
$check = $conn->query("SELECT * FROM usuarios WHERE email='$email'");
if ($check && $check->num_rows > 0) {
    header("Location: ../../public/auth/cadastro_aluno.html?erro=1");
    exit;
}

// Validar campos
if (empty($nome) || empty($email) || empty($senha)) {
    header("Location: ../../public/auth/cadastro_aluno.html?erro=1");
    exit;
}

// Inserir aluno novo já com faixa branca, 0 graus e 55 aulas faltando
$sql = "INSERT INTO usuarios (nome, email, senha, tipo, faixa, graus, aulas_faltando) VALUES (?,?,?,?,?,?,?)";
$stmt = $conn->prepare($sql);
$tipo = 'aluno';
$faixa = 'Branca';
$graus = 1;
$faltando = 55;
$stmt->bind_param('ssssiii', $nome, $email, $senha, $tipo, $faixa, $graus, $faltando);
if (!$stmt->execute()) {
    error_log("Erro ao cadastrar aluno: " . $stmt->error);
    header("Location: ../../public/auth/cadastro_aluno.html?erro=1");
    exit;
}
$aluno_id = $conn->insert_id;

// Criar pasta individual do usuário para fotos
if ($aluno_id > 0) {
    criarPastaUsuario($aluno_id);
}

// Criar solicitação de vínculo com academia (confirmação mútua)
if ($academia_id > 0) {
    $stmt2 = $conn->prepare("INSERT INTO academia_memberships (aluno_id, academia_id, status) VALUES (?,?, 'pending_professor')");
    $stmt2->bind_param('ii', $aluno_id, $academia_id);
    $stmt2->execute();
}

header("Location: ../../public/auth/login_aluno.html");
exit;
?>