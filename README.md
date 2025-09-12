# JiuLOG
## Sistema de Check-in para Academia de Jiu-Jitsu

[![PHP](https://img.shields.io/badge/PHP-8.0-blue)](https://www.php.net/)  
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)](https://www.mysql.com/)  
[![HTML5](https://img.shields.io/badge/HTML5-orange)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)  
[![CSS3](https://img.shields.io/badge/CSS3-blue)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)  
[![JavaScript](https://img.shields.io/badge/JavaScript-yellow)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)

**JiuLOG** é um sistema funcional para controle de presenças em academias de Jiu-Jitsu, permitindo check-ins de alunos, aprovação pelo professor e controle de aulas e graduação.

---

## Funcionalidades

- **Tela inicial:** [index.html](index.html) – escolha entre login de aluno ou professor.  
- **Login e Cadastro:**  
  - Aluno: [login_aluno.html](login_aluno.html) | [cadastro_aluno.html](cadastro_aluno.html)  
  - Professor: [login_professor.html](login_professor.html) | [cadastro_professor.html](cadastro_professor.html)  
- **Dashboard do Aluno:** [dashboard_aluno.html](dashboard_aluno.html)  
  - Exibe nome do usuário logado  
  - Mostra aulas restantes para a próxima graduação  
  - Lista horários disponíveis para check-in (hoje e amanhã)  
  - Lista check-ins realizados com status  
  - Logout  
- **Dashboard do Professor:** [professor.html](professor.html)  
  - Exibe nome do professor logado  
  - Adicionar/remover horários fixos de aulas  
  - Aprovar ou reprovar check-ins pendentes  
  - Logout  

---

## Banco de Dados

- Tabelas: `usuarios`, `horarios`, `checkins`  
- Scripts PHP: login, cadastro, check-in, gerenciamento de aulas, aprovação, logout, APIs (`get_aluno.php`, `get_professor.php`)  

---

## Tecnologias

- Frontend: HTML, CSS, JavaScript (responsivo)  
- Backend: PHP com MySQL (via XAMPP)  

---

## Como rodar localmente

1. Instale o [XAMPP](https://www.apachefriends.org/pt_br/index.html) e inicie **Apache** e **MySQL**.  
2. Coloque a pasta do projeto dentro de `C:\xampp\htdocs\` (Windows) ou `/Applications/XAMPP/htdocs/` (Mac).  
3. Acesse `http://localhost/JiuLOG/index.html` no navegador.  
4. Crie o banco de dados `jiulog` no **phpMyAdmin** e importe as tabelas (`usuarios`, `horarios`, `checkins`).  
5. Ajuste `php/db.php` com seu usuário e senha do MySQL.  

---

## Observações

- O projeto é responsivo e compatível com dispositivos móveis.  
- Todos os dashboards usam HTML puro com JavaScript consumindo dados via PHP.  
- Botões de logout e navegação estão implementados em todas as páginas.  

---