@echo off
REM ------------------------------------------------------------
REM  JiuLOG - Setup do Banco de Dados (Windows + XAMPP)
REM  Uso:
REM    setup_db.bat [usuario] [senha] [host]
REM  Exemplos:
REM    setup_db.bat              (usa root sem senha, host localhost)
REM    setup_db.bat root "" 127.0.0.1
REM    setup_db.bat root minhaSenha localhost
REM ------------------------------------------------------------

setlocal ENABLEDELAYEDEXPANSION

REM Caminho padrão do XAMPP (ajuste se necessário)
set XAMPP_PATH=C:\xampp
set MYSQL_CMD="%XAMPP_PATH%\mysql\bin\mysql.exe"

REM Script SQL canônico do projeto (estrutura completa)
REM O arquivo está em config/database_setup.sql (relativo à raiz do projeto)
set SQL_FILE=%~dp0..\config\database_setup.sql

REM Credenciais/host (padrões para XAMPP)
set DB_USER=%~1
if "!DB_USER!"=="" set DB_USER=root

set DB_PASS=%~2
set DB_HOST=%~3
if "!DB_HOST!"=="" set DB_HOST=localhost

echo ==============================================
echo   JiuLOG - Criacao/Atualizacao do Banco (MySQL)
echo ==============================================
echo.

REM Verificar mysql.exe
if not exist %MYSQL_CMD% (
  echo ✗ Nao encontrei o MySQL do XAMPP em: %MYSQL_CMD%
  echo → Ajuste a variavel XAMPP_PATH dentro deste arquivo.
  echo → Ou rode manualmente via phpMyAdmin importando database_setup.sql
  pause
  exit /b 1
)

REM Verificar arquivo SQL
if not exist "%SQL_FILE%" (
  echo ✗ Arquivo SQL nao encontrado: %SQL_FILE%
  echo → Certifique-se de que "config\database_setup.sql" existe no projeto.
  pause
  exit /b 1
)

REM Montar parametros de senha (so adiciona -p se houver senha)
set PASS_ARG=
if not "!DB_PASS!"=="" set PASS_ARG=-p!DB_PASS!

echo ✓ MySQL encontrado: %MYSQL_CMD%
echo ✓ Script SQL: %SQL_FILE%
echo ✓ Host: !DB_HOST!  Usuario: !DB_USER!
echo.
echo → Importando estrutura e dados de exemplo...
"%XAMPP_PATH%\mysql\bin\mysql.exe" -h !DB_HOST! -u !DB_USER! !PASS_ARG! < "%SQL_FILE%"

if %ERRORLEVEL% EQU 0 (
  echo.
  echo ✓ Banco de dados "jiulog" criado/atualizado com sucesso!
  echo   Dica: Acesse http://localhost/phpmyadmin para verificar as tabelas.
) else (
  echo.
  echo ✗ Falha ao importar o SQL. Possiveis causas:
  echo   - Servico MySQL nao iniciado no XAMPP
  echo   - Usuario/senha/host invalidos
  echo   - Porta MySQL alterada
  echo.
  echo Tente:
  echo   1) Iniciar MySQL no XAMPP Control Panel
  echo   2) Rodar novamente este comando
  echo   3) Ou importar manualmente via phpMyAdmin (config\database_setup.sql)
  pause
  exit /b 1
)

echo.
echo Tudo pronto. URLs uteis:
echo   - phpMyAdmin:   http://localhost/phpmyadmin
echo   - App (index):  http://localhost/jiulog/index.html
echo.
pause
endlocal


