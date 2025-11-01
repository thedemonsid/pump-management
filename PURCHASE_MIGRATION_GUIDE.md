# Purchase System Refactoring - Migration Guide

## Overview

This migration refactors the Purchase system to support multiple items per purchase (similar to the Bill system) and properly links payments to bank accounts.

## Changes Summary

### Database Changes

1. **New Table**: `pump_purchase_item_master` - Stores individual items for each purchase
2. **Modified Table**: `pump_purchase_master` - Now acts as a header/master record
3. **Relationships**: Links purchases to supplier payments via bank accounts

### Code Changes

1. New entities: `PurchaseItem`
2. Modified entities: `Purchase` (removed product-specific fields, added collections)
3. New DTOs: `CreatePurchaseItemRequest`, `CreateSupplierPurchasePaymentRequest`, `PurchaseItemResponse`
4. Modified DTOs: `CreatePurchaseRequest`, `PurchaseResponse`
5. Updated services, mappers, and repositories

## Migration Steps

### Step 1: Backup Database

```bash
# Backup your database before running migration
mysqldump -u root -p pump_db > pump_db_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Run Migration Script

```bash
# Connect to MySQL
mysql -u root -p pump_db

# Run the migration script
source /path/to/migration_purchase_refactor.sql

# Or copy-paste the SQL content into MySQL console
```

### Step 3: Verify Migration

After running the migration, verify the changes:

```sql
-- Check if new table exists
SHOW TABLES LIKE 'pump_purchase_item_master';

-- Check purchase items were migrated
SELECT COUNT(*) FROM pump_purchase_item_master;

-- Verify structure
DESC pump_purchase_master;
DESC pump_purchase_item_master;

-- Check sample data
SELECT
    p.purchase_id,
    p.invoice_number,
    COUNT(pi.id) as item_count,
    p.total_amount,
    p.net_amount
FROM pump_purchase_master p
LEFT JOIN pump_purchase_item_master pi ON p.id = pi.purchase_id
GROUP BY p.id
LIMIT 5;
```

### Step 4: Update Application

1. Stop the backend application
2. Pull the latest code changes
3. Rebuild the application:
   ```bash
   cd backend
   ./mvnw clean package -DskipTests
   ```
4. Start the application

### Step 5: Test the Changes

1. Try creating a new purchase with multiple items
2. Test adding payments to purchases
3. Verify CASH payment type validation (payments must match total)
4. Test CREDIT payment type (partial payments allowed)

## Payment Type Logic

### CASH Payment Type

- When creating a purchase with `paymentType: "CASH"`
- Total payments must equal the purchase net amount
- Validation error if amounts don't match

### CREDIT Payment Type

- When creating a purchase with `paymentType: "CREDIT"`
- Payments can be partial or zero (supplier credit)
- Can add payments later

## API Changes

### Create Purchase (Before)

```json
{
  "pumpMasterId": "uuid",
  "purchaseDate": "2025-10-31",
  "supplierId": "uuid",
  "invoiceNumber": "INV001",
  "productId": "uuid",
  "quantity": 100,
  "purchaseRate": 50,
  "amount": 5000,
  "purchaseUnit": "Liters",
  "taxPercentage": 18,
  "paymentType": "CASH",
  "rateType": "INCLUDING_GST"
}
```

### Create Purchase (After)

```json
{
  "pumpMasterId": "uuid",
  "purchaseDate": "2025-10-31",
  "supplierId": "uuid",
  "invoiceNumber": "INV001",
  "paymentType": "CASH",
  "rateType": "INCLUDING_GST",
  "goodsReceivedBy": "John Doe",
  "purchaseItems": [
    {
      "productId": "uuid",
      "quantity": 100,
      "purchaseUnit": "Liters",
      "purchaseRate": 50,
      "taxPercentage": 18,
      "addToStock": true
    },
    {
      "productId": "uuid2",
      "quantity": 50,
      "purchaseUnit": "Kg",
      "purchaseRate": 30,
      "taxPercentage": 12,
      "addToStock": false
    }
  ],
  "payments": [
    {
      "pumpMasterId": "uuid",
      "supplierId": "uuid",
      "bankAccountId": "uuid",
      "amount": 100,
      "paymentDate": "2025-10-31T10:00:00",
      "paymentMethod": "UPI",
      "referenceNumber": "REF123",
      "notes": "Payment via UPI"
    }
  ]
}
```

## Rollback Instructions

If you need to rollback the migration, use the rollback script included at the end of `migration_purchase_refactor.sql`.

**⚠️ WARNING**: Rollback will only preserve the first item from each purchase. Any additional items will be lost.

```bash
# Restore from backup if needed
mysql -u root -p pump_db < pump_db_backup_YYYYMMDD_HHMMSS.sql
```

## Troubleshooting

### Issue: Foreign key constraint errors

**Solution**: Make sure all referenced tables exist and have the correct data

### Issue: Data not migrated

**Solution**: Check if the WHERE clause `p.product_id IS NOT NULL` is filtering your data. Adjust if needed.

### Issue: Application won't start

**Solution**:

1. Check for compilation errors
2. Verify all new repositories are created
3. Check application logs for specific errors

## Support

If you encounter issues, check:

1. Application logs: `backend/logs/`
2. Database error logs
3. Verify all entity relationships are correctly mapped

## Next Steps (Frontend)

After successful backend migration, update the frontend:

1. Update purchase types/interfaces
2. Create new purchase form similar to bill form
3. Add payment entry UI
4. Update purchase list display
