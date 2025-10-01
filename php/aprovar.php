<?php
session_start();
include 'db.php';

if ($_SESSION['tipo'] != 'professor') die("Acesso negado");

$checkin_id = $_POST['checkin_id'];
$acao = $_POST['acao']; // aprovar ou reprovar

$status = $acao == 'aprovar' ? 'aprovado' : 'reprovado';

// Atualiza o status do check-in
$conn->query("UPDATE checkins SET status='$status' WHERE id=$checkin_id");

// Se for aprovado, atualiza progresso do aluno
if ($status == 'aprovado') {
    // Descobrir qual aluno fez o check-in
    $res = $conn->query("SELECT aluno_id FROM checkins WHERE id=$checkin_id");
    if ($res && $res->num_rows > 0) {
        $aluno_id = $res->fetch_assoc()['aluno_id'];

        // Diminui em 1 no momento da aprovação
        $conn->query("UPDATE usuarios SET aulas_faltando = aulas_faltando - 1 WHERE id=$aluno_id");

        // Pega dados do aluno para verificar progressão
        $aluno_res = $conn->query("SELECT faixa, graus, aulas_faltando 
                                   FROM usuarios WHERE id=$aluno_id");
        $aluno = $aluno_res->fetch_assoc();

        // Se zerou aulas_faltando, faz reset + progressão
        if ($aluno['aulas_faltando'] <= 0) {
            $nova_aulas = 55;
            $nova_graus = $aluno['graus'] + 1;
            $nova_faixa = $aluno['faixa'];

            // Progressão de faixas (quando atingir 4 graus, sobe faixa)
            $ordem_faixas = ['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'];
            if ($nova_graus >= 4) {
                $nova_graus = 0;
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
        }
    }
}

header("Location: ../professor.html");
exit;
?>