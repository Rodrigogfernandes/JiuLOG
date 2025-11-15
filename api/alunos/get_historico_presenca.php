<?php
session_start();
include __DIR__ . '/../config/db.php';

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'professor') {
    die("Acesso negado!");
}

$aluno_id = $_GET['aluno_id'] ?? null;

if (!$aluno_id) {
    die("ID do aluno não fornecido!");
}

// Buscar histórico de check-ins do aluno
$sql = "SELECT c.id, 
               COALESCE(h.nome_aula, 'Check-in Livre') as nome_aula,
               COALESCE(h.dia_semana, '') as dia_semana, 
               COALESCE(h.hora, '') as hora, 
               DATE_FORMAT(c.data_checkin, '%d/%m/%Y') as data,
               c.status,
               c.horario_id
        FROM checkins c
        LEFT JOIN horarios h ON c.horario_id = h.id 
        WHERE c.aluno_id = $aluno_id 
        ORDER BY c.data_checkin DESC, c.id DESC";

$result = $conn->query($sql);

$checkins = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $checkins[] = $row;
    }
}

header('Content-Type: application/json');
echo json_encode(['checkins' => $checkins]);
?>
