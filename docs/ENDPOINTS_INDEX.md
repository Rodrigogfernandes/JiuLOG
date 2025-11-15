# 📋 Índice de Endpoints - JiuLOG

## Visão Geral

Todos os endpoints estão organizados por funcionalidade na pasta `/api/`. Este documento fornece um índice rápido de todos os endpoints disponíveis.

**Base URL:** `/api/`

---

## 🔐 Autenticação (`/api/auth/`)

| Endpoint | Método | Descrição | Autenticação |
|----------|--------|-----------|--------------|
| `login_aluno.php` | POST | Login de alunos | Não |
| `login_professor.php` | POST | Login de professores | Não |
| `cadastro_aluno.php` | POST | Cadastro de alunos | Não |
| `cadastro_professor.php` | POST | Cadastro de professores | Não |
| `logout.php` | POST | Logout do sistema | Sim |

---

## 👥 Alunos (`/api/alunos/`)

### GET - Consultas

| Endpoint | Método | Descrição | Autenticação |
|----------|--------|-----------|--------------|
| `get_aluno.php` | GET | Dados do aluno logado | Aluno |
| `get_alunos.php` | GET | Lista geral de alunos | Professor |
| `get_alunos_academia.php` | GET | Lista alunos da academia | Professor |
| `get_historico_presenca.php?aluno_id={id}` | GET | Histórico de presenças | Professor |
| `buscar_alunos.php?q={query}` | GET | Buscar alunos por nome/email | Professor |

### POST - Operações

| Endpoint | Método | Descrição | Autenticação |
|----------|--------|-----------|--------------|
| `update_aluno.php` | POST | Atualizar dados do aluno | Aluno |
| `editar_aluno.php` | POST | Editar dados do aluno | Professor |
| `excluir_aluno.php` | POST | Excluir aluno | Professor |
| `novo_aluno.php` | POST | Criar novo aluno | Professor |
| `avancar_faixa.php` | POST | Avançar faixa do aluno | Professor |
| `alterar_faixa.php` | POST | Alterar faixa manualmente | Professor |

---

## 👨‍🏫 Professores (`/api/professores/`)

| Endpoint | Método | Descrição | Autenticação |
|----------|--------|-----------|--------------|
| `get_professor.php` | GET | Dados do professor logado | Professor |
| `editar_professor.php` | POST | Editar dados do professor | Professor |
| `excluir_professor.php` | POST | Excluir professor | Professor |

---

## 🏢 Academias (`/api/academias/`)

| Endpoint | Método | Descrição | Autenticação |
|----------|--------|-----------|--------------|
| `get_academias.php` | GET | Lista de academias disponíveis | Não |
| `salvar_academia.php` | POST | Salvar dados da academia | Professor |
| `solicitar_vinculo.php` | POST | Solicitar vínculo com academia | Aluno |
| `confirmar_vinculo.php` | POST | Confirmar vínculo aluno-academia | Aluno/Professor |
| `criar_vinculo.php` | POST | Criar vínculo direto | Professor |

---

## ✅ Check-ins (`/api/checkins/`)

| Endpoint | Método | Descrição | Autenticação |
|----------|--------|-----------|--------------|
| `checkin.php` | POST | Registrar check-in em aula | Aluno |
| `checkin_livre.php` | POST | Registrar check-in livre | Aluno |
| `alterar_status_checkin.php` | POST | Alterar status de check-in | Professor |
| `excluir_checkin.php` | POST | Excluir check-in | Professor |

---

## 📅 Horários (`/api/horarios/`)

| Endpoint | Método | Descrição | Autenticação |
|----------|--------|-----------|--------------|
| `get_aluno_horarios.php?aluno_id={id}` | GET | Horários do aluno | Professor |
| `atribuir_horario.php` | POST | Atribuir horário a aluno | Professor |
| `remover_horario.php` | POST | Remover horário do aluno | Professor |
| `editar_horario.php` | POST | Editar horário | Professor |
| `adicionar_aulas.php` | POST | Adicionar aulas ao contador | Professor |

---

## ⚙️ Configuração (`/api/config/`)

| Endpoint | Método | Descrição | Autenticação |
|----------|--------|-----------|--------------|
| `upgrade_schema.php` | POST | Atualizar estrutura do banco | Admin |

---

## 📝 Convenções de Nomenclatura

### Estrutura de Pastas
- `/api/auth/` - Autenticação
- `/api/alunos/` - Gerenciamento de alunos
- `/api/professores/` - Gerenciamento de professores
- `/api/academias/` - Gerenciamento de academias
- `/api/checkins/` - Gerenciamento de check-ins
- `/api/horarios/` - Gerenciamento de horários
- `/api/config/` - Configurações e utilitários

### Padrões de Nomeação
- **GET endpoints:** `get_{recurso}.php` ou `{recurso}.php` (quando único)
- **POST endpoints:** `{acao}_{recurso}.php` ou `{recurso}.php` (quando único)
- **Busca:** `buscar_{recurso}.php`
- **CRUD:**
  - Criar: `novo_{recurso}.php` ou `criar_{recurso}.php`
  - Ler: `get_{recurso}.php`
  - Atualizar: `update_{recurso}.php` ou `editar_{recurso}.php`
  - Excluir: `excluir_{recurso}.php`

---

## 🔧 Funções Auxiliares

Arquivo: `/api/config/response.php`

Funções disponíveis para padronizar respostas:

```php
// Resposta de sucesso
json_success($data, $message, $statusCode);

// Resposta de erro
json_error($message, $statusCode, $errors);

// Verificar autenticação
require_auth($tipoRequerido);

// Verificar se é AJAX
is_ajax();

// Obter POST sanitizado
get_post($key, $default, $required);

// Obter GET sanitizado
get_get($key, $default, $required);

// Redirecionar
redirect($url, $statusCode);
```

---

## 📖 Documentação Completa

Para documentação detalhada de cada endpoint, incluindo:
- Parâmetros completos
- Exemplos de requisição/resposta
- Códigos de status HTTP
- Tratamento de erros

Veja: **[docs/API_ENDPOINTS.md](API_ENDPOINTS.md)**

---

**Última atualização:** 2024

