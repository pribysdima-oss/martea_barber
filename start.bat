@echo off
cd /d "%~dp0"
set "NODE=%~dp0tools\node\node.exe"
if not exist "%NODE%" (
  set "NODE=node"
  where node >nul 2>nul
  if errorlevel 1 (
    set "NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
    if not exist "%NODE%" (
      echo Node.js nu este instalat. Instaleaza versiunea LTS de la https://nodejs.org/
      pause
      exit /b 1
    )
  )
)

if not exist node_modules (
  echo Lipsesc dependintele proiectului. Ruleaza mai intai: npm install
  pause
  exit /b 1
)

echo.
echo Martea Barber ruleaza la http://localhost:3000
echo Pastreaza aceasta fereastra deschisa cat timp folosesti programarile.
set "OPEN_BROWSER=1"
"%NODE%" server.js
