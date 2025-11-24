-- Add nozzle test tracking table
-- This table tracks fuel dispensed during nozzle testing (e.g., dispensing 5 liters to verify accuracy)
-- Test quantities appear on meter readings but should not be counted in sales

CREATE TABLE pump_nozzle_test (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pump_master_id UUID NOT NULL,
    salesman_shift_id UUID NOT NULL,
    nozzle_assignment_id UUID NOT NULL,
    test_datetime TIMESTAMP NOT NULL,
    test_quantity DECIMAL(15, 3) NOT NULL CHECK (test_quantity > 0),
    remarks VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    
    CONSTRAINT fk_nozzle_test_pump_master FOREIGN KEY (pump_master_id) 
        REFERENCES pump_info_master(id) ON DELETE CASCADE,
    CONSTRAINT fk_nozzle_test_shift FOREIGN KEY (salesman_shift_id) 
        REFERENCES pump_salesman_shift(id) ON DELETE CASCADE,
    CONSTRAINT fk_nozzle_test_assignment FOREIGN KEY (nozzle_assignment_id) 
        REFERENCES pump_nozzle_assignment(id) ON DELETE CASCADE
);

-- Create indexes for efficient queries
CREATE INDEX idx_nozzle_test_shift ON pump_nozzle_test(salesman_shift_id);
CREATE INDEX idx_nozzle_test_assignment ON pump_nozzle_test(nozzle_assignment_id);
CREATE INDEX idx_nozzle_test_pump_master ON pump_nozzle_test(pump_master_id);
CREATE INDEX idx_nozzle_test_datetime ON pump_nozzle_test(test_datetime);

-- Add comments
COMMENT ON TABLE pump_nozzle_test IS 'Tracks nozzle test readings where fuel is dispensed for testing and returned to tank';
COMMENT ON COLUMN pump_nozzle_test.test_quantity IS 'Quantity dispensed during test (in liters)';
COMMENT ON COLUMN pump_nozzle_test.remarks IS 'Optional notes about the test';
