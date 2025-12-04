-- Migration: Make bank_transaction_id nullable in employee_salary_payment table
-- Purpose: Advance payments for cash shortages should not create bank transactions
--          since no actual money moves from the bank - it's just a record that
--          the salesman owes money, which will be deducted from their salary later.
-- Database: MySQL 8

-- Step 1: Drop the existing NOT NULL constraint on bank_transaction_id
-- In MySQL, we need to use MODIFY COLUMN to change nullability
ALTER TABLE employee_salary_payment 
MODIFY COLUMN bank_transaction_id BINARY(16) NULL;

-- Step 2: Update existing advance payments from shift accounting to remove their bank transactions
-- These were incorrectly created and are affecting bank balances

-- First, clear the bank_transaction_id from advance payments that came from shift accounting
UPDATE employee_salary_payment 
SET bank_transaction_id = NULL 
WHERE reference_number LIKE 'ADV-%'
  AND bank_transaction_id IS NOT NULL;

-- Delete orphaned bank transactions that were linked to advance payments
-- (Only if they exist and are no longer referenced)
SET SQL_SAFE_UPDATES = 0;
DELETE bt FROM pump_bank_transaction_master bt
WHERE bt.id NOT IN (
    SELECT DISTINCT bank_transaction_id 
    FROM employee_salary_payment 
    WHERE bank_transaction_id IS NOT NULL
)
AND bt.description LIKE '%Cash shortage%';
SET SQL_SAFE_UPDATES = 1;
-- Step 3: Verify the changes
SELECT 
    esp.id as payment_id,
    esp.reference_number,
    esp.amount,
    esp.notes,
    esp.bank_transaction_id,
    u.username as salesman
FROM employee_salary_payment esp
JOIN pump_user_master u ON esp.user_id = u.id
WHERE esp.reference_number LIKE 'ADV-%'
ORDER BY esp.created_at DESC;

-- Note: You may need to recalculate daily closing balances after this migration
-- if the system uses cached balance calculations.
