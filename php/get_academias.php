<?php
include 'db.php';

$academias = [];
$res = $conn->query("SELECT a.id, a.nome, a.logo_path, u.nome as professor_nome FROM academias a JOIN usuarios u ON u.id=a.professor_id ORDER BY a.nome ASC");
while ($row = $res->fetch_assoc()) { $academias[] = $row; }

echo json_encode(['academias' => $academias]);
?>


