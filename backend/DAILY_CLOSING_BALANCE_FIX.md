# Daily Closing Balance Fix for Cash Distribution

## Problem

When cash distribution transactions were created from shift accounting, the daily closing balance was not being updated. This caused inconsistencies between bank transaction totals and daily closing balance records.

## Root Cause

The `SalesmanShiftAccountingService.distributeCash()` method was creating bank transactions but not calling the logic to update the daily closing balance table. Similarly, when deleting distributions, the daily closing balance was not being recalculated.

## Solution Implemented

### Backend Code Changes

#### 1. Added Dependencies

- Added `DailyClosingBalanceRepository` to `SalesmanShiftAccountingService`
- Added `LocalDate` import for date operations

#### 2. Updated `distributeCash()` Method

```java
// Now calls updateDailyClosingBalance after saving each transaction
BankTransaction savedTransaction = bankTransactionRepository.save(transaction);
updateDailyClosingBalance(savedTransaction);
transactions.add(savedTransaction);
```

#### 3. Updated `deleteCashDistributions()` Method

```java
// Now recalculates daily closing balance after deletion
List<BankTransaction> transactionsToDelete = bankTransactionRepository
        .findByShiftAccountingIdOrderByCreatedAtDesc(accounting.getId());

bankTransactionRepository.deleteByShiftAccountingId(accounting.getId());

// Recalculate for each affected bank account and date
transactionsToDelete.stream()
        .collect(Collectors.groupingBy(...))
        .keySet()
        .forEach(key -> {
            recalculateDailyClosingBalance(bankAccountId, date);
        });
```

#### 4. Updated `deleteCashDistribution()` Method

```java
// Store info before deletion
UUID bankAccountId = transaction.getBankAccount().getId();
LocalDate transactionDate = transaction.getTransactionDate().toLocalDate();

bankTransactionRepository.delete(transaction);

// Recalculate daily closing balance
recalculateDailyClosingBalance(bankAccountId, transactionDate);
```

#### 5. Added Helper Methods

**`updateDailyClosingBalance(BankTransaction transaction)`**

- Called after creating a new transaction
- Calculates daily net for the transaction date
- Creates or updates the daily closing balance record

**`recalculateDailyClosingBalance(UUID bankAccountId, LocalDate date)`**

- Called after deleting transactions
- Recalculates daily net from all remaining transactions for that date
- Deletes the daily closing balance record if no transactions exist for that date
- Updates or creates the record if transactions exist

## SQL Scripts for Data Cleanup

### Script 1: Complete Recalculation (`recalculate_daily_closing_balance.sql`)

This script performs a full recalculation:

1. Creates a backup of existing data
2. Deletes all daily closing balance records
3. Recalculates from all bank transactions
4. Provides verification queries
5. Shows summary by bank account

**Use when:** You want a complete fresh start

### Script 2: Quick Fix (`fix_daily_closing_balance_quick.sql`)

This script performs incremental fixes:

1. Identifies inconsistent records
2. Shows missing records
3. Updates incorrect values
4. Inserts missing records
5. Deletes zero-balance records
6. Verifies the fixes

**Use when:** You want to fix only the inconsistent data without deleting everything

## How to Apply the Fix

### 1. Deploy Backend Code

```bash
cd backend
./mvnw clean package
# Restart your application
```

### 2. Run SQL Script to Fix Existing Data

**Option A: Complete Recalculation (Recommended)**

```bash
mysql -u your_username -p your_database < recalculate_daily_closing_balance.sql
```

**Option B: Quick Fix**

```bash
mysql -u your_username -p your_database < fix_daily_closing_balance_quick.sql
```

### 3. Verify the Fix

Both SQL scripts include verification queries that will show:

- Total records processed
- Any remaining inconsistencies
- Summary by bank account
- Date ranges covered

## What This Fixes

### Before Fix

- Cash distribution transactions created ✅
- Bank account balance calculated correctly ✅
- Daily closing balance **NOT UPDATED** ❌
- Reports showed incorrect daily balances ❌

### After Fix

- Cash distribution transactions created ✅
- Bank account balance calculated correctly ✅
- Daily closing balance **UPDATED AUTOMATICALLY** ✅
- Reports show correct daily balances ✅

## Testing Checklist

1. **Create Cash Distribution**

   - Create shift accounting
   - Add cash distribution to bank account
   - Verify daily closing balance is updated for that date

2. **Delete Cash Distribution**

   - Delete a single distribution
   - Verify daily closing balance is recalculated
   - If no transactions remain for that date, verify record is deleted

3. **Delete All Distributions**

   - Delete all distributions for a shift
   - Verify all affected dates have recalculated balances

4. **Check Reports**
   - Bank account reports should show correct daily balances
   - Balance trends should be accurate
   - Total balance should match sum of all transactions

## Database Schema

The `pump_daily_closing_balance_master` table structure:

```sql
- id (UUID, PK)
- bank_account_id (UUID, FK)
- date (DATE)
- daily_net (DECIMAL 15,2) -- Net of all transactions for this date
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- UNIQUE KEY: (bank_account_id, date)
```

## Notes

- The daily closing balance table stores the NET daily change (credits - debits)
- Cumulative balance is calculated by summing daily_net up to a specific date
- Zero-balance records are cleaned up automatically
- The fix is backward compatible and doesn't affect existing functionality
