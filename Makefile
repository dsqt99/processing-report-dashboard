# Makefile for Docker Compose commands

.PHONY: help dev prod api build clean logs stop restart

# Default target
help:
	@echo "Available commands:"
	@echo "  make dev      - Start development environment"
	@echo "  make prod     - Start production environment"
	@echo "  make api      - Start API server only"
	@echo "  make build    - Build all images"
	@echo "  make clean    - Remove all containers and images"
	@echo "  make logs     - Show logs"
	@echo "  make stop     - Stop all services"
	@echo "  make restart  - Restart services"

# Development environment
dev:
	docker-compose --profile dev up --build

# Production environment
prod:
	docker-compose --profile prod up --build -d

# API server only
api:
	docker-compose --profile api up --build -d

# Build all images
build:
	docker-compose build

# Clean up
clean:
	docker-compose down --rmi all --volumes --remove-orphans
	docker system prune -f

# Show logs
logs:
	docker-compose logs -f

# Stop all services
stop:
	docker-compose down

# Restart services
restart:
	docker-compose restart