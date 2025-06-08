# Alternative Database Migration using Docker
# This script uses Docker to backup your local database and restore it to the Docker container

param(
    [Parameter(Mandatory=$false)]
    [string]$Action = "backup"
)

# Configuration
$LOCAL_DB_HOST = "host.docker.internal"  # Docker's way to access host machine
$LOCAL_DB_PORT = "5432"
$LOCAL_DB_NAME = "eventDB"
$LOCAL_DB_USER = "postgres"
$LOCAL_DB_PASSWORD = "karan"

$DOCKER_CONTAINER_NAME = "eventify-postgres"
$BACKUP_FILE = "eventdb_backup.sql"
$BACKUP_PATH = Join-Path $PSScriptRoot $BACKUP_FILE

function Backup-LocalDatabaseWithDocker {
    Write-Host "🔄 Creating database backup using Docker..." -ForegroundColor Yellow
    
    try {
        # Use Docker to run pg_dump against local database
        Write-Host "💾 Backing up local database..." -ForegroundColor Yellow
        
        # Create backup using Docker
        docker run --rm `
            -e PGPASSWORD=$LOCAL_DB_PASSWORD `
            -v "${PWD}:/backup" `
            postgres:15-alpine `
            pg_dump -h $LOCAL_DB_HOST -p $LOCAL_DB_PORT -U $LOCAL_DB_USER -d $LOCAL_DB_NAME `
            --no-password --verbose --clean --if-exists --create > $BACKUP_PATH
        
        if ($LASTEXITCODE -eq 0 -and (Test-Path $BACKUP_PATH)) {
            Write-Host "✅ Database backup created successfully: $BACKUP_PATH" -ForegroundColor Green
            $backupSize = (Get-Item $BACKUP_PATH).Length
            Write-Host "📊 Backup file size: $([math]::Round($backupSize/1KB, 2)) KB" -ForegroundColor Cyan
            return $true
        } else {
            Write-Host "❌ Database backup failed!" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ Error during backup: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Restore-DockerDatabase {
    Write-Host "🔄 Starting database restore to Docker..." -ForegroundColor Yellow
    
    if (-not (Test-Path $BACKUP_PATH)) {
        Write-Host "❌ Backup file not found: $BACKUP_PATH" -ForegroundColor Red
        Write-Host "💡 Run with -Action backup first to create a backup" -ForegroundColor Cyan
        return $false
    }
    
    # Check if Docker container is running
    $containerStatus = docker ps --filter "name=$DOCKER_CONTAINER_NAME" --format "{{.Status}}" 2>$null
    if (-not $containerStatus) {
        Write-Host "❌ Docker container '$DOCKER_CONTAINER_NAME' is not running!" -ForegroundColor Red
        Write-Host "💡 Start your Docker services first: docker-compose up -d" -ForegroundColor Cyan
        return $false
    }
    
    Write-Host "✅ Docker container '$DOCKER_CONTAINER_NAME' is running" -ForegroundColor Green
    Write-Host "📥 Restoring database from backup..." -ForegroundColor Yellow
    
    try {
        # Copy backup file to container
        docker cp $BACKUP_PATH "${DOCKER_CONTAINER_NAME}:/tmp/$BACKUP_FILE"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Backup file copied to container" -ForegroundColor Green
            
            # Restore database
            Write-Host "🔄 Restoring database..." -ForegroundColor Yellow
            docker exec -e PGPASSWORD=karan $DOCKER_CONTAINER_NAME psql -U postgres -d postgres -f "/tmp/$BACKUP_FILE"
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Database restored successfully!" -ForegroundColor Green
                
                # Clean up backup file from container
                docker exec $DOCKER_CONTAINER_NAME rm "/tmp/$BACKUP_FILE"
                Write-Host "🧹 Cleaned up temporary files" -ForegroundColor Green
                return $true
            } else {
                Write-Host "❌ Database restore failed!" -ForegroundColor Red
                return $false
            }
        } else {
            Write-Host "❌ Failed to copy backup file to container!" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ Error during restore: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Verify-Migration {
    Write-Host "🔍 Verifying migration..." -ForegroundColor Yellow
    
    try {
        # Get table count from Docker database
        $dockerTableCount = docker exec -e PGPASSWORD=karan $DOCKER_CONTAINER_NAME psql -U postgres -d eventDB -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>$null
        
        if ($dockerTableCount -and $dockerTableCount.Trim() -gt 0) {
            Write-Host "✅ Migration verified! Docker database has $($dockerTableCount.Trim()) tables" -ForegroundColor Green
            
            # Show table list
            Write-Host "📋 Tables in Docker database:" -ForegroundColor Cyan
            docker exec -e PGPASSWORD=karan $DOCKER_CONTAINER_NAME psql -U postgres -d eventDB -c "\dt"
        } else {
            Write-Host "⚠️  Warning: Could not verify migration or no tables found" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "⚠️  Could not verify migration: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Main execution
Write-Host "🐋 Event Management Database Migration Tool (Docker Method)" -ForegroundColor Magenta
Write-Host "==========================================================" -ForegroundColor Magenta

switch ($Action.ToLower()) {
    "backup" {
        if (Backup-LocalDatabaseWithDocker) {
            Write-Host "`n✨ Backup completed successfully!" -ForegroundColor Green
            Write-Host "💡 Next step: Run 'powershell .\docker-db-migration.ps1 -Action restore' to restore to Docker" -ForegroundColor Cyan
        }
    }
    "restore" {
        if (Restore-DockerDatabase) {
            Verify-Migration
            Write-Host "`n✨ Migration completed successfully!" -ForegroundColor Green
        }
    }
    "full" {
        if (Backup-LocalDatabaseWithDocker) {
            Write-Host "`n⏳ Proceeding to restore..." -ForegroundColor Yellow
            Start-Sleep -Seconds 2
            if (Restore-DockerDatabase) {
                Verify-Migration
                Write-Host "`n✨ Full migration completed successfully!" -ForegroundColor Green
            }
        }
    }
    default {
        Write-Host "❌ Invalid action. Use: backup, restore, or full" -ForegroundColor Red
        Write-Host "Examples:" -ForegroundColor Cyan
        Write-Host "  .\docker-db-migration.ps1 -Action backup" -ForegroundColor Gray
        Write-Host "  .\docker-db-migration.ps1 -Action restore" -ForegroundColor Gray  
        Write-Host "  .\docker-db-migration.ps1 -Action full" -ForegroundColor Gray
    }
}
