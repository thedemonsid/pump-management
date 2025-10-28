-- Add calculated fields to pump_salesman_shift_accounting table
-- These fields store frozen snapshots of values at accounting creation time

ALTER TABLE pump_salesman_shift_accounting
ADD COLUMN IF NOT EXISTS fuel_sales DECIMAL(17, 2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS customer_receipt DECIMAL(17, 2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS system_received_amount DECIMAL(17, 2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS credit DECIMAL(17, 2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS expenses DECIMAL(17, 2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS opening_cash DECIMAL(17, 2) NOT NULL DEFAULT 0.00;

-- Add comments to document the purpose
COMMENT ON COLUMN pump_salesman_shift_accounting.fuel_sales IS 'Total fuel sales from all nozzles - frozen at accounting creation';
COMMENT ON COLUMN pump_salesman_shift_accounting.customer_receipt IS 'Total bill payments received - frozen at accounting creation';
COMMENT ON COLUMN pump_salesman_shift_accounting.system_received_amount IS 'Fuel sales + customer receipts - frozen at accounting creation';
COMMENT ON COLUMN pump_salesman_shift_accounting.credit IS 'Total credit bills - frozen at accounting creation';
COMMENT ON COLUMN pump_salesman_shift_accounting.expenses IS 'Total expenses - frozen at accounting creation';
COMMENT ON COLUMN pump_salesman_shift_accounting.opening_cash IS 'Opening cash given to salesman at shift start - copied from shift';
