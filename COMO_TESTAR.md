# 🥋 Como Testar o Projeto JiuLOG

## 🚀 Configuração Rápida (Windows)

### Opção 1: Script Automático
1. Execute o arquivo `setup_windows.bat` como administrador
2. Siga as instruções na tela

### Opção 2: Manual
1. Instale o [XAMPP](https://www.apachefriends.org/pt_br/index.html)
2. Copie a pasta `JiuLOG` para `C:\xampp\htdocs\`
3. Inicie Apache e MySQL no XAMPP Control Panel

## 🗄️ Configuração do Banco de Dados

### 1. Acessar phpMyAdmin
- URL: `http://localhost/phpmyadmin`

### 2. Criar Banco de Dados
- Nome: `jiulog`
- Collation: `utf8mb4_unicode_ci`

### 3. Importar Estrutura
- Execute o conteúdo do arquivo `database_setup.sql`
- Ou importe o arquivo diretamente

## 🧪 Testar o Sistema

### 1. Teste Automático
- Acesse: `http://localhost/JiuLOG/test_system.html`
- Execute todos os testes automaticamente

### 2. Teste Manual
- Acesse: `http://localhost/JiuLOG/index.html`
- Siga o guia completo em `GUIA_DE_TESTE.md`

## 📱 URLs para Teste

| Página | URL |
|--------|-----|
| **Inicial** | `http://localhost/JiuLOG/index.html` |
| **Login Aluno** | `http://localhost/JiuLOG/login_aluno.html` |
| **Login Professor** | `http://localhost/JiuLOG/login_professor.html` |
| **Cadastro Aluno** | `http://localhost/JiuLOG/cadastro_aluno.html` |
| **Cadastro Professor** | `http://localhost/JiuLOG/cadastro_professor.html` |
| **Dashboard Aluno** | `http://localhost/JiuLOG/dashboard_aluno.html` |
| **Dashboard Professor** | `http://localhost/JiuLOG/professor.html` |
| **Teste do Sistema** | `http://localhost/JiuLOG/test_system.html` |

## 👤 Dados de Teste

### Professor Padrão
- **Email:** `professor@jiulog.com`
- **Senha:** `123456`

### Aluno Padrão
- **Email:** `aluno@jiulog.com`
- **Senha:** `123456`

## 🔧 Solução de Problemas

### Erro 404 - Página não encontrada
- Verifique se os arquivos estão em `C:\xampp\htdocs\JiuLOG\`
- Confirme se o Apache está rodando

### Erro 500 - Internal Server Error
- Verifique se o PHP está funcionando
- Confirme se o banco de dados foi criado

### CSS não carrega
- Verifique se o arquivo `css/theme.css` existe
- Confirme se o caminho está correto

### Banco de dados não conecta
- Verifique se o MySQL está rodando
- Confirme as credenciais em `php/db.php`

## 📋 Checklist Rápido

- [ ] XAMPP instalado e rodando
- [ ] Arquivos copiados para `htdocs`
- [ ] Banco `jiulog` criado
- [ ] Tabelas importadas
- [ ] Página inicial carrega
- [ ] Design responsivo funciona
- [ ] Cadastro funciona
- [ ] Login funciona
- [ ] Dashboards carregam

## 🎯 Funcionalidades para Testar

### Professor
- [ ] Cadastrar e fazer login
- [ ] Adicionar horários de aula
- [ ] Ver check-ins pendentes
- [ ] Aprovar/reprovar check-ins
- [ ] Gerenciar alunos

### Aluno
- [ ] Cadastrar e fazer login
- [ ] Ver horários disponíveis
- [ ] Fazer check-in
- [ ] Ver status das aulas
- [ ] Verificar histórico

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do Apache
2. Teste com o arquivo `test_system.html`
3. Confirme se todas as dependências estão instaladas
4. Verifique se o banco de dados está configurado

---

**Boa sorte! 🥋✨**
