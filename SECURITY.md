# EduFlow Security & Authorization Policy

## 1. Authentication & Session Security
- Passwords are encrypted using bcrypt hashing algorithm before database persistence.
- Stateless OAuth2 Bearer tokens with short-lived JWT access tokens and long-lived refresh tokens.

## 2. Authorization (RBAC)
- Role-based access control enforced at the FastAPI dependency layer (`require_roles`).
- Learner accounts cannot access teacher course builders or admin approval consoles.
- Teacher accounts cannot access financial ledgers of other teachers or approve their own courses.

## 3. Financial Integrity & Webhook Verification
- Frontend payment responses are never trusted.
- Payment completion requires server-side HMAC signature verification (`verify_payment_signature`) before creating enrollments and writing financial ledger entries.
- All monetary amounts use exact `Numeric(10,2)` decimal representations.

## 4. Media Asset Protection
- Private video content is streamed via presigned URLs (`generate_access_url`) with expiration windows.
