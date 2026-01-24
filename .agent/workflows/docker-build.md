---
description: Build and run the application using Docker
---

# Docker Build and Deployment Workflow

## Overview
This project uses a **monolith architecture** where all services (auth, travel, trip, payment, platform, safety) are consolidated into a single `monolith-app` module.

## Project Structure
```
backend/
├── pom.xml                 # Parent POM (reactor build)
├── Dockerfile              # Main application Dockerfile
├── monolith-app/           # Main application module
├── modules/
│   ├── auth/              # Auth service module
│   ├── travel/            # Travel service module
│   ├── trip/              # Trip service module
│   ├── payment/           # Payment service module
│   ├── platform/          # Platform service module
│   └── safety/            # Safety service module
└── shared/
    ├── common/            # Shared common library
    └── events/            # Shared events library
```

## Build Steps

### 1. Build Docker Image
```bash
cd c:\project\api-gateway\backend
docker build -t api-gateway:latest .
```

### 2. Run with Docker Compose
```bash
cd c:\project\api-gateway
docker-compose up -d
```

### 3. Run Standalone Container
```bash
docker run -p 8080:8080 \
  -e DB_URL=jdbc:postgresql://host.docker.internal:5432/portfolio_db \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=admin \
  api-gateway:latest
```

## Environment Variables
Key environment variables (see `.env.example` for full list):
- `DB_URL` - PostgreSQL database URL
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret
- `GOOGLE_CLIENT_ID` - OAuth2 Google client ID
- `GOOGLE_CLIENT_SECRET` - OAuth2 Google client secret

## Troubleshooting

### Build Fails with "not found" errors
- **Cause**: Dockerfile trying to copy non-existent paths
- **Solution**: The Dockerfile has been updated to build from the monolith-app

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8080
kill -9 <PID>
```

### Database Connection Issues
1. Ensure PostgreSQL is running
2. Verify database exists: `portfolio_db`
3. Check credentials in environment variables
4. For Docker, use `host.docker.internal` instead of `localhost`

## Health Check
Once running, verify the application:
```bash
curl http://localhost:8080/actuator/health
```

## API Documentation
Access Swagger UI:
```
http://localhost:8080/swagger-ui.html
```

## Logs
View container logs:
```bash
docker logs -f <container-id>
```
