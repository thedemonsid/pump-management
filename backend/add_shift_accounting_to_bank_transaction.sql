-- Add shift_accounting_id column to bank transaction table
-- This allows linking bank transactions to shift accounting for cash distribution tracking

ALTER TABLE pump_bank_transaction_master
ADD COLUMN shift_accounting_id UUID NULL;

-- Add foreign key constraint
ALTER TABLE pump_bank_transaction_master
ADD CONSTRAINT fk_transaction_shift_accounting
FOREIGN KEY (shift_accounting_id)
REFERENCES pump_salesman_shift_accounting(id)
ON DELETE SET NULL;

-- Create index for efficient querying
CREATE INDEX idx_bank_transaction_shift_accounting
ON pump_bank_transaction_master(shift_accounting_id)
WHERE shift_accounting_id IS NOT NULL;
