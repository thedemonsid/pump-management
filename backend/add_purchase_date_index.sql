-- Migration: Add indexes for purchase date filtering performance
-- Date: 2025-11-01
-- Description: Adds composite index on pump_master_id and purchase_date 
--              for efficient date range queries
-- Database: MySQL
-- Note: We only need the composite index since ALL queries filter by pump_master_id

-- Drop the standalone date index if it exists (cleanup from previous version)
DROP INDEX IF EXISTS idx_purchase_date ON pump_purchase_master;

-- Create composite index on pump_master_id and purchase_date
-- This index will be used for ALL purchase queries since they always filter by pump_master_id
-- The DESC on purchase_date helps with ORDER BY purchase_date DESC
CREATE INDEX IF NOT EXISTS idx_purchase_pump_date 
ON pump_purchase_master (pump_master_id, purchase_date DESC);

-- Verify index was created
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    INDEX_TYPE
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'pump_purchase_master' 
  AND INDEX_NAME = 'idx_purchase_pump_date'
ORDER BY SEQ_IN_INDEX;

-- Analyze the table to update statistics for the query optimizer
ANALYZE TABLE pump_purchase_master;
