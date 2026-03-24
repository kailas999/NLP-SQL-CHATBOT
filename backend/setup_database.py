import sqlite3
import random
from datetime import datetime, timedelta

DB_NAME = "clinic.db"

def setup_database():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # Create Tables
    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS patients (
            patient_id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            city TEXT,
            email TEXT,
            phone TEXT
        );

        CREATE TABLE IF NOT EXISTS doctors (
            doctor_id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            specialization TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS appointments (
            appointment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER,
            doctor_id INTEGER,
            appointment_date DATE NOT NULL,
            status TEXT NOT NULL,
            FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
            FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
        );

        CREATE TABLE IF NOT EXISTS treatments (
            treatment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            appointment_id INTEGER,
            treatment_name TEXT NOT NULL,
            cost REAL NOT NULL,
            FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
        );

        CREATE TABLE IF NOT EXISTS invoices (
            invoice_id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER,
            amount REAL NOT NULL,
            status TEXT NOT NULL,
            invoice_date DATE NOT NULL,
            FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
        );
    """)

    # Seed Data
    cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio"]
    first_names = ["John", "Jane", "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Judy", "Mallory", "Victor", "Peggy", "Trent", "Walter", "Arthur", "Betty", "Cindy"]
    last_names = ["Smith", "Doe", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor"]
    
    # 200 patients
    patients_data = []
    for _ in range(200):
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        city = random.choice(cities)
        email = f"{fname.lower()}.{lname.lower()}{random.randint(1,999)}@example.com" if random.random() > 0.3 else None
        phone = f"555-{random.randint(100, 999)}-{random.randint(1000, 9999)}" if random.random() > 0.2 else None
        patients_data.append((fname, lname, city, email, phone))
        
    cursor.executemany("INSERT INTO patients (first_name, last_name, city, email, phone) VALUES (?, ?, ?, ?, ?)", patients_data)

    # 15 doctors (5 specializations)
    specializations = ["Cardiology", "Dermatology", "Neurology", "Orthopedics", "Pediatrics"]
    doctors_data = []
    for _ in range(15):
        doctors_data.append((random.choice(first_names), random.choice(last_names), specializations[_ % 5]))
        
    cursor.executemany("INSERT INTO doctors (first_name, last_name, specialization) VALUES (?, ?, ?)", doctors_data)

    # 500 appointments (past 12 months)
    statuses = ["Completed", "Cancelled", "No Show", "Scheduled"]
    appointments_data = []
    now = datetime.now()
    for _ in range(500):
        patient_id = random.randint(1, 200) # patients repeat
        doctor_id = random.randint(1, 15)
        days_ago = random.randint(0, 365)
        appt_date = (now - timedelta(days=days_ago)).strftime('%Y-%m-%d')
        status = random.choices(statuses, weights=[0.7, 0.1, 0.1, 0.1])[0]
        appointments_data.append((patient_id, doctor_id, appt_date, status))

    cursor.executemany("INSERT INTO appointments (patient_id, doctor_id, appointment_date, status) VALUES (?, ?, ?, ?)", appointments_data)

    # 350 treatments
    treatment_names = ["Consultation", "Blood Test", "X-Ray", "MRI", "Physical Therapy", "Vaccination", "Checkup"]
    treatments_data = []
    # Assign treatments only to some completed appointments to be realistic
    completed_appts = [i for i, appt in enumerate(appointments_data) if appt[3] == "Completed"]
    # We need 350 treatments, so we sample from completed appointments (with replacement)
    for _ in range(350):
        appt_id = random.choice(completed_appts) + 1 # 1-indexed
        t_name = random.choice(treatment_names)
        cost = round(random.uniform(50.0, 5000.0), 2)
        treatments_data.append((appt_id, t_name, cost))
        
    cursor.executemany("INSERT INTO treatments (appointment_id, treatment_name, cost) VALUES (?, ?, ?)", treatments_data)

    # 300 invoices
    invoice_statuses = ["Paid", "Pending", "Overdue"]
    invoices_data = []
    for _ in range(300):
        patient_id = random.randint(1, 200)
        amount = round(random.uniform(50.0, 5000.0), 2)
        status = random.choices(invoice_statuses, weights=[0.6, 0.3, 0.1])[0]
        days_ago = random.randint(0, 365)
        inv_date = (now - timedelta(days=days_ago)).strftime('%Y-%m-%d')
        invoices_data.append((patient_id, amount, status, inv_date))

    cursor.executemany("INSERT INTO invoices (patient_id, amount, status, invoice_date) VALUES (?, ?, ?, ?)", invoices_data)

    conn.commit()

    # Print summary
    cursor.execute("SELECT COUNT(*) FROM patients")
    patients_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM doctors")
    doctors_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM appointments")
    appointments_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM treatments")
    treatments_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM invoices")
    invoices_count = cursor.fetchone()[0]

    print("--- Database Creation Summary ---")
    print(f"Patients: {patients_count}")
    print(f"Doctors: {doctors_count}")
    print(f"Appointments: {appointments_count}")
    print(f"Treatments: {treatments_count}")
    print(f"Invoices: {invoices_count}")
    print("Database 'clinic.db' created successfully.")

    conn.close()

if __name__ == "__main__":
    setup_database()
