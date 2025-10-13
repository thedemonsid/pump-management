ALTER TABLE `pump_db`.`pump_fuel_purchase_master` 
ADD COLUMN `aft_density` DECIMAL(8,3) NOT NULL AFTER `bfr_density`,
ADD COLUMN `aft_dip_reading` DECIMAL(12,2) NOT NULL AFTER `bfr_dip_reading`,
ADD COLUMN `driver_name` VARCHAR(45) NULL DEFAULT 'N/A' AFTER `vehicle_number`,
CHANGE COLUMN `density` `bfr_density` DECIMAL(8,3) NOT NULL ,
CHANGE COLUMN `dip_reading` `bfr_dip_reading` DECIMAL(12,2) NOT NULL ,
CHANGE COLUMN `vehicle` `vehicle_number` VARCHAR(100) NULL DEFAULT NULL ;

ALTER TABLE `pump_db`.`pump_fuel_purchase_master` 
DROP COLUMN `rate_type`,
DROP COLUMN `payment_type`;
