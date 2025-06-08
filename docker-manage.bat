@echo off
setlocal enabledelayedexpansion

REM Eventify Docker Management Script for Windows
REM Colors for output (using Windows echo with color codes)

set "INFO=[INFO]"
set "SUCCESS=[SUCCESS]"
set "WARNING=[WARNING]"
set "ERROR=[ERROR]"

:check_docker
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo %ERROR% Docker is not running. Please start Docker Desktop and try again.
    exit /b 1
)
goto :eof

:start_services
echo %INFO% Starting Eventify services...
call :check_docker
if %errorlevel% neq 0 exit /b 1

if "%~1"=="dev" (
    echo %INFO% Starting in development mode...
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
) else (
    docker-compose up --build -d
)

if %errorlevel% equ 0 (
    echo %SUCCESS% Services started successfully!
    echo %INFO% Frontend: http://localhost
    echo %INFO% Backend API: http://localhost:8080
    echo %INFO% Database: localhost:5432
) else (
    echo %ERROR% Failed to start services
)
goto :eof

:stop_services
echo %INFO% Stopping Eventify services...
docker-compose down
if %errorlevel% equ 0 (
    echo %SUCCESS% Services stopped successfully!
) else (
    echo %ERROR% Failed to stop services
)
goto :eof

:restart_services
echo %INFO% Restarting Eventify services...
call :stop_services
call :start_services %~1
goto :eof

:view_logs
if "%~1"=="" (
    docker-compose logs -f
) else (
    docker-compose logs -f %~1
)
goto :eof

:check_status
echo %INFO% Checking service status...
docker-compose ps
echo.
echo %INFO% Health checks:

REM Check backend health
curl -f -s http://localhost:8080/actuator/health >nul 2>&1
if %errorlevel% equ 0 (
    echo %SUCCESS% Backend is healthy
) else (
    echo %WARNING% Backend health check failed
)

REM Check frontend
curl -f -s http://localhost >nul 2>&1
if %errorlevel% equ 0 (
    echo %SUCCESS% Frontend is accessible
) else (
    echo %WARNING% Frontend is not accessible
)
goto :eof

:reset_all
echo %WARNING% This will remove all containers, networks, and volumes!
set /p confirm="Are you sure? (y/N): "
if /i "!confirm!"=="y" (
    echo %INFO% Removing all services and data...
    docker-compose down -v --rmi all
    echo %SUCCESS% Reset completed!
) else (
    echo %INFO% Reset cancelled.
)
goto :eof

:build_service
if "%~1"=="" (
    echo %ERROR% Please specify a service to build (backend, frontend, or all)
    exit /b 1
)

echo %INFO% Building %~1...
if "%~1"=="all" (
    docker-compose build
) else (
    docker-compose build %~1
)

if %errorlevel% equ 0 (
    echo %SUCCESS% Build completed!
) else (
    echo %ERROR% Build failed!
)
goto :eof

:show_help
echo Eventify Docker Management Script for Windows
echo.
echo Usage: %0 [COMMAND] [OPTIONS]
echo.
echo Commands:
echo   start [dev]     Start all services (add 'dev' for development mode)
echo   stop            Stop all services
echo   restart [dev]   Restart all services
echo   status          Check service status and health
echo   logs [service]  View logs (optionally for specific service)
echo   build [service] Build specific service or all
echo   reset           Remove all containers, networks, and volumes
echo   help            Show this help message
echo.
echo Examples:
echo   %0 start        # Start in production mode
echo   %0 start dev    # Start in development mode
echo   %0 logs backend # View backend logs
echo   %0 build frontend # Build only frontend
goto :eof

REM Main script logic
if "%~1"=="start" (
    call :start_services %~2
) else if "%~1"=="stop" (
    call :stop_services
) else if "%~1"=="restart" (
    call :restart_services %~2
) else if "%~1"=="status" (
    call :check_status
) else if "%~1"=="logs" (
    call :view_logs %~2
) else if "%~1"=="build" (
    call :build_service %~2
) else if "%~1"=="reset" (
    call :reset_all
) else if "%~1"=="help" (
    call :show_help
) else if "%~1"=="--help" (
    call :show_help
) else if "%~1"=="-h" (
    call :show_help
) else (
    echo %ERROR% Unknown command: %~1
    echo.
    call :show_help
    exit /b 1
)
