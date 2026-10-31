# REWOIX Production Hosting & Deployment Manual

This guide details the complete production deployment architecture for **REWOIX** (*Real-World Industry Experience*), optimized to support **10,000+ concurrent active learners and instructors**.

---

## 1. Architecture Overview

```
                ┌──────────────────────────────────────────────┐
                │             Cloudflare / AWS Route 53        │
                │        (DNS + SSL + DDoS Mitigation)         │
                └──────────────────────┬───────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
        ┌───────────────────────┐             ┌───────────────────────┐
        │   Vercel / Next.js    │             │   FastAPI / Uvicorn   │
        │   Edge Global CDN     │ ──────────> │   REST API Cluster    │
        │   (Port 3000 / Web)   │             │   (Port 8000 / API)   │
        └───────────────────────┘             └───────────┬───────────┘
                                                          │
                                         ┌────────────────┴────────────────┐
                                         ▼                                 ▼
                             ┌───────────────────────┐         ┌───────────────────────┐
                             │  PostgreSQL 15+ Pool  │         │   Redis 7 In-Memory   │
                             │ (RDS / Supabase / HA) │         │ (Rate Limit & Cache)  │
                             └───────────────────────┘         └───────────────────────┘
```

---

## 2. Environment Variables Configuration

Create a `.env.production` file in your server or secret manager:

```ini
# Core Environment
APP_ENV=production
DEBUG=false
PROJECT_NAME="REWOIX Experience Platform"
VERSION=1.0.0

# Security (Generate with: openssl rand -hex 32)
SECRET_KEY=94a8f93e98124b892348cbe8924bce89234bf98a7234be892341928374028347
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_MINUTES=10080

# Production Database (AWS RDS / Supabase / Railway)
DATABASE_URL=postgresql+asyncpg://rewoix_user:StrongPassword123@db-host.com:5432/rewoix_db
SYNC_DATABASE_URL=postgresql://rewoix_user:StrongPassword123@db-host.com:5432/rewoix_db

# Redis Caching & Rate Limiting
REDIS_URL=redis://redis-host.com:6379/0

# Production CORS (Include your actual production domains)
BACKEND_CORS_ORIGINS=["https://rewoix.com","https://app.rewoix.com","https://www.rewoix.com"]

# Payment Gateway (Razorpay Live Mode)
RAZORPAY_KEY_ID=rzp_live_your_actual_key_here
RAZORPAY_KEY_SECRET=your_actual_live_secret_here
RAZORPAY_WEBHOOK_SECRET=your_actual_webhook_secret_here

# Frontend URL
NEXT_PUBLIC_API_URL=https://api.rewoix.com/api/v1
```

---

## 3. Deployment Method A: Vercel (Frontend) + Render / Railway (Backend)

*(Recommended for fastest zero-downtime deployment)*

### 1. Frontend on Vercel:
1. Connect your GitHub repository: `https://github.com/Tejaso7/REWOIX.git`.
2. Set **Root Directory** to `frontend`.
3. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL = https://api.yourdomain.com/api/v1`
4. Click **Deploy**. Vercel will build and serve your Next.js 14 App Router globally.

### 2. Backend on Render / Railway / Fly.io:
1. Create a new **Web Service** from GitHub repo.
2. Set **Root Directory** to `backend`.
3. Set **Build Command**: `pip install -r requirements.txt`
4. Set **Start Command**:
   ```bash
   alembic upgrade head && python scripts/sync_db.py && uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
   ```
5. Attach a managed **PostgreSQL** database and supply `DATABASE_URL` and `SECRET_KEY`.

---

## 4. Deployment Method B: Docker Compose (Single-Server / Cloud VPS)

Use this method on any Ubuntu 22.04+ VPS (DigitalOcean, AWS EC2, Hetzner, Linode):

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Tejaso7/REWOIX.git
   cd REWOIX
   ```

2. **Configure production environment:**
   ```bash
   cp .env.example .env.production
   nano .env.production
   ```

3. **Launch container stack:**
   ```bash
   docker compose up -d --build
   ```

4. **Run database migrations:**
   ```bash
   docker compose exec backend alembic upgrade head
   ```

5. **Seed initial simulation courses & admin:**
   ```bash
   docker compose exec backend python scripts/seed_courses.py
   ```

6. **Verify health:**
   ```bash
   curl -I http://localhost:8000/health
   curl -I http://localhost:3000
   ```

---

## 5. Setting Up Nginx & SSL (Let's Encrypt)

If hosting on a raw VPS, configure Nginx as a reverse proxy:

```nginx
# Frontend
server {
    server_name rewoix.com www.rewoix.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    server_name api.rewoix.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable HTTPS:
```bash
sudo certbot --nginx -d rewoix.com -d www.rewoix.com -d api.rewoix.com
```

---

## 6. Verification Checklist Before Launching to Students

- [x] Next.js production build (`npm run build`) compiles with 0 errors.
- [x] Backend tests (`pytest backend/tests`) pass 100%.
- [x] Database migration (`alembic upgrade head`) runs cleanly against PostgreSQL.
- [x] Live Razorpay keys set in backend environment variables.
- [x] SSL certificate active with strict HTTPS redirection.
- [x] Admin custom commission manager active at `/admin/users`.
