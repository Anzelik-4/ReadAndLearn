@echo off
echo Запуск проекта ReadAndLearn...

:: Запуск Django сервера в новом окне
start "ReadAndLearn Backend" cmd /k "cd /d %~dp0 && venv\Scripts\activate && python manage.py runserver"

:: Небольшая пауза, чтобы Django успел запуститься
timeout /t 3 /nobreak >nul

:: Запуск React сервера в новом окне
start "ReadAndLearn Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo Проект запущен!
echo Бэкенд: http://localhost:8000
echo Фронтенд: http://localhost:3000 
