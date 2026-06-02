@echo off
:: Set Java 26 environment variables for this session
set "JAVA_HOME=C:\Program Files\Java\jdk-26.0.1"
set "PATH=%JAVA_HOME%\bin;%PATH%"

:: Go to the backend directory and run the application
cd /d "%~dp0Backend\moneymanager"
echo Starting Money Manager Backend with JDK 26...
call mvnw.cmd spring-boot:run
pause
