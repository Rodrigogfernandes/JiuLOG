-- Esquema mínimo para o projeto JiuLOG
-- Cria database e tabelas básicas necessárias para teste local

CREATE DATABASE IF NOT EXISTS `jiulog` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `jiulog`;

-- tabela de usuários (alunos e professores)
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(120) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `senha` VARCHAR(255) NOT NULL,
  `tipo` ENUM('aluno','professor') NOT NULL DEFAULT 'aluno',
  `faixa` VARCHAR(50) DEFAULT NULL,
  `graus` TINYINT UNSIGNED DEFAULT 0,
  `aulas_faltando` INT DEFAULT 55,
  `foto_path` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_unq` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Adicionar coluna foto_path se não existir
ALTER TABLE `usuarios` ADD COLUMN IF NOT EXISTS `foto_path` VARCHAR(255) DEFAULT NULL;

-- horários de aulas (registro simples)
CREATE TABLE IF NOT EXISTS `horarios` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `descricao` VARCHAR(255) DEFAULT NULL,
  `dia_semana` VARCHAR(20) DEFAULT NULL,
  `hora` TIME DEFAULT NULL,
  `ativo` TINYINT(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- checkins realizados pelos alunos
CREATE TABLE IF NOT EXISTS `checkins` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `aluno_id` INT UNSIGNED NOT NULL,
  `horario_id` INT UNSIGNED DEFAULT NULL,
  `data_checkin` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('pendente','aprovado','reprovado') NOT NULL DEFAULT 'pendente',
  `comentario` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- academias (criada por professor)
CREATE TABLE IF NOT EXISTS `academias` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(150) NOT NULL,
  `logo_path` VARCHAR(255) DEFAULT NULL,
  `professor_id` INT UNSIGNED NOT NULL,
  `criada_em` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `professor_id_idx` (`professor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- associação aluno x academia com confirmação mútua
CREATE TABLE IF NOT EXISTS `academia_memberships` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `aluno_id` INT UNSIGNED NOT NULL,
  `academia_id` INT UNSIGNED NOT NULL,
  `status` ENUM('pending_professor','pending_aluno','approved','rejected','cancelled') NOT NULL DEFAULT 'pending_professor',
  `criada_em` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizada_em` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_active_membership` (`aluno_id`,`academia_id`),
  KEY `academia_id_idx` (`academia_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inserir alguns usuários de exemplo (senha em texto simples para teste: 'senha')
INSERT INTO `usuarios` (`nome`,`email`,`senha`,`tipo`,`faixa`,`graus`,`aulas_faltando`) VALUES
('Aluno Exemplo','aluno@local.test','senha','aluno','Branca',0,55),
('Professor Exemplo','professor@local.test','senha','professor',NULL,0,55)
ON DUPLICATE KEY UPDATE nome=VALUES(nome);

-- Inserir alguns horários de exemplo
INSERT INTO `horarios` (`descricao`,`dia_semana`,`hora`,`ativo`) VALUES
('Aula Matinal','Segunda','08:00:00',1),
('Aula Noturna','Quarta','19:00:00',1)
ON DUPLICATE KEY UPDATE descricao=VALUES(descricao);
