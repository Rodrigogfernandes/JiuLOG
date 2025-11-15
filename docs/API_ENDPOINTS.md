# 📡 Documentação da API - JiuLOG

## Visão Geral

Esta documentação descreve todos os endpoints disponíveis na API do sistema JiuLOG. Os endpoints estão organizados por funcionalidade e seguem padrões REST quando possível.

**Base URL:** `/api/`

---

## 🔐 Autenticação

Os endpoints de autenticação utilizam sessões PHP. Após login bem-sucedido, a sessão contém:
- `$_SESSION['user_id']` - ID do usuário
- `$_SESSION['tipo']` - Tipo do usuário (`aluno` ou `professor`)

---

## 📋 Índice

1. [Autenticação](#autenticação)
2. [Alunos](#alunos)
3. [Professores](#professores)
4. [Academias](#academias)
5. [Check-ins](#check-ins)
6. [Horários](#horários)

---

## 🔐 Autenticação

### POST `/auth/login_aluno.php`
**Descrição:** Autentica um aluno no sistema.

**Método:** `POST`

**Body (form-data):**
```json
{
  "email": "string (required)",
  "senha": "string (required)"
}
```

**Resposta de Sucesso:**
- **Status:** `302 Found`
- **Location:** `/public/dashboard/dashboard_aluno.html`

**Resposta de Erro:**
- **Status:** `302 Found`
- **Location:** `/public/auth/login_aluno.html?erro=1`

---

### POST `/auth/login_professor.php`
**Descrição:** Autentica um professor no sistema.

**Método:** `POST`

**Body (form-data):**
```json
{
  "email": "string (required)",
  "senha": "string (required)"
}
```

**Resposta de Sucesso:**
- **Status:** `302 Found`
- **Location:** `/public/dashboard/professor.html`

**Resposta de Erro:**
- **Status:** `302 Found`
- **Location:** `/public/auth/login_professor.html?erro=1`

---

### POST `/auth/cadastro_aluno.php`
**Descrição:** Registra um novo aluno no sistema.

**Método:** `POST`

**Body (form-data):**
```json
{
  "nome": "string (required)",
  "email": "string (required, unique)",
  "senha": "string (required)",
  "academia_id": "integer (required)"
}
```

**Resposta de Sucesso:**
- **Status:** `302 Found`
- **Location:** `/public/auth/login_aluno.html`

**Resposta de Erro:**
- **Status:** `302 Found`
- **Location:** `/public/auth/cadastro_aluno.html?erro=1`

---

### POST `/auth/cadastro_professor.php`
**Descrição:** Registra um novo professor e cria sua academia.

**Método:** `POST`

**Body (form-data):**
```json
{
  "nome": "string (required)",
  "email": "string (required, unique)",
  "senha": "string (required)",
  "academia_nome": "string (required)",
  "academia_logo": "file (optional)"
}
```

**Resposta de Sucesso:**
- **Status:** `302 Found`
- **Location:** `/public/auth/login_professor.html`

---

### POST `/auth/logout.php`
**Descrição:** Encerra a sessão do usuário.

**Método:** `POST`

**Resposta:**
- **Status:** `302 Found`
- **Location:** `/index.html`

---

## 👥 Alunos

### GET `/alunos/get_aluno.php`
**Descrição:** Retorna dados completos do aluno autenticado.

**Método:** `GET`

**Autenticação:** Requerida (tipo: `aluno`)

**Resposta de Sucesso:**
```json
{
  "aluno": {
    "nome": "string",
    "email": "string",
    "aulas_faltando": "integer",
    "faixa": "string",
    "graus": "integer"
  },
  "horarios": [
    {
      "id": "integer",
      "nome_aula": "string",
      "dia_semana": "string",
      "hora": "time"
    }
  ],
  "checkins": [
    {
      "id": "integer",
      "nome_aula": "string",
      "dia_semana": "string",
      "hora": "time",
      "data": "date (DD/MM/YYYY)",
      "status": "string (pendente|aprovado|reprovado)",
      "horario_id": "integer|null"
    }
  ],
  "membership": {
    "membership_id": "integer",
    "status": "string",
    "academia_id": "integer",
    "academia_nome": "string",
    "logo_path": "string|null",
    "professor_id": "integer"
  },
  "professor": {
    "nome": "string"
  }
}
```

**Resposta de Erro:**
```json
{
  "erro": "Acesso negado"
}
```

---

### GET `/alunos/get_alunos.php`
**Descrição:** Retorna lista de todos os alunos.

**Método:** `GET`

**Autenticação:** Requerida (tipo: `professor`)

**Resposta:**
```json
{
  "alunos": [
    {
      "id": "integer",
      "nome": "string",
      "email": "string",
      "faixa": "string",
      "graus": "integer",
      "aulas_faltando": "integer"
    }
  ]
}
```

---

### GET `/alunos/get_alunos_academia.php`
**Descrição:** Retorna lista de alunos vinculados à academia do professor.

**Método:** `GET`

**Autenticação:** Requerida (tipo: `professor`)

**Resposta:**
```json
{
  "alunos": [
    {
      "id": "integer",
      "nome": "string",
      "email": "string",
      "faixa": "string",
      "graus": "integer",
      "aulas_faltando": "integer",
      "membership_id": "integer",
      "membership_status": "string"
    }
  ]
}
```

---

### GET `/alunos/get_historico_presenca.php?aluno_id={id}`
**Descrição:** Retorna histórico de presenças de um aluno específico.

**Método:** `GET`

**Query Parameters:**
- `aluno_id` (integer, required) - ID do aluno

**Autenticação:** Requerida (tipo: `professor`)

**Resposta:**
```json
{
  "historico": [
    {
      "id": "integer",
      "nome_aula": "string",
      "data": "date (DD/MM/YYYY)",
      "status": "string",
      "horario_id": "integer|null"
    }
  ]
}
```

---

### GET `/alunos/buscar_alunos.php?q={query}`
**Descrição:** Busca alunos por nome ou email.

**Método:** `GET`

**Query Parameters:**
- `q` (string, required) - Termo de busca

**Autenticação:** Requerida (tipo: `professor`)

**Resposta:**
```json
{
  "alunos": [
    {
      "id": "integer",
      "nome": "string",
      "email": "string",
      "faixa": "string",
      "graus": "integer"
    }
  ]
}
```

---

### POST `/alunos/update_aluno.php`
**Descrição:** Atualiza dados do aluno autenticado.

**Método:** `POST`

**Body (form-data):**
```json
{
  "nome": "string (optional)",
  "email": "string (optional)",
  "nova_senha": "string (optional)"
}
```

**Autenticação:** Requerida (tipo: `aluno`)

**Resposta de Sucesso:**
```json
{
  "success": true,
  "message": "Dados atualizados com sucesso"
}
```

---

### POST `/alunos/editar_aluno.php`
**Descrição:** Edita dados de um aluno (apenas professor).

**Método:** `POST`

**Body (form-data):**
```json
{
  "aluno_id": "integer (required)",
  "nome": "string (optional)",
  "email": "string (optional)",
  "faixa": "string (optional)",
  "graus": "integer (optional)",
  "aulas_faltando": "integer (optional)"
}
```

**Autenticação:** Requerida (tipo: `professor`)

**Resposta:**
```json
{
  "success": true,
  "message": "Aluno atualizado com sucesso"
}
```

---

### POST `/alunos/excluir_aluno.php`
**Descrição:** Exclui um aluno do sistema.

**Método:** `POST`

**Body (form-data):**
```json
{
  "aluno_id": "integer (required)"
}
```

**Autenticação:** Requerida (tipo: `professor`)

**Resposta:**
```json
{
  "success": true,
  "message": "Aluno excluído com sucesso"
}
```

---

### POST `/alunos/novo_aluno.php`
**Descrição:** Cria um novo aluno.

**Método:** `POST`

**Body (form-data):**
```json
{
  "nome": "string (required)",
  "email": "string (required)",
  "senha": "string (required)",
  "faixa": "string (required)",
  "graus": "integer (required)",
  "academia_id": "integer (required)"
}
```

**Autenticação:** Requerida (tipo: `professor`)

**Resposta:**
- Retorna HTML do formulário ou redireciona após sucesso

---

### POST `/alunos/avancar_faixa.php`
**Descrição:** Avança a faixa de um aluno.

**Método:** `POST`

**Body (form-data):**
```json
{
  "aluno_id": "integer (required)"
}
```

**Autenticação:** Requerida (tipo: `professor`)

**Resposta:**
```json
{
  "success": true,
  "message": "Faixa avançada com sucesso"
}
```

---

### POST `/alunos/alterar_faixa.php`
**Descrição:** Altera manualmente a faixa de um aluno.

**Método:** `POST`

**Body (form-data):**
```json
{
  "aluno_id": "integer (required)",
  "faixa": "string (required)",
  "graus": "integer (required)"
}
```

**Autenticação:** Requerida (tipo: `professor`)

**Resposta:**
```json
{
  "success": true,
  "message": "Faixa alterada com sucesso"
}
```

---

## 👨‍🏫 Professores

### GET `/professores/get_professor.php`
**Descrição:** Retorna dados completos do professor autenticado.

**Método:** `GET`

**Autenticação:** Requerida (tipo: `professor`)

**Resposta:**
```json
{
  "professor": {
    "id": "integer",
    "nome": "string",
    "apelido": "string|null",
    "email": "string"
  },
  "academias": [
    {
      "id": "integer",
      "nome": "string",
      "logo_path": "string|null"
    }
  ],
  "solicitacoes": [
    {
      "membership_id": "integer",
      "aluno_nome": "string",
      "academia_nome": "string"
    }
  ],
  "checkins": [
    {
      "id": "integer",
      "aluno_nome": "string",
      "nome_aula": "string",
      "data": "date",
      "hora": "time",
      "status": "string"
    }
  ]
}
```

---

### POST `/professores/editar_professor.php`
**Descrição:** Atualiza dados do professor autenticado.

**Método:** `POST`

**Body (form-data):**
```json
{
  "nome": "string (optional)",
  "email": "string (optional)",
  "apelido": "string (optional)",
  "nova_senha": "string (optional)",
  "academia_nome": "string (optional)",
  "academia_logo": "file (optional)"
}
```

**Autenticação:** Requerida (tipo: `professor`)

**Resposta:**
```json
{
  "ok": true
}
```

---

### POST `/professores/excluir_professor.php`
**Descrição:** Exclui o professor autenticado e sua academia.

**Método:** `POST`

**Autenticação:** Requerida (tipo: `professor`)

**Resposta:**
```json
{
  "success": true,
  "message": "Professor excluído com sucesso"
}
```

---

## 🏢 Academias

### GET `/academias/get_academias.php`
**Descrição:** Retorna lista de todas as academias disponíveis.

**Método:** `GET`

**Resposta:**
```json
{
  "academias": [
    {
      "id": "integer",
      "nome": "string",
      "logo_path": "string|null",
      "professor_id": "integer",
      "professor_nome": "string"
    }
  ]
}
```

---

### POST `/academias/salvar_academia.php`
**Descrição:** Salva ou atualiza dados da academia.

**Método:** `POST`

**Body (form-data):**
```json
{
  "academia_nome": "string (required)",
  "academia_logo": "file (optional)"
}
```

**Autenticação:** Requerida (tipo: `professor`)

**Resposta:**
```json
{
  "success": true,
  "message": "Academia salva com sucesso"
}
```

---

### POST `/academias/solicitar_vinculo.php`
**Descrição:** Solicita vínculo do aluno com uma academia.

**Método:** `POST`

**Body (form-data):**
```json
{
  "academia_id": "integer (required)"
}
```

**Autenticação:** Requerida (tipo: `aluno`)

**Resposta:**
```json
{
  "success": true,
  "message": "Solicitação enviada com sucesso"
}
```

---

### POST `/academias/confirmar_vinculo.php`
**Descrição:** Confirma ou rejeita vínculo aluno-academia.

**Método:** `POST`

**Body (form-data):**
```json
{
  "acao": "string (required: prof_aceitar|prof_rejeitar|aluno_aceitar|aluno_rejeitar)",
  "membership_id": "integer (required)"
}
```

**Autenticação:** Requerida (tipo: `professor` ou `aluno`)

**Resposta:**
```json
{
  "success": true,
  "message": "Vínculo atualizado com sucesso"
}
```

---

### POST `/academias/criar_vinculo.php`
**Descrição:** Cria vínculo direto aluno-academia (apenas professor).

**Método:** `POST`

**Body (form-data):**
```json
{
  "aluno_id": "integer (required)",
  "academia_id": "integer (required)"
}
```

**Autenticação:** Requerida (tipo: `professor`)

**Resposta:**
```json
{
  "success": true,
  "message": "Vínculo criado com sucesso"
}
```

---

## ✅ Check-ins

### POST `/checkins/checkin.php`
**Descrição:** Registra check-in do aluno em uma aula específica.

**Método:** `POST`

**Body (form-data):**
```json
{
  "horario_id": "integer (required)",
  "data": "date (required, YYYY-MM-DD)",
  "force": "integer (optional, 0|1)"
}
```

**Autenticação:** Requerida (tipo: `aluno`)

**Resposta de Sucesso (AJAX):**
```json
{
  "success": true,
  "data": "DD/MM/YYYY"
}
```

**Resposta de Erro (AJAX):**
```json
{
  "error": "Mensagem de erro"
}
```

**Status HTTP:** `400` para erro, `200` para sucesso

---

### POST `/checkins/checkin_livre.php`
**Descrição:** Registra check-in livre (sem aula específica).

**Método:** `POST`

**Body (form-data):**
```json
{
  "data": "date (required, YYYY-MM-DD)",
  "force": "integer (optional, 0|1)"
}
```

**Autenticação:** Requerida (tipo: `aluno`)

**Resposta:**
```json
{
  "success": true,
  "data": "DD/MM/YYYY"
}
```

---

### POST `/checkins/alterar_status_checkin.php`
**Descrição:** Altera status de um check-in.

**Método:** `POST`

**Body (form-data):**
```json
{
  "checkin_id": "integer (required)",
  "status": "string (required: pendente|aprovado|reprovado)"
}
```

**Autenticação:** Requerida (tipo: `professor`)

**Resposta:**
```json
{
  "success": true,
  "message": "Status alterado com sucesso"
}
```

---

### POST `/checkins/excluir_checkin.php`
**Descrição:** Exclui um check-in.

**Método:** `POST`

**Body (form-data):**
```json
{
  "checkin_id": "integer (required)"
}
```

**Autenticação:** Requerida (tipo: `professor`)

**Resposta:**
```json
{
  "success": true,
  "message": "Check-in excluído com sucesso"
}
```

---

## 📅 Horários

### GET `/horarios/get_aluno_horarios.php?aluno_id={id}`
**Descrição:** Retorna horários atribuídos a um aluno.

**Método:** `GET`

**Query Parameters:**
- `aluno_id` (integer, required) - ID do aluno

**Autenticação:** Requerida (tipo: `professor`)

**Resposta:**
```json
{
  "horarios": [
    {
      "id": "integer",
      "nome_aula": "string",
      "dia_semana": "string",
      "hora": "time"
    }
  ]
}
```

---

### POST `/horarios/atribuir_horario.php`
**Descrição:** Atribui um horário a um aluno.

**Método:** `POST`

**Body (form-data):**
```json
{
  "aluno_id": "integer (required)",
  "horario_id": "integer (required)"
}
```

**Autenticação:** Requerida (tipo: `professor`)

**Resposta:**
```json
{
  "success": true,
  "message": "Horário atribuído com sucesso"
}
```

---

### POST `/horarios/remover_horario.php`
**Descrição:** Remove horário atribuído a um aluno.

**Método:** `POST`

**Body (form-data):**
```json
{
  "aluno_id": "integer (required)",
  "horario_id": "integer (required)"
}
```

**Autenticação:** Requerida (tipo: `professor`)

**Resposta:**
```json
{
  "success": true,
  "message": "Horário removido com sucesso"
}
```

---

### POST `/horarios/editar_horario.php`
**Descrição:** Edita um horário de aula.

**Método:** `POST`

**Body (form-data):**
```json
{
  "horario_id": "integer (required)",
  "nome_aula": "string (optional)",
  "dia_semana": "string (optional)",
  "hora": "time (optional)"
}
```

**Autenticação:** Requerida (tipo: `professor`)

**Resposta:**
```json
{
  "success": true,
  "message": "Horário atualizado com sucesso"
}
```

---

### POST `/horarios/adicionar_aulas.php`
**Descrição:** Adiciona aulas ao contador do aluno.

**Método:** `POST`

**Body (form-data):**
```json
{
  "aluno_id": "integer (required)",
  "quantidade": "integer (required)"
}
```

**Autenticação:** Requerida (tipo: `professor`)

**Resposta:**
```json
{
  "success": true,
  "message": "Aulas adicionadas com sucesso"
}
```

---

## 🔧 Padrões de Resposta

### Respostas de Sucesso
- **JSON:** Todos os endpoints JSON devem retornar `Content-Type: application/json`
- **Status HTTP:** `200 OK` para sucesso, `201 Created` para criação
- **Formato:**
```json
{
  "success": true,
  "message": "Mensagem opcional",
  "data": {} // Dados opcionais
}
```

### Respostas de Erro
- **Status HTTP:** `400 Bad Request` para erros do cliente, `401 Unauthorized` para não autenticado, `403 Forbidden` para sem permissão, `500 Internal Server Error` para erros do servidor
- **Formato:**
```json
{
  "error": "Mensagem de erro",
  "erro": "Mensagem de erro (formato alternativo)"
}
```

### Autenticação
- Endpoints que requerem autenticação verificam `$_SESSION['tipo']` e `$_SESSION['user_id']`
- Resposta para acesso negado:
```json
{
  "erro": "Acesso negado"
}
```

---

## 📝 Notas Importantes

1. **Sessões PHP:** Todos os endpoints utilizam sessões PHP para autenticação
2. **Formato de Data:** Use `YYYY-MM-DD` para envio e `DD/MM/YYYY` para exibição
3. **Upload de Arquivos:** Endpoints que aceitam upload usam `multipart/form-data`
4. **Validação:** Validações básicas são feitas no backend; validações frontend são complementares
5. **Sanitização:** Todos os inputs devem ser sanitizados antes de uso em queries SQL

---

**Última atualização:** 2024

