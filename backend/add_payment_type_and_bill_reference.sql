-- Migration: Add payment_type column to SalesmanBill and salesman_bill_id to SalesmanBillPayment
-- Date: 2025-11-24
-- Database: MySQL 8

-- Step 1: Add payment_type column to pump_salesman_bill_master
ALTER TABLE pump_salesman_bill_master 
ADD COLUMN payment_type VARCHAR(10) NOT NULL DEFAULT 'CREDIT';

-- Step 2: Add check constraint for payment_type
ALTER TABLE pump_salesman_bill_master 
ADD CONSTRAINT chk_payment_type CHECK (payment_type IN ('CASH', 'CREDIT'));

-- Step 3: Add salesman_bill_id column to pump_salesman_bill_payment_master
ALTER TABLE pump_salesman_bill_payment_master 
ADD COLUMN salesman_bill_id BIGINT NULL;

-- Step 4: Add foreign key constraint for salesman_bill_id
ALTER TABLE pump_salesman_bill_payment_master 
ADD CONSTRAINT fk_salesman_bill_payment_bill 
FOREIGN KEY (salesman_bill_id) 
REFERENCES pump_salesman_bill_master(id);

-- Step 5: Create index on salesman_bill_id for better query performance
CREATE INDEX idx_salesman_bill_payment_bill_id 
ON pump_salesman_bill_payment_master(salesman_bill_id);

-- Verification queries (MySQL compatible)
-- Check if payment_type column exists and has correct default
SELECT column_name, column_default, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_schema = DATABASE()
AND table_name = 'pump_salesman_bill_master' 
AND column_name = 'payment_type';

-- Check if salesman_bill_id column exists
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_schema = DATABASE()
AND table_name = 'pump_salesman_bill_payment_master' 
AND column_name = 'salesman_bill_id';

-- Check foreign key constraint (MySQL compatible)
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    kcu.referenced_table_name AS foreign_table_name,
    kcu.referenced_column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = DATABASE()
AND tc.table_name = 'pump_salesman_bill_payment_master'
AND kcu.column_name = 'salesman_bill_id';
