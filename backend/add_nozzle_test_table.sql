-- Add nozzle test tracking table
-- This table tracks fuel dispensed during nozzle testing (e.g., dispensing 5 liters to verify accuracy)
-- Test quantities appear on meter readings but should not be counted in sales
-- Database: MySQL 8

CREATE TABLE pump_nozzle_test (
    id BINARY(16) NOT NULL PRIMARY KEY,
    pump_master_id BINARY(16) NOT NULL,
    salesman_shift_id BINARY(16) NOT NULL,
    nozzle_assignment_id BINARY(16) NOT NULL,
    test_datetime DATETIME(6) NOT NULL,
    test_quantity DECIMAL(15, 3) NOT NULL,
    remarks VARCHAR(500) NULL,
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    entry_by VARCHAR(255) NULL,
    version BIGINT DEFAULT 0,
    
    CONSTRAINT fk_nozzle_test_pump_master FOREIGN KEY (pump_master_id) 
        REFERENCES pump_info_master(id) ON DELETE CASCADE,
    CONSTRAINT fk_nozzle_test_shift FOREIGN KEY (salesman_shift_id) 
        REFERENCES pump_salesman_shift(id) ON DELETE CASCADE,
    CONSTRAINT fk_nozzle_test_assignment FOREIGN KEY (nozzle_assignment_id) 
        REFERENCES pump_nozzle_assignment(id) ON DELETE CASCADE,
    CONSTRAINT chk_nozzle_test_quantity CHECK (test_quantity >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for efficient queries
CREATE INDEX idx_nozzle_test_shift ON pump_nozzle_test(salesman_shift_id);
CREATE INDEX idx_nozzle_test_assignment ON pump_nozzle_test(nozzle_assignment_id);
CREATE INDEX idx_nozzle_test_pump_master ON pump_nozzle_test(pump_master_id);
CREATE INDEX idx_nozzle_test_datetime ON pump_nozzle_test(test_datetime);
