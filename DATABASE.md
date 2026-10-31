# REWOIX Relational Database Schema & Data Models

## Key Relational Models

- **`users`**: User identity, hashed passwords, active/verification status.
- **`user_roles`**: Many-to-many relationship linking users to `LEARNER`, `TEACHER`, `ADMIN`.
- **`courses`**: Course metadata, level, status (`DRAFT`, `SUBMITTED`, `PUBLISHED`, `REJECTED`), pricing (`Numeric(10,2)`).
- **`course_sections` & `lessons`**: Modular curriculum hierarchy with signed video keys.
- **`enrollments`**: Learner course access tracking with completion percentage.
- **`lesson_progress`**: Individual video timestamp position and completion flag.
- **`quizzes`, `quiz_questions`, `quiz_options`, `quiz_attempts`**: Auto-graded assessment engine.
- **`orders` & `payments`**: Checkout gateway order tracking and status transitions.
- **`revenue_transactions`**: Financial ledger tracking gross sales, platform commission (30%), teacher share (70%), and net platform revenue.
- **`payouts`**: Teacher withdrawal settlements.
- **`certificates`**: Cryptographic certificate number, hash, and public verification link.
- **`audit_logs`**: Administrative action logs for security compliance.
