-- Migration script to add opening_balance column and change stock_quantity to INT
-- Date: 2025-12-20
-- Description: Add opening_balance for general products and convert stock_quantity from DECIMAL to INT
-- Database: MySQL 8

-- Add opening_balance column to pump_product_master table
ALTER TABLE pump_product_master
ADD COLUMN opening_balance INT DEFAULT 0 COMMENT 'Opening balance for general products (can be negative)';

-- Convert stock_quantity from DECIMAL(12,2) to INT
-- Step 1: Add temporary column
ALTER TABLE pump_product_master
ADD COLUMN stock_quantity_temp INT DEFAULT 0;

-- Step 2: Copy data from old column to new column (rounding decimal values)
UPDATE pump_product_master
SET stock_quantity_temp = CAST(ROUND(COALESCE(stock_quantity, 0), 0) AS SIGNED);

-- Step 3: Drop the old column
ALTER TABLE pump_product_master
DROP COLUMN stock_quantity;

-- Step 4: Rename the temporary column to stock_quantity
ALTER TABLE pump_product_master
CHANGE COLUMN stock_quantity_temp stock_quantity INT DEFAULT 0 COMMENT 'Current stock quantity as integer';
