# Frontend Migration Guide

## Overview

This document outlines the changes required to align the frontend with the new backend architecture for shift and nozzle management.

## Completed Changes

### 1. Type Definitions ✅

#### Updated Files:

- `src/types/salesman-bill.ts`
- `src/types/salesman-bill-payment.ts`
- `src/types/expense.ts`
- `src/types/shift.ts`

#### Key Changes:

1. **SalesmanBill**:

   - `salesmanNozzleShiftId` → `salesmanShiftId` (links to SalesmanShift)
   - Added optional `nozzleId` field (for tracking which nozzle dispensed)
   - Added optional `nozzleName` field (for display purposes)

2. **SalesmanBillPayment**:

   - `salesmanNozzleShiftId` → `salesmanShiftId` (links to SalesmanShift)

3. **Expense**:

   - `salesmanNozzleShiftId` → `salesmanShiftId`
   - `ExpenseType`: `"NOZZLE_SHIFT"` → `"SHIFT"`

4. **Shift (ShiftMaster)**:
   - Added clarifying comments that this is for shift templates (Morning/Evening/Night)
   - Added `ShiftMaster` type alias

### 2. Service Layer ✅

#### Updated Files:

- `src/services/salesman-bill-service.ts`
- `src/services/salesman-bill-payment-service.ts`
- `src/services/expense-service.ts`

#### Key Changes:

1. Updated method parameter names from `salesmanNozzleShiftId` to `salesmanShiftId`
2. Updated URL paths where applicable
3. Updated method names in ExpenseService:
   - `getBySalesmanNozzleShiftId()` → `getBySalesmanShiftId()`

### 3. New Services ✅

#### Already Implemented:

- `src/services/salesman-shift-service.ts` - Main shift management
- `src/services/nozzle-assignment-service.ts` - Nozzle assignments within shifts

These services are already aligned with the new architecture and follow the patterns from the backend refactoring document.

---

## Pending Changes (TODO)

### 1. Store Updates Required

#### Files to Update:

**`src/store/salesman-bill-store.ts`**

- Update state/methods referencing `salesmanNozzleShiftId` → `salesmanShiftId`

**`src/store/salesman-bill-payment-store.ts`**

- Update all references: `salesmanNozzleShiftId` → `salesmanShiftId`
- Update method names:
  - `fetchPaymentsByShiftId(salesmanNozzleShiftId)` → `fetchPaymentsByShiftId(salesmanShiftId)`
  - `getTotalByShiftId(salesmanNozzleShiftId)` → `getTotalByShiftId(salesmanShiftId)`

**`src/store/expense-store.ts`**

- Update method: `fetchExpensesBySalesmanNozzleShiftId()` → `fetchExpensesBySalesmanShiftId()`
- Update calls to `ExpenseService.getBySalesmanNozzleShiftId()` → `getBySalesmanShiftId()`
- Update state field references

**`src/store/salesman-nozzle-shift-store.ts`**

- This store may need to be **deprecated** or **refactored** to work with the new `SalesmanShiftService` and `NozzleAssignmentService`
- Consider creating a new `salesman-shift-store.ts` for the new architecture

### 2. Component Updates Required

The following components use the old architecture and need updates:

#### **Pages using SalesmanNozzleShift:**

1. **`src/pages/nozzles/NozzleDetailPage.tsx`**

   - Imports: `SalesmanNozzleShiftService`
   - Replace with: `NozzleAssignmentService`
   - Update to work with nozzle assignments across shifts

2. **`src/pages/salesman/SalesmanBillsPage.tsx`**

   - Uses: `useSalesmanNozzleShiftStore`, `SalesmanNozzleShiftResponse`
   - Field: `salesmanNozzleShiftId: selectedShiftForBill.id`
   - Updates needed:
     - Import `useSalesmanShiftStore` (new)
     - Use `ShiftResponse` type instead of `SalesmanNozzleShiftResponse`
     - Update bill creation to use `salesmanShiftId`
     - Optionally add `nozzleId` field if tracking which nozzle dispensed

3. **`src/pages/salesman/SalesmanPaymentsPage.tsx`**

   - Uses: `useSalesmanNozzleShiftStore`, `SalesmanNozzleShiftResponse`
   - Updates needed:
     - Import `useSalesmanShiftStore` (new)
     - Use `ShiftResponse` type
     - Update payment creation to use `salesmanShiftId`

4. **`src/pages/salesman-bill-payments/SalesmanBillPaymentsPage.tsx`**
   - Uses: `useSalesmanNozzleShiftStore`
   - Updates needed:
     - Import `useSalesmanShiftStore` (new)
     - Update shift selection logic

### 3. New Components to Create

Consider creating new components for the improved architecture:

1. **`src/pages/salesman-shifts/SalesmanShiftsPage.tsx`**

   - List all salesman shifts (OPEN and CLOSED)
   - Filter by date range, salesman, status
   - Actions: View details, Close shift, Create accounting

2. **`src/pages/salesman-shifts/ShiftDetailsPage.tsx`**

   - Show shift header (salesman, times, status)
   - List all nozzle assignments for the shift
   - Show bills created during shift
   - Show payments received during shift
   - Action to close/open nozzles
   - Link to accounting

3. **`src/pages/salesman-shifts/NozzleAssignmentForm.tsx`**

   - Add nozzle to shift
   - Close nozzle assignment
   - Validate opening/closing balances

4. **`src/pages/salesman-shifts/ShiftAccountingPage.tsx`**
   - Create/view accounting for closed shifts
   - Show calculations (fuel sales, cash, credit, etc.)
   - Cash denomination entry
   - UPI/Card amounts

### 4. Backend API Alignment

Ensure the following backend endpoints are implemented and frontend services match:

#### SalesmanShift Endpoints:

```
✅ POST   /api/v1/salesman-shifts              - Start shift
✅ GET    /api/v1/salesman-shifts              - Get all shifts (with filters)
✅ GET    /api/v1/salesman-shifts/{id}         - Get shift details
✅ PUT    /api/v1/salesman-shifts/{id}/close   - Close shift
✅ GET    /api/v1/salesman-shifts/open         - Get open shifts
```

#### NozzleAssignment Endpoints:

```
✅ POST   /api/v1/salesman-shifts/{shiftId}/nozzles                 - Add nozzle to shift
✅ GET    /api/v1/salesman-shifts/{shiftId}/nozzles                 - Get all nozzles for shift
✅ PUT    /api/v1/salesman-shifts/{shiftId}/nozzles/{id}/close      - Close nozzle
✅ GET    /api/v1/salesman-shifts/nozzle/{nozzleId}                 - Get assignments by nozzle
```

#### Accounting Endpoints:

```
✅ POST   /api/v1/salesman-shifts/{shiftId}/accounting    - Create accounting
✅ GET    /api/v1/salesman-shifts/{shiftId}/accounting    - Get accounting
✅ PUT    /api/v1/salesman-shifts/{shiftId}/accounting    - Update accounting
```

#### Updated Bill/Payment Endpoints:

```
⚠️ GET    /api/v1/salesman-bills/shift/{salesmanShiftId}              - Get bills by shift
⚠️ GET    /api/v1/salesman-bill-payments/shift/{salesmanShiftId}      - Get payments by shift
⚠️ GET    /api/v1/salesman-bill-payments/shift/{salesmanShiftId}/total - Get total by shift
```

**Note**: Verify backend has updated these endpoints to use `salesmanShiftId` instead of `salesmanNozzleShiftId`

---

## Migration Strategy

### Phase 1: Core Services & Types (✅ COMPLETED)

- Updated type definitions
- Updated existing services with new field names
- New services (SalesmanShiftService, NozzleAssignmentService) already in place

### Phase 2: Stores (🔄 IN PROGRESS)

- Update existing stores to use new field names
- Create new `salesman-shift-store.ts`
- Deprecate or refactor `salesman-nozzle-shift-store.ts`

### Phase 3: Components (📋 TODO)

- Update existing pages to use new stores and services
- Fix all references to `salesmanNozzleShiftId`
- Add `nozzleId` where appropriate in bill creation

### Phase 4: New UI (📋 TODO)

- Create new shift management pages
- Create accounting interface
- Improve UX based on new workflow

### Phase 5: Testing & Cleanup (📋 TODO)

- Test all workflows end-to-end
- Remove deprecated code
- Update documentation

---

## Field Mapping Reference

| Old Field Name             | New Field Name      | Context                                    |
| -------------------------- | ------------------- | ------------------------------------------ |
| `salesmanNozzleShiftId`    | `salesmanShiftId`   | SalesmanBill, SalesmanBillPayment, Expense |
| `SalesmanNozzleShift`      | `SalesmanShift`     | Entity/Type name                           |
| `NozzleShift`              | `NozzleAssignment`  | Nozzle assignments within shift            |
| `ExpenseType.NOZZLE_SHIFT` | `ExpenseType.SHIFT` | Expense type enum                          |

---

## Breaking Changes Checklist

Before deploying to production, ensure:

- [ ] Backend endpoints updated to use `salesmanShiftId`
- [ ] Frontend types updated (✅ Done)
- [ ] Frontend services updated (✅ Done)
- [ ] Frontend stores updated
- [ ] Frontend components updated
- [ ] Database migration completed
- [ ] All tests passing
- [ ] Documentation updated
- [ ] User training materials updated (if applicable)

---

## Example Code Changes

### Before (Old Architecture):

```typescript
// Creating a bill
const bill: CreateSalesmanBillRequest = {
  salesmanNozzleShiftId: shift.id,
  customerId: customer.id,
  productId: product.id,
  // ... other fields
};
```

### After (New Architecture):

```typescript
// Creating a bill
const bill: CreateSalesmanBillRequest = {
  salesmanShiftId: shift.id, // Changed field name
  nozzleId: nozzleAssignment.nozzleId, // Optional: track which nozzle
  customerId: customer.id,
  productId: product.id,
  // ... other fields
};
```

### Before (Store):

```typescript
fetchPaymentsByShiftId: async (salesmanNozzleShiftId: string) => {
  const payments = await SalesmanBillPaymentService.getByShiftId(
    salesmanNozzleShiftId
  );
  set({ shiftPayments: payments });
};
```

### After (Store):

```typescript
fetchPaymentsByShiftId: async (salesmanShiftId: string) => {
  const payments = await SalesmanBillPaymentService.getByShiftId(
    salesmanShiftId
  );
  set({ shiftPayments: payments });
};
```

---

## Questions to Resolve

1. **Backwards Compatibility**: Do we need to support old data structure during migration?
2. **Data Migration**: Is there a script to migrate existing `salesman_nozzle_shift` data to new structure?
3. **NozzleId in Bills**: Should we make `nozzleId` required or optional in bill creation?
4. **Deprecated Services**: When can we remove `SalesmanNozzleShiftService`?
5. **API Versioning**: Should we version the API endpoints during migration?

---

## Next Steps

1. **Immediate**: Update stores to use new field names
2. **Short-term**: Update components to use new stores/services
3. **Medium-term**: Build new shift management UI
4. **Long-term**: Deprecate old code and clean up

---

## Resources

- Backend Refactoring Doc: `/SHIFT_NOZZLE_REFACTORING.md`
- Type Definitions: `/frontend/src/types/`
- Services: `/frontend/src/services/`
- Current Stores: `/frontend/src/store/`
