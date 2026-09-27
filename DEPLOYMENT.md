# EduFlow Production Deployment Guide

## Docker Compose Deployment

1. **Build and start services:**
   ```bash
   docker compose up -d --build
   ```

2. **Execute Database Migrations:**
   ```bash
   docker exec -it eduflow_backend alembic upgrade head
   ```

3. **Seed Initial Production Admin:**
   ```bash
   docker exec -it eduflow_backend python seed.py
   ```

## Cloud Provider Deployment (Azure / AWS)

- **Backend API**: Deploy `Dockerfile.backend` to Azure App Service or AWS ECS.
- **Frontend App**: Deploy Next.js to Vercel or Azure Container Apps.
- **Database**: Azure Database for PostgreSQL Flexible Server or AWS RDS PostgreSQL.
- **Cache**: Azure Cache for Redis or AWS ElastiCache.
