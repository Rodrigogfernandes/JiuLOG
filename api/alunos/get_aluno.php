<?php
session_start();
include __DIR__ . '/../config/db.php';

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'aluno') {
    die(json_encode(['erro' => 'Acesso negado']));
}

$aluno_id = $_SESSION['user_id'];

// Dias da semana
$diasSemana = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
$hoje_num = date('w'); // 0 = domingo, 1 = segunda, ...
$hoje_nome = $diasSemana[$hoje_num];

// Garantir que o contador nunca seja negativo
$conn->query("UPDATE usuarios 
              SET aulas_faltando = 55 
              WHERE id=$aluno_id AND aulas_faltando <= 0");

// Dados do aluno
$res = $conn->query("SELECT nome, email, aulas_faltando, faixa, graus FROM usuarios WHERE id=$aluno_id");
$aluno = $res->fetch_assoc();

// Todos os horários da semana
$horarios_res = $conn->query("SELECT * FROM horarios 
                              ORDER BY FIELD(dia_semana,'Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'), hora ASC");
$horarios = [];
while ($row = $horarios_res->fetch_assoc()) {
    $horarios[] = $row;
}

// Check-ins do aluno (incluindo check-ins livres) - retornar data formatada DD/MM/YYYY
 $checkins_res = $conn->query("SELECT c.id, 
                      COALESCE(h.nome_aula, 'Check-in Livre') as nome_aula,
                      COALESCE(h.dia_semana, '') as dia_semana, 
                      COALESCE(h.hora, '') as hora, 
                      DATE_FORMAT(c.data_checkin, '%d/%m/%Y') as data, 
                      c.status, 
                      c.horario_id
                  FROM checkins c
                  LEFT JOIN horarios h ON c.horario_id = h.id 
                  WHERE c.aluno_id=$aluno_id 
                  ORDER BY c.data_checkin DESC");
$checkins = [];
while ($row = $checkins_res->fetch_assoc()) {
    $checkins[] = $row;
}

// Retornar JSON
// Membership atual (se existir)
$membership = null;
$professor = null;
$mres = $conn->query("SELECT m.id as membership_id, m.status, m.academia_id, a.nome as academia_nome, a.logo_path, a.professor_id
                      FROM academia_memberships m
                      JOIN academias a ON a.id=m.academia_id
                      WHERE m.aluno_id=$aluno_id
                      ORDER BY m.atualizada_em DESC, m.criada_em DESC
                      LIMIT 1");
if ($mres && $mres->num_rows > 0) {
    $membership = $mres->fetch_assoc();
    $professor_id = $membership['professor_id'];
    $pres = $conn->query("SELECT nome FROM usuarios WHERE id=$professor_id");
    if ($pres && $pres->num_rows > 0) {
        $professor = $pres->fetch_assoc();
    }
}

echo json_encode([
    'aluno' => $aluno,
    'horarios' => $horarios,
    'checkins' => $checkins,
    'membership' => $membership,
    'professor' => $professor
]);
?>