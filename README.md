# REWOIX | Production-Ready Dynamic Learning Marketplace & LMS Platform

REWOIX is a scalable, secure online learning marketplace platform supporting three primary user roles: **Learner/Student**, **Teacher/Instructor**, and **Admin/Business**.

The platform enables instructors to create and monetize courses, learners to discover, purchase, and consume content through an interactive video player with progress auto-saving and verifiable certificates, and admins to oversee platform operations, course approvals, dynamic pricing policies, custom teacher commission splits, and transparent financial ledgers.

---

## 🌟 Key Features

- **Multi-Role RBAC & Detailed Onboarding**: Onboarding for Teachers (Company, CTC, Experience, LinkedIn, GitHub, Bank & IFSC) and Learners (Student/Working Professional, Goals, Tech Stack).
- **Dynamic Teacher Commission & Pricing Controls**: Admin customizable revenue splits (e.g. 70%, 80%, 85%) and live course price overrides.
- **Dual-Theme System**: Instant Sun ☀️ / Moon 🌙 toggle supporting Dark Mode and Light Mode with localStorage state persistence.
- **Dynamic Financial Ledger**: Automated revenue splits with exact decimal calculations for audit compliance.
- **Object Storage Abstraction**: Provider-agnostic storage layer supporting Local File Storage, Azure Blob Storage, and AWS S3.
- **Payment Provider Abstraction**: Backend HMAC signature verification with Razorpay integration and development fallback provider.
- **Interactive Learning Player**: Auto-saving video playback positions, section curriculum drawer, auto-graded quizzes, and instant certificate issuance upon 100% completion.
- **Verifiable Certificates**: Cryptographic certificate hashes with public verification URLs (`/certificates/verify/{certificate_number}`).

---

## 📐 System Architecture

```text
                               ┌─────────────────────────┐
                               │       Next.js 14        │
                               │   App Router Frontend   │
                               └────────────┬────────────┘
                                            │
                                      REST / JSON
                                            │
                               ┌────────────▼────────────┐
                               │         FastAPI         │
                               │      Backend Layer      │
                               └────────────┬────────────┘
                                            │
           ┌────────────────────────────────┼────────────────────────────────┐
           │                                │                                │
   ┌───────▼────────┐              ┌────────▼────────┐              ┌────────▼─────────┐
   │   PostgreSQL   │              │      Redis      │              │  Object Storage  │
   │  DB & Ledger   │              │ Cache & Workers │              │ Azure / S3 / Loc │
   └────────────────┘              └─────────────────┘              └──────────────────┘
```

---

## 🐳 Quick Start with Docker (Recommended)

Run the entire REWOIX multi-container platform (PostgreSQL 15, Redis 7, FastAPI, and Next.js 14) with a single command:

```bash
# 1. Clone repository
git clone https://github.com/Tejaso7/REWOIX.git
cd REWOIX

# 2. Copy Docker environment file
cp .env.docker.example .env

# 3. Build & start all services (detached mode)
docker compose up --build -d
```

### Accessing Running Services:
- **Web Application**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Interactive Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Healthcheck**: [http://localhost:8000/health](http://localhost:8000/health)

> 📖 **Full Container Manual**: For complete Docker management, hot-reloading development setups, automated migrations, backups, and cloud deployment guides, see [**DOCKER.md**](DOCKER.md).

---

## 💻 Alternative: Local Setup (Without Docker)

1. **Start Backend Server:**
   ```bash
   cd backend
   pip install -r requirements.txt
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Start Frontend Server:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Access services:**
   - **Frontend App**: [http://localhost:3000](http://localhost:3000)
   - **Backend API & Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🔐 Pre-Seeded Development Credentials

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Admin** | `admin@example.com` | `admin123` | Platform Console, Approvals, Pricing Controller, User Directory, Payouts |
| **Teacher** | `teacher@example.com` | `teacher123` | Course Builder, Professional Onboarding, Bank Details, Earnings |
| **Student** | `student@example.com` | `student123` | Course Explorer, Checkout, Student Profile, Learning Player, Certificates |

---

## 📚 Platform Documentation Suite

| Document | Purpose |
| :--- | :--- |
| [**DOCKER.md**](DOCKER.md) | Comprehensive Docker and Docker Compose operations manual |
| [**docs/EXECUTIVE_OVERVIEW.md**](docs/EXECUTIVE_OVERVIEW.md) | High-level business overview, unit economics, market positioning |
| [**docs/ROLES_AND_VIEWS_SPECIFICATION.md**](docs/ROLES_AND_VIEWS_SPECIFICATION.md) | Comprehensive specification for all 15 platform views across Learner, Teacher, and Admin |
| [**docs/TECHNICAL_ARCHITECTURE_AND_SCALING.md**](docs/TECHNICAL_ARCHITECTURE_AND_SCALING.md) | Deep-dive technical architecture, ERD, 10k+ user connection pooling, and security |
| [**ARCHITECTURE.md**](ARCHITECTURE.md) | Module structure, data flow, and authentication architecture |
| [**DATABASE.md**](DATABASE.md) | Complete database entity schema, indexes, and relations |
| [**DEPLOYMENT.md**](DEPLOYMENT.md) | Production infrastructure deployment blueprints |

---

## 📜 License
MIT License. Built for REWOIX production scalability.
