-- Migration: Make bank_transaction_id nullable in employee_salary_payment table
-- Purpose: Advance payments for cash shortages should not create bank transactions
--          since no actual money moves from the bank - it's just a record that
--          the salesman owes money, which will be deducted from their salary later.

-- Step 1: Drop the existing NOT NULL constraint on bank_transaction_id
ALTER TABLE employee_salary_payment 
ALTER COLUMN bank_transaction_id DROP NOT NULL;

-- Step 2: Update existing advance payments from shift accounting to remove their bank transactions
-- These were incorrectly created and are affecting bank balances

-- First, get the bank_transaction_ids that need to be deleted
-- (transactions linked to advance payments that came from shift accounting)
DO $$
DECLARE
    txn_id UUID;
    txn_record RECORD;
BEGIN
    -- Find all bank transactions linked to advance payments from shift accounting
    FOR txn_record IN 
        SELECT esp.bank_transaction_id, esp.id as payment_id, esp.reference_number
        FROM employee_salary_payment esp
        WHERE esp.reference_number LIKE 'SHIFT-BALANCE-%'
          AND esp.bank_transaction_id IS NOT NULL
    LOOP
        -- Log what we're doing
        RAISE NOTICE 'Removing bank transaction % from advance payment % (ref: %)', 
            txn_record.bank_transaction_id, txn_record.payment_id, txn_record.reference_number;
        
        -- Clear the bank_transaction_id from the payment first
        UPDATE employee_salary_payment 
        SET bank_transaction_id = NULL 
        WHERE id = txn_record.payment_id;
        
        -- Delete the bank transaction (this will also remove it from daily closing balance calculations)
        DELETE FROM pump_bank_transaction_master 
        WHERE id = txn_record.bank_transaction_id;
    END LOOP;
END $$;

-- Step 3: Verify the changes
SELECT 
    esp.id as payment_id,
    esp.reference_number,
    esp.amount,
    esp.notes,
    esp.bank_transaction_id,
    u.username as salesman
FROM employee_salary_payment esp
JOIN pump_user u ON esp.user_id = u.id
WHERE esp.reference_number LIKE 'SHIFT-BALANCE-%'
ORDER BY esp.created_at DESC;

-- Note: You may need to recalculate daily closing balances after this migration
-- if the system uses cached balance calculations.
