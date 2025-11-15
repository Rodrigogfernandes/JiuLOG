<?php
/**
 * Funções auxiliares para padronizar respostas da API
 */

/**
 * Envia resposta JSON padronizada de sucesso
 * 
 * @param mixed $data Dados a serem retornados
 * @param string $message Mensagem opcional
 * @param int $statusCode Código de status HTTP (padrão: 200)
 */
function json_success($data = null, $message = null, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    
    $response = ['success' => true];
    
    if ($message !== null) {
        $response['message'] = $message;
    }
    
    if ($data !== null) {
        if (is_array($data) && isset($data['success'])) {
            // Se $data já contém 'success', mesclar
            $response = array_merge($response, $data);
        } else {
            $response['data'] = $data;
        }
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Envia resposta JSON padronizada de erro
 * 
 * @param string $message Mensagem de erro
 * @param int $statusCode Código de status HTTP (padrão: 400)
 * @param mixed $errors Erros adicionais (opcional)
 */
function json_error($message, $statusCode = 400, $errors = null) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    
    $response = [
        'success' => false,
        'error' => $message
    ];
    
    // Compatibilidade com formato antigo
    $response['erro'] = $message;
    
    if ($errors !== null) {
        $response['errors'] = $errors;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Verifica se o usuário está autenticado
 * 
 * @param string|null $tipoRequerido Tipo de usuário requerido ('aluno' ou 'professor')
 * @return array Dados do usuário autenticado
 * @throws Exception Se não autenticado
 */
function require_auth($tipoRequerido = null) {
    session_start();
    
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['tipo'])) {
        json_error('Acesso negado. Faça login primeiro.', 401);
    }
    
    if ($tipoRequerido !== null && $_SESSION['tipo'] !== $tipoRequerido) {
        json_error('Acesso negado. Permissão insuficiente.', 403);
    }
    
    return [
        'user_id' => $_SESSION['user_id'],
        'tipo' => $_SESSION['tipo']
    ];
}

/**
 * Verifica se a requisição é AJAX
 * 
 * @return bool
 */
function is_ajax() {
    return !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
           strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
}

/**
 * Obtém dados do POST sanitizados
 * 
 * @param string $key Chave do POST
 * @param mixed $default Valor padrão se não existir
 * @param bool $required Se true, retorna erro se não existir
 * @return mixed
 */
function get_post($key, $default = null, $required = false) {
    if (!isset($_POST[$key])) {
        if ($required) {
            json_error("Campo obrigatório não fornecido: $key", 400);
        }
        return $default;
    }
    
    $value = $_POST[$key];
    
    // Sanitização básica
    if (is_string($value)) {
        return trim($value);
    }
    
    return $value;
}

/**
 * Obtém parâmetro GET sanitizado
 * 
 * @param string $key Chave do GET
 * @param mixed $default Valor padrão se não existir
 * @param bool $required Se true, retorna erro se não existir
 * @return mixed
 */
function get_get($key, $default = null, $required = false) {
    if (!isset($_GET[$key])) {
        if ($required) {
            json_error("Parâmetro obrigatório não fornecido: $key", 400);
        }
        return $default;
    }
    
    $value = $_GET[$key];
    
    // Sanitização básica
    if (is_string($value)) {
        return trim($value);
    }
    
    return $value;
}

/**
 * Redireciona para uma URL
 * 
 * @param string $url URL para redirecionar
 * @param int $statusCode Código de status HTTP (padrão: 302)
 */
function redirect($url, $statusCode = 302) {
    http_response_code($statusCode);
    header("Location: $url");
    exit;
}

