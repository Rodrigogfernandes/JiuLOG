<?php
session_start();
include 'db.php';

// Verificar se é professor
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'professor') {
    header("Location: ../login_professor.html?erro=1");
    exit;
}

$erro = '';
$sucesso = '';

// Processar formulário
if ($_POST) {
    $nome = trim($_POST['nome']);
    $email = trim($_POST['email']);
    $senha = trim($_POST['senha']);
    $confirmar_senha = trim($_POST['confirmar_senha']);
    $faixa = $_POST['faixa'];
    $graus = (int)$_POST['graus'];
    
    // Validações
    if (empty($nome) || empty($email) || empty($senha)) {
        $erro = "Todos os campos são obrigatórios.";
    } elseif ($senha !== $confirmar_senha) {
        $erro = "As senhas não coincidem.";
    } elseif (strlen($senha) < 6) {
        $erro = "A senha deve ter pelo menos 6 caracteres.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $erro = "Email inválido.";
    } else {
        // Verificar se email já existe
        $check_email = $conn->query("SELECT id FROM usuarios WHERE email='$email'");
        if ($check_email->num_rows > 0) {
            $erro = "Este email já está cadastrado.";
        } else {
            // Inserir novo aluno
            $sql = "INSERT INTO usuarios (nome, email, senha, tipo, faixa, graus, aulas_faltando) 
                    VALUES ('$nome', '$email', '$senha', 'aluno', '$faixa', $graus, 55)";
            
            if ($conn->query($sql)) {
                $aluno_id = $conn->insert_id;
                
                // Criar pasta individual do usuário para fotos
                if ($aluno_id > 0) {
                    criarPastaUsuario($aluno_id);
                }
                
                $sucesso = "Aluno cadastrado com sucesso!";
                // Limpar formulário
                $nome = $email = $senha = $confirmar_senha = '';
                $faixa = 'Branca';
                $graus = 0;
            } else {
                $erro = "Erro ao cadastrar aluno: " . $conn->error;
            }
        }
    }
}
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Novo Aluno - JiuLOG</title>
    <link rel="stylesheet" href="../css/theme.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <!-- Partículas flutuantes -->
    <div class="particles" id="particles"></div>
    
    <div class="container">
        <div class="logo">
            <i class="fas fa-user-plus"></i>
            Novo Aluno
        </div>
        
        <p class="subtitle">Cadastre um novo aluno no sistema</p>
        
        <?php if ($erro): ?>
            <div class="alert alert-error">
                <i class="fas fa-exclamation-triangle"></i>
                <?php echo $erro; ?>
            </div>
        <?php endif; ?>
        
        <?php if ($sucesso): ?>
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i>
                <?php echo $sucesso; ?>
            </div>
        <?php endif; ?>
        
        <form method="POST" action="">
            <div class="form-group">
                <label for="nome">
                    <i class="fas fa-user"></i>
                    Nome Completo
                </label>
                <input type="text" id="nome" name="nome" 
                       value="<?php echo htmlspecialchars($nome ?? ''); ?>" 
                       placeholder="Digite o nome completo do aluno" required>
            </div>
            
            <div class="form-group">
                <label for="email">
                    <i class="fas fa-envelope"></i>
                    Email
                </label>
                <input type="email" id="email" name="email" 
                       value="<?php echo htmlspecialchars($email ?? ''); ?>" 
                       placeholder="Digite o email do aluno" required>
            </div>
            
            <div class="form-group">
                <label for="senha">
                    <i class="fas fa-lock"></i>
                    Senha
                </label>
                <input type="password" id="senha" name="senha" 
                       placeholder="Digite uma senha (mínimo 6 caracteres)" required>
            </div>
            
            <div class="form-group">
                <label for="confirmar_senha">
                    <i class="fas fa-lock"></i>
                    Confirmar Senha
                </label>
                <input type="password" id="confirmar_senha" name="confirmar_senha" 
                       placeholder="Confirme a senha" required>
            </div>
            
            <div class="form-group">
                <label for="faixa">
                    <i class="fas fa-medal"></i>
                    Faixa Atual
                </label>
                <select id="faixa" name="faixa" required>
                    <option value="Branca" <?php echo ($faixa ?? '') === 'Branca' ? 'selected' : ''; ?>>Branca</option>
                    <option value="Azul" <?php echo ($faixa ?? '') === 'Azul' ? 'selected' : ''; ?>>Azul</option>
                    <option value="Roxa" <?php echo ($faixa ?? '') === 'Roxa' ? 'selected' : ''; ?>>Roxa</option>
                    <option value="Marrom" <?php echo ($faixa ?? '') === 'Marrom' ? 'selected' : ''; ?>>Marrom</option>
                    <option value="Preta" <?php echo ($faixa ?? '') === 'Preta' ? 'selected' : ''; ?>>Preta</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="graus">
                    <i class="fas fa-star"></i>
                    Graus
                </label>
                <input type="number" id="graus" name="graus" 
                       value="<?php echo $graus ?? 0; ?>" 
                       min="0" max="4" placeholder="Número de graus (0-4)" required>
            </div>
            
            <div class="button-container">
                <button type="submit" class="btn btn-lg w-100">
                    <i class="fas fa-user-plus"></i>
                    Cadastrar Aluno
                </button>
                
                <a href="../professor.html" class="btn btn-secondary w-100">
                    <i class="fas fa-arrow-left"></i>
                    Voltar ao Dashboard
                </a>
            </div>
        </form>
    </div>
    
    <script>
        // Criar partículas flutuantes
        function createParticles() {
            const particlesContainer = document.getElementById('particles');
            const particleCount = 10;
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                const size = Math.random() * 3 + 1;
                particle.style.width = size + 'px';
                particle.style.height = size + 'px';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 6 + 's';
                particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
                
                particlesContainer.appendChild(particle);
            }
        }
        
        // Inicializar partículas
        document.addEventListener('DOMContentLoaded', createParticles);
        
        // Validação de senha em tempo real
        document.getElementById('confirmar_senha').addEventListener('input', function() {
            const senha = document.getElementById('senha').value;
            const confirmar = this.value;
            
            if (senha !== confirmar) {
                this.style.borderColor = '#dc3545';
            } else {
                this.style.borderColor = '#28a745';
            }
        });
    </script>
</body>
</html>
