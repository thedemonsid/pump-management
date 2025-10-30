-- Migration: Add index on fuel purchase date for performance optimization
-- Date: 30-Oct-2025
-- Purpose: Optimize date range queries on fuel purchases

-- Create composite index on pump_master_id and purchase_date
-- This will significantly improve performance of date range queries
-- The index supports queries that filter by pump_master_id and date range
CREATE INDEX IF NOT EXISTS idx_fuel_purchase_pump_date 
ON pump_fuel_purchase_master (pump_master_id, purchase_date DESC);

-- Add index on purchase_date alone for date-only queries
CREATE INDEX IF NOT EXISTS idx_fuel_purchase_date 
ON pump_fuel_purchase_master (purchase_date DESC);

-- The DESC ordering helps with "ORDER BY purchase_date DESC" queries
-- These indexes will make the date filtering query highly performant even with thousands of records
