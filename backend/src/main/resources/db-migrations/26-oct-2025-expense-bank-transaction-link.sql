-- Add bank_transaction_id column to pump_expense table to link expenses with bank transactions
ALTER TABLE `pump_expense` 
ADD COLUMN `bank_transaction_id` BINARY(16) NULL AFTER `bank_account_id`,
ADD CONSTRAINT `fk_expense_bank_transaction` FOREIGN KEY (`bank_transaction_id`) REFERENCES `pump_bank_transaction_master` (`id`) ON DELETE CASCADE;

-- Add file_storage_id column to pump_expense table for optional expense receipt/image
ALTER TABLE `pump_expense` 
ADD COLUMN `file_storage_id` BINARY(16) NULL AFTER `reference_number`,
ADD CONSTRAINT `fk_expense_file_storage` FOREIGN KEY (`file_storage_id`) REFERENCES `pump_file_storage` (`id`) ON DELETE SET NULL;
