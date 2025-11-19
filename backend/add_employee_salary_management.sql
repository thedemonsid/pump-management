-- Migration SQL for Employee Salary Management Feature
-- Date: 2025-11-19
-- Description: Adds salary management functionality for employees including opening balance,
--              salary configuration, calculated salaries, and salary payments

-- ============================================================================
-- STEP 1: Add opening balance fields to pump_user_master table
-- ============================================================================

ALTER TABLE pump_user_master
ADD COLUMN opening_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00
COMMENT 'Opening balance for employee - positive means company owes employee, negative means employee owes company';

ALTER TABLE pump_user_master
ADD COLUMN opening_balance_date DATE NOT NULL DEFAULT CURRENT_DATE
COMMENT 'Date when the opening balance was set';

-- Add constraint to ensure opening balance is valid
ALTER TABLE pump_user_master
ADD CONSTRAINT chk_user_opening_balance CHECK (opening_balance >= 0.00);

-- ============================================================================
-- STEP 2: Create employee_salary_config table
-- ============================================================================

CREATE TABLE employee_salary_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    pump_master_id UUID NOT NULL,
    salary_type VARCHAR(20) NOT NULL CHECK (salary_type IN ('DAILY', 'WEEKLY', 'MONTHLY')),
    basic_salary_amount DECIMAL(15, 2) NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    half_day_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.50,
    overtime_rate DECIMAL(5, 2) NOT NULL DEFAULT 1.50,
    notes VARCHAR(500),
    
    -- Audit fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    entry_by VARCHAR(255) NOT NULL DEFAULT 'system',
    version BIGINT DEFAULT 0,
    
    -- Constraints
    CONSTRAINT fk_salary_config_user FOREIGN KEY (user_id) REFERENCES pump_user_master(id) ON DELETE CASCADE,
    CONSTRAINT fk_salary_config_pump_master FOREIGN KEY (pump_master_id) REFERENCES pump_info_master(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_pump_salary_config UNIQUE (user_id, pump_master_id),
    CONSTRAINT chk_basic_salary_positive CHECK (basic_salary_amount > 0.00),
    CONSTRAINT chk_half_day_rate_valid CHECK (half_day_rate >= 0.00 AND half_day_rate <= 1.00),
    CONSTRAINT chk_overtime_rate_valid CHECK (overtime_rate >= 0.00),
    CONSTRAINT chk_effective_dates_valid CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

-- Create indexes for employee_salary_config
CREATE INDEX idx_user_id_salary_config ON employee_salary_config(user_id);
CREATE INDEX idx_pump_master_id_salary_config ON employee_salary_config(pump_master_id);
CREATE INDEX idx_salary_config_active ON employee_salary_config(is_active);
CREATE INDEX idx_salary_config_effective_dates ON employee_salary_config(effective_from, effective_to);

-- Add comments
COMMENT ON TABLE employee_salary_config IS 'Stores salary configuration for employees';
COMMENT ON COLUMN employee_salary_config.salary_type IS 'Type of salary: DAILY, WEEKLY, or MONTHLY';
COMMENT ON COLUMN employee_salary_config.basic_salary_amount IS 'Base salary amount based on salary type';
COMMENT ON COLUMN employee_salary_config.half_day_rate IS 'Multiplier for half day calculation (typically 0.50)';
COMMENT ON COLUMN employee_salary_config.overtime_rate IS 'Multiplier for overtime calculation (typically 1.50)';

-- ============================================================================
-- STEP 3: Create calculated_salary table
-- ============================================================================

CREATE TABLE calculated_salary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    pump_master_id UUID NOT NULL,
    salary_config_id UUID NOT NULL,
    reference_number VARCHAR(50) NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    calculation_date DATE NOT NULL,
    
    -- Attendance details
    total_days INTEGER NOT NULL,
    full_day_absences INTEGER NOT NULL DEFAULT 0,
    half_day_absences INTEGER NOT NULL DEFAULT 0,
    overtime_days INTEGER NOT NULL DEFAULT 0,
    working_days DECIMAL(10, 2) NOT NULL,
    
    -- Salary calculation
    basic_salary_amount DECIMAL(15, 2) NOT NULL,
    overtime_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    additional_payment DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    additional_deduction DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    gross_salary DECIMAL(15, 2) NOT NULL,
    net_salary DECIMAL(15, 2) NOT NULL,
    
    -- Payment tracking
    paid_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    balance_amount DECIMAL(15, 2) NOT NULL,
    is_fully_paid BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Additional information
    notes VARCHAR(1000),
    additional_payment_reason VARCHAR(500),
    additional_deduction_reason VARCHAR(500),
    
    -- Audit fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    entry_by VARCHAR(255) NOT NULL DEFAULT 'system',
    version BIGINT DEFAULT 0,
    
    -- Constraints
    CONSTRAINT fk_calculated_salary_user FOREIGN KEY (user_id) REFERENCES pump_user_master(id) ON DELETE CASCADE,
    CONSTRAINT fk_calculated_salary_pump_master FOREIGN KEY (pump_master_id) REFERENCES pump_info_master(id) ON DELETE CASCADE,
    CONSTRAINT fk_calculated_salary_config FOREIGN KEY (salary_config_id) REFERENCES employee_salary_config(id) ON DELETE RESTRICT,
    CONSTRAINT uk_salary_reference_number_pump UNIQUE (reference_number, pump_master_id),
    CONSTRAINT chk_salary_dates_valid CHECK (to_date >= from_date),
    CONSTRAINT chk_total_days_valid CHECK (total_days >= 0),
    CONSTRAINT chk_absences_valid CHECK (full_day_absences >= 0 AND half_day_absences >= 0),
    CONSTRAINT chk_overtime_valid CHECK (overtime_days >= 0),
    CONSTRAINT chk_working_days_valid CHECK (working_days >= 0),
    CONSTRAINT chk_salary_amounts_valid CHECK (
        basic_salary_amount >= 0 AND 
        overtime_amount >= 0 AND 
        additional_payment >= 0 AND 
        additional_deduction >= 0 AND
        gross_salary >= 0 AND
        net_salary >= 0
    ),
    CONSTRAINT chk_payment_amounts_valid CHECK (
        paid_amount >= 0 AND
        paid_amount <= net_salary
    )
);

-- Create indexes for calculated_salary
CREATE INDEX idx_user_id_calculated_salary ON calculated_salary(user_id);
CREATE INDEX idx_pump_master_id_calculated_salary ON calculated_salary(pump_master_id);
CREATE INDEX idx_salary_config_id ON calculated_salary(salary_config_id);
CREATE INDEX idx_salary_from_date ON calculated_salary(from_date);
CREATE INDEX idx_salary_to_date ON calculated_salary(to_date);
CREATE INDEX idx_salary_calculation_date ON calculated_salary(calculation_date);
CREATE INDEX idx_salary_is_fully_paid ON calculated_salary(is_fully_paid);
CREATE INDEX idx_salary_reference_number ON calculated_salary(reference_number);

-- Add comments
COMMENT ON TABLE calculated_salary IS 'Stores calculated salary records for employees for specific date ranges';
COMMENT ON COLUMN calculated_salary.working_days IS 'Calculated working days = total_days - full_day_absences - (half_day_absences * 0.5)';
COMMENT ON COLUMN calculated_salary.gross_salary IS 'Basic salary + overtime amount';
COMMENT ON COLUMN calculated_salary.net_salary IS 'Gross salary + additional payment - additional deduction';
COMMENT ON COLUMN calculated_salary.balance_amount IS 'Net salary - paid amount';

-- ============================================================================
-- STEP 4: Create employee_salary_payment table
-- ============================================================================

CREATE TABLE employee_salary_payment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    pump_master_id UUID NOT NULL,
    calculated_salary_id UUID,
    bank_account_id UUID NOT NULL,
    bank_transaction_id UUID NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    payment_date TIMESTAMP NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('CASH', 'CHEQUE', 'BANK_TRANSFER', 'UPI', 'CARD')),
    reference_number VARCHAR(50) NOT NULL,
    notes VARCHAR(500),
    
    -- Audit fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    entry_by VARCHAR(255) NOT NULL DEFAULT 'system',
    version BIGINT DEFAULT 0,
    
    -- Constraints
    CONSTRAINT fk_salary_payment_user FOREIGN KEY (user_id) REFERENCES pump_user_master(id) ON DELETE CASCADE,
    CONSTRAINT fk_salary_payment_pump_master FOREIGN KEY (pump_master_id) REFERENCES pump_info_master(id) ON DELETE CASCADE,
    CONSTRAINT fk_salary_payment_calculated_salary FOREIGN KEY (calculated_salary_id) REFERENCES calculated_salary(id) ON DELETE SET NULL,
    CONSTRAINT fk_salary_payment_bank_account FOREIGN KEY (bank_account_id) REFERENCES pump_bank_account_master(id) ON DELETE RESTRICT,
    CONSTRAINT fk_salary_payment_bank_transaction FOREIGN KEY (bank_transaction_id) REFERENCES pump_bank_transaction_master(id) ON DELETE CASCADE,
    CONSTRAINT uk_salary_payment_reference_bank_transaction UNIQUE (reference_number, bank_transaction_id),
    CONSTRAINT chk_salary_payment_amount_positive CHECK (amount > 0.00)
);

-- Create indexes for employee_salary_payment
CREATE INDEX idx_user_id_salary_payment ON employee_salary_payment(user_id);
CREATE INDEX idx_pump_master_id_salary_payment ON employee_salary_payment(pump_master_id);
CREATE INDEX idx_calculated_salary_id ON employee_salary_payment(calculated_salary_id);
CREATE INDEX idx_bank_account_id_salary_payment ON employee_salary_payment(bank_account_id);
CREATE INDEX idx_salary_payment_date ON employee_salary_payment(payment_date);
CREATE INDEX idx_salary_payment_method ON employee_salary_payment(payment_method);
CREATE INDEX idx_salary_payment_reference ON employee_salary_payment(reference_number);

-- Add comments
COMMENT ON TABLE employee_salary_payment IS 'Stores salary payment records made to employees';
COMMENT ON COLUMN employee_salary_payment.calculated_salary_id IS 'Optional reference to calculated salary - can be NULL for advance payments';

-- ============================================================================
-- STEP 5: Create triggers for automatic updates
-- ============================================================================

-- Trigger to update calculated_salary when payment is made
CREATE OR REPLACE FUNCTION update_calculated_salary_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.calculated_salary_id IS NOT NULL THEN
        UPDATE calculated_salary
        SET 
            paid_amount = (
                SELECT COALESCE(SUM(amount), 0)
                FROM employee_salary_payment
                WHERE calculated_salary_id = NEW.calculated_salary_id
            ),
            is_fully_paid = (
                SELECT COALESCE(SUM(amount), 0) >= net_salary
                FROM employee_salary_payment
                WHERE calculated_salary_id = NEW.calculated_salary_id
            )
        WHERE id = NEW.calculated_salary_id;
        
        UPDATE calculated_salary
        SET balance_amount = net_salary - paid_amount
        WHERE id = NEW.calculated_salary_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_calculated_salary_on_payment
AFTER INSERT OR UPDATE ON employee_salary_payment
FOR EACH ROW
EXECUTE FUNCTION update_calculated_salary_on_payment();

-- Trigger to recalculate on payment deletion
CREATE OR REPLACE FUNCTION recalculate_salary_on_payment_delete()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.calculated_salary_id IS NOT NULL THEN
        UPDATE calculated_salary
        SET 
            paid_amount = (
                SELECT COALESCE(SUM(amount), 0)
                FROM employee_salary_payment
                WHERE calculated_salary_id = OLD.calculated_salary_id
            )
        WHERE id = OLD.calculated_salary_id;
        
        UPDATE calculated_salary
        SET 
            balance_amount = net_salary - paid_amount,
            is_fully_paid = (paid_amount >= net_salary)
        WHERE id = OLD.calculated_salary_id;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalculate_salary_on_payment_delete
AFTER DELETE ON employee_salary_payment
FOR EACH ROW
EXECUTE FUNCTION recalculate_salary_on_payment_delete();

-- ============================================================================
-- STEP 6: Create views for reporting
-- ============================================================================

-- View for employee outstanding salary balance
CREATE OR REPLACE VIEW v_employee_salary_balance AS
SELECT 
    u.id AS user_id,
    u.username,
    u.pump_master_id,
    u.opening_balance,
    COALESCE(SUM(cs.net_salary), 0) AS total_salary_calculated,
    COALESCE(SUM(cs.paid_amount), 0) AS total_salary_paid,
    COALESCE(SUM(cs.balance_amount), 0) AS total_salary_balance,
    u.opening_balance + COALESCE(SUM(cs.balance_amount), 0) AS net_balance
FROM 
    pump_user_master u
    LEFT JOIN calculated_salary cs ON u.id = cs.user_id
GROUP BY 
    u.id, u.username, u.pump_master_id, u.opening_balance;

COMMENT ON VIEW v_employee_salary_balance IS 'View showing salary balance for each employee including opening balance';

-- View for monthly salary summary
CREATE OR REPLACE VIEW v_monthly_salary_summary AS
SELECT 
    cs.pump_master_id,
    cs.user_id,
    u.username,
    DATE_TRUNC('month', cs.calculation_date) AS month_year,
    COUNT(cs.id) AS salary_count,
    SUM(cs.total_days) AS total_days,
    SUM(cs.working_days) AS total_working_days,
    SUM(cs.full_day_absences) AS total_absences,
    SUM(cs.half_day_absences) AS total_half_days,
    SUM(cs.overtime_days) AS total_overtime_days,
    SUM(cs.gross_salary) AS total_gross_salary,
    SUM(cs.net_salary) AS total_net_salary,
    SUM(cs.paid_amount) AS total_paid,
    SUM(cs.balance_amount) AS total_balance
FROM 
    calculated_salary cs
    JOIN pump_user_master u ON cs.user_id = u.id
GROUP BY 
    cs.pump_master_id, cs.user_id, u.username, DATE_TRUNC('month', cs.calculation_date);

COMMENT ON VIEW v_monthly_salary_summary IS 'Monthly summary of salary calculations by employee';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify table structures
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name IN ('employee_salary_config', 'calculated_salary', 'employee_salary_payment')
ORDER BY 
    table_name, ordinal_position;

-- Verify constraints
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM
    information_schema.table_constraints tc
    LEFT JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
WHERE
    tc.table_name IN ('employee_salary_config', 'calculated_salary', 'employee_salary_payment')
ORDER BY
    tc.table_name, tc.constraint_type, tc.constraint_name;

-- Verify indexes
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    tablename IN ('employee_salary_config', 'calculated_salary', 'employee_salary_payment')
ORDER BY
    tablename, indexname;
