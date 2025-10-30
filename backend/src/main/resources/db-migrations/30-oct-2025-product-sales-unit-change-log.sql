-- Create table for tracking product sales unit changes
CREATE TABLE IF NOT EXISTS product_sales_unit_change_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pump_master_id UUID NOT NULL,
    product_id UUID NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    product_type VARCHAR(20) NOT NULL,
    old_sales_unit VARCHAR(20) NOT NULL,
    new_sales_unit VARCHAR(20) NOT NULL,
    old_stock_quantity DECIMAL(12, 2),
    new_stock_quantity DECIMAL(12, 2),
    old_sales_rate DECIMAL(12, 2),
    new_sales_rate DECIMAL(12, 2),
    change_reason VARCHAR(500),
    changed_by VARCHAR(100),
    remarks VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT,
    entry_by VARCHAR(255) NOT NULL DEFAULT 'system',
    
    CONSTRAINT fk_sales_unit_log_pump_master FOREIGN KEY (pump_master_id) 
        REFERENCES pump_info_master(id) ON DELETE CASCADE,
    CONSTRAINT fk_sales_unit_log_product FOREIGN KEY (product_id) 
        REFERENCES pump_product_master(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_product_id_change_log ON product_sales_unit_change_log(product_id);
CREATE INDEX IF NOT EXISTS idx_pump_master_id_change_log ON product_sales_unit_change_log(pump_master_id);
CREATE INDEX IF NOT EXISTS idx_change_date ON product_sales_unit_change_log(created_at);
CREATE INDEX IF NOT EXISTS idx_product_type_change_log ON product_sales_unit_change_log(product_type);

-- Add comment to table
COMMENT ON TABLE product_sales_unit_change_log IS 'Tracks changes to product sales units, especially important for fuel products for reporting and auditing purposes';
COMMENT ON COLUMN product_sales_unit_change_log.pump_master_id IS 'Reference to the pump master (multi-tenant support)';
COMMENT ON COLUMN product_sales_unit_change_log.product_id IS 'Reference to the product whose sales unit was changed';
COMMENT ON COLUMN product_sales_unit_change_log.old_sales_unit IS 'The previous sales unit before the change';
COMMENT ON COLUMN product_sales_unit_change_log.new_sales_unit IS 'The new sales unit after the change';
COMMENT ON COLUMN product_sales_unit_change_log.change_reason IS 'Reason for the sales unit change';
COMMENT ON COLUMN product_sales_unit_change_log.changed_by IS 'User who made the change';
