-- ============================================================================
-- Migration Script: Refactor Purchase System to Support Multiple Items
-- Database: MySQL
-- Date: 2025-10-31
-- 
-- Description:
-- This migration refactors the Purchase system to support multiple items
-- per purchase (similar to Bill system), and links payments to bank accounts.
--
-- Changes:
-- 1. Create new table: pump_purchase_item_master
-- 2. Modify pump_purchase_master table (remove product-specific columns)
-- 3. Migrate existing purchase data to new structure
-- 4. Add relationship between pump_supplier_payment_master and pump_purchase_master
-- 
-- IMPORTANT: 
-- - Backup your database before running this script
-- - Test on a development environment first
-- - This script preserves existing data
-- ============================================================================

-- Start transaction
START TRANSACTION;

-- ============================================================================
-- STEP 1: Create new pump_purchase_item_master table
-- ============================================================================
CREATE TABLE IF NOT EXISTS pump_purchase_item_master (
    id BINARY(16) NOT NULL PRIMARY KEY,
    purchase_id BINARY(16) NOT NULL,
    product_id BINARY(16) NOT NULL,
    quantity DECIMAL(12, 2) NOT NULL,
    purchase_unit VARCHAR(20) NOT NULL,
    purchase_rate DECIMAL(12, 2) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    tax_percentage DECIMAL(7, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    add_to_stock BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME(6) DEFAULT NULL,
    updated_at DATETIME(6) DEFAULT NULL,
    entry_by VARCHAR(255) DEFAULT NULL,
    version BIGINT DEFAULT NULL,
    CONSTRAINT fk_purchase_item_purchase FOREIGN KEY (purchase_id) REFERENCES pump_purchase_master(id) ON DELETE CASCADE,
    CONSTRAINT fk_purchase_item_product FOREIGN KEY (product_id) REFERENCES pump_product_master(id),
    CONSTRAINT chk_purchase_item_quantity_positive CHECK (quantity > 0.0),
    CONSTRAINT chk_purchase_item_rate_positive CHECK (purchase_rate > 0.0),
    CONSTRAINT chk_purchase_item_amount_positive CHECK (amount > 0.0),
    CONSTRAINT chk_purchase_item_tax_percentage_non_negative CHECK (tax_percentage >= 0.0),
    CONSTRAINT chk_purchase_item_tax_amount_non_negative CHECK (tax_amount >= 0.0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- STEP 2: Add new columns to pump_purchase_master
-- ============================================================================
ALTER TABLE pump_purchase_master 
    ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12, 2) DEFAULT 0.00 AFTER goods_received_by,
    ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12, 2) DEFAULT 0.00 AFTER total_amount,
    ADD COLUMN IF NOT EXISTS net_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00 AFTER tax_amount;

-- Add constraints for new columns
ALTER TABLE pump_purchase_master
    ADD CONSTRAINT IF NOT EXISTS chk_purchase_total_amount_non_negative CHECK (total_amount >= 0.0),
    ADD CONSTRAINT IF NOT EXISTS chk_purchase_tax_amount_non_negative CHECK (tax_amount >= 0.0),
    ADD CONSTRAINT IF NOT EXISTS chk_purchase_net_amount_non_negative CHECK (net_amount >= 0.0);

-- ============================================================================
-- STEP 2.1: Fix payment_type column type (TINYINT to ENUM)
-- ============================================================================
-- Backup the current payment_type values
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
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

-- Drop the old payment_type column
ALTER TABLE pump_purchase_master 
    DROP COLUMN payment_type;

-- Create the new payment_type column as ENUM
ALTER TABLE pump_purchase_master 
    ADD COLUMN payment_type ENUM('CASH', 'CREDIT') NOT NULL DEFAULT 'CASH' AFTER rate_type;

-- Migrate the data (0 = CASH, 1 = CREDIT or any other value)
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
-- STEP 2.2: Fix rate_type column type (TINYINT to ENUM)
-- ============================================================================
-- Backup the current rate_type values
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'pump_purchase_master' 
    AND COLUMN_NAME = 'rate_type_backup');

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE pump_purchase_master ADD COLUMN rate_type_backup TINYINT AFTER rate_type', 
    'SELECT "Backup column already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE pump_purchase_master 
SET rate_type_backup = rate_type
WHERE rate_type_backup IS NULL;

-- Drop the old rate_type column
ALTER TABLE pump_purchase_master 
    DROP COLUMN rate_type;

-- Create the new rate_type column as ENUM
ALTER TABLE pump_purchase_master 
    ADD COLUMN rate_type ENUM('EXCLUDING_GST', 'INCLUDING_GST') NOT NULL DEFAULT 'EXCLUDING_GST' AFTER purchase_date;

-- Migrate the data (0 = EXCLUDING_GST, 1 = INCLUDING_GST or any other value)
UPDATE pump_purchase_master 
SET rate_type = CASE 
    WHEN rate_type_backup = 0 THEN 'EXCLUDING_GST'
    WHEN rate_type_backup = 1 THEN 'INCLUDING_GST'
    ELSE 'EXCLUDING_GST'  -- Default to EXCLUDING_GST for any unexpected values
END;

-- Remove the backup column
ALTER TABLE pump_purchase_master 
    DROP COLUMN rate_type_backup;

-- ============================================================================
-- STEP 3: Migrate existing purchase data to new structure
-- ============================================================================
-- Insert existing purchase items into pump_purchase_item_master
INSERT INTO pump_purchase_item_master (
    id,
    purchase_id,
    product_id,
    quantity,
    purchase_unit,
    purchase_rate,
    amount,
    tax_percentage,
    tax_amount,
    add_to_stock,
    created_at,
    updated_at,
    entry_by,
    version
)
SELECT 
    UUID_TO_BIN(UUID()) as id,
    p.id as purchase_id,
    p.product_id,
    p.quantity,
    p.purchase_unit,
    p.purchase_rate,
    p.amount,
    p.tax_percentage,
    -- Calculate tax_amount
    ROUND(p.amount * (p.tax_percentage / 100), 2) as tax_amount,
    p.add_to_stock,
    p.created_at,
    p.updated_at,
    p.entry_by,
    p.version
FROM pump_purchase_master p
WHERE p.product_id IS NOT NULL;

-- Update pump_purchase_master with calculated totals
UPDATE pump_purchase_master p
SET 
    total_amount = p.amount,
    tax_amount = ROUND(p.amount * (p.tax_percentage / 100), 2),
    net_amount = p.amount + ROUND(p.amount * (p.tax_percentage / 100), 2)
WHERE p.product_id IS NOT NULL;

-- ============================================================================
-- STEP 4: Drop old product-specific columns from pump_purchase_master
-- ============================================================================
-- Note: We need to drop foreign key constraint first before dropping the column
ALTER TABLE pump_purchase_master DROP FOREIGN KEY IF EXISTS fk_purchase_product;
ALTER TABLE pump_purchase_master DROP INDEX IF EXISTS fk_purchase_product;

-- Drop old columns that are now in pump_purchase_item_master
ALTER TABLE pump_purchase_master 
    DROP COLUMN IF EXISTS product_id,
    DROP COLUMN IF EXISTS quantity,
    DROP COLUMN IF EXISTS purchase_rate,
    DROP COLUMN IF EXISTS amount,
    DROP COLUMN IF EXISTS purchase_unit,
    DROP COLUMN IF EXISTS tax_percentage,
    DROP COLUMN IF EXISTS add_to_stock;

-- ============================================================================
-- STEP 5: Verify data integrity
-- ============================================================================
-- Count records to ensure migration was successful
SELECT 
    'pump_purchase_master' as table_name,
    COUNT(*) as record_count
FROM pump_purchase_master
UNION ALL
SELECT 
    'pump_purchase_item_master' as table_name,
    COUNT(*) as record_count
FROM pump_purchase_item_master;

-- ============================================================================
-- STEP 6: Create indexes for better performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_purchase_item_purchase_id ON pump_purchase_item_master(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchase_item_product_id ON pump_purchase_item_master(product_id);
CREATE INDEX IF NOT EXISTS idx_supplier_payment_purchase_id ON pump_supplier_payment_master(purchase_id);

-- ============================================================================
-- Commit transaction
-- ============================================================================
COMMIT;

-- ============================================================================
-- Verification Queries (Run these after migration to verify)
-- ============================================================================
-- Check if all purchases have items
SELECT 
    p.purchase_id,
    p.invoice_number,
    COUNT(pi.id) as item_count,
    p.total_amount,
    p.net_amount
FROM pump_purchase_master p
LEFT JOIN pump_purchase_item_master pi ON p.id = pi.purchase_id
GROUP BY p.id, p.purchase_id, p.invoice_number, p.total_amount, p.net_amount
ORDER BY p.purchase_id DESC
LIMIT 10;

-- Check for orphaned purchase items (should return 0)
SELECT COUNT(*) as orphaned_items
FROM pump_purchase_item_master pi
LEFT JOIN pump_purchase_master p ON pi.purchase_id = p.id
WHERE p.id IS NULL;

-- ============================================================================
-- Rollback Script (In case of issues - run this to revert changes)
-- ============================================================================
/*
START TRANSACTION;

-- Restore old columns
ALTER TABLE pump_purchase_master 
    ADD COLUMN product_id BINARY(16),
    ADD COLUMN quantity DECIMAL(12, 2),
    ADD COLUMN purchase_rate DECIMAL(12, 2),
    ADD COLUMN amount DECIMAL(12, 2),
    ADD COLUMN purchase_unit VARCHAR(20),
    ADD COLUMN tax_percentage DECIMAL(7, 2),
    ADD COLUMN add_to_stock BOOLEAN DEFAULT FALSE;

-- Restore data from purchase items (taking first item only)
UPDATE pump_purchase_master p
INNER JOIN (
    SELECT 
        purchase_id,
        product_id,
        quantity,
        purchase_rate,
        amount,
        purchase_unit,
        tax_percentage,
        add_to_stock,
        ROW_NUMBER() OVER (PARTITION BY purchase_id ORDER BY created_at) as rn
    FROM pump_purchase_item_master
) pi ON p.id = pi.purchase_id AND pi.rn = 1
SET 
    p.product_id = pi.product_id,
    p.quantity = pi.quantity,
    p.purchase_rate = pi.purchase_rate,
    p.amount = pi.amount,
    p.purchase_unit = pi.purchase_unit,
    p.tax_percentage = pi.tax_percentage,
    p.add_to_stock = pi.add_to_stock;

-- Drop new columns
ALTER TABLE pump_purchase_master 
    DROP COLUMN total_amount,
    DROP COLUMN tax_amount,
    DROP COLUMN net_amount;

-- Drop new table
DROP TABLE IF EXISTS pump_purchase_item_master;

-- Restore foreign key
ALTER TABLE pump_purchase_master 
    ADD CONSTRAINT fk_purchase_product FOREIGN KEY (product_id) REFERENCES pump_product_master(id);

COMMIT;
*/
