<?php
session_start();
include 'db.php';

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'professor') {
    die(json_encode(['erro' => 'Acesso negado']));
}

$professor_id = $_SESSION['user_id'];

// Dados do professor
$prof = $conn->query("SELECT id,nome,email FROM usuarios WHERE id=$professor_id")->fetch_assoc();

// Academias do professor
$academias = [];
$res = $conn->query("SELECT id,nome,logo_path FROM academias WHERE professor_id=$professor_id ORDER BY criada_em DESC");
while ($row = $res->fetch_assoc()) { $academias[] = $row; }

// Horários ativos
$horarios = [];
$res2 = $conn->query("SELECT * 
                      FROM horarios 
                      ORDER BY FIELD(dia_semana,'Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'), hora ASC");
while ($row = $res2->fetch_assoc()) $horarios[] = $row;

// Check-ins pendentes (incluindo check-ins livres)
$checkins = [];
$sql = "SELECT c.id, 
               u.nome as aluno_nome, 
               COALESCE(h.nome_aula, 'Check-in Livre') as nome_aula, 
               COALESCE(h.hora, '') as hora, 
               COALESCE(h.dia_semana, '') as dia_semana, 
               c.data_checkin as data,
               c.horario_id
        FROM checkins c
        JOIN usuarios u ON c.aluno_id=u.id
        LEFT JOIN horarios h ON c.horario_id=h.id
        WHERE c.status='pendente'
        ORDER BY c.data_checkin ASC";
$res3 = $conn->query($sql);
while ($row = $res3->fetch_assoc()) $checkins[] = $row;

// Lista de alunos
$alunos = [];
$res4 = $conn->query("SELECT id, nome, faixa, graus 
                      FROM usuarios 
                      WHERE tipo='aluno' 
                      ORDER BY nome ASC");
while ($row = $res4->fetch_assoc()) $alunos[] = $row;

// Solicitações de vínculo pendentes para o professor
$solicitacoes = [];
$q = "SELECT m.id AS membership_id,
             m.aluno_id,
             u.nome AS aluno_nome,
             m.academia_id,
             a.nome AS academia_nome,
             m.status,
             m.criada_em
      FROM academia_memberships m
      JOIN academias a ON a.id = m.academia_id
      JOIN usuarios u ON u.id = m.aluno_id
      WHERE a.professor_id = $professor_id AND m.status = 'pending_professor'
      ORDER BY m.criada_em ASC";
$rsol = $conn->query($q);
while ($row = $rsol->fetch_assoc()) $solicitacoes[] = $row;

// Retorno JSON
echo json_encode([
    'professor' => $prof,
    'academias' => $academias,
    'user' => $prof, // compatibilidade
    'horarios' => $horarios,
    'checkins' => $checkins,
    'alunos' => $alunos,
    'solicitacoes' => $solicitacoes
]);
?>