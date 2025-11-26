-- Migration to add nozzle_test_id column to tank transaction table
-- This allows linking tank transactions to nozzle tests for fuel returned to tank

-- Add nozzle_test_id column
ALTER TABLE pump_tank_transaction_master
ADD COLUMN nozzle_test_id UUID;

-- Add foreign key constraint
ALTER TABLE pump_tank_transaction_master
ADD CONSTRAINT fk_tank_transaction_nozzle_test
FOREIGN KEY (nozzle_test_id) REFERENCES pump_nozzle_test(id)
ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX idx_tank_transaction_nozzle_test 
ON pump_tank_transaction_master(nozzle_test_id);

-- Add comment to document the column purpose
COMMENT ON COLUMN pump_tank_transaction_master.nozzle_test_id IS 
'References the nozzle test for which this transaction was created (when fuel is returned to tank after testing)';
