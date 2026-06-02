# Set Java 26 environment variables for this session
$env:JAVA_HOME = "C:\Program Files\Java\jdk-26.0.1"
$env:PATH = "C:\Program Files\Java\jdk-26.0.1\bin;" + $env:PATH

# Go to the backend directory and run the application
Set-Location -Path "$PSScriptRoot\Backend\moneymanager"
Write-Host "Starting Money Manager Backend with JDK 26..." -ForegroundColor Green
.\mvnw.cmd spring-boot:run
