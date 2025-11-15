<?php
// Simple DB upgrade helper to align schema with latest code
// Visit this file once in the browser: http://localhost/JiuLOG/php/upgrade_schema.php
// It is safe to re-run; operations are conditional.

include __DIR__ . '/../config/db.php';

function columnExists($conn, $table, $column) {
    $tableEsc = $conn->real_escape_string($table);
    $columnEsc = $conn->real_escape_string($column);
    $db = $conn->query('SELECT DATABASE() as db')->fetch_assoc()['db'];
    $dbEsc = $conn->real_escape_string($db);
    $sql = "SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='{$dbEsc}' AND TABLE_NAME='{$tableEsc}' AND COLUMN_NAME='{$columnEsc}' LIMIT 1";
    $res = $conn->query($sql);
    return $res && $res->num_rows > 0;
}

function tableExists($conn, $table) {
    $tableEsc = $conn->real_escape_string($table);
    $db = $conn->query('SELECT DATABASE() as db')->fetch_assoc()['db'];
    $dbEsc = $conn->real_escape_string($db);
    $sql = "SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA='{$dbEsc}' AND TABLE_NAME='{$tableEsc}' LIMIT 1";
    $res = $conn->query($sql);
    return $res && $res->num_rows > 0;
}

$messages = [];

// Ensure usuarios columns
if (!columnExists($conn, 'usuarios', 'graus')) {
    $conn->query("ALTER TABLE usuarios ADD COLUMN graus TINYINT UNSIGNED DEFAULT 0");
    $messages[] = "Added usuarios.graus";
}
if (!columnExists($conn, 'usuarios', 'apelido')) {
    $conn->query("ALTER TABLE usuarios ADD COLUMN apelido VARCHAR(100) DEFAULT NULL");
    $messages[] = "Added usuarios.apelido";
}
if (!columnExists($conn, 'usuarios', 'aulas_faltando')) {
    $conn->query("ALTER TABLE usuarios ADD COLUMN aulas_faltando INT DEFAULT 55");
    $messages[] = "Added usuarios.aulas_faltando";
}

// Ensure checkins columns renamed/created
if (tableExists($conn, 'checkins')) {
    // aluno_id
    if (!columnExists($conn, 'checkins', 'aluno_id')) {
        if (columnExists($conn, 'checkins', 'usuario_id')) {
            // Try rename if supported
            @$conn->query("ALTER TABLE checkins CHANGE COLUMN usuario_id aluno_id INT UNSIGNED NOT NULL");
            if (!columnExists($conn, 'checkins', 'aluno_id')) {
                // Fallback: add column and try to copy
                $conn->query("ALTER TABLE checkins ADD COLUMN aluno_id INT UNSIGNED NOT NULL AFTER id");
                if (columnExists($conn, 'checkins', 'usuario_id')) {
                    $conn->query("UPDATE checkins SET aluno_id = usuario_id WHERE aluno_id IS NULL OR aluno_id=0");
                }
            }
        } else {
            $conn->query("ALTER TABLE checkins ADD COLUMN aluno_id INT UNSIGNED NOT NULL AFTER id");
        }
        $messages[] = "Ensured checkins.aluno_id";
    }
    // data_checkin
    if (!columnExists($conn, 'checkins', 'data_checkin')) {
        if (columnExists($conn, 'checkins', 'data')) {
            @$conn->query("ALTER TABLE checkins CHANGE COLUMN data data_checkin DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP");
            if (!columnExists($conn, 'checkins', 'data_checkin')) {
                $conn->query("ALTER TABLE checkins ADD COLUMN data_checkin DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER horario_id");
                if (columnExists($conn, 'checkins', 'data')) {
                    $conn->query("UPDATE checkins SET data_checkin = data WHERE data_checkin IS NULL");
                }
            }
        } else {
            $conn->query("ALTER TABLE checkins ADD COLUMN data_checkin DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER horario_id");
        }
        $messages[] = "Ensured checkins.data_checkin";
    }
}

// Ensure academias table
if (!tableExists($conn, 'academias')) {
    $conn->query("CREATE TABLE academias (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        nome VARCHAR(150) NOT NULL,
        logo_path VARCHAR(255) DEFAULT NULL,
        professor_id INT UNSIGNED NOT NULL,
        criada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY professor_id_idx (professor_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $messages[] = "Created academias";
}

// Ensure academia_memberships table
if (!tableExists($conn, 'academia_memberships')) {
    $conn->query("CREATE TABLE academia_memberships (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        aluno_id INT UNSIGNED NOT NULL,
        academia_id INT UNSIGNED NOT NULL,
        status ENUM('pending_professor','pending_aluno','approved','rejected','cancelled') NOT NULL DEFAULT 'pending_professor',
        criada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        atualizada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uniq_active_membership (aluno_id, academia_id),
        KEY academia_id_idx (academia_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $messages[] = "Created academia_memberships";
}

header('Content-Type: text/plain; charset=utf-8');
echo "Upgrade completed.\n";
if (!$messages) {
    echo "No changes were necessary.";
} else {
    foreach ($messages as $m) echo "- $m\n";
}
?>


