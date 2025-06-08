# Eventify - Containerized Event Management System

This project has been containerized using Docker and Docker Compose for easy deployment and development.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (usually comes with Docker Desktop)

## Project Structure

```
event-management/
├── backend/                 # Spring Boot application
│   ├── Dockerfile
│   └── src/
├── frontend/               # React application  
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
├── docker-compose.yml      # Multi-service orchestration
└── README-Docker.md       # This file
```

## Services

The application consists of three main services:

1. **PostgreSQL Database** (`postgres`) - Database server
2. **Spring Boot Backend** (`backend`) - REST API server
3. **React Frontend** (`frontend`) - Web interface served by Nginx

## Quick Start

### Option 1: Automated Setup (Recommended)
```powershell
# Run the setup script
.\setup.ps1
```

### Option 2: Manual Setup

#### 1. Clone and Navigate
```powershell
cd "d:\projects\event management"
```

#### 2. Configure Environment (Optional)
```powershell
# Copy environment template
Copy-Item .env.template .env
# Edit .env file with your configurations
notepad .env
```

#### 3. Build and Start All Services
```powershell
docker-compose up --build
```

This command will:
- Build the backend and frontend Docker images
- Start PostgreSQL, Backend, and Frontend services
- Set up networking between services
- Create persistent volumes for data

### 3. Access the Application
- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:8080
- **Database**: localhost:5432

## Development Commands

### Using PowerShell Management Script (Recommended)
```powershell
# Start services
.\docker-manage.ps1 start

# Start in development mode
.\docker-manage.ps1 start dev

# Check status and health
.\docker-manage.ps1 status

# View logs
.\docker-manage.ps1 logs
.\docker-manage.ps1 logs backend

# Stop services
.\docker-manage.ps1 stop

# Build specific service
.\docker-manage.ps1 build backend

# Get help
.\docker-manage.ps1 help
```

### Using Docker Compose Directly
```powershell
# Start services in background
docker-compose up -d

# View logs
docker-compose logs
docker-compose logs backend

# Stop services
docker-compose down

# Rebuild specific service
docker-compose build backend
```

## Environment Variables

The backend uses the following environment variables (configured in docker-compose.yml):

- `SPRING_DATASOURCE_URL`: Database connection URL
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: Database password
- `ADMIN_EMAIL`: Admin contact email
- `ADMIN_PHONE`: Admin contact phone
- Email configuration for notifications

## Data Persistence

- **Database**: Data is persisted in a Docker volume named `postgres_data`
- **File Uploads**: Uploaded files are stored in a Docker volume named `uploads_data`

## Health Checks

The application includes health checks:
- **Backend**: Available at http://localhost:8080/actuator/health
- **Database**: Built-in PostgreSQL health check

## Troubleshooting

### Services not starting
```bash
# Check service status
docker-compose ps

# Check logs for errors
docker-compose logs [service-name]
```

### Database connection issues
```bash
# Verify database is running
docker-compose exec postgres pg_isready -U postgres

# Check database logs
docker-compose logs postgres
```

### File upload issues
```bash
# Check if uploads volume exists
docker volume ls

# Inspect uploads volume
docker volume inspect event-management_uploads_data
```

### Reset everything
```bash
# Stop and remove containers, networks
docker-compose down

# Remove volumes (WARNING: This deletes all data!)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

## Production Deployment

For production deployment:

1. Update environment variables in `docker-compose.yml`
2. Use environment-specific configuration files
3. Set up proper SSL certificates
4. Configure proper logging
5. Set up monitoring and alerting

### Example production override
Create `docker-compose.prod.yml`:
```yaml
version: '3.8'
services:
  frontend:
    ports:
      - "443:80"
  backend:
    environment:
      SPRING_PROFILES_ACTIVE: prod
```

Run with:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Security Notes

- Change default database credentials
- Update email credentials
- Use environment files for sensitive data
- Set up proper firewall rules
- Enable SSL/TLS in production

## Support

If you encounter any issues:
1. Check the logs: `docker-compose logs`
2. Verify all services are running: `docker-compose ps`
3. Check network connectivity between services
4. Ensure ports are not blocked by firewall
