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

## 🚀 Quick Start (Local Setup)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Tejaso7/REWOIX.git
   cd REWOIX
   ```

2. **Start Backend Server:**
   ```bash
   cd backend
   pip install -r requirements.txt
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

3. **Start Frontend Server:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access services:**
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

## 📜 License
MIT License. Built for REWOIX production scalability.
