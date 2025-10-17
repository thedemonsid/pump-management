-- Create file storage table
CREATE TABLE IF NOT EXISTS `pump_db`.`pump_file_storage` (
  `id` BINARY(16) NOT NULL,
  `pump_master_id` BINARY(16) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `original_file_name` VARCHAR(255) NOT NULL,
  `content_type` VARCHAR(100) NOT NULL,
  `file_size` BIGINT NOT NULL,
  `file_data` LONGBLOB NOT NULL,
  `description` VARCHAR(500) NULL,
  `file_category` VARCHAR(50) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(6) NOT NULL,
  `updated_at` DATETIME(6) NOT NULL,
  `version` BIGINT NULL,
  `entry_by` VARCHAR(255) NOT NULL DEFAULT 'system',
  PRIMARY KEY (`id`),
  INDEX `idx_pump_master_id` (`pump_master_id` ASC),
  INDEX `idx_file_category` (`file_category` ASC),
  INDEX `idx_is_active` (`is_active` ASC),
  INDEX `idx_file_name` (`file_name` ASC),
  INDEX `idx_pump_category` (`pump_master_id` ASC, `file_category` ASC),
  CONSTRAINT `fk_file_storage_pump_master`
    FOREIGN KEY (`pump_master_id`)
    REFERENCES `pump_db`.`pump_info_master` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

-- Add image columns to salesman bill table
ALTER TABLE `pump_db`.`pump_salesman_bill_master` 
ADD COLUMN `meter_image_id` BINARY(16) NULL AFTER `net_amount`,
ADD COLUMN `vehicle_image_id` BINARY(16) NULL AFTER `meter_image_id`,
ADD COLUMN `extra_image_id` BINARY(16) NULL AFTER `vehicle_image_id`,
ADD CONSTRAINT `fk_salesman_bill_meter_image`
  FOREIGN KEY (`meter_image_id`)
  REFERENCES `pump_db`.`pump_file_storage` (`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE,
ADD CONSTRAINT `fk_salesman_bill_vehicle_image`
  FOREIGN KEY (`vehicle_image_id`)
  REFERENCES `pump_db`.`pump_file_storage` (`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE,
ADD CONSTRAINT `fk_salesman_bill_extra_image`
  FOREIGN KEY (`extra_image_id`)
  REFERENCES `pump_db`.`pump_file_storage` (`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- Add indexes for the foreign keys
ALTER TABLE `pump_db`.`pump_salesman_bill_master`
ADD INDEX `idx_meter_image_id` (`meter_image_id` ASC),
ADD INDEX `idx_vehicle_image_id` (`vehicle_image_id` ASC),
ADD INDEX `idx_extra_image_id` (`extra_image_id` ASC);

-- Remove the unnecessay column
ALTER TABLE `pump_db`.`pump_salesman_shift_accounting` 
DROP COLUMN `system_received_amount`;
