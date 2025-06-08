@echo off
setlocal enabledelayedexpansion

:: Database Migration Batch Script
:: Simple version for migrating local PostgreSQL to Docker

set LOCAL_DB_HOST=host.docker.internal
set LOCAL_DB_PORT=5432
set LOCAL_DB_NAME=eventDB
set LOCAL_DB_USER=postgres
set LOCAL_DB_PASSWORD=karan
set DOCKER_CONTAINER_NAME=eventify-postgres
set BACKUP_FILE=eventdb_backup.sql

echo.
echo ===============================================
echo   Event Management Database Migration Tool
echo ===============================================
echo.

if "%1"=="" (
    echo Usage: %0 [backup^|restore^|full]
    echo.
    echo Examples:
    echo   %0 backup   - Create backup of local database
    echo   %0 restore  - Restore backup to Docker
    echo   %0 full     - Do both backup and restore
    goto :eof
)

if /i "%1"=="backup" goto :backup
if /i "%1"=="restore" goto :restore
if /i "%1"=="full" goto :full
echo Invalid option. Use: backup, restore, or full
goto :eof

:backup
echo 🔄 Creating database backup using Docker...
echo 💾 Backing up local database...

docker run --rm -e PGPASSWORD=%LOCAL_DB_PASSWORD% -v "%CD%:/backup" postgres:15-alpine pg_dump -h %LOCAL_DB_HOST% -p %LOCAL_DB_PORT% -U %LOCAL_DB_USER% -d %LOCAL_DB_NAME% --no-password --verbose --clean --if-exists --create > %BACKUP_FILE%

if exist %BACKUP_FILE% (
    echo ✅ Database backup created successfully: %BACKUP_FILE%
    for %%A in (%BACKUP_FILE%) do echo 📊 Backup file size: %%~zA bytes
    if /i "%1"=="full" goto :restore
) else (
    echo ❌ Database backup failed!
)
goto :eof

:restore
echo 🔄 Starting database restore to Docker...

if not exist %BACKUP_FILE% (
    echo ❌ Backup file not found: %BACKUP_FILE%
    echo 💡 Run "%0 backup" first to create a backup
    goto :eof
)

:: Check if Docker container is running
docker ps --filter "name=%DOCKER_CONTAINER_NAME%" --format "{{.Status}}" > nul 2>&1
if errorlevel 1 (
    echo ❌ Docker container '%DOCKER_CONTAINER_NAME%' is not running!
    echo 💡 Start your Docker services first: docker-compose up -d
    goto :eof
)

echo ✅ Docker container '%DOCKER_CONTAINER_NAME%' is running
echo 📥 Restoring database from backup...

:: Copy backup file to container
docker cp %BACKUP_FILE% %DOCKER_CONTAINER_NAME%:/tmp/%BACKUP_FILE%
if errorlevel 1 (
    echo ❌ Failed to copy backup file to container!
    goto :eof
)

echo ✅ Backup file copied to container

:: Restore database
echo 🔄 Restoring database...
docker exec -e PGPASSWORD=karan %DOCKER_CONTAINER_NAME% psql -U postgres -d postgres -f /tmp/%BACKUP_FILE%
if errorlevel 1 (
    echo ❌ Database restore failed!
    goto :eof
)

echo ✅ Database restored successfully!

:: Clean up
docker exec %DOCKER_CONTAINER_NAME% rm /tmp/%BACKUP_FILE%
echo 🧹 Cleaned up temporary files

:: Verify
echo 🔍 Verifying migration...
docker exec -e PGPASSWORD=karan %DOCKER_CONTAINER_NAME% psql -U postgres -d eventDB -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"

echo ✨ Migration completed successfully!
goto :eof

:full
call :backup
if exist %BACKUP_FILE% (
    echo.
    echo ⏳ Proceeding to restore...
    timeout /t 2 /nobreak > nul
    call :restore
)
goto :eof
