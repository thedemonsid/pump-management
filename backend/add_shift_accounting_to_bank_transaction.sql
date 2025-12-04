-- Add shift_accounting_id column to bank transaction table
-- This allows linking bank transactions to shift accounting for cash distribution tracking
-- Database: MySQL 8

ALTER TABLE pump_bank_transaction_master
ADD COLUMN shift_accounting_id BINARY(16) NULL;

-- Add foreign key constraint
ALTER TABLE pump_bank_transaction_master
ADD CONSTRAINT fk_transaction_shift_accounting
FOREIGN KEY (shift_accounting_id)
REFERENCES pump_salesman_shift_accounting(id)
ON DELETE SET NULL;

-- Create index for efficient querying (MySQL doesn't support partial indexes, so we create a regular index)
CREATE INDEX idx_bank_transaction_shift_accounting
ON pump_bank_transaction_master(shift_accounting_id);
