-- Migration script to add absence type functionality to user_absence table
-- Date: November 19, 2025

-- Add absence_type column
ALTER TABLE user_absence 
ADD COLUMN absence_type VARCHAR(20) DEFAULT 'FULL_DAY' NOT NULL;

-- Add check constraint for absence_type
ALTER TABLE user_absence 
ADD CONSTRAINT chk_absence_type CHECK (absence_type IN ('FULL_DAY', 'HALF_DAY', 'OVERTIME'));

-- Add index for better query performance
CREATE INDEX idx_user_absence_type ON user_absence(absence_type);

-- Update existing records to have FULL_DAY type (already done by DEFAULT, but explicit update for safety)
UPDATE user_absence SET absence_type = 'FULL_DAY' WHERE absence_type IS NULL;

-- Verification queries
-- Check that all records have an absence type
SELECT COUNT(*) as total_records, absence_type 
FROM user_absence 
GROUP BY absence_type;

-- Check for any null absence types (should be 0)
SELECT COUNT(*) as null_absence_types 
FROM user_absence 
WHERE absence_type IS NULL;
