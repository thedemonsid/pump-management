ALTER TABLE `pump_product_master` 
ADD COLUMN `gst_percentage` INT NOT NULL DEFAULT 0 AFTER `pump_master_id`;
