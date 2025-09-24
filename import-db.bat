@echo off
REM Script para importar php/schema.sql no MySQL local (Windows + XAMPP)
REM Ajuste XAMPP_PATH se necessário

set XAMPP_PATH=C:\xampp
set MYSQL_CMD="%XAMPP_PATH%\mysql\bin\mysql.exe"
set SQL_FILE=%~dp0JiuLOG\php\schema.sql

if not exist %MYSQL_CMD% (
  echo mysql.exe not found em %MYSQL_CMD%
  echo Atualize a variavel XAMPP_PATH no topo do script ou use phpMyAdmin para importar.
  pause
  exit /b 1
)

if not exist "%SQL_FILE%" (
  echo Arquivo de schema nao encontrado: %SQL_FILE%
  pause
  exit /b 1
)

echo Importando %SQL_FILE% para MySQL (usuário root, sem senha)...
%MYSQL_CMD% -u root < "%SQL_FILE%"

if %ERRORLEVEL% EQU 0 (
  echo Importacao concluida.
) else (
  echo Erro ao importar o schema. Verifique o MySQL ou execute manualmente via phpMyAdmin.
)

pause
