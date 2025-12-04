-- Add advance payment reference to salesman shift accounting
-- This column links to employee_salary_payment when balance amount >= 50
-- Database: MySQL 8

ALTER TABLE pump_salesman_shift_accounting 
ADD COLUMN advance_payment_id BINARY(16) NULL;

ALTER TABLE pump_salesman_shift_accounting
ADD CONSTRAINT fk_shift_accounting_advance_payment 
    FOREIGN KEY (advance_payment_id) 
    REFERENCES employee_salary_payment(id) 
    ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX idx_shift_accounting_advance_payment 
ON pump_salesman_shift_accounting(advance_payment_id);
