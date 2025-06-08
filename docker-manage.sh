#!/bin/bash

# Eventify Docker Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop and try again."
        exit 1
    fi
}

# Function to start services
start_services() {
    print_status "Starting Eventify services..."
    check_docker
    
    if [ "$1" = "dev" ]; then
        print_status "Starting in development mode..."
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
    else
        docker-compose up --build -d
    fi
    
    print_success "Services started successfully!"
    print_status "Frontend: http://localhost"
    print_status "Backend API: http://localhost:8080"
    print_status "Database: localhost:5432"
}

# Function to stop services
stop_services() {
    print_status "Stopping Eventify services..."
    docker-compose down
    print_success "Services stopped successfully!"
}

# Function to restart services
restart_services() {
    print_status "Restarting Eventify services..."
    stop_services
    start_services $1
}

# Function to view logs
view_logs() {
    if [ -z "$1" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f $1
    fi
}

# Function to check status
check_status() {
    print_status "Checking service status..."
    docker-compose ps
    echo ""
    print_status "Health checks:"
    
    # Check backend health
    if curl -f -s http://localhost:8080/actuator/health >/dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_warning "Backend health check failed"
    fi
    
    # Check frontend
    if curl -f -s http://localhost >/dev/null 2>&1; then
        print_success "Frontend is accessible"
    else
        print_warning "Frontend is not accessible"
    fi
}

# Function to reset everything
reset_all() {
    print_warning "This will remove all containers, networks, and volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Removing all services and data..."
        docker-compose down -v --rmi all
        print_success "Reset completed!"
    else
        print_status "Reset cancelled."
    fi
}

# Function to build specific service
build_service() {
    if [ -z "$1" ]; then
        print_error "Please specify a service to build (backend, frontend, or all)"
        exit 1
    fi
    
    print_status "Building $1..."
    if [ "$1" = "all" ]; then
        docker-compose build
    else
        docker-compose build $1
    fi
    print_success "Build completed!"
}

# Function to show help
show_help() {
    echo "Eventify Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start [dev]     Start all services (add 'dev' for development mode)"
    echo "  stop            Stop all services"
    echo "  restart [dev]   Restart all services"
    echo "  status          Check service status and health"
    echo "  logs [service]  View logs (optionally for specific service)"
    echo "  build [service] Build specific service or all"
    echo "  reset           Remove all containers, networks, and volumes"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start        # Start in production mode"
    echo "  $0 start dev    # Start in development mode"
    echo "  $0 logs backend # View backend logs"
    echo "  $0 build frontend # Build only frontend"
}

# Main script logic
case "$1" in
    start)
        start_services $2
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services $2
        ;;
    status)
        check_status
        ;;
    logs)
        view_logs $2
        ;;
    build)
        build_service $2
        ;;
    reset)
        reset_all
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
