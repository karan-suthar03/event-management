# Eventify Docker Management Script for PowerShell
param(
    [Parameter(Position=0)]
    [string]$Command,
    
    [Parameter(Position=1)]
    [string]$Option
)

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

# Function to check if Docker is running
function Test-Docker {
    try {
        docker info | Out-Null
        return $true
    }
    catch {
        Write-Error "Docker is not running. Please start Docker Desktop and try again."
        return $false
    }
}

# Function to start services
function Start-Services {
    param([string]$Mode)
    
    Write-Info "Starting Eventify services..."
    
    if (!(Test-Docker)) {
        exit 1
    }
    
    try {
        if ($Mode -eq "dev") {
            Write-Info "Starting in development mode..."
            docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
        } else {
            docker-compose up --build -d
        }
        
        Write-Success "Services started successfully!"
        Write-Info "Frontend: http://localhost"
        Write-Info "Backend API: http://localhost:8080"
        Write-Info "Database: localhost:5432"
    }
    catch {
        Write-Error "Failed to start services: $_"
    }
}

# Function to stop services
function Stop-Services {
    Write-Info "Stopping Eventify services..."
    
    try {
        docker-compose down
        Write-Success "Services stopped successfully!"
    }
    catch {
        Write-Error "Failed to stop services: $_"
    }
}

# Function to restart services
function Restart-Services {
    param([string]$Mode)
    
    Write-Info "Restarting Eventify services..."
    Stop-Services
    Start-Services $Mode
}

# Function to view logs
function Show-Logs {
    param([string]$Service)
    
    try {
        if ([string]::IsNullOrEmpty($Service)) {
            docker-compose logs -f
        } else {
            docker-compose logs -f $Service
        }
    }
    catch {
        Write-Error "Failed to show logs: $_"
    }
}

# Function to check status
function Test-Status {
    Write-Info "Checking service status..."
    
    try {
        docker-compose ps
        Write-Host ""
        Write-Info "Health checks:"
        
        # Check backend health
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Success "Backend is healthy"
            } else {
                Write-Warning "Backend health check returned status $($response.StatusCode)"
            }
        }
        catch {
            Write-Warning "Backend health check failed"
        }
        
        # Check frontend
        try {
            $response = Invoke-WebRequest -Uri "http://localhost" -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Success "Frontend is accessible"
            } else {
                Write-Warning "Frontend returned status $($response.StatusCode)"
            }
        }
        catch {
            Write-Warning "Frontend is not accessible"
        }
    }
    catch {
        Write-Error "Failed to check status: $_"
    }
}

# Function to reset everything
function Reset-All {
    Write-Warning "This will remove all containers, networks, and volumes!"
    $confirm = Read-Host "Are you sure? (y/N)"
    
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        Write-Info "Removing all services and data..."
        try {
            docker-compose down -v --rmi all
            Write-Success "Reset completed!"
        }
        catch {
            Write-Error "Failed to reset: $_"
        }
    } else {
        Write-Info "Reset cancelled."
    }
}

# Function to build service
function Build-Service {
    param([string]$Service)
    
    if ([string]::IsNullOrEmpty($Service)) {
        Write-Error "Please specify a service to build (backend, frontend, or all)"
        return
    }
    
    Write-Info "Building $Service..."
    
    try {
        if ($Service -eq "all") {
            docker-compose build
        } else {
            docker-compose build $Service
        }
        Write-Success "Build completed!"
    }
    catch {
        Write-Error "Build failed: $_"
    }
}

# Function to show help
function Show-Help {
    Write-Host "Eventify Docker Management Script for PowerShell" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\docker-manage.ps1 [COMMAND] [OPTIONS]" -ForegroundColor White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor White
    Write-Host "  start [dev]     Start all services (add 'dev' for development mode)"
    Write-Host "  stop            Stop all services"
    Write-Host "  restart [dev]   Restart all services"
    Write-Host "  status          Check service status and health"
    Write-Host "  logs [service]  View logs (optionally for specific service)"
    Write-Host "  build [service] Build specific service or all"
    Write-Host "  reset           Remove all containers, networks, and volumes"
    Write-Host "  help            Show this help message"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor White
    Write-Host "  .\docker-manage.ps1 start        # Start in production mode"
    Write-Host "  .\docker-manage.ps1 start dev    # Start in development mode"
    Write-Host "  .\docker-manage.ps1 logs backend # View backend logs"
    Write-Host "  .\docker-manage.ps1 build frontend # Build only frontend"
}

# Main script logic
switch ($Command) {
    "start" {
        Start-Services $Option
    }
    "stop" {
        Stop-Services
    }
    "restart" {
        Restart-Services $Option
    }
    "status" {
        Test-Status
    }
    "logs" {
        Show-Logs $Option
    }
    "build" {
        Build-Service $Option
    }
    "reset" {
        Reset-All
    }
    "help" {
        Show-Help
    }
    "--help" {
        Show-Help
    }
    "-h" {
        Show-Help
    }
    default {
        if ([string]::IsNullOrEmpty($Command)) {
            Write-Error "No command specified."
        } else {
            Write-Error "Unknown command: $Command"
        }
        Write-Host ""
        Show-Help
    }
}
