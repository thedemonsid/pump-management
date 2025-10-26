-- Add bank_transaction_id column to pump_expense table to link expenses with bank transactions
ALTER TABLE `pump_expense` 
ADD COLUMN `bank_transaction_id` BINARY(16) NULL AFTER `bank_account_id`,
ADD CONSTRAINT `fk_expense_bank_transaction` FOREIGN KEY (`bank_transaction_id`) REFERENCES `pump_bank_transaction_master` (`id`) ON DELETE CASCADE;
