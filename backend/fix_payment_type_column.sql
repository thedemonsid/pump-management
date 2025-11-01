-- ============================================================================
-- Migration: Fix payment_type and rate_type column types in pump_purchase_master
-- Description: Change payment_type and rate_type from TINYINT to ENUM to match entity definition
-- Date: 2025-10-31
-- Note: This fix is now integrated into migration_purchase_refactor.sql
-- ============================================================================

USE pump_db;

-- Step 1: Backup the current payment_type values
-- Check if backup column exists, if not add it
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'pump_db' 
    AND TABLE_NAME = 'pump_purchase_master' 
    AND COLUMN_NAME = 'payment_type_backup');

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE pump_purchase_master ADD COLUMN payment_type_backup TINYINT AFTER payment_type', 
    'SELECT "Backup column already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE pump_purchase_master 
SET payment_type_backup = payment_type
WHERE payment_type_backup IS NULL;

-- Step 2: Drop the old payment_type column
ALTER TABLE pump_purchase_master 
    DROP COLUMN payment_type;

-- Step 3: Create the new payment_type column as ENUM
ALTER TABLE pump_purchase_master 
    ADD COLUMN payment_type ENUM('CASH', 'CREDIT') NOT NULL DEFAULT 'CASH' AFTER rate_type;

-- Step 4: Migrate the data (0 = CASH, 1 = CREDIT or any other value)
UPDATE pump_purchase_master 
SET payment_type = CASE 
    WHEN payment_type_backup = 0 THEN 'CASH'
    WHEN payment_type_backup = 1 THEN 'CREDIT'
    ELSE 'CASH'  -- Default to CASH for any unexpected values
END;

-- Remove the backup column
ALTER TABLE pump_purchase_master 
    DROP COLUMN payment_type_backup;

-- ============================================================================
-- Fix rate_type column (TINYINT to ENUM)
-- ============================================================================
ALTER TABLE pump_purchase_master ADD COLUMN rate_type_backup TINYINT AFTER rate_type;

UPDATE pump_purchase_master 
SET rate_type_backup = rate_type
WHERE rate_type_backup IS NULL;

ALTER TABLE pump_purchase_master DROP COLUMN rate_type;

ALTER TABLE pump_purchase_master 
ADD COLUMN rate_type ENUM('EXCLUDING_GST', 'INCLUDING_GST') NOT NULL DEFAULT 'EXCLUDING_GST' AFTER purchase_date;

UPDATE pump_purchase_master 
SET rate_type = CASE 
    WHEN rate_type_backup = 0 THEN 'EXCLUDING_GST'
    WHEN rate_type_backup = 1 THEN 'INCLUDING_GST'
    ELSE 'EXCLUDING_GST'
END;

ALTER TABLE pump_purchase_master DROP COLUMN rate_type_backup;

-- ============================================================================
-- Verify the changes
-- ============================================================================
SELECT 'Migration completed. Verifying columns...' AS status;
SHOW COLUMNS FROM pump_purchase_master WHERE Field IN ('payment_type', 'rate_type');

-- Show sample data to verify
SELECT id, purchase_id, payment_type, rate_type, invoice_number 
FROM pump_purchase_master 
LIMIT 5;
