-- ============================================================================
-- Quick Daily Closing Balance Fix - MySQL 8
-- Run this to quickly identify and fix inconsistencies
-- ============================================================================

-- 1. Check current status - Show any inconsistencies
SELECT 
    'Inconsistent Records' as issue_type,
    COUNT(*) as count
FROM (
    SELECT 
        dcb.id,
        dcb.bank_account_id,
        dcb.date,
        dcb.daily_net as stored_net,
        COALESCE(SUM(
            CASE 
                WHEN bt.transaction_type = 'CREDIT' THEN bt.amount
                WHEN bt.transaction_type = 'DEBIT' THEN -bt.amount
                ELSE 0
            END
        ), 0) as calculated_net
    FROM pump_daily_closing_balance_master dcb
    LEFT JOIN pump_bank_transaction_master bt ON 
        dcb.bank_account_id = bt.bank_account_id 
        AND DATE(bt.transaction_date) = dcb.date
    GROUP BY dcb.id, dcb.bank_account_id, dcb.date, dcb.daily_net
    HAVING ABS(stored_net - calculated_net) > 0.01
) inconsistent_records;

-- 2. Show details of inconsistent records
SELECT 
    ba.bank,
    ba.account_holder_name,
    dcb.date,
    dcb.daily_net as stored_daily_net,
    COALESCE(SUM(
        CASE 
            WHEN bt.transaction_type = 'CREDIT' THEN bt.amount
            WHEN bt.transaction_type = 'DEBIT' THEN -bt.amount
            ELSE 0
        END
    ), 0) as calculated_daily_net,
    dcb.daily_net - COALESCE(SUM(
        CASE 
            WHEN bt.transaction_type = 'CREDIT' THEN bt.amount
            WHEN bt.transaction_type = 'DEBIT' THEN -bt.amount
            ELSE 0
        END
    ), 0) as difference
FROM pump_daily_closing_balance_master dcb
JOIN pump_bank_account_master ba ON dcb.bank_account_id = ba.id
LEFT JOIN pump_bank_transaction_master bt ON 
    dcb.bank_account_id = bt.bank_account_id 
    AND DATE(bt.transaction_date) = dcb.date
GROUP BY dcb.id, ba.bank, ba.account_holder_name, dcb.date, dcb.daily_net
HAVING ABS(dcb.daily_net - COALESCE(SUM(
    CASE 
        WHEN bt.transaction_type = 'CREDIT' THEN bt.amount
        WHEN bt.transaction_type = 'DEBIT' THEN -bt.amount
        ELSE 0
    END
), 0)) > 0.01
ORDER BY dcb.date DESC, ba.bank;

-- 3. Show transactions that are missing daily closing balance records
SELECT 
    ba.bank,
    ba.account_holder_name,
    DATE(bt.transaction_date) as missing_date,
    COUNT(*) as transaction_count,
    SUM(
        CASE 
            WHEN bt.transaction_type = 'CREDIT' THEN bt.amount
            WHEN bt.transaction_type = 'DEBIT' THEN -bt.amount
            ELSE 0
        END
    ) as should_be_daily_net
FROM pump_bank_transaction_master bt
JOIN pump_bank_account_master ba ON bt.bank_account_id = ba.id
WHERE bt.transaction_date IS NOT NULL
AND NOT EXISTS (
    SELECT 1 
    FROM pump_daily_closing_balance_master dcb
    WHERE dcb.bank_account_id = bt.bank_account_id 
    AND dcb.date = DATE(bt.transaction_date)
)
GROUP BY ba.id, ba.bank, ba.account_holder_name, DATE(bt.transaction_date)
ORDER BY missing_date DESC, ba.bank;

-- ============================================================================
-- SIMPLE FIX: Update existing records and insert missing ones
-- ============================================================================

-- Update existing records with correct values
UPDATE pump_daily_closing_balance_master dcb
JOIN (
    SELECT 
        bank_account_id,
        DATE(transaction_date) as date,
        SUM(
            CASE 
                WHEN transaction_type = 'CREDIT' THEN amount
                WHEN transaction_type = 'DEBIT' THEN -amount
                ELSE 0
            END
        ) as correct_daily_net
    FROM pump_bank_transaction_master
    WHERE transaction_date IS NOT NULL
    GROUP BY bank_account_id, DATE(transaction_date)
) bt ON dcb.bank_account_id = bt.bank_account_id AND dcb.date = bt.date
SET dcb.daily_net = bt.correct_daily_net,
    dcb.updated_at = NOW()
WHERE ABS(dcb.daily_net - bt.correct_daily_net) > 0.01;

-- Insert missing daily closing balance records
INSERT INTO pump_daily_closing_balance_master (id, bank_account_id, date, daily_net, created_at, updated_at)
SELECT 
    UUID_TO_BIN(UUID()) as id,
    bt.bank_account_id,
    DATE(bt.transaction_date) as date,
    SUM(
        CASE 
            WHEN bt.transaction_type = 'CREDIT' THEN bt.amount
            WHEN bt.transaction_type = 'DEBIT' THEN -bt.amount
            ELSE 0
        END
    ) as daily_net,
    NOW() as created_at,
    NOW() as updated_at
FROM pump_bank_transaction_master bt
WHERE bt.transaction_date IS NOT NULL
AND NOT EXISTS (
    SELECT 1 
    FROM pump_daily_closing_balance_master dcb
    WHERE dcb.bank_account_id = bt.bank_account_id 
    AND dcb.date = DATE(bt.transaction_date)
)
GROUP BY bt.bank_account_id, DATE(bt.transaction_date)
HAVING SUM(
    CASE 
        WHEN bt.transaction_type = 'CREDIT' THEN bt.amount
        WHEN bt.transaction_type = 'DEBIT' THEN -bt.amount
        ELSE 0
    END
) != 0;

-- Delete records that have zero balance (shouldn't exist)
DELETE FROM pump_daily_closing_balance_master 
WHERE ABS(daily_net) < 0.01;

-- ============================================================================
-- Verification after fix
-- ============================================================================
SELECT 
    'Fixed - Verification' as status,
    COUNT(*) as total_records,
    MIN(date) as earliest_date,
    MAX(date) as latest_date
FROM pump_daily_closing_balance_master;

-- Should return 0 rows if everything is fixed
SELECT 
    'Remaining Issues' as status,
    COUNT(*) as count
FROM (
    SELECT 
        dcb.id
    FROM pump_daily_closing_balance_master dcb
    LEFT JOIN pump_bank_transaction_master bt ON 
        dcb.bank_account_id = bt.bank_account_id 
        AND DATE(bt.transaction_date) = dcb.date
    GROUP BY dcb.id, dcb.bank_account_id, dcb.date, dcb.daily_net
    HAVING ABS(dcb.daily_net - COALESCE(SUM(
        CASE 
            WHEN bt.transaction_type = 'CREDIT' THEN bt.amount
            WHEN bt.transaction_type = 'DEBIT' THEN -bt.amount
            ELSE 0
        END
    ), 0)) > 0.01
) remaining_issues;
