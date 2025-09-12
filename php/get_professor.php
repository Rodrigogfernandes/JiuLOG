<?php
session_start();
include 'db.php';

if($_SESSION['tipo'] != 'professor') die(json_encode(['erro'=>'Acesso negado']));

$user_id = $_SESSION['user_id'];
$res = $conn->query("SELECT nome FROM usuarios WHERE id=$user_id");
$user = $res->fetch_assoc();

$horarios = [];
$res2 = $conn->query("SELECT * FROM horarios WHERE ativa=1 ORDER BY FIELD(dia_semana,'Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'), hora ASC");
while($row = $res2->fetch_assoc()) $horarios[] = $row;

$checkins = [];
$sql = "SELECT c.id,u.nome as aluno_nome,h.nome_aula,h.hora,h.dia_semana,c.data
        FROM checkins c
        JOIN usuarios u ON c.aluno_id=u.id
        JOIN horarios h ON c.horario_id=h.id
        WHERE c.status='pendente'
        ORDER BY c.data ASC";
$res3 = $conn->query($sql);
while($row = $res3->fetch_assoc()) $checkins[] = $row;

echo json_encode(['user'=>$user,'horarios'=>$horarios,'checkins'=>$checkins]);
?>