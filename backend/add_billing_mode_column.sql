-- Add billing_mode column to pump_salesman_bill_master table
-- This column tracks whether the bill was created by quantity (liters) or amount (rupees)

-- Add the column as nullable first
ALTER TABLE pump_salesman_bill_master
ADD COLUMN billing_mode VARCHAR(20);

-- Set default value for existing records (assume BY_QUANTITY for historical data)
UPDATE pump_salesman_bill_master
SET billing_mode = 'BY_QUANTITY'
WHERE billing_mode IS NULL;

-- Make the column NOT NULL
ALTER TABLE pump_salesman_bill_master
MODIFY COLUMN billing_mode VARCHAR(20) NOT NULL;

-- Add check constraint to ensure valid values
ALTER TABLE pump_salesman_bill_master
ADD CONSTRAINT chk_billing_mode CHECK (billing_mode IN ('BY_QUANTITY', 'BY_AMOUNT'));

-- Update quantity column to support 3 decimal places (for more precise calculations when billing by amount)
ALTER TABLE pump_salesman_bill_master
MODIFY COLUMN quantity DECIMAL(12, 3) NOT NULL;
