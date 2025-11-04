<?php
include 'db.php';

$nome = $_POST['nome'];
$email = $_POST['email'];
$senha = $_POST['senha'];
$academia_id = isset($_POST['academia_id']) ? intval($_POST['academia_id']) : 0;

// Verificar se email já existe
$check = $conn->query("SELECT * FROM usuarios WHERE email='$email'");
if ($check->num_rows > 0) {
    header("Location: ../cadastro_aluno.html?erro=1");
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
$stmt->execute();
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

header("Location: ../login_aluno.html");
exit;
?>