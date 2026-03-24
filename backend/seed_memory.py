from vanna_setup import get_agent

def seed_memory():
    agent = get_agent()
    
    print("Starting memory seeding...")
    
    # 15 question-SQL pairs
    training_data = [
        ("How many patients are there?", 
         "SELECT COUNT(*) FROM patients;"),
         
        ("List all doctors.", 
         "SELECT first_name, last_name, specialization FROM doctors;"),
         
        ("Who are the cardiologists?", 
         "SELECT first_name, last_name FROM doctors WHERE specialization = 'Cardiology';"),
         
        ("How many appointments were completed?", 
         "SELECT COUNT(*) FROM appointments WHERE status = 'Completed';"),
         
        ("What is the total revenue?", 
         "SELECT SUM(amount) FROM invoices WHERE status = 'Paid';"),
         
        ("Show all invoices that are overdue.", 
         "SELECT * FROM invoices WHERE status = 'Overdue';"),
         
        ("Which patient has the highest total invoice amount?", 
         "SELECT p.first_name, p.last_name, SUM(i.amount) as total FROM patients p JOIN invoices i ON p.patient_id = i.patient_id GROUP BY p.patient_id ORDER BY total DESC LIMIT 1;"),
         
        ("List treatments that cost more than 1000.", 
         "SELECT treatment_name, cost FROM treatments WHERE cost > 1000;"),
         
        ("How many appointments did Dr. Smith have?", 
         "SELECT COUNT(*) as count FROM appointments a JOIN doctors d ON a.doctor_id = d.doctor_id WHERE d.last_name = 'Smith';"),
         
        ("What is the average cost of treatments?", 
         "SELECT AVG(cost) FROM treatments;"),
         
        ("Show patients from New York.", 
         "SELECT first_name, last_name FROM patients WHERE city = 'New York';"),
         
        ("How many cancelled appointments are there?", 
         "SELECT COUNT(*) FROM appointments WHERE status = 'Cancelled';"),
         
        ("Show total revenue by month.", 
         "SELECT strftime('%Y-%m', invoice_date) as month, SUM(amount) as revenue FROM invoices WHERE status = 'Paid' GROUP BY month ORDER BY month;"),
         
        ("What is the most common treatment?", 
         "SELECT treatment_name, COUNT(*) as count FROM treatments GROUP BY treatment_name ORDER BY count DESC LIMIT 1;"),
         
        ("List all patients who have an email address.", 
         "SELECT first_name, last_name, email FROM patients WHERE email IS NOT NULL;")
    ]

    from vanna.core.user import RequestContext
    import asyncio
    
    for i, (question, sql) in enumerate(training_data, 1):
        print(f"[{i}/{len(training_data)}] Adding memory: {question}")
        asyncio.run(agent.memory.save_tool_usage(
            context=RequestContext(),
            question=question,
            tool_name="run_sql",
            args={"sql": sql}
        ))
    
    print(f"Memory seeding complete. Added {len(training_data)} items.")

if __name__ == "__main__":
    seed_memory()
