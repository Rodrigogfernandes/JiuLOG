<?php
session_start();
include 'db.php';

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'professor') {
    die(json_encode(['ok' => false, 'message' => 'Acesso negado!']));
}

$aluno_id = $_POST['aluno_id'] ?? null;

if (!$aluno_id) {
    die(json_encode(['ok' => false, 'message' => 'ID do aluno não fornecido!']));
}

try {
    // Pega dados do aluno
    $aluno_res = $conn->query("SELECT faixa, graus FROM usuarios WHERE id=$aluno_id");
    $aluno = $aluno_res->fetch_assoc();

    $nova_aulas = 55;
    $nova_graus = $aluno['graus'] + 1;
    $nova_faixa = $aluno['faixa'];

    // Progressão de faixas (quando atingir 4 graus, sobe faixa)
    $ordem_faixas = ['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'];
    if ($nova_graus >= 4) {
        $nova_graus = 1;
        $pos = array_search($aluno['faixa'], $ordem_faixas);
        if ($pos !== false && $pos < count($ordem_faixas) - 1) {
            $nova_faixa = $ordem_faixas[$pos + 1];
        }
    }

    // Atualiza no banco
    $conn->query("UPDATE usuarios
                  SET aulas_faltando=$nova_aulas,
                      graus=$nova_graus,
                      faixa='$nova_faixa'
                  WHERE id=$aluno_id");

    header('Content-Type: application/json');
    echo json_encode([
        'ok' => true,
        'message' => 'Faixa avançada com sucesso!',
        'nova_faixa' => $nova_faixa,
        'novos_graus' => $nova_graus,
        'novas_aulas' => $nova_aulas
    ]);
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode([
        'ok' => false,
        'message' => 'Erro ao avançar faixa: ' . $e->getMessage()
    ]);
}
?>