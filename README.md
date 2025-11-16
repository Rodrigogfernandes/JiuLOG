<div align="center">

<h1>JiuLOG - Sistema de Gestão para Academia de Jiu-Jitsu</h1>

![Imagem](assets/images/image.gif)


[![PHP](https://img.shields.io/badge/PHP-8.0+-blue)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue)](https://www.mysql.com/)
[![HTML5](https://img.shields.io/badge/HTML5-orange)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-blue)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)


[![rodrigodev.net](https://img.shields.io/badge/rodrigodev.net-gree?style=for-the-badge&logo=rodrigodev&logoColor=white)](https://www.rodrigodev.net/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Rodrigogfernandes)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rodrigogfernandes/)
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/rodrigogfernandes1/)

</div>

**JiuLOG** é um sistema completo de gestão para academias de Jiu-Jitsu, oferecendo controle de presenças, gerenciamento de alunos, professores e academias, com interface responsiva e moderna.

---

## 📋 Sumário

- [Funcionalidades](#-funcionalidades)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Páginas do Sistema](#-páginas-do-sistema)
- [Banco de Dados](#-banco-de-dados)
- [APIs e Endpoints](#-apis-e-endpoints)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Como Usar](#-como-usar)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura de Arquivos](#-estrutura-de-arquivos)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

---

## 🚀 Funcionalidades

### Para Alunos
- ✅ **Check-in de presença** em aulas agendadas ou check-in livre
- 📊 **Acompanhamento de progresso** (aulas restantes para graduação)
- 📅 **Visualização de horários** de treino disponíveis
- 📚 **Histórico completo** de presenças
- 🏢 **Vinculação com academias** e troca de academia
- 👤 **Gerenciamento de conta** (perfil, senha)

### Para Professores
- ✅ **Aprovação/reprovação** de check-ins pendentes
- 📅 **Gerenciamento de horários** de aulas
- 👥 **Gerenciamento de alunos** da academia
- 🏢 **Administração de academia** (nome, logo)
- 📊 **Dashboard completo** com estatísticas
- 🔗 **Sistema de vínculos** aluno-academia

### Sistema Geral
- 🔐 **Autenticação segura** com sessões PHP
- 📱 **Interface responsiva** para desktop e mobile
- 🎨 **Design moderno** com animações e efeitos visuais
- ⚡ **Performance otimizada** com carregamento assíncrono
- 🛡️ **Validação de dados** em frontend e backend

---

## 🏗️ Estrutura do Projeto

```
jiulog/
├── 📁 public/              # Arquivos públicos acessíveis
│   ├── 📁 auth/            # Páginas de autenticação
│   ├── 📁 dashboard/       # Dashboards do sistema
│   ├── 📁 css/             # Folhas de estilo
│   ├── 📁 js/              # Scripts JavaScript
│   ├── 📁 uploads/         # Arquivos enviados
├── 📄 index.html           # Página inicial (raiz)
├── 📁 api/                 # Backend PHP (API)
│   ├── 📁 config/          # Configurações (db.php)
│   ├── 📁 auth/            # Autenticação
│   ├── 📁 alunos/          # Gerenciamento de alunos
│   ├── 📁 professores/     # Gerenciamento de professores
│   ├── 📁 academias/       # Gerenciamento de academias
│   ├── 📁 checkins/        # Gerenciamento de check-ins
│   └── 📁 horarios/        # Gerenciamento de horários
├── 📁 assets/              # Recursos estáticos (imagens, favicons)
├── 📁 config/              # Arquivos de configuração (SQL)
├── 📁 docs/                # Documentação
├── 📁 scripts/             # Scripts de automação
├── 📄 README.md            # Esta documentação
└── 📄 LICENSE              # Licença MIT
```

---

## 📄 Páginas do Sistema

### 1. **Página Inicial** (`index.html`)
- **Descrição**: Tela de boas-vindas com seleção de tipo de usuário
- **Funcionalidades**:
  - Botão "Sou Aluno" → redireciona para login do aluno
  - Botão "Sou Professor" → redireciona para login do professor
  - Efeitos visuais com partículas flutuantes
- **Design**: Interface clean e moderna com animações

### 2. **Sistema de Autenticação**

#### **Login do Aluno** (`login_aluno.html`)
- **Campos**: Email e senha
- **Funcionalidades**:
  - Validação de credenciais
  - Link para cadastro
  - Recuperação de senha (placeholder)
- **Redirecionamento**: Dashboard do aluno após login

#### **Cadastro do Aluno** (`cadastro_aluno.html`)
- **Campos**: Nome, email, senha, confirmação de senha, seleção de academia
- **Funcionalidades**:
  - Validação em tempo real
  - Verificação de email único
  - Seleção de academia existente
  - Criação automática de vínculo pendente

#### **Login do Professor** (`login_professor.html`)
- **Campos**: Email e senha
- **Funcionalidades**: Similar ao login do aluno
- **Redirecionamento**: Dashboard do professor

#### **Cadastro do Professor** (`cadastro_professor.html`)
- **Campos**: Nome, email, senha, nome da academia, logo (opcional)
- **Funcionalidades**:
  - Criação automática da academia
  - Upload de logo
  - Validações completas

### 3. **Dashboard do Aluno** (`dashboard_aluno.html`)

#### **Aba Horários** (Padrão)
- **Status das Aulas**: Mostra aulas restantes para graduação
- **Horários de Treino**: Lista aulas disponíveis para check-in
- **Check-in Livre**: Botão para marcar presença sem aula específica

#### **Aba Histórico**
- **Histórico de Presença**: Lista completa de check-ins realizados
- **Status Visual**: Aprovado/Reprovado/Pendente com ícones
- **Filtros**: Por data e status

#### **Aba Minha Academia**
- **Informações da Academia**: Nome, professor, logo
- **Troca de Academia**: Selecionar e solicitar mudança
- **Status do Vínculo**: Pendente/Aprovado/Rejeitado

#### **Aba Conta**
- **Informações Pessoais**: Nome, email, academia
- **Alteração de Dados**: Editar perfil e senha
- **Logout**: Encerrar sessão

### 4. **Dashboard do Professor** (`professor.html`)

#### **Aba Check-ins** (Padrão)
- **Check-ins Pendentes**: Lista de presenças aguardando aprovação
- **Ações**: Botões Aceitar/Rejeitar para cada check-in
- **Informações**: Aluno, aula, data, horário

#### **Aba Alunos**
- **Busca de Alunos**: Campo de pesquisa por nome/email
- **Tabela de Alunos**: Lista alunos vinculados à academia
- **Gerenciamento**: Editar aluno, remover vínculo, ver histórico
- **Seleção**: Clique simples para abrir card do aluno

#### **Aba Solicitações**
- **Solicitações Pendentes**: Alunos solicitando vínculo
- **Ações**: Aprovar/Rejeitar solicitações
- **Informações**: Nome do aluno, academia solicitada

#### **Aba Minha Conta**
- **Perfil do Professor**: Nome, apelido, email
- **Academia**: Nome e logo
- **Alterações**: Editar dados e senha
- **Exclusão**: Opção de excluir conta (com confirmações)

---

## 🗄️ Banco de Dados

### Tabelas Principais

#### **`usuarios`**
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- nome (VARCHAR 120)
- email (VARCHAR 150, UNIQUE)
- senha (VARCHAR 255) -- Hash SHA256 ou similar
- tipo (ENUM: 'aluno', 'professor')
- faixa (VARCHAR 50, DEFAULT 'Branca')
- graus (TINYINT UNSIGNED, DEFAULT 0)
- aulas_faltando (INT, DEFAULT 55)
- foto_path (VARCHAR 255, NULL)
- apelido (VARCHAR 100, NULL)
- created_at (TIMESTAMP)
```

#### **`horarios`**
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- nome_aula (VARCHAR 255)
- dia_semana (VARCHAR 20)
- hora (TIME)
- professor_id (INT, NULL, FK → usuarios.id)
- created_at (TIMESTAMP)
```

#### **`checkins`**
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- aluno_id (INT, NOT NULL, FK → usuarios.id)
- horario_id (INT, NULL, FK → horarios.id)
- data_checkin (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- status (ENUM: 'pendente', 'aprovado', 'reprovado')
- comentario (TEXT, NULL)
- created_at (TIMESTAMP)
```

#### **`academias`**
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- nome (VARCHAR 150)
- logo_path (VARCHAR 255, NULL)
- professor_id (INT, NOT NULL, FK → usuarios.id)
- criada_em (DATETIME, DEFAULT CURRENT_TIMESTAMP)
```

#### **`academia_memberships`**
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- aluno_id (INT, NOT NULL, FK → usuarios.id)
- academia_id (INT, NOT NULL, FK → academias.id)
- status (ENUM: 'pending_professor', 'pending_aluno', 'approved', 'rejected', 'cancelled')
- criada_em (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- atualizada_em (DATETIME, DEFAULT CURRENT_TIMESTAMP ON UPDATE)
```

### Relacionamentos
- **Professor → Academia**: 1:N (um professor pode ter múltiplas academias)
- **Academia → Aluno**: N:M (via tabela `academia_memberships`)
- **Professor → Horário**: 1:N
- **Horário → Check-in**: 1:N
- **Aluno → Check-in**: 1:N

### Setup Automatizado do Banco

O projeto inclui um script automatizado para criação e configuração do banco de dados:

**`setup_db.bat`** - Script Windows para criar/atualizar o banco de dados automaticamente

**Uso:**
```bash
# Método mais simples (usa padrões do XAMPP)
setup_db.bat

# Com credenciais personalizadas
setup_db.bat [usuario] [senha] [host]

# Exemplos:
setup_db.bat                    # root, sem senha, localhost
setup_db.bat root "" 127.0.0.1  # root, sem senha, 127.0.0.1
setup_db.bat root minhaSenha localhost
```

**O que o script faz:**
- ✅ Detecta automaticamente o MySQL do XAMPP
- ✅ Importa o arquivo `database_setup.sql` completo
- ✅ Cria todas as tabelas com estrutura completa
- ✅ Insere dados de exemplo para testes
- ✅ Valida instalação e exibe mensagens de erro claras

**Requisitos:**
- MySQL deve estar iniciado no XAMPP Control Panel
- XAMPP instalado em `C:\xampp\` (ou ajustar variável no script)

---

## 🔌 APIs e Endpoints

### Documentação Completa

📖 **Documentação completa da API:** 
- **[docs/API_ENDPOINTS.md](docs/API_ENDPOINTS.md)** - Documentação detalhada de todos os endpoints, incluindo métodos HTTP, parâmetros, respostas e exemplos
- **[docs/ENDPOINTS_INDEX.md](docs/ENDPOINTS_INDEX.md)** - Índice rápido de todos os endpoints organizados por funcionalidade

### Resumo dos Endpoints

#### **Autenticação** (`/api/auth/`)
- `POST login_aluno.php` - Login de alunos
- `POST login_professor.php` - Login de professores
- `POST cadastro_aluno.php` - Cadastro de alunos
- `POST cadastro_professor.php` - Cadastro de professores
- `POST logout.php` - Logout do sistema

#### **Alunos** (`/api/alunos/`)
- `GET get_aluno.php` - Dados do aluno logado
- `GET get_alunos.php` - Lista geral de alunos
- `GET get_alunos_academia.php` - Lista alunos da academia
- `GET get_historico_presenca.php` - Histórico de presenças
- `GET buscar_alunos.php` - Buscar alunos por nome/email
- `POST update_aluno.php` - Atualizar dados do aluno
- `POST editar_aluno.php` - Editar dados do aluno (professor)
- `POST excluir_aluno.php` - Excluir aluno
- `POST novo_aluno.php` - Criar novo aluno
- `POST avancar_faixa.php` - Avançar faixa do aluno
- `POST alterar_faixa.php` - Alterar faixa manualmente

#### **Professores** (`/api/professores/`)
- `GET get_professor.php` - Dados do professor logado
- `POST editar_professor.php` - Editar dados do professor
- `POST excluir_professor.php` - Excluir professor

#### **Academias** (`/api/academias/`)
- `GET get_academias.php` - Lista de academias disponíveis
- `POST salvar_academia.php` - Salvar dados da academia
- `POST solicitar_vinculo.php` - Solicitar vínculo com academia
- `POST confirmar_vinculo.php` - Confirmar vínculo aluno-academia
- `POST criar_vinculo.php` - Criar vínculo direto (professor)

#### **Check-ins** (`/api/checkins/`)
- `POST checkin.php` - Registrar check-in em aula
- `POST checkin_livre.php` - Registrar check-in livre
- `POST alterar_status_checkin.php` - Alterar status de check-in
- `POST excluir_checkin.php` - Excluir check-in

#### **Horários** (`/api/horarios/`)
- `GET get_aluno_horarios.php` - Horários do aluno
- `POST atribuir_horario.php` - Atribuir horário a aluno
- `POST remover_horario.php` - Remover horário do aluno
- `POST editar_horario.php` - Editar horário
- `POST adicionar_aulas.php` - Adicionar aulas ao contador

#### **Utilitários** (`/api/config/`)
- `POST upgrade_schema.php` - Atualizar estrutura do banco

---

## ⚙️ Instalação e Configuração

### Pré-requisitos
- **XAMPP** (ou similar com Apache, MySQL, PHP)
- **Navegador web** moderno (Chrome, Firefox, Edge)
- **Espaço em disco**: ~50MB

### Passo a Passo

1. **Instalar XAMPP**
   ```bash
   # Baixe e instale o XAMPP
   # https://www.apachefriends.org/download.html
   ```

2. **Clonar/Configurar Projeto**
   ```bash
   # Windows: Coloque a pasta do projeto em
   C:\xampp\htdocs\jiulog

   # Linux/Mac: /opt/lampp/htdocs/jiulog
   ```

3. **Iniciar Serviços**
   - Abra o painel de controle do XAMPP
   - Inicie **Apache** e **MySQL**

4. **Configurar Banco de Dados**
   
   **Opção 1 - Automatizado (Recomendado):**
   ```bash
   # Execute o script de setup do banco
   setup_db.bat
   
   # Ou com credenciais personalizadas:
   setup_db.bat root minhaSenha localhost
   ```
   
   **Opção 2 - Manual:**
   ```bash
   # Acesse http://localhost/phpmyadmin
   # Crie banco de dados: jiulog
   # Importe o arquivo: database_setup.sql
   ```

5. **Configurar Conexão** (se necessário)
   ```php
   // Edite php/db.php se suas credenciais forem diferentes
   $servername = "localhost";
   $username = "root";     // padrão XAMPP
   $password = "";         // padrão XAMPP
   $dbname = "jiulog";
   ```

6. **Acessar Sistema**
   ```
   http://localhost/jiulog/index.html
   ```

### Configuração de Produção
- Configure credenciais seguras no `api/config/db.php`
- Implemente hash de senhas adequado
- Configure HTTPS
- Ajuste permissões de arquivos
- Configure backup automático do banco

---

## 📖 Como Usar

### Primeiro Acesso
1. Acesse `index.html` (na raiz do projeto)
2. Escolha seu tipo de usuário
3. Faça cadastro ou login

### Para Alunos
1. **Login**: Use email e senha cadastrados
2. **Check-in**: Na aba "Horários", clique em uma aula ou use "Marcar presença (Livre)"
3. **Acompanhamento**: Veja progresso na aba "Horários"
4. **Histórico**: Consulte presenças na aba "Histórico"

### Para Professores
1. **Login**: Use email e senha cadastrados
2. **Gerenciar Check-ins**: Na aba "Check-ins", aprove ou reprove presenças
3. **Gerenciar Alunos**: Na aba "Alunos", busque e gerencie alunos
4. **Configurar Academia**: Na aba "Conta", edite dados da academia

### Funcionalidades Avançadas
- **Troca de Academia**: Alunos podem solicitar mudança
- **Horários Personalizados**: Professores podem criar aulas
- **Relatórios**: Histórico detalhado de presenças
- **Notificações**: Sistema de alertas integrado

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Design responsivo com Flexbox/Grid
- **JavaScript ES6+**: Interatividade e consumo de APIs
- **Font Awesome**: Ícones vetoriais
- **Google Fonts**: Tipografia Inter

### Backend
- **PHP 8.0+**: Lógica de servidor e APIs
- **MySQL 8.0+**: Banco de dados relacional
- **PDO/MySQLi**: Conexão com banco de dados
- **Sessions**: Gerenciamento de autenticação

### Ferramentas de Desenvolvimento
- **XAMPP**: Ambiente de desenvolvimento local
- **phpMyAdmin**: Gerenciamento do banco de dados
- **VS Code**: Editor de código
- **Git**: Controle de versão

### Bibliotecas e Frameworks
- **Custom Alert System**: Sistema de notificações próprio
- **Responsive Design**: CSS puro para mobile/desktop
- **AJAX/Fetch API**: Comunicação assíncrona
- **Form Validation**: Validação client-side e server-side

---

## 📁 Estrutura de Arquivos

```
jiulog/
├── 📄 index.html                   # Página inicial (raiz)
├── 📁 public/                      # Arquivos públicos acessíveis pelo navegador
│   ├── 📁 auth/                    # Páginas de autenticação
│   │   ├── 📄 login_aluno.html
│   │   ├── 📄 login_professor.html
│   │   ├── 📄 cadastro_aluno.html
│   │   └── 📄 cadastro_professor.html
│   ├── 📁 dashboard/               # Dashboards do sistema
│   │   ├── 📄 dashboard_aluno.html
│   │   └── 📄 professor.html
│   ├── 📁 css/                     # Estilos CSS
│   │   ├── 📄 style.css
│   │   ├── 📄 theme.css
│   │   ├── 📄 index.css
│   │   ├── 📄 login.css
│   │   ├── 📄 aluno.css
│   │   ├── 📄 professor.css
│   │   └── 📄 mobile.css
│   ├── 📁 js/                      # Scripts JavaScript
│   │   ├── 📄 aluno.js
│   │   ├── 📄 professor.js
│   │   └── 📄 custom-alert.js
│   └── 📁 uploads/                 # Arquivos enviados (logos, fotos)
├── 📁 api/                         # Backend PHP (API)
│   ├── 📁 config/                  # Configurações
│   │   ├── 📄 db.php               # Conexão com banco de dados
│   │   └── 📄 upgrade_schema.php
│   ├── 📁 auth/                    # Autenticação
│   │   ├── 📄 login_aluno.php
│   │   ├── 📄 login_professor.php
│   │   ├── 📄 logout.php
│   │   ├── 📄 cadastro_aluno.php
│   │   └── 📄 cadastro_professor.php
│   ├── 📁 alunos/                  # Gerenciamento de alunos
│   │   ├── 📄 get_aluno.php
│   │   ├── 📄 get_alunos.php
│   │   ├── 📄 get_alunos_academia.php
│   │   ├── 📄 get_historico_presenca.php
│   │   ├── 📄 buscar_alunos.php
│   │   ├── 📄 editar_aluno.php
│   │   ├── 📄 update_aluno.php
│   │   ├── 📄 novo_aluno.php
│   │   ├── 📄 excluir_aluno.php
│   │   ├── 📄 alterar_faixa.php
│   │   └── 📄 avancar_faixa.php
│   ├── 📁 professores/             # Gerenciamento de professores
│   │   ├── 📄 get_professor.php
│   │   ├── 📄 editar_professor.php
│   │   └── 📄 excluir_professor.php
│   ├── 📁 academias/               # Gerenciamento de academias
│   │   ├── 📄 get_academias.php
│   │   ├── 📄 salvar_academia.php
│   │   ├── 📄 solicitar_vinculo.php
│   │   ├── 📄 confirmar_vinculo.php
│   │   └── 📄 criar_vinculo.php
│   ├── 📁 checkins/                # Gerenciamento de check-ins
│   │   ├── 📄 checkin.php
│   │   ├── 📄 checkin_livre.php
│   │   ├── 📄 alterar_status_checkin.php
│   │   └── 📄 excluir_checkin.php
│   └── 📁 horarios/                # Gerenciamento de horários
│       ├── 📄 get_aluno_horarios.php
│       ├── 📄 atribuir_horario.php
│       ├── 📄 remover_horario.php
│       ├── 📄 editar_horario.php
│       ├── 📄 adicionar_aulas.php
├── 📁 assets/                      # Recursos estáticos
│   └── 📁 images/
│       └── 📁 favicon/
│           └── 📄 jiu_jitsu2.png
├── 📁 config/                      # Arquivos de configuração
│   ├── 📄 database_setup.sql       # Script de setup do banco
│   └── 📄 schema.sql               # Esquema do banco
├── 📁 docs/                        # Documentação
│   ├── 📄 COMO_TESTAR.md
│   └── 📄 GUIA_DE_TESTE.md
├── 📁 scripts/                     # Scripts de automação
│   ├── 📄 setup_db.bat             # Setup automatizado do banco
│   ├── 📄 setup_windows.bat        # Setup Windows
│   └── 📄 run-server.bat           # Iniciar servidor
├── 📄 README.md                    # Esta documentação
├── 📄 LICENSE                      # Licença MIT
└── 📄 package-lock.json            # Dependências Node (se houver)
```

---

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Diretrizes de Contribuição
- Mantenha o código limpo e bem documentado
- Siga os padrões de nomenclatura existentes
- Teste suas mudanças em diferentes navegadores
- Atualize a documentação quando necessário

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 📞 Suporte

Para dúvidas, sugestões ou problemas:
- Abra uma **issue** no GitHub
- Consulte a documentação em `COMO_TESTAR.md`
- Verifique os logs do navegador (F12 → Console)

---

**Desenvolvido com ❤️ para a comunidade de Jiu-Jitsu**