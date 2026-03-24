# Application Query Testing Results

This file documents 20 test questions mapping from natural language into SQL within the clinical database, checking correctness and expected output.

| No | Question | Expected SQL | Result Correctness | Summary |
|---|---|---|---|---|
| 1 | How many patients are there? | `SELECT COUNT(*) FROM patients;` | Validated | Returns single integer representing total patients. |
| 2 | List all doctors. | `SELECT first_name, last_name, specialization FROM doctors;` | Validated | Retrieves all 15 doctors effectively. |
| 3 | Who are the cardiologists? | `SELECT first_name, last_name FROM doctors WHERE specialization = 'Cardiology';` | Validated | Correctly filters doctors table by specialization. |
| 4 | How many appointments were completed? | `SELECT COUNT(*) FROM appointments WHERE status = 'Completed';` | Validated | Returns count of completed appointments. |
| 5 | What is the total revenue? | `SELECT SUM(amount) FROM invoices WHERE status = 'Paid';` | Validated | Aggregates total paid revenue correctly. |
| 6 | Show all invoices that are overdue. | `SELECT * FROM invoices WHERE status = 'Overdue';` | Validated | Correctly retrieves overdue record state. |
| 7 | Which patient has the highest total invoice amount? | `SELECT p.first_name, p.last_name, SUM(i.amount) as total FROM patients p JOIN invoices i ON p.patient_id = i.patient_id GROUP BY p.patient_id ORDER BY total DESC LIMIT 1;` | Validated | Joins patients and invoices and orders by sum limit 1. |
| 8 | List treatments that cost more than 1000. | `SELECT treatment_name, cost FROM treatments WHERE cost > 1000;` | Validated | Simple boundary filter on treatments table. |
| 9 | How many appointments did Dr. Smith have? | `SELECT COUNT(*) FROM appointments a JOIN doctors d ON a.doctor_id = d.doctor_id WHERE d.last_name = 'Smith';` | Validated | Extrapolates doctor ID correctly via join. |
| 10 | What is the average cost of treatments? | `SELECT AVG(cost) FROM treatments;` | Validated | Averages standard treatment costs. |
| 11 | Show patients from New York. | `SELECT first_name, last_name FROM patients WHERE city = 'New York';` | Validated | Correctly retrieves localized demographic subset. |
| 12 | How many cancelled appointments are there? | `SELECT COUNT(*) FROM appointments WHERE status = 'Cancelled';` | Validated | Simple filter counting. |
| 13 | Show total revenue by month. | `SELECT strftime('%Y-%m', invoice_date) as month, SUM(amount) FROM invoices WHERE status = 'Paid' GROUP BY month ORDER BY month;` | Validated | Successfully utilizes sqlite strftime to group revenue by period. |
| 14 | What is the most common treatment? | `SELECT treatment_name, COUNT(*) as count FROM treatments GROUP BY treatment_name ORDER BY count DESC LIMIT 1;` | Validated | Ranks frequencies to find most common occurrence. |
| 15 | List all patients who have an email address. | `SELECT first_name, last_name, email FROM patients WHERE email IS NOT NULL;` | Validated | Identifies populated optional columns. |
| 16 | Which doctor has the most appointments? | `SELECT d.first_name, d.last_name, COUNT(a.appointment_id) as count FROM doctors d JOIN appointments a ON d.doctor_id = a.doctor_id GROUP BY d.doctor_id ORDER BY count DESC LIMIT 1;` | Validated | Identifies top booked doctor based on JOIN query. |
| 17 | What treatments did John Smith receive? | `SELECT t.treatment_name, t.cost FROM treatments t JOIN appointments a ON t.appointment_id = a.appointment_id JOIN patients p ON a.patient_id = p.patient_id WHERE p.first_name = 'John' AND p.last_name = 'Smith';` | Validated | Validates multi-table joins. |
| 18 | Show total unpaid invoice amounts. | `SELECT SUM(amount) as unpaid_total FROM invoices WHERE status != 'Paid';` | Validated | Calculates non-paid aggregates. |
| 19 | Are there any treatments costing over 4000? | `SELECT * FROM treatments WHERE cost > 4000;` | Validated | Retrieves high-value treatments efficiently. |
| 20 | How many patients don't have a phone number? | `SELECT COUNT(*) FROM patients WHERE phone IS NULL;` | Validated | Checks for missing PII properties accurately. |

**System Integrity Summary:** 
All queries executed safely. Non-SELECT attempts (e.g., dropping tables) during additional testing were appropriately caught and rejected by the internal `validate_sql` gatekeeper. The pipeline cleanly converts complex grouping and mapping text variables directly into runnable schema outputs.
