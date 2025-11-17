# Billing Mode Feature - Dual Billing Support

## Overview

The Salesman Bill system now supports **two modes of billing** to accommodate different customer purchase patterns:

1. **BY_QUANTITY** - Customer specifies liters (e.g., "Give me 10 liters", "Fill 30 liters")
2. **BY_AMOUNT** - Customer specifies rupees (e.g., "Give me fuel worth ₹1000", "Fill ₹2000 worth")

## Business Case

In real-world scenarios at fuel pumps, customers request fuel in two ways:

- **Volume-based**: "I need 10L of diesel" → System calculates amount = 10L × rate
- **Value-based**: "I need diesel worth ₹500" → System calculates quantity = ₹500 ÷ rate

This feature eliminates manual calculations and reduces errors by automatically computing the missing field.

---

## Backend Changes

### 1. New Enum: `BillingMode`

**File**: `backend/src/main/java/com/reallink/pump/entities/BillingMode.java`

```java
public enum BillingMode {
    BY_QUANTITY,  // Customer specifies liters
    BY_AMOUNT     // Customer specifies rupees
}
```

### 2. Entity Update: `SalesmanBill`

**File**: `backend/src/main/java/com/reallink/pump/entities/SalesmanBill.java`

Added new field:

```java
@NotNull(message = "Billing mode is required")
@Enumerated(EnumType.STRING)
@Column(name = "billing_mode", nullable = false)
private BillingMode billingMode;
```

### 3. DTO Update: `CreateSalesmanBillRequest`

**File**: `backend/src/main/java/com/reallink/pump/dto/request/CreateSalesmanBillRequest.java`

Changes:

- Added `billingMode` field (required)
- Made `quantity` optional (required only when `billingMode = BY_QUANTITY`)
- Added `requestedAmount` field (required only when `billingMode = BY_AMOUNT`)
- Updated quantity precision to 3 decimal places (was 2)

```java
@NotNull(message = "Billing mode is required")
private BillingMode billingMode;

@DecimalMin(value = "0.0", inclusive = false)
@Digits(integer = 10, fraction = 3)
private BigDecimal quantity;  // Optional - required for BY_QUANTITY

@DecimalMin(value = "0.0", inclusive = false)
@Digits(integer = 10, fraction = 2)
private BigDecimal requestedAmount;  // Optional - required for BY_AMOUNT
```

### 4. Service Logic: `SalesmanBillService`

**File**: `backend/src/main/java/com/reallink/pump/services/SalesmanBillService.java`

#### New Validation Method

```java
private void validateBillingRequest(CreateSalesmanBillRequest request) {
    switch (request.getBillingMode()) {
        case BY_QUANTITY:
            // Ensure quantity is provided and positive
            if (request.getQuantity() == null || request.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
                throw new PumpBusinessException("INVALID_QUANTITY", "...");
            }
            break;
        case BY_AMOUNT:
            // Ensure requestedAmount is provided and positive
            if (request.getRequestedAmount() == null || request.getRequestedAmount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new PumpBusinessException("INVALID_AMOUNT", "...");
            }
            break;
    }
}
```

#### Updated Calculation Logic

```java
BigDecimal quantity;
BigDecimal amount;

switch (request.getBillingMode()) {
    case BY_QUANTITY:
        // Customer specified quantity, calculate amount
        quantity = request.getQuantity();
        amount = quantity.multiply(request.getRate()).setScale(2, RoundingMode.HALF_UP);
        break;

    case BY_AMOUNT:
        // Customer specified amount, calculate quantity
        amount = request.getRequestedAmount();
        quantity = amount.divide(request.getRate(), 3, RoundingMode.HALF_UP);
        break;
}

bill.setQuantity(quantity);
bill.setAmount(amount);
bill.setNetAmount(amount);
```

### 5. Database Migration

**File**: `backend/add_billing_mode_column.sql`

- Adds `billing_mode` column (VARCHAR(20), NOT NULL)
- Sets default value `BY_QUANTITY` for existing records
- Adds CHECK constraint for valid values
- Updates `quantity` column precision to `DECIMAL(12, 3)`

---

## Frontend Changes

### 1. Type Definitions

**File**: `frontend/src/types/salesman-bill.ts`

Added:

```typescript
export type BillingMode = "BY_QUANTITY" | "BY_AMOUNT";

export interface CreateSalesmanBillRequest {
  // ... other fields
  billingMode: BillingMode;
  quantity?: number; // Optional - for BY_QUANTITY mode
  requestedAmount?: number; // Optional - for BY_AMOUNT mode
  // ...
}
```

### 2. UI Components

**File**: `frontend/src/pages/shifts/ShiftBillsPage.tsx`

#### New State Variables

```typescript
const [billingMode, setBillingMode] = useState<"BY_QUANTITY" | "BY_AMOUNT">(
  "BY_QUANTITY"
);
const [requestedAmount, setRequestedAmount] = useState<string>("");
```

#### Billing Mode Toggle

```tsx
<div className="flex gap-3">
  <Button
    variant={billingMode === "BY_QUANTITY" ? "default" : "outline"}
    onClick={() => {
      setBillingMode("BY_QUANTITY");
      setRequestedAmount("");
    }}
  >
    By Quantity (Liters)
  </Button>
  <Button
    variant={billingMode === "BY_AMOUNT" ? "default" : "outline"}
    onClick={() => {
      setBillingMode("BY_AMOUNT");
      setQuantity("");
    }}
  >
    By Amount (₹)
  </Button>
</div>
```

#### Conditional Input Fields

**BY_QUANTITY Mode:**

- Shows quantity input (liters)
- Displays calculated amount
- Formula: Amount = Quantity × Rate

**BY_AMOUNT Mode:**

- Shows amount input (rupees)
- Displays calculated quantity
- Formula: Quantity = Amount ÷ Rate

```tsx
{billingMode === "BY_QUANTITY" ? (
  <>
    <Input id="quantity" ... />
    <div>Calculated Amount: ₹{(quantity * rate).toFixed(2)}</div>
  </>
) : (
  <>
    <Input id="requestedAmount" ... />
    <div>Calculated Quantity: {(requestedAmount / rate).toFixed(3)} L</div>
  </>
)}
```

#### Updated Validation

```typescript
if (billingMode === "BY_QUANTITY") {
  if (!quantity || parseFloat(quantity) <= 0) {
    setError("Please enter a valid quantity");
    return;
  }
} else {
  if (!requestedAmount || parseFloat(requestedAmount) <= 0) {
    setError("Please enter a valid amount");
    return;
  }
}
```

---

## Usage Examples

### Example 1: Customer Requests 30 Liters

**Input:**

- Billing Mode: BY_QUANTITY
- Quantity: 30.000 L
- Rate: ₹96.50/L

**System Calculates:**

- Amount = 30.000 × 96.50 = ₹2,895.00

**Stored in DB:**

- `billing_mode`: BY_QUANTITY
- `quantity`: 30.000
- `rate`: 96.50
- `amount`: 2895.00
- `net_amount`: 2895.00

### Example 2: Customer Requests ₹2000 Worth

**Input:**

- Billing Mode: BY_AMOUNT
- Requested Amount: ₹2000.00
- Rate: ₹96.50/L

**System Calculates:**

- Quantity = 2000.00 ÷ 96.50 = 20.725 L

**Stored in DB:**

- `billing_mode`: BY_AMOUNT
- `quantity`: 20.725
- `rate`: 96.50
- `amount`: 2000.00
- `net_amount`: 2000.00

---

## Key Benefits

1. **Accuracy**: Eliminates manual calculation errors
2. **Flexibility**: Supports both common customer request patterns
3. **Audit Trail**: `billing_mode` field preserves how the bill was created
4. **Precision**: 3 decimal places for quantity ensures accurate calculations
5. **User Experience**: Intuitive toggle interface, real-time calculation preview

---

## Testing Checklist

### Backend Tests

- [ ] Create bill with BY_QUANTITY mode
- [ ] Create bill with BY_AMOUNT mode
- [ ] Validate quantity must be provided for BY_QUANTITY
- [ ] Validate requestedAmount must be provided for BY_AMOUNT
- [ ] Verify calculations are accurate (quantity × rate = amount)
- [ ] Verify calculations are accurate (amount ÷ rate = quantity)
- [ ] Test with edge cases (very small/large numbers)
- [ ] Test rounding behavior (HALF_UP)

### Frontend Tests

- [ ] Toggle between billing modes works
- [ ] Quantity input appears only in BY_QUANTITY mode
- [ ] Amount input appears only in BY_AMOUNT mode
- [ ] Real-time calculation displays correctly
- [ ] Form validation works for both modes
- [ ] Bill submission includes correct billingMode
- [ ] Error messages are clear and helpful
- [ ] Previous input clears when switching modes

### Database Tests

- [ ] Migration runs successfully
- [ ] Existing records set to BY_QUANTITY
- [ ] CHECK constraint enforces valid values
- [ ] Quantity precision updated to 3 decimal places

---

## Migration Instructions

### 1. Backend Database Migration

```bash
# Run the migration script
mysql -u your_user -p your_database < backend/add_billing_mode_column.sql
```

### 2. Backend Deployment

- Deploy updated backend with new BillingMode enum and service logic
- Restart backend services

### 3. Frontend Deployment

- Build and deploy frontend with updated UI
- Clear browser cache if needed

### 4. Verification

- Create a test bill in BY_QUANTITY mode
- Create a test bill in BY_AMOUNT mode
- Verify calculations and data storage

---

## Notes

- **Default Mode**: BY_QUANTITY (most common scenario)
- **Precision**: Quantity stored with 3 decimal places, amount with 2
- **Rounding**: Uses HALF_UP rounding mode
- **Backward Compatibility**: Existing bills automatically set to BY_QUANTITY mode
- **UI/UX**: Toggle buttons provide clear visual indication of active mode

---

## Future Enhancements

1. Add billing mode to reports and analytics
2. Track which mode is used more frequently
3. Support editing billing mode in bill updates
4. Add keyboard shortcuts for mode switching
5. Remember user's last selected mode preference
