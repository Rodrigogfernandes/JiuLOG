<?php
$servername = "localhost";
$username = "root"; // padrão XAMPP
$password = "";     // padrão XAMPP
$dbname = "jiulog";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Conexão falhou: " . $conn->connect_error);
}

/**
 * Cria a pasta individual do usuário em /uploads/user_{id}/
 * Retorna o caminho da pasta se criada com sucesso, ou false em caso de erro
 * 
 * @param int $user_id ID do usuário
 * @return string|false Caminho da pasta criada ou false em caso de erro
 */
function criarPastaUsuario($user_id) {
    $uploadBaseDir = __DIR__ . '/../../public/uploads';
    
    // Garantir que a pasta uploads existe
    if (!is_dir($uploadBaseDir)) {
        @mkdir($uploadBaseDir, 0777, true);
    }
    
    // Criar pasta do usuário: user_{id}
    $userDir = $uploadBaseDir . '/user_' . intval($user_id);
    
    if (!is_dir($userDir)) {
        if (@mkdir($userDir, 0777, true)) {
            return 'public/uploads/user_' . intval($user_id);
        } else {
            return false;
        }
    }
    
    // Pasta já existe, retornar o caminho
    return 'public/uploads/user_' . intval($user_id);
}

/**
 * Retorna o caminho da pasta do usuário (sem criar se não existir)
 * 
 * @param int $user_id ID do usuário
 * @return string Caminho da pasta do usuário
 */
function getPastaUsuario($user_id) {
    return 'public/uploads/user_' . intval($user_id);
}

/**
 * Exclui a pasta individual do usuário e todo seu conteúdo
 * 
 * @param int $user_id ID do usuário
 * @return bool True se a pasta foi excluída com sucesso, false caso contrário
 */
function excluirPastaUsuario($user_id) {
    $userDir = __DIR__ . '/../../public/uploads/user_' . intval($user_id);
    
    // Se a pasta não existe, considerar sucesso (não há nada para excluir)
    if (!is_dir($userDir)) {
        return true;
    }
    
    // Função recursiva para excluir diretório e conteúdo
    function deleteDirectory($dir) {
        if (!is_dir($dir)) {
            return false;
        }
        
        $files = array_diff(scandir($dir), array('.', '..'));
        
        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            if (is_dir($path)) {
                deleteDirectory($path);
            } else {
                @unlink($path);
            }
        }
        
        return @rmdir($dir);
    }
    
    return deleteDirectory($userDir);
}
?>