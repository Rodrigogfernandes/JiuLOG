# 🥋 Guia de Teste - JiuLOG

## 📋 Pré-requisitos

### 1. Instalar XAMPP
- Baixe e instale o [XAMPP](https://www.apachefriends.org/pt_br/index.html)
- Inicie os serviços **Apache** e **MySQL** no painel de controle do XAMPP

### 2. Configurar o Projeto
- Copie a pasta `JiuLOG` para `C:\xampp\htdocs\` (Windows) ou `/Applications/XAMPP/htdocs/` (Mac)
- O caminho final deve ser: `C:\xampp\htdocs\JiuLOG\`

## 🗄️ Configuração do Banco de Dados

### 1. Acessar phpMyAdmin
- Abra o navegador e acesse: `http://localhost/phpmyadmin`
- Clique em "Novo" para criar um novo banco de dados

### 2. Criar Banco de Dados
- Nome do banco: `jiulog`
- Collation: `utf8mb4_unicode_ci`
- Clique em "Criar"

### 3. Importar Estrutura
- Selecione o banco `jiulog`
- Vá na aba "SQL"
- Copie e cole o conteúdo do arquivo `database_setup.sql`
- Clique em "Executar"

### 4. Verificar Tabelas
Você deve ver 3 tabelas criadas:
- `usuarios` - Alunos e professores
- `horarios` - Horários das aulas
- `checkins` - Check-ins dos alunos

## 🚀 Como Testar o Sistema

### 1. Acessar o Sistema
- Abra o navegador e acesse: `http://localhost/JiuLOG/index.html`
- Você deve ver a página inicial moderna com o logo JiuLOG

### 2. Testar Cadastro de Professor

#### Passo 1: Cadastrar Professor
1. Clique em "Sou Professor"
2. Clique em "Cadastrar como Professor"
3. Preencha os dados:
   - Nome: `Professor Teste`
   - Email: `prof@teste.com`
   - Senha: `123456`
4. Clique em "Cadastrar"
5. Você será redirecionado para o login

#### Passo 2: Login do Professor
1. Faça login com:
   - Email: `prof@teste.com`
   - Senha: `123456`
2. Você deve acessar o dashboard do professor

### 3. Testar Cadastro de Aluno

#### Passo 1: Cadastrar Aluno
1. Volte para a página inicial
2. Clique em "Sou Aluno"
3. Clique em "Cadastrar como Aluno"
4. Preencha os dados:
   - Nome: `Aluno Teste`
   - Email: `aluno@teste.com`
   - Senha: `123456`
5. Clique em "Cadastrar"

#### Passo 2: Login do Aluno
1. Faça login com:
   - Email: `aluno@teste.com`
   - Senha: `123456`
2. Você deve acessar o dashboard do aluno

### 4. Testar Funcionalidades do Professor

#### Adicionar Horários
1. No dashboard do professor, preencha o formulário:
   - Nome da aula: `Aula das 8:00`
   - Dia da semana: `Segunda-feira`
   - Hora: `08:00`
2. Clique em "Adicionar Horário"
3. O horário deve aparecer na seção "Horários Existentes"

#### Gerenciar Check-ins
1. Faça login como aluno
2. Tente fazer check-in em um horário disponível
3. Volte para o dashboard do professor
4. Aprove ou reprove o check-in pendente

### 5. Testar Funcionalidades do Aluno

#### Fazer Check-in
1. No dashboard do aluno, veja os horários disponíveis
2. Clique em um horário para fazer check-in
3. O check-in deve aparecer como "Pendente"

#### Verificar Status
1. Veja quantas aulas faltam para a próxima graduação
2. Verifique os check-ins realizados e seus status

## 🧪 Cenários de Teste

### Teste 1: Responsividade
1. Acesse o sistema em diferentes dispositivos
2. Teste em desktop, tablet e mobile
3. Verifique se todos os elementos se adaptam corretamente

### Teste 2: Validação de Formulários
1. Tente cadastrar com email duplicado
2. Tente fazer login com credenciais incorretas
3. Teste campos obrigatórios vazios

### Teste 3: Navegação
1. Teste todos os botões de navegação
2. Verifique se o logout funciona corretamente
3. Teste os links entre páginas

### Teste 4: Funcionalidades Específicas
1. **Professor:**
   - Adicionar/remover horários
   - Aprovar/reprovar check-ins
   - Gerenciar alunos

2. **Aluno:**
   - Fazer check-in
   - Ver status das aulas
   - Verificar histórico

## 🐛 Solução de Problemas

### Erro de Conexão com Banco
- Verifique se o MySQL está rodando no XAMPP
- Confirme se o banco `jiulog` foi criado
- Verifique as credenciais em `php/db.php`

### Página não Carrega
- Verifique se o Apache está rodando
- Confirme se os arquivos estão em `C:\xampp\htdocs\JiuLOG\`
- Acesse `http://localhost/JiuLOG/` (com barra no final)

### Erro 500 (Internal Server Error)
- Verifique os logs do Apache
- Confirme se o PHP está funcionando
- Teste se consegue acessar `http://localhost/`

### CSS não Carrega
- Verifique se o arquivo `css/theme.css` existe
- Confirme se o caminho está correto
- Teste abrindo o arquivo CSS diretamente no navegador

## 📱 Teste em Dispositivos Móveis

### Usando DevTools do Navegador
1. Abra o DevTools (F12)
2. Clique no ícone de dispositivo móvel
3. Teste diferentes resoluções:
   - iPhone SE (375x667)
   - iPad (768x1024)
   - Galaxy S5 (360x640)

### Teste Real em Mobile
1. Acesse o IP da sua máquina no celular
2. Exemplo: `http://192.168.1.100/JiuLOG/`
3. Teste todas as funcionalidades

## ✅ Checklist de Teste

- [ ] Página inicial carrega corretamente
- [ ] Design responsivo funciona
- [ ] Cadastro de professor funciona
- [ ] Cadastro de aluno funciona
- [ ] Login de professor funciona
- [ ] Login de aluno funciona
- [ ] Dashboard do professor carrega
- [ ] Dashboard do aluno carrega
- [ ] Adicionar horários funciona
- [ ] Fazer check-in funciona
- [ ] Aprovar check-ins funciona
- [ ] Logout funciona
- [ ] Navegação entre páginas funciona
- [ ] Validação de formulários funciona
- [ ] Mensagens de erro aparecem
- [ ] Animações e efeitos visuais funcionam

## 🎯 Dados de Teste Pré-cadastrados

### Professor Padrão
- **Email:** `professor@jiulog.com`
- **Senha:** `123456`

### Aluno Padrão
- **Email:** `aluno@jiulog.com`
- **Senha:** `123456`

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do Apache em `C:\xampp\apache\logs\`
2. Verifique os logs do MySQL em `C:\xampp\mysql\data\`
3. Teste as funcionalidades uma por uma
4. Verifique se todas as dependências estão instaladas

---

**Boa sorte com os testes! 🥋✨**
