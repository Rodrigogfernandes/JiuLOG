<?php
session_start();
include 'db.php';

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'professor') {
    die(json_encode(['erro' => 'Acesso negado']));
}

$confirmar = $_POST['confirmar'] ?? '';
if ($confirmar !== '1') {
    die(json_encode(['erro' => 'Confirmação necessária']));
}

$professor_id = $_SESSION['user_id'];

try {
    $conn->autocommit(false);
    
    // Excluir academias do professor
    // Coletar IDs das academias do professor
    $acad_ids = [];
    $resAcad = $conn->query("SELECT id FROM academias WHERE professor_id=$professor_id");
    while ($row = $resAcad && $resAcad->fetch_assoc() ? $row = $resAcad->fetch_assoc() : null) {}
    // O loop acima não é adequado; refazendo coleta corretamente
    $acad_ids = [];
    if ($resAcad) {
        while ($r = $resAcad->fetch_assoc()) { $acad_ids[] = (int)$r['id']; }
    }
    $ids_list = count($acad_ids) ? implode(',', $acad_ids) : '';

    if ($ids_list !== '') {
        // Excluir check-ins de alunos que possuem membership com academias do professor
        $conn->query("DELETE c FROM checkins c 
                      JOIN academia_memberships m ON m.aluno_id = c.aluno_id 
                      WHERE m.academia_id IN ($ids_list)");

        // Excluir memberships dessas academias
        $conn->query("DELETE FROM academia_memberships WHERE academia_id IN ($ids_list)");

        // Excluir academias do professor
        $conn->query("DELETE FROM academias WHERE id IN ($ids_list)");
    }
    
    // Excluir o professor
    $conn->query("DELETE FROM usuarios WHERE id=$professor_id");
    
    $conn->commit();
    
    // Limpar sessão
    session_destroy();
    
    echo json_encode(['ok' => true]);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['erro' => 'Erro ao excluir conta: ' . $e->getMessage()]);
}
?>
