@echo off
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required to launch the local module server.
  echo Please install Node.js, or run this project with another static server.
  pause
  exit /b 1
)

node server.mjs
