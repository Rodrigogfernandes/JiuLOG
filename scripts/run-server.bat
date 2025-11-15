@echo off
REM Script para iniciar o servidor PHP embutido e abrir o navegador (Windows)
REM Pode ser executado de qualquer lugar - encontra automaticamente a raiz do projeto

:: Tenta localizar php.exe: 1) no PATH, 2) em locais comuns do XAMPP/WAMP/Program Files
set PHP_CMD=
where php >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  set PHP_CMD=php
)

if not defined PHP_CMD (
  if exist "C:\xampp\php\php.exe" set PHP_CMD="C:\xampp\php\php.exe"
)
if not defined PHP_CMD (
  if exist "C:\wamp64\bin\php\php.exe" set PHP_CMD="C:\wamp64\bin\php\php.exe"
)
if not defined PHP_CMD (
  if exist "C:\Program Files\PHP\php.exe" set PHP_CMD="C:\Program Files\PHP\php.exe"
)
if not defined PHP_CMD (
  if exist "C:\php\php.exe" set PHP_CMD="C:\php\php.exe"
)

if not defined PHP_CMD (
  echo PHP não encontrado. Instale PHP ou XAMPP e adicione php.exe ao PATH.
  echo Dicas:
  echo  - Se usar XAMPP, adicione C:\xampp\php ao PATH
  echo  - Para adicionar temporariamente ao PATH no Git Bash: export PATH="/c/xampp/php:$PATH"
  pause
  exit /b 1
)

:: Porta e pasta
set PORT=8000
set WEBROOT=%~dp0..

echo Iniciando servidor PHP embutido em http://localhost:%PORT% (servindo %WEBROOT%)
cd /d "%WEBROOT%"

REM Abre o navegador (padrão) apontando para a página inicial
start "" "http://localhost:%PORT%/index.html"

REM Inicia o servidor (este processo fica em primeiro plano)
%PHP_CMD% -S 0.0.0.0:%PORT% -t "%WEBROOT%"
