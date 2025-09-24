-- Script SQL para criar o banco de dados JiuLOG
-- Execute este script no phpMyAdmin ou MySQL Workbench

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS jiulog;
USE jiulog;

-- Tabela de usuários (alunos e professores)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('aluno', 'professor') NOT NULL,
    faixa VARCHAR(50) DEFAULT 'Branca',
    graus INT DEFAULT 0,
    aulas_faltando INT DEFAULT 55,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de horários de aulas
CREATE TABLE IF NOT EXISTS horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_aula VARCHAR(255) NOT NULL,
    dia_semana VARCHAR(20) NOT NULL,
    hora TIME NOT NULL,
    professor_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (professor_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de check-ins
CREATE TABLE IF NOT EXISTS checkins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    horario_id INT NOT NULL,
    data_checkin DATE NOT NULL,
    status ENUM('pendente', 'aprovado', 'reprovado') DEFAULT 'pendente',
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (horario_id) REFERENCES horarios(id) ON DELETE CASCADE
);

-- Inserir dados de exemplo para teste
-- Professor de exemplo
INSERT INTO usuarios (nome, email, senha, tipo, aulas_faltando) 
VALUES ('Professor Silva', 'professor@jiulog.com', '123456', 'professor', 0);

-- Aluno de exemplo
INSERT INTO usuarios (nome, email, senha, tipo, faixa, graus, aulas_faltando) 
VALUES ('João Aluno', 'aluno@jiulog.com', '123456', 'aluno', 'Branca', 0, 55);

-- Horários de exemplo
INSERT INTO horarios (nome_aula, dia_semana, hora, professor_id) VALUES
('Aula das 7:00', 'Segunda', '07:00:00', 1),
('Aula das 19:00', 'Segunda', '19:00:00', 1),
('Aula das 7:00', 'Quarta', '07:00:00', 1),
('Aula das 19:00', 'Quarta', '19:00:00', 1),
('Aula das 7:00', 'Sexta', '07:00:00', 1),
('Aula das 19:00', 'Sexta', '19:00:00', 1);

-- Verificar se as tabelas foram criadas
SHOW TABLES;

-- Verificar dados inseridos
SELECT * FROM usuarios;
SELECT * FROM horarios;
