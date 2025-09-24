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
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_unq` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  `usuario_id` INT UNSIGNED NOT NULL,
  `horario_id` INT UNSIGNED DEFAULT NULL,
  `data` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('pendente','aprovado','reprovado') NOT NULL DEFAULT 'pendente',
  `comentario` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inserir alguns usuários de exemplo (senha em texto simples para teste: 'senha')
INSERT INTO `usuarios` (`nome`,`email`,`senha`,`tipo`,`faixa`) VALUES
('Aluno Exemplo','aluno@local.test','senha','aluno','Branca'),
('Professor Exemplo','professor@local.test','senha','professor',NULL)
ON DUPLICATE KEY UPDATE nome=VALUES(nome);

-- Inserir alguns horários de exemplo
INSERT INTO `horarios` (`descricao`,`dia_semana`,`hora`,`ativo`) VALUES
('Aula Matinal','Segunda','08:00:00',1),
('Aula Noturna','Quarta','19:00:00',1)
ON DUPLICATE KEY UPDATE descricao=VALUES(descricao);
