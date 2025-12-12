-- ============================================================================
-- SQL Script to Recalculate Daily Closing Balance for MySQL 8
-- This script will fix inconsistent daily closing balance data
-- ============================================================================

-- BACKUP: Create a backup of the current daily closing balance table first
CREATE TABLE IF NOT EXISTS pump_daily_closing_balance_master_backup AS 
SELECT * FROM pump_daily_closing_balance_master;

-- Step 1: Delete all existing daily closing balance records
-- (We will recalculate them from scratch)
DELETE FROM pump_daily_closing_balance_master;

-- Step 2: Recalculate and insert daily closing balances from bank transactions
-- This query groups transactions by bank account and date, then calculates the net for each day
INSERT INTO pump_daily_closing_balance_master (id, bank_account_id, date, daily_net, created_at, updated_at,entry_by)
SELECT 
    UUID_TO_BIN(UUID()) as id,
    bank_account_id,
    DATE(transaction_date) as date,
    SUM(
        CASE 
            WHEN transaction_type = 'CREDIT' THEN amount
            WHEN transaction_type = 'DEBIT' THEN -amount
            ELSE 0
        END
    ) as daily_net,
    NOW() as created_at,
    NOW() as updated_at,
    'system'
FROM pump_bank_transaction_master
WHERE transaction_date IS NOT NULL
GROUP BY bank_account_id, DATE(transaction_date)
HAVING daily_net != 0
ORDER BY bank_account_id, date;

-- Step 3: Verify the results
-- Show summary of recalculated daily closing balances
SELECT 
    ba.bank as bank_name,
    ba.account_holder_name,
    COUNT(dcb.id) as total_records,
    MIN(dcb.date) as earliest_date,
    MAX(dcb.date) as latest_date,
    SUM(dcb.daily_net) as total_net
FROM pump_daily_closing_balance_master dcb
JOIN pump_bank_account_master ba ON dcb.bank_account_id = ba.id
GROUP BY ba.id, ba.bank, ba.account_holder_name
ORDER BY ba.bank, ba.account_holder_name;

-- Step 4: Verify bank account balances match
-- This query compares the sum of daily closing balances with the actual bank transaction totals
SELECT 
    ba.bank as bank_name,
    ba.account_holder_name,
    ba.account_number,
    COALESCE(SUM(dcb.daily_net), 0) as balance_from_daily_closing,
    COALESCE(SUM(
        CASE 
            WHEN bt.transaction_type = 'CREDIT' THEN bt.amount
            WHEN bt.transaction_type = 'DEBIT' THEN -bt.amount
            ELSE 0
        END
    ), 0) as balance_from_transactions,
    COALESCE(SUM(dcb.daily_net), 0) - COALESCE(SUM(
        CASE 
            WHEN bt.transaction_type = 'CREDIT' THEN bt.amount
            WHEN bt.transaction_type = 'DEBIT' THEN -bt.amount
            ELSE 0
        END
    ), 0) as difference
FROM pump_bank_account_master ba
LEFT JOIN pump_daily_closing_balance_master dcb ON ba.id = dcb.bank_account_id
LEFT JOIN pump_bank_transaction_master bt ON ba.id = bt.bank_account_id
GROUP BY ba.id, ba.bank, ba.account_holder_name, ba.account_number
ORDER BY ba.bank, ba.account_holder_name;

-- Step 5: Check for any dates that have transactions but no daily closing balance record
-- (This should return no rows if everything is correct)
SELECT 
    ba.bank,
    ba.account_holder_name,
    DATE(bt.transaction_date) as transaction_date,
    SUM(
        CASE 
            WHEN bt.transaction_type = 'CREDIT' THEN bt.amount
            WHEN bt.transaction_type = 'DEBIT' THEN -bt.amount
            ELSE 0
        END
    ) as daily_net
FROM pump_bank_transaction_master bt
JOIN pump_bank_account_master ba ON bt.bank_account_id = ba.id
WHERE bt.transaction_date IS NOT NULL
GROUP BY ba.id, ba.bank, ba.account_holder_name, DATE(bt.transaction_date)
HAVING NOT EXISTS (
    SELECT 1 
    FROM pump_daily_closing_balance_master dcb
    WHERE dcb.bank_account_id = ba.id 
    AND dcb.date = DATE(bt.transaction_date)
)
ORDER BY ba.bank, transaction_date;

-- ============================================================================
-- OPTIONAL: If you need to restore from backup
-- ============================================================================
-- DELETE FROM pump_daily_closing_balance_master;
-- INSERT INTO pump_daily_closing_balance_master SELECT * FROM pump_daily_closing_balance_master_backup;

-- ============================================================================
-- OPTIONAL: Clean up backup table after verification
-- ============================================================================
-- DROP TABLE IF EXISTS pump_daily_closing_balance_master_backup;
