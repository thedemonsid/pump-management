# Advance Payment from Shift Accounting Balance

## Overview

Automatically creates an advance salary payment for salesmen when their shift accounting balance amount is >= ₹50. The advance payment is automatically deleted when the accounting is deleted.

## Implementation Details

### 1. Database Changes

- Added `advance_payment_id` column to `pump_salesman_shift_accounting` table
- Foreign key relationship to `employee_salary_payment` table
- Cascade delete ensures advance payment is deleted when accounting is deleted
- Migration file: `add_advance_payment_to_accounting.sql`

### 2. Entity Changes (`SalesmanShiftAccounting.java`)

- Added `advancePayment` field with `@OneToOne` relationship
- Configured with `CascadeType.ALL` and `orphanRemoval = true`
- This ensures the advance payment is automatically created, updated, and deleted with the accounting record

### 3. Service Logic (`SalesmanShiftAccountingService.java`)

#### Constants

- `ADVANCE_PAYMENT_THRESHOLD = 50.00` - Minimum balance to trigger advance payment creation

#### Create Accounting

When creating new accounting:

1. Calculates the balance amount (actual cash - expected cash)
2. If balance >= ₹50:
   - Creates an advance salary payment for the salesman
   - Links it to the accounting record
   - Uses CASH payment method
   - Reference number: `SHIFT-BALANCE-{shiftId}`
   - Description indicates it's from shift balance

#### Update Accounting

When updating existing accounting:

1. Recalculates the balance amount
2. Three scenarios:
   - **Balance >= 50 and no existing advance**: Creates new advance payment
   - **Balance >= 50 and advance exists**: Updates the existing advance payment amount
   - **Balance < 50 and advance exists**: Removes the advance payment (orphan removal)

#### Delete Accounting

When deleting accounting:

- The cascade relationship automatically deletes the associated advance payment
- No additional code needed due to `CascadeType.ALL` and `orphanRemoval = true`

### 4. Advance Payment Details

The automatically created advance payment has the following characteristics:

- **User**: The salesman from the shift
- **Pump Master**: From the shift
- **Calculated Salary**: `null` (this is an advance, not linked to calculated salary)
- **Bank Account**: First available bank account for the pump master
- **Amount**: The balance amount from shift accounting
- **Payment Date**: Current timestamp
- **Payment Method**: `CASH`
- **Reference Number**: `SHIFT-BALANCE-{shiftId}`
- **Notes**: "Advance payment from shift accounting balance"

### 5. Bank Transaction

Each advance payment creates a corresponding bank transaction:

- **Type**: `DEBIT` (money going out)
- **Amount**: Same as payment amount
- **Description**: "Advance Salary Payment to {salesman} from Shift Balance - Shift ID: {shiftId}"
- **Payment Method**: `CASH`

## Usage

### Creating Accounting

```java
// When balance >= 50, advance payment is automatically created
SalesmanShiftAccounting accounting = service.createAccounting(shiftId, request);
// accounting.getAdvancePayment() will be set if balance >= 50
```

### Updating Accounting

```java
// Advance payment is automatically managed based on new balance
SalesmanShiftAccounting accounting = service.updateAccounting(shiftId, request);
```

### Deleting Accounting

```java
// Advance payment is automatically deleted via cascade
service.deleteAccounting(shiftId);
```

## Error Handling

- If no bank account exists for the pump master, throws `PumpBusinessException` with code `NO_BANK_ACCOUNT`
- All database operations are wrapped in `@Transactional` to ensure atomicity

## Logging

The service logs the following events:

- Creation of advance payment with amount and salesman details
- Update of existing advance payment amounts
- Removal of advance payment when balance drops below threshold

## Database Migration

To apply the database changes, run:

```sql
-- Run the migration script
psql -U your_user -d your_database -f add_advance_payment_to_accounting.sql
```

## Benefits

1. **Automatic**: No manual intervention needed
2. **Consistent**: Always follows the same business rules
3. **Audit Trail**: Creates proper bank transactions
4. **Clean Deletion**: Cascade ensures no orphaned records
5. **Flexible**: Can be updated if balance changes
6. **Threshold-Based**: Only creates advance when significant balance exists (>= ₹50)
