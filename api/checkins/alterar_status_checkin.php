<?php
session_start();
include __DIR__ . '/../config/db.php';

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'professor') {
    die(json_encode(['ok' => false, 'message' => 'Acesso negado!']));
}

$checkin_id = $_POST['checkin_id'] ?? null;
$status = $_POST['status'] ?? null;

if (!$checkin_id || !$status) {
    die(json_encode(['ok' => false, 'message' => 'Dados incompletos!']));
}

// Validar status
$statuses_validos = ['pendente', 'aprovado', 'reprovado'];
if (!in_array($status, $statuses_validos)) {
    die(json_encode(['ok' => false, 'message' => 'Status inválido!']));
}

// Verificar se o check-in existe
$check_checkin = $conn->query("SELECT id FROM checkins WHERE id = $checkin_id");
if (!$check_checkin || $check_checkin->num_rows === 0) {
    die(json_encode(['ok' => false, 'message' => 'Check-in não encontrado!']));
}

try {
    // Atualizar status do check-in
    $sql = "UPDATE checkins SET status = '$status' WHERE id = $checkin_id";

    if ($conn->query($sql)) {
        $response = [
            'ok' => true,
            'message' => 'Status atualizado com sucesso!',
            'status' => $status
        ];

        // Se aprovado, atualizar progresso do aluno
        if ($status == 'aprovado') {
            // Descobrir qual aluno fez o check-in
            $res = $conn->query("SELECT aluno_id FROM checkins WHERE id=$checkin_id");
            if ($res && $res->num_rows > 0) {
                $aluno_id = $res->fetch_assoc()['aluno_id'];

                // Diminuir em 1 no momento da aprovação
                $conn->query("UPDATE usuarios SET aulas_faltando = aulas_faltando - 1 WHERE id=$aluno_id");

                // Pega dados do aluno para verificar se zerou aulas_faltando
                $aluno_res = $conn->query("SELECT aulas_faltando FROM usuarios WHERE id=$aluno_id");
                $aluno = $aluno_res->fetch_assoc();

                // Se zerou aulas_faltando, marcar para decisão de avanço
                if ($aluno['aulas_faltando'] <= 0) {
                    $response['needs_advance_decision'] = true;
                    $response['aluno_id'] = $aluno_id;
                }
            }
        }

        header('Content-Type: application/json');
        echo json_encode($response);
    } else {
        throw new Exception('Erro ao atualizar status: ' . $conn->error);
    }
    
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode([
        'ok' => false, 
        'message' => $e->getMessage()
    ]);
}
?>
