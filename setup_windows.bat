@echo off
echo ========================================
echo    CONFIGURACAO RAPIDA - JiuLOG
echo ========================================
echo.

echo Verificando se o XAMPP esta instalado...
if exist "C:\xampp\xampp-control.exe" (
    echo ✓ XAMPP encontrado!
) else (
    echo ✗ XAMPP nao encontrado em C:\xampp\
    echo Por favor, instale o XAMPP primeiro: https://www.apachefriends.org/pt_br/index.html
    pause
    exit
)

echo.
echo Copiando arquivos para o XAMPP...
if not exist "C:\xampp\htdocs\JiuLOG" (
    mkdir "C:\xampp\htdocs\JiuLOG"
)

xcopy /E /I /Y . "C:\xampp\htdocs\JiuLOG\"
echo ✓ Arquivos copiados com sucesso!

echo.
echo Iniciando servicos do XAMPP...
start "" "C:\xampp\xampp-control.exe"

echo.
echo ========================================
echo    CONFIGURACAO CONCLUIDA!
echo ========================================
echo.
echo Proximos passos:
echo 1. Inicie o Apache e MySQL no XAMPP Control Panel
echo 2. Acesse: http://localhost/phpmyadmin
echo 3. Crie o banco 'jiulog' e importe o arquivo database_setup.sql
echo 4. Acesse: http://localhost/JiuLOG/index.html
echo.
echo Para testar o sistema:
echo Acesse: http://localhost/JiuLOG/test_system.html
echo.
pause
