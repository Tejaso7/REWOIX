# REWOIX: Platform Roles & Views Specification

**Document Purpose:** Complete functional specification of all user roles, access control boundaries, route hierarchies, and view-level user stories across the REWOIX platform.  
**Audience:** CEO, CTO, Product Managers, Frontend/Backend Engineers, and UX Designers  
**Version:** 1.0.0 Production  

---

## 1. Access Control Matrix & Roles Hierarchy

REWOIX enforces a strict **Role-Based Access Control (RBAC)** architecture:

```
                  ┌─────────────────────────────────────────┐
                  │                 ADMIN                   │
                  │   Full System Access & Telemetry        │
                  └────────────────────┬────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
        ┌───────────────────────┐             ┌───────────────────────┐
        │        TEACHER        │             │        LEARNER        │
        │  Course Builder &     │             │  Simulation Player &  │
        │  Earnings Ledger      │             │  Portfolio Registry   │
        └───────────────────────┘             └───────────────────────┘
```

| Route / Resource | Guest / Public | LEARNER | TEACHER | ADMIN |
| :--- | :---: | :---: | :---: | :---: |
| `/` (Landing Page & Hero Mockup) | ✅ View | ✅ View | ✅ View | ✅ View |
| `/courses` (Track Catalog) | ✅ View | ✅ View | ✅ View | ✅ View |
| `/courses/[id]` (Track Details & Checkout) | ✅ View | ✅ Buy / Enroll | ✅ View | ✅ View |
| `/login` & `/register` | ✅ Access | 🔄 Redirect | 🔄 Redirect | 🔄 Redirect |
| `/learn/my-courses` (Student Portal) | ❌ 401 Redirect | ✅ Enrolled Only | ✅ View Own | ✅ Full View |
| `/learn/courses/[courseId]` (Simulation Player) | ❌ 401 Redirect | ✅ Verified Only | ✅ Author Only | ✅ Full View |
| `/certificates/verify/[certId]` | ✅ Public Verify | ✅ Public Verify | ✅ Public Verify | ✅ Public Verify |
| `/teacher/onboarding` (Professional KYC) | ❌ 401 Redirect | ❌ Forbidden | ✅ Update Own | ✅ Full View |
| `/teacher/dashboard` & `/teacher/earnings` | ❌ 401 Redirect | ❌ Forbidden | ✅ Author Only | ✅ Full View |
| `/admin/*` (All Admin Subroutes) | ❌ 401 Redirect | ❌ 403 Forbidden | ❌ 403 Forbidden | ✅ Full Access |

---

## 2. Role 1: Learner / Student Archetype

### Target User Profile
- **Archetype:** Final-year university students (BTech, BCA, MCA, MBA), fresh graduates, career switchers, and junior analysts seeking senior-level intuition.
- **Primary Goal:** Experience realistic corporate problem statements, acquire production portfolio artifacts, and secure high-paying analytics/engineering job offers.

### View Breakdown

#### View 1.1: Corporate Experience Landing Page (`/`)
- **Key Features:**
  - **Dynamic Hero Workspace Simulator:** Interactive mockup featuring 4 tabs (Executive Brief, Dirty SQL Query, Live Retention Bar Chart & KPIs, Strategic Recommendation & Stakeholder Pushback).
  - **The Reality Check Problem Grid:** 3 contrasting cards highlighting "Clean Toy Tutorials" vs. "Messy Corporate Reality".
  - **6-Stage Simulation Loop:** Visual progression of modern data engineering & analytics problem-solving.
  - **Simulation Track Catalog:** Domain-filtered preview with scenario briefs.
  - **Interactive Early-Access Waitlist:** Live countdown timer, real-time queue counter (`#380+`), validated lead capture.
- **User Story:** *"As a visiting student, I want to immediately see that REWOIX is an active workplace simulator rather than another generic video course, so that I am motivated to enroll or join the waitlist."*

#### View 1.2: Simulation Experience Catalog (`/courses`)
- **Key Features:**
  - Live search bar filtering across title, subtitle, and keywords.
  - Category / Domain dropdown (Fintech, E-Commerce, SaaS, Cloud, Healthcare).
  - Sorting controls (Most Popular, Highest Rated, Newest, Price: Low to High, Price: High to Low).
  - Track count header displaying active simulations.
  - Responsive cards displaying instructor credentials, rating stars, enrolled student count, and discount badges.
- **User Story:** *"As a student, I want to filter simulations by my target industry (e.g. Fintech) so that I can choose tracks relevant to my upcoming job interviews."*

#### View 1.3: Track Overview & Checkout Modal (`/courses/[id]`)
- **Key Features:**
  - Executive course hero with level badge, verified rating, total learners, and language support.
  - **Working Professional Mentor Spotlight:** Company name, domain expertise, and vetted industry badge.
  - **What You'll Deliver:** 6 enterprise competencies acquired during the track.
  - **Curriculum Accordion:** Expandable stages and lessons with duration and Free Preview indicators.
  - **Sticky Purchasing Sidebar:**
    - Original price vs. discounted price with savings percentage badge.
    - Features checklist (lifetime access, verifiable certificate, money-back guarantee).
    - **Razorpay Checkout Modal Integration:** Injects Razorpay SDK for real card/UPI/NetBanking payments.
    - **One-Click Sandbox Override:** Allows instant evaluation enrollment for testing without live payments.
- **User Story:** *"As an interested student, I want to inspect the exact curriculum and mentor credentials, and securely purchase access via UPI or card with instant enrollment confirmation."*

#### View 1.4: Student Learning Portal (`/learn/my-courses`)
- **Key Features:**
  - Grid of all enrolled simulation tracks.
  - Dynamic progress bar showing percent completion.
  - "Continue Learning" primary action button.
  - "Certificate" link for completed tracks with direct access to cryptographic verification.
  - Empty state with direct link to catalog if no courses are yet purchased.
- **User Story:** *"As an enrolled student, I want to track my progress across multiple tracks and quickly resume my active workplace scenario."*

#### View 1.5: Interactive Workplace Player (`/learn/courses/[courseId]`)
- **Key Features:**
  - **Dual-Pane Layout:** Main interactive workplace panel (left) + Stage/Task curriculum sidebar (right).
  - **3 Workplace Tabs:**
    1. *Video Masterclass:* Custom video player with playback controls and auto-progress synchronization.
    2. *Interactive SQL Sandbox:* Embedded SQL query editor pointing to simulated production partitions, live query execution simulator returning realistic latency and aggregated churn metrics.
    3. *Schemas & Briefs:* Production schema definitions (`dwh_prod.finance.*`), column data types, and business context notes.
  - "Mark Lesson as Completed" progress updater.
  - Top progress meter and dynamic Certificate unlock button.
- **User Story:** *"As an active learner, I want to practice querying realistic transaction partitions in an interactive sandbox while watching the instructor's architecture breakdown."*

#### View 1.6: Cryptographic Certificate Verification (`/certificates/verify/[certificateId]`)
- **Key Features:**
  - Publicly accessible, tamper-proof credential verification record.
  - Displays learner name, simulation track completed, instructor signature/credentials, issue date, and unique credential ID.
  - "Cryptographically Validated" status badge.
  - One-click "Printable PDF Download" button for physical submission or LinkedIn profile embedding.
- **User Story:** *"As a graduate of a simulation track, I want a permanent verifiable credential URL that I can share on my resume and LinkedIn so that employers can verify my real-world competence."*

---

## 3. Role 2: Teacher / Working Professional Instructor Archetype

### Target User Profile
- **Archetype:** Lead Analytics Engineers, Staff Data Scientists, and Senior BI Architects employed at Tier-1 companies (Stripe, Amazon, Google, Razorpay).
- **Primary Goal:** Monetize hard-earned production expertise, build a professional brand, and mentor motivated junior talent without building their own payment or learning infrastructure.

### View Breakdown

#### View 2.1: Working Professional Onboarding (`/teacher/onboarding`)
- **Key Features:**
  - **Professional Background Form:**
    - Current Professional Headline (e.g. *"Lead Data Architect at Stripe"*).
    - Current Company Name & Domain Expertise (e.g. *"Fintech & High-Volume Payments"*).
    - Current CTC Bracket (e.g. *"45-60 LPA"*) & Total Experience Years.
    - Verified Links: LinkedIn Profile URL, GitHub Profile URL, Personal Portfolio/Website.
    - Technical Skills inventory (e.g. *"SQL, Snowflake, dbt, Kafka, Python"*).
  - **Banking & Payout KYC Details:**
    - Bank Name, Bank Account Number, IFSC Code.
    - Account Holder Full Name.
    - UPI ID for instant payout transfers.
  - Display of assigned custom platform commission share (e.g. *"Your Current Revenue Share: 70%"*).
- **User Story:** *"As a working professional, I want to securely submit my employer credentials and bank account details so that I can receive monthly royalty payouts for the simulation tracks I author."*

#### View 2.2: Instructor Dashboard (`/teacher/dashboard`)
- **Key Features:**
  - High-level telemetry: Total Courses Created, Total Published Tracks, Total Enrolled Learners across all courses.
  - Average student satisfaction rating.
  - Quick action: "Create New Course / Simulation".
- **User Story:** *"As an instructor, I want an immediate snapshot of how many learners are enrolled in my tracks and how my content is rated."*

#### View 2.3: Course Studio & Curriculum Builder (`/teacher/courses/new`)
- **Key Features:**
  - Course metadata setup (Title, Subtitle, Category, Level, Base Price, Discount Price, Thumbnail).
  - Multi-stage curriculum builder: Add Sections and Lessons with video URLs, duration, preview flags, and text notes.
  - Instant submission to Admin review queue.
- **User Story:** *"As an instructor, I want an intuitive course creation wizard to structure real business problems into progressive stages."*

#### View 2.4: Financial Ledger & Earnings (`/teacher/earnings`)
- **Key Features:**
  - Total lifetime earnings (net teacher share after platform fee).
  - Pending balance eligible for payout.
  - Itemized transaction ledger: Order ID, Course Title, Gross Amount, Platform Cut (e.g. 30%), Teacher Cut (e.g. 70%), Timestamp.
  - Payout request action button.
- **User Story:** *"As an instructor, I want an itemized transparent ledger of every enrollment and my exact revenue share so that I have complete financial clarity."*

---

## 4. Role 3: Admin / Platform Operator Archetype

### Target User Profile
- **Archetype:** Platform Founder, Operations Lead, and Finance Administrator.
- **Primary Goal:** Monitor platform financial health, manage instructor revenue cuts, override track pricing, and inspect compliance data.

### View Breakdown

#### View 3.1: Executive Telemetry Dashboard (`/admin/dashboard`)
- **Key Features:**
  - Macro platform metrics: Gross Merchandise Value (GMV), Platform Net Revenue, Total Platform Users, Total Published Tracks.
  - Pending course approval queue counter.
- **User Story:** *"As the CEO/Admin, I want a single-pane dashboard showing real-time revenue and marketplace growth metrics."*

#### View 3.2: 360° User Directory & Custom Commission Manager (`/admin/users`)
- **Key Features:**
  - Searchable list of all registered users with role badges (LEARNER, TEACHER, ADMIN).
  - Comprehensive drill-down modal displaying:
    - Teacher professional profile: Employer, domain, CTC bracket, experience, LinkedIn, GitHub.
    - Teacher bank KYC: Account number, bank name, IFSC, UPI ID.
    - Learner archetype: Student vs. Fresher vs. Working Pro, learning goals, field of study.
  - **Dynamic Commission Override Tool:** Input box to adjust a teacher's royalty share percentage (e.g. from 70.0% to 82.5%) with instant database persistence and audit logging.
- **User Story:** *"As an Admin, I want to review an instructor's bank and professional credentials and give them a custom royalty cut (e.g. 85%) to incentivize top industry talent."*

#### View 3.3: Course Catalog & Pricing Override (`/admin/courses/manage`)
- **Key Features:**
  - Table of all platform courses with current status (PUBLISHED, DRAFT).
  - Quick inline price edit modal: Update Base Price and Discounted Price without redeploying code.
  - Real-time price synchronization across the student marketplace.
- **User Story:** *"As an Admin, I want to run promotional pricing campaigns (e.g. holiday sale) by updating track prices directly from the management console."*

#### View 3.4: Platform Financial Audit & Revenue Ledger (`/admin/revenue`)
- **Key Features:**
  - Comprehensive financial ledger recording every order executed across the platform.
  - Mathematical breakdown: Gross Order Amount = Platform Share (30%) + Instructor Share (70%).
  - Payout status tracker (PENDING, PROCESSED, FAILED).
- **User Story:** *"As the CFO/Admin, I want a mathematically auditable ledger ensuring that all platform commissions and teacher liabilities balance to the penny."*
