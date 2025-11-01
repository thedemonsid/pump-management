-- ============================================================================
-- Post-Migration Verification and Testing Queries
-- Run these queries after migration to verify data integrity
-- ============================================================================

-- 1. Check table structure
DESC pump_purchase_master;
DESC pump_purchase_item_master;

-- 2. Count records in both tables
SELECT 'Purchases' as entity, COUNT(*) as count FROM pump_purchase_master
UNION ALL
SELECT 'Purchase Items' as entity, COUNT(*) as count FROM pump_purchase_item_master;

-- 3. Verify all purchases have at least one item
SELECT 
    'Purchases without items' as check_name,
    COUNT(*) as count
FROM pump_purchase_master p
LEFT JOIN pump_purchase_item_master pi ON p.id = pi.purchase_id
WHERE pi.id IS NULL;

-- 4. Check for orphaned purchase items (should be 0)
SELECT 
    'Orphaned purchase items' as check_name,
    COUNT(*) as count
FROM pump_purchase_item_master pi
LEFT JOIN pump_purchase_master p ON pi.purchase_id = p.id
WHERE p.id IS NULL;

-- 5. Verify totals calculation
SELECT 
    p.purchase_id,
    p.invoice_number,
    p.total_amount as purchase_total,
    COALESCE(SUM(pi.amount), 0) as items_total,
    p.tax_amount as purchase_tax,
    COALESCE(SUM(pi.tax_amount), 0) as items_tax,
    p.net_amount as purchase_net,
    COALESCE(SUM(pi.amount + pi.tax_amount), 0) as items_net,
    -- Check if totals match
    CASE 
        WHEN ABS(p.total_amount - COALESCE(SUM(pi.amount), 0)) < 0.01 
        THEN '✓' 
        ELSE '✗' 
    END as totals_match
FROM pump_purchase_master p
LEFT JOIN pump_purchase_item_master pi ON p.id = pi.purchase_id
GROUP BY p.id, p.purchase_id, p.invoice_number, p.total_amount, p.tax_amount, p.net_amount
HAVING totals_match = '✗'
LIMIT 10;

-- 6. View recent purchases with item count
SELECT 
    p.purchase_id,
    p.invoice_number,
    p.purchase_date,
    s.supplier_name,
    COUNT(pi.id) as item_count,
    p.total_amount,
    p.tax_amount,
    p.net_amount,
    p.payment_type
FROM pump_purchase_master p
INNER JOIN pump_supplier_master s ON p.supplier_id = s.id
LEFT JOIN pump_purchase_item_master pi ON p.id = pi.purchase_id
GROUP BY p.id, p.purchase_id, p.invoice_number, p.purchase_date, 
         s.supplier_name, p.total_amount, p.tax_amount, p.net_amount, p.payment_type
ORDER BY p.purchase_date DESC, p.purchase_id DESC
LIMIT 20;

-- 7. Detailed view of a specific purchase with all items
-- Replace 'PURCHASE_UUID_HERE' with actual purchase UUID
SELECT 
    p.purchase_id,
    p.invoice_number,
    p.purchase_date,
    s.supplier_name,
    prod.product_name,
    pi.quantity,
    pi.purchase_unit,
    pi.purchase_rate,
    pi.amount,
    pi.tax_percentage,
    pi.tax_amount,
    pi.add_to_stock
FROM pump_purchase_master p
INNER JOIN pump_supplier_master s ON p.supplier_id = s.id
INNER JOIN pump_purchase_item_master pi ON p.id = pi.purchase_id
INNER JOIN pump_product_master prod ON pi.product_id = prod.id
WHERE p.id = UNHEX(REPLACE('PURCHASE_UUID_HERE', '-', ''))
ORDER BY pi.created_at;

-- 8. Check purchases with payments
SELECT 
    p.purchase_id,
    p.invoice_number,
    p.net_amount as purchase_amount,
    COALESCE(SUM(sp.amount), 0) as total_paid,
    p.net_amount - COALESCE(SUM(sp.amount), 0) as outstanding,
    COUNT(sp.id) as payment_count,
    p.payment_type
FROM pump_purchase_master p
LEFT JOIN pump_supplier_payment_master sp ON p.id = sp.purchase_id
GROUP BY p.id, p.purchase_id, p.invoice_number, p.net_amount, p.payment_type
ORDER BY p.purchase_date DESC
LIMIT 20;

-- 9. Check stock updates (items marked as add_to_stock)
SELECT 
    prod.product_name,
    COUNT(pi.id) as purchase_count,
    SUM(CASE WHEN pi.add_to_stock THEN pi.quantity ELSE 0 END) as total_added_to_stock,
    prod.stock_quantity as current_stock
FROM pump_purchase_item_master pi
INNER JOIN pump_product_master prod ON pi.product_id = prod.id
GROUP BY prod.id, prod.product_name, prod.stock_quantity
ORDER BY purchase_count DESC;

-- 10. Check data types and constraints
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_KEY,
    EXTRA
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME IN ('pump_purchase_master', 'pump_purchase_item_master')
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- 11. Check foreign key relationships
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME IN ('pump_purchase_master', 'pump_purchase_item_master')
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- 12. Sample data for testing new purchase creation
-- Copy this JSON to test in Postman/Frontend
/*
{
  "pumpMasterId": "REPLACE_WITH_ACTUAL_UUID",
  "purchaseDate": "2025-10-31",
  "rateType": "INCLUDING_GST",
  "paymentType": "CASH",
  "supplierId": "REPLACE_WITH_ACTUAL_UUID",
  "invoiceNumber": "TEST-INV-001",
  "goodsReceivedBy": "John Doe",
  "purchaseItems": [
    {
      "productId": "REPLACE_WITH_ACTUAL_UUID",
      "quantity": 100,
      "purchaseUnit": "Liters",
      "purchaseRate": 50,
      "taxPercentage": 18,
      "addToStock": true
    }
  ],
  "payments": [
    {
      "pumpMasterId": "REPLACE_WITH_ACTUAL_UUID",
      "supplierId": "REPLACE_WITH_ACTUAL_UUID",
      "bankAccountId": "REPLACE_WITH_ACTUAL_UUID",
      "amount": 5900,
      "paymentDate": "2025-10-31T10:00:00",
      "paymentMethod": "CASH",
      "referenceNumber": "TEST-REF-001",
      "notes": "Test payment"
    }
  ]
}
*/

-- 13. Get sample UUIDs for testing
SELECT 
    'Pump Master' as entity,
    HEX(id) as uuid,
    pump_name as name
FROM pump_info_master
LIMIT 1;

SELECT 
    'Supplier' as entity,
    HEX(id) as uuid,
    supplier_name as name
FROM pump_supplier_master
LIMIT 3;

SELECT 
    'Product' as entity,
    HEX(id) as uuid,
    product_name as name
FROM pump_product_master
WHERE is_active = true
LIMIT 5;

SELECT 
    'Bank Account' as entity,
    HEX(id) as uuid,
    account_name as name
FROM pump_bank_account_master
WHERE is_active = true
LIMIT 3;
