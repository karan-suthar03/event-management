# Eventify Setup Script for PowerShell
# This script helps you set up the containerized Eventify application

Write-Host "🎉 Welcome to Eventify Setup!" -ForegroundColor Cyan
Write-Host "This script will help you set up the containerized event management system." -ForegroundColor White
Write-Host ""

# Function to write colored output
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if Docker is installed and running
Write-Info "Checking Docker installation..."
try {
    $dockerVersion = docker --version
    Write-Success "Docker found: $dockerVersion"
} catch {
    Write-Error "Docker is not installed or not in PATH. Please install Docker Desktop first."
    Write-Host "Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running
Write-Info "Checking if Docker is running..."
try {
    docker info | Out-Null
    Write-Success "Docker is running"
} catch {
    Write-Error "Docker is not running. Please start Docker Desktop and run this script again."
    exit 1
}

# Check if docker-compose is available
Write-Info "Checking Docker Compose..."
try {
    $composeVersion = docker-compose --version
    Write-Success "Docker Compose found: $composeVersion"
} catch {
    Write-Error "Docker Compose not found. Please ensure Docker Desktop is properly installed."
    exit 1
}

# Check if .env file exists
if (Test-Path ".env") {
    Write-Info ".env file already exists. Skipping environment setup."
} else {
    Write-Info "Creating .env file from template..."
    if (Test-Path ".env.template") {
        Copy-Item ".env.template" ".env"
        Write-Success "Created .env file from template"
        Write-Warning "Please edit the .env file to configure your environment variables:"
        Write-Host "  - Database password" -ForegroundColor Yellow
        Write-Host "  - Admin email and phone" -ForegroundColor Yellow
        Write-Host "  - Email configuration for notifications" -ForegroundColor Yellow
        Write-Host ""
        $openEnv = Read-Host "Would you like to open the .env file now? (y/N)"
        if ($openEnv -eq "y" -or $openEnv -eq "Y") {
            try {
                notepad .env
            } catch {
                Write-Info "Please manually edit the .env file with your preferred text editor"
            }
        }
    } else {
        Write-Warning ".env.template not found. You may need to create a .env file manually."
    }
}

Write-Host ""
Write-Info "Setup complete! Here's what you can do next:"
Write-Host ""
Write-Host "🚀 Quick Start Commands:" -ForegroundColor Cyan
Write-Host "  .\docker-manage.ps1 start     # Start all services"
Write-Host "  .\docker-manage.ps1 start dev # Start in development mode"
Write-Host "  .\docker-manage.ps1 status    # Check service status"
Write-Host "  .\docker-manage.ps1 logs      # View logs"
Write-Host "  .\docker-manage.ps1 stop      # Stop all services"
Write-Host ""
Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
Write-Host "  Frontend:    http://localhost"
Write-Host "  Backend API: http://localhost:8080"
Write-Host "  Database:    localhost:5432"
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "  README-Docker.md - Detailed Docker setup guide"
Write-Host "  .\docker-manage.ps1 help - Management script help"
Write-Host ""

$startNow = Read-Host "Would you like to start the services now? (y/N)"
if ($startNow -eq "y" -or $startNow -eq "Y") {
    Write-Info "Starting services..."
    .\docker-manage.ps1 start
} else {
    Write-Info "You can start the services later with: .\docker-manage.ps1 start"
}

Write-Host ""
Write-Success "Setup completed! Enjoy using Eventify! 🎊" -ForegroundColor Green
