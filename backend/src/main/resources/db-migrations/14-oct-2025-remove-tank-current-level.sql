-- Migration: Remove current_level column from pump_tank_master table
-- Reason: Current level will now be calculated dynamically based on opening level + cumulative transactions
-- Date: 2025-10-14

-- Drop the current_level column as it's no longer needed
ALTER TABLE pump_tank_master DROP COLUMN current_level;

-- Note: Current level is now calculated as:
-- current_level = opening_level + SUM(daily_net) from daily_tank_level table
-- This ensures consistency and eliminates the need to maintain redundant data
