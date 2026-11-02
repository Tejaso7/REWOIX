# REWOIX Deployment Guide: Render & Railway
**The Corporate Experience Simulator** | *Stop learning projects. Start experiencing work.*

---

## 1. Executive Summary: Will REWOIX Run Fine on Render and Railway?

**Yes, REWOIX runs exceptionally well on both Render and Railway.**

Both platforms are cloud PaaS (Platform as a Service) providers designed specifically for modern full-stack web applications, containerized microservices, and managed data stores. 

REWOIX has been engineered and validated with:
1. **Multi-Stage Docker Containers** (`Dockerfile.backend` and `Dockerfile.frontend`) that build lightweight Alpine Linux images with non-root security.
2. **Dynamic `$PORT` Binding**: ASGI/Uvicorn and Next.js automatically bind to `${PORT:-8000}` and `${PORT:-3000}` injected by Render and Railway.
3. **Database URL Auto-Normalization**: The SQLAlchemy async engine in `backend/app/core/database.py` dynamically normalizes `postgres://` or `postgresql://` strings injected by Render/Railway into `postgresql+asyncpg://` without any manual connection string surgery.
4. **Resilient Redis Architecture**: The Redis client handles cold boots and graceful fallback if cache initialization is asynchronous.
5. **Blueprint & Configuration As Code**: Native `render.yaml` and `railway.json` are committed to the root of the repository.

---

## 2. Render vs. Railway Comparison Matrix

| Capability | Render | Railway |
| :--- | :--- | :--- |
| **Managed PostgreSQL** | Built-in (Free tier available, starter plans) | Built-in 1-Click Plugin (Very fast provision) |
| **Managed Redis** | Built-in | Built-in 1-Click Plugin |
| **Blueprint / IaC** | `render.yaml` in repo root auto-creates DB, Redis, Backend & Frontend | Project Canvas with linked GitHub repo services |
| **Custom Domains & SSL** | Free automated Let's Encrypt SSL certificates | Free automated Let's Encrypt SSL certificates |
| **Monorepo / Multi-Service** | Native support via `render.yaml` or UI | Native support via multiple services from same repo |
| **Container Port Handling** | Injects `$PORT` (typically `10000`) | Injects `$PORT` (dynamic internal routing) |
| **Deployment Speed** | Fast (cached Docker build layers) | Blazing fast (Nixpacks or Dockerfile caching) |
| **Free / Starter Credits** | Generous starter tier (free web services spin down on idle) | \$5 monthly free usage credit on trial |
| **Recommended For** | Zero-touch blueprint deployments with static infrastructure definition | Developer experience, live visual project graphs, instant metrics |

---

## 3. Option A: Deploying on Render via Blueprint (Recommended 1-Click)

Render provides the cleanest automated setup because REWOIX includes a native `render.yaml` Blueprint file.

### Step-by-Step Instructions:
1. **Sign Up / Log In**:
   - Go to [render.com](https://render.com) and sign in using your GitHub account (`Tejaso7`).
2. **Create New Blueprint**:
   - In your Render Dashboard, click **New +** -> **Blueprint**.
   - Connect your GitHub repository: `Tejaso7/REWOIX`.
   - Select branch: `stable` (or `main`).
3. **Review Resources**:
   - Render will parse `render.yaml` and display the plan:
     - `rewoix-db` (PostgreSQL Database)
     - `rewoix-redis` (Redis Cache)
     - `rewoix-backend` (Web Service via `Dockerfile.backend`)
     - `rewoix-frontend` (Web Service via `Dockerfile.frontend`)
4. **Add Sensitive Environment Variables** (Optional):
   - Under `rewoix-backend`, add your live production keys when ready:
     - `RAZORPAY_KEY_ID`: `rzp_live_...`
     - `RAZORPAY_KEY_SECRET`: `...`
     - `RAZORPAY_WEBHOOK_SECRET`: `...`
     - `SMTP_USER` & `SMTP_PASSWORD`: For transactional OTP emails.
5. **Click "Apply"**:
   - Render will provision the database, start Redis, build the Docker images, run database migrations (`alembic upgrade head`), seed default corporate simulations, and launch both frontend and backend.
6. **Access Your Live App**:
   - Backend URL: `https://rewoix-backend.onrender.com`
   - Frontend URL: `https://rewoix-frontend.onrender.com`

---

## 4. Option B: Deploying on Railway

Railway allows you to set up the entire stack on an interactive visual canvas.

### Step-by-Step Instructions:
1. **Sign Up / Log In**:
   - Go to [railway.app](https://railway.app) and log in with GitHub (`Tejaso7`).
2. **Create a New Project**:
   - Click **New Project** -> **Deploy from GitHub repo**.
   - Select `Tejaso7/REWOIX`.
3. **Add Managed Databases**:
   - In the project canvas, click **+ New** -> **Database** -> **Add PostgreSQL**.
   - Click **+ New** -> **Database** -> **Add Redis**.
4. **Configure Backend Service**:
   - Click on the newly created service from GitHub and rename it to `rewoix-backend`.
   - Go to **Settings**:
     - **Build**: Set *Dockerfile Path* to `Dockerfile.backend`.
     - **Healthcheck Path**: `/health`.
   - Go to **Variables**:
     - Add `DATABASE_URL`: `${{Postgres.DATABASE_URL}}` (Railway references the managed DB).
     - Add `REDIS_URL`: `${{Redis.REDIS_URL}}`.
     - Add `SECRET_KEY`: `<Generate a random 32-char secret string>`.
     - Add `APP_ENV`: `production`.
     - Add `DEBUG`: `false`.
     - Add `BACKEND_CORS_ORIGINS`: `["*"]`.
5. **Configure Frontend Service**:
   - In the same canvas, click **+ New** -> **GitHub Repo** -> select `Tejaso7/REWOIX` again.
   - Rename this second service to `rewoix-frontend`.
   - Go to **Settings**:
     - **Build**: Set *Dockerfile Path* to `Dockerfile.frontend`.
   - Go to **Variables**:
     - Add `NEXT_PUBLIC_API_URL`: `${{rewoix-backend.RAILWAY_PUBLIC_DOMAIN}}/api/v1` (or your custom backend domain).
     - Add `NODE_ENV`: `production`.
6. **Generate Domains**:
   - Under both services, go to **Settings** -> **Networking** -> **Generate Domain**.
   - Railway will provide instant public URLs (e.g. `rewoix-frontend.up.railway.app`).

---

## 5. Post-Deployment Verification & Smoke Test

Once deployed on either platform, verify the deployment in under 2 minutes:

1. **Verify Backend Health**:
   - Open: `https://<YOUR_BACKEND_URL>/health`
   - Expected Response: `{"status": "healthy"}`
2. **Verify Interactive API Documentation**:
   - Open: `https://<YOUR_BACKEND_URL>/docs` (FastAPI Swagger UI)
3. **Verify Frontend Experience**:
   - Open: `https://<YOUR_FRONTEND_URL>`
   - Confirm REWOIX landing page loads with high-contrast dual theme (Dark/Light).
   - Test Login / Registration or Seeded Corporate Simulations.
4. **Default Seeded Accounts**:
   - **Admin**: `admin@rewoix.com` / `admin123456`
   - **Teacher/Mentor**: `teacher@rewoix.com` / `teacher123456`
   - **Student/Candidate**: `student@rewoix.com` / `student123456`

---

## 6. Verdict & Recommendation

- If you want the **fastest, zero-configuration deployment** with one click: **Deploy to Render using `render.yaml`**.
- If you want **real-time CPU/RAM metrics, instant rollbacks, and an intuitive visual architecture canvas**: **Deploy to Railway**.
- Both platforms are 100% production-ready for REWOIX without modifying a single line of application code.
