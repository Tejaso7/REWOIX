import sqlite3
import os

def sync_schema():
    for db_path in ["./rewoix.db", "./backend/rewoix.db", "rewoix.db", "backend/rewoix.db"]:
        if not os.path.exists(db_path):
            continue
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Waitlist Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS waitlist_entries (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            role_stage TEXT NOT NULL,
            target_domain TEXT,
            queue_number INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # Teacher Profile Columns
        teacher_cols = [
            ("company_name", "TEXT"),
            ("domain_expertise", "TEXT"),
            ("ctc_bracket", "TEXT"),
            ("linkedin_url", "TEXT"),
            ("github_url", "TEXT"),
            ("technical_skills", "TEXT"),
            ("bank_name", "TEXT"),
            ("account_number", "TEXT"),
            ("ifsc_code", "TEXT"),
            ("account_holder_name", "TEXT"),
            ("upi_id", "TEXT"),
            ("custom_commission_percent", "REAL DEFAULT 70.0"),
        ]

        for col_name, col_type in teacher_cols:
            try:
                cursor.execute(f"ALTER TABLE teacher_profiles ADD COLUMN {col_name} {col_type};")
            except sqlite3.OperationalError:
                pass

        # Learner Profile Columns
        learner_cols = [
            ("user_type", "TEXT DEFAULT 'STUDENT'"),
            ("institution_or_company", "TEXT"),
            ("field_of_study_or_role", "TEXT"),
            ("primary_learning_goal", "TEXT"),
        ]

        for col_name, col_type in learner_cols:
            try:
                cursor.execute(f"ALTER TABLE learner_profiles ADD COLUMN {col_name} {col_type};")
            except sqlite3.OperationalError:
                pass

        try:
            cursor.execute("ALTER TABLE users ADD COLUMN phone_number TEXT;")
        except sqlite3.OperationalError:
            pass

        audit_cols = [
            ("location", "TEXT"),
            ("user_agent", "TEXT"),
        ]
        for col_name, col_type in audit_cols:
            try:
                cursor.execute(f"ALTER TABLE audit_logs ADD COLUMN {col_name} {col_type};")
            except sqlite3.OperationalError:
                pass

        conn.commit()
        conn.close()
        print(f"Schema sync for {db_path} completed successfully!")

if __name__ == "__main__":
    sync_schema()
