import sqlite3

def sync_schema():
    conn = sqlite3.connect("./eduflow.db")
    cursor = conn.cursor()

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
            print(f"Added {col_name} to teacher_profiles")
        except sqlite3.OperationalError:
            pass  # Column already exists

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
            print(f"Added {col_name} to learner_profiles")
        except sqlite3.OperationalError:
            pass

    # Users Column
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN phone_number TEXT;")
        print("Added phone_number to users")
    except sqlite3.OperationalError:
        pass

    conn.commit()
    conn.close()
    print("Schema sync completed successfully!")

if __name__ == "__main__":
    sync_schema()
