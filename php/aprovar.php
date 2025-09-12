<?php
session_start();
include 'db.php';

if ($_SESSION['tipo'] != 'professor') die("Acesso negado");

$checkin_id = $_POST['checkin_id'];
$acao = $_POST['acao']; // aprovar ou reprovar

$status = $acao == 'aprovar' ? 'aprovado' : 'reprovado';

// Atualiza o status do check-in
$conn->query("UPDATE checkins SET status='$status' WHERE id=$checkin_id");

// Se for aprovado, diminui aulas_faltando
if ($status == 'aprovado') {
    // Descobrir qual aluno fez o check-in
    $res = $conn->query("SELECT aluno_id FROM checkins WHERE id=$checkin_id");
    if ($res && $res->num_rows > 0) {
        $aluno_id = $res->fetch_assoc()['aluno_id'];

        // Diminui em 1
        $conn->query("UPDATE usuarios 
                      SET aulas_faltando = aulas_faltando - 1 
                      WHERE id=$aluno_id");

        // Reseta para 55 se chegou em 0
        $conn->query("UPDATE usuarios 
                      SET aulas_faltando = 55 
                      WHERE id=$aluno_id AND aulas_faltando <= 0");
    }
}

header("Location: ../professor.html");
exit;
?>