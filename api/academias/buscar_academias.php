<?php
include __DIR__ . '/../config/db.php';

$query = isset($_GET['q']) ? trim($_GET['q']) : '';

if (empty($query)) {
    echo json_encode(['academias' => []]);
    exit;
}

$searchTerm = $conn->real_escape_string($query);
$academias = [];

$sql = "SELECT a.id, a.nome, a.logo_path, u.nome as professor_nome 
        FROM academias a 
        JOIN usuarios u ON u.id=a.professor_id 
        WHERE a.nome LIKE '%$searchTerm%' 
        ORDER BY a.nome ASC 
        LIMIT 10";

$res = $conn->query($sql);
while ($row = $res->fetch_assoc()) {
    $academias[] = $row;
}

echo json_encode(['academias' => $academias]);
?>

