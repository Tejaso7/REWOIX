# REWOIX System Architecture

REWOIX (Real-World Industry Experience) is architected with enterprise-grade modular principles separating concerns across API routing, business simulation engines, database persistence repositories, payment provider gateways, and reactive Next.js frontend state.

```text
                               ┌─────────────────────────┐
                               │       Next.js 15        │
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

## Modular Backend Structure
- `app/api/v1/`: Endpoint definitions (`auth`, `courses`, `learning`, `payments`, `teacher`, `admin`, `certificates`, `videos`, `ai`).
- `app/core/`: Settings, Security, Database session, Provider Interfaces (`storage.py`, `payment.py`, `ai.py`, `email.py`).
- `app/models/`: SQLAlchemy 2.0 ORM domain entities.
- `app/schemas/`: Pydantic v2 input/output validation models.
