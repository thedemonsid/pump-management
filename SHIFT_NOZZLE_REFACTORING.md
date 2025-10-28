# Shift and Nozzle Management Refactoring

## Overview

This document summarizes the comprehensive refactoring of the shift and nozzle management system to align with industry standards and proper business logic.

## Problem Statement

The original implementation had a fundamental flaw:

- **SalesmanNozzleShift**: Represented a salesman assigned to a single nozzle
- **Accounting**: Was done per nozzle (incorrect)
- **Bills and Payments**: Were tied to individual nozzle shifts

This didn't match how fuel stations operate in reality.

## New Architecture

### 1. Entity Changes

#### **SalesmanShift** (NEW - Main Entity)

Represents a salesman's actual work period.

**Key Fields:**

- `salesman_id`: The salesman working this shift
- `pump_master_id`: The pump station
- `start_datetime`: When shift began
- `end_datetime`: When shift ended (null if open)
- `opening_cash`: Cash given to salesman at start
- `status`: OPEN or CLOSED
- `is_accounting_done`: Whether accounting has been completed

**Relationships:**

- One-to-Many with `NozzleAssignment`
- One-to-Many with `SalesmanBill` (credit bills)
- One-to-Many with `SalesmanBillPayment`
- One-to-One with `SalesmanShiftAccounting`

**Security:**

- Location: `/backend/src/main/java/com/reallink/pump/entities/SalesmanShift.java`

---

#### **NozzleAssignment** (Replaces SalesmanNozzleShift)

Represents a nozzle being managed by a salesman during their shift.

**Key Fields:**

- `salesman_shift_id`: FK to SalesmanShift
- `nozzle_id`: Which nozzle
- `salesman_id`: Who managed it (denormalized for convenience)
- `start_time`: When nozzle was added to shift
- `end_time`: When nozzle was closed (null if open)
- `opening_balance`: Meter reading when assigned
- `closing_balance`: Meter reading when closed
- `status`: OPEN or CLOSED
- `dispensed_amount`: Cached calculation (closing - opening)
- `total_amount`: Cached calculation (dispensed × product price)

**Business Rules:**

1. A nozzle can only have ONE open assignment at a time
2. Once closed, a nozzle can be assigned to another shift
3. Closing balance must be >= opening balance
4. When closed, creates a TankTransaction (REMOVAL type)

**Location**: `/backend/src/main/java/com/reallink/pump/entities/NozzleAssignment.java`

---

#### **ShiftMaster** (Renamed from Shift)

Represents shift templates (Morning, Evening, Night).

**Purpose:** Configuration/master data, not actual shifts.

**Location**: `/backend/src/main/java/com/reallink/pump/entities/ShiftMaster.java`

---

#### **SalesmanBill** (UPDATED)

Now references `SalesmanShift` instead of `SalesmanNozzleShift`.

**Changes:**

- `salesman_shift_id`: FK to SalesmanShift (was salesman_nozzle_shift_id)
- `nozzle_id`: Optional FK for tracking which nozzle dispensed (for reporting)

**Location**: `/backend/src/main/java/com/reallink/pump/entities/SalesmanBill.java`

---

#### **SalesmanBillPayment** (UPDATED)

Now references `SalesmanShift`.

**Changes:**

- `salesman_shift_id`: FK to SalesmanShift (was salesman_nozzle_shift_id)

**Location**: `/backend/src/main/java/com/reallink/pump/entities/SalesmanBillPayment.java`

---

#### **SalesmanShiftAccounting** (UPDATED)

Now references `SalesmanShift`.

**Changes:**

- `salesman_shift_id`: FK to SalesmanShift (was salesman_nozzle_shift_id)
- Accounting is now done at **SHIFT level**, aggregating all nozzle activities

**Location**: `/backend/src/main/java/com/reallink/pump/entities/SalesmanShiftAccounting.java`

---

### 2. Repository Layer

#### **New Repositories:**

1. **SalesmanShiftRepository**

   - `findBySalesmanIdAndStatusAndPumpMasterId()`: Check for open shifts
   - `existsBySalesmanIdAndStatusAndPumpMasterId()`: Quick existence check
   - `findByPumpMasterIdAndDateRange()`: For reports
   - `findOpenShiftsByPumpMasterId()`: All open shifts (manager view)
   - `findShiftsNeedingAccounting()`: Closed but not accounted

2. **NozzleAssignmentRepository**
   - `findBySalesmanShiftIdOrderByStartTimeDesc()`: All nozzles for a shift
   - `findOpenAssignmentForNozzle()`: Check if nozzle is in use
   - `isNozzleCurrentlyAssigned()`: Quick boolean check
   - `findOpenAssignmentsByShiftId()`: Open nozzles in a shift
   - `countOpenAssignmentsByShiftId()`: Count for validation

#### **Updated Repositories:**

1. **ShiftRepository** → Now for `ShiftMaster` (templates)
2. **SalesmanBillRepository** → Updated queries to use `salesmanShift`
3. **SalesmanBillPaymentRepository** → Updated queries to use `salesmanShift`
4. **SalesmanShiftAccountingRepository** → Updated to use `salesmanShiftId`

---

### 3. Security Implementation

#### **SecurityHelper** (NEW)

Location: `/backend/src/main/java/com/reallink/pump/security/SecurityHelper.java`

**Role-Based Access Control:**

| Role         | Access Rights                               |
| ------------ | ------------------------------------------- |
| **ADMIN**    | Can access and modify all shifts and data   |
| **MANAGER**  | Can access and modify all shifts            |
| **SALESMAN** | Can only access and modify their OWN shifts |

**Key Methods:**

- `getCurrentUser()`: Get authenticated user
- `getCurrentPumpMasterId()`: Get pump master from security context
- `canAccessSalesmanData(salesmanId)`: Check if user can access salesman's data
- `verifyAccessToSalesmanData(salesmanId)`: Throws exception if no access
- `canModifyShift(salesmanId, isOpen)`: Check modification rights
- `verifyCanModifyShift()`: Throws exception if cannot modify

**Security Rules:**

1. Salesmen can only start/manage their own shifts
2. Salesmen cannot access other salesmen's data
3. Managers and Admins have full access
4. Salesmen can only modify OPEN shifts (not closed ones)

---

### 4. Service Layer

#### **SalesmanShiftService** (NEW)

Location: `/backend/src/main/java/com/reallink/pump/services/SalesmanShiftService.java`

**Core Operations:**

##### 1. Start Shift

```java
@PreAuthorize("hasAnyRole('SALESMAN', 'MANAGER', 'ADMIN')")
public SalesmanShift startShift(UUID salesmanId, BigDecimal openingCash)
```

**Validations:**

- Salesman exists
- No existing open shift for this salesman
- Salesman can only start their own shift (unless ADMIN/MANAGER)

**Actions:**

- Creates `SalesmanShift` with status OPEN
- Records opening cash
- Sets start datetime

---

##### 2. Add Nozzle to Shift

```java
@PreAuthorize("hasAnyRole('SALESMAN', 'MANAGER', 'ADMIN')")
public NozzleAssignment addNozzleToShift(UUID shiftId, UUID nozzleId, BigDecimal openingBalance)
```

**Validations:**

- Shift exists and is OPEN
- User has access to this shift
- Nozzle exists and is not currently assigned
- Opening balance validation (warns if differs from nozzle current reading)

**Actions:**

- Creates `NozzleAssignment` with status OPEN
- Records opening balance and start time
- Links to shift

---

##### 3. Close Nozzle Assignment

```java
@PreAuthorize("hasAnyRole('SALESMAN', 'MANAGER', 'ADMIN')")
public NozzleAssignment closeNozzleAssignment(UUID assignmentId, BigDecimal closingBalance)
```

**Validations:**

- Assignment exists and is OPEN
- User has access
- Closing balance >= opening balance

**Actions:**

- Sets closing balance and end time
- Calculates dispensed amount
- Updates nozzle's current reading
- Creates `TankTransaction` (REMOVAL type)
- Changes status to CLOSED

---

##### 4. Close Shift

```java
@PreAuthorize("hasAnyRole('SALESMAN', 'MANAGER', 'ADMIN')")
public SalesmanShift closeShift(UUID shiftId)
```

**Validations:**

- Shift exists and is OPEN
- User can modify this shift
- ALL nozzles are closed (no open assignments)

**Actions:**

- Sets end datetime
- Changes status to CLOSED
- Shift is now ready for accounting

---

##### 5. Query Operations

- `getShiftById()`: Get shift with security check
- `getAllShifts()`: Salesmen see their own, others see all
- `getOpenShiftForSalesman()`: Get salesman's current shift
- `getNozzleAssignmentsForShift()`: All nozzles for a shift
- `getAllOpenShifts()`: Manager/Admin only

---

## Workflow Example

### Typical Salesman's Day:

**8:00 AM - Start Shift**

```
POST /api/v1/salesman-shifts
{
  "salesmanId": "uuid-salesman-1",
  "openingCash": 5000.00
}
→ Creates SalesmanShift (ID: shift-1, status: OPEN)
```

**8:05 AM - Add First Nozzle**

```
POST /api/v1/salesman-shifts/shift-1/nozzles
{
  "nozzleId": "uuid-nozzle-1",
  "openingBalance": 12345.678
}
→ Creates NozzleAssignment (status: OPEN)
```

**8:10 AM - Add Second Nozzle**

```
POST /api/v1/salesman-shifts/shift-1/nozzles
{
  "nozzleId": "uuid-nozzle-2",
  "openingBalance": 98765.432
}
→ Creates another NozzleAssignment
```

**Throughout Day - Create Credit Bills**

```
POST /api/v1/salesman-bills
{
  "salesmanShiftId": "shift-1",
  "nozzleId": "uuid-nozzle-1",
  "customerId": "uuid-customer-1",
  "quantity": 50,
  ...
}
→ Bill is linked to SHIFT, not individual nozzle assignment
```

**Throughout Day - Receive Payments**

```
POST /api/v1/salesman-bill-payments
{
  "salesmanShiftId": "shift-1",
  "customerId": "uuid-customer-2",
  "amount": 1000
}
→ Payment is linked to SHIFT
```

**12:00 PM - Close First Nozzle (lunch break)**

```
PUT /api/v1/salesman-shifts/shift-1/nozzles/assignment-1/close
{
  "closingBalance": 12567.890
}
→ NozzleAssignment status: CLOSED
→ Dispensed: 222.212 liters
→ TankTransaction created (REMOVAL)
```

**12:00 PM - Another Salesman Takes Nozzle 1**

```
POST /api/v1/salesman-shifts/shift-2/nozzles
{
  "nozzleId": "uuid-nozzle-1",
  "openingBalance": 12567.890  // Must match previous closing
}
→ New assignment for nozzle-1 in shift-2
```

**4:00 PM - Close Second Nozzle**

```
PUT /api/v1/salesman-shifts/shift-1/nozzles/assignment-2/close
{
  "closingBalance": 99123.456
}
```

**4:00 PM - Close Shift**

```
PUT /api/v1/salesman-shifts/shift-1/close
→ Validates all nozzles are closed
→ Shift status: CLOSED
→ Ready for accounting
```

**End of Day - Manager Creates Accounting**

```
POST /api/v1/salesman-shifts/shift-1/accounting
{
  "upiReceived": 5000,
  "cardReceived": 3000,
  "cashInHand": 12000,
  "notes500": 10,
  "notes200": 5,
  ...
}
→ System calculates:
  - Total fuel sales (from all nozzle assignments)
  - Credit given (from bills)
  - Payments received (from payments)
  - Expected cash vs actual cash
→ isAccountingDone = true
```

---

## Benefits of New Architecture

### 1. Industry Standard

Matches how real fuel stations operate

### 2. Flexibility

- Salesman can manage multiple nozzles simultaneously
- Nozzles can be transferred between shifts
- Proper separation of concerns

### 3. Proper Accounting

- One accounting record per shift (not per nozzle)
- Aggregates all activities during the shift
- Easier reconciliation

### 4. Better Security

- Role-based access control
- Salesmen isolated from each other
- Managers can oversee everything

### 5. Accurate Tracking

- Full history of nozzle assignments
- Proper tank transactions
- Clear audit trail

### 6. Data Integrity

- Prevents double-assignment of nozzles
- Validates opening/closing balances
- Enforces business rules

---

## Migration Notes

### Database Changes Required:

1. Create `pump_salesman_shift` table
2. Create `pump_nozzle_assignment` table
3. Rename `pump_shift_master` references (already correct table name)
4. Update FKs in:
   - `pump_salesman_bill_master` (salesman_nozzle_shift_id → salesman_shift_id, add nozzle_id)
   - `pump_salesman_bill_payment_master` (salesman_nozzle_shift_id → salesman_shift_id)
   - `pump_salesman_shift_accounting` (salesman_nozzle_shift_id → salesman_shift_id)

### Data Migration:

Since you mentioned recreating the DB, no data migration needed. Fresh start with correct schema.

---

## Next Steps

### Backend (Completed):

✅ Entity refactoring  
✅ Repository layer  
✅ Security helper  
✅ Core service (SalesmanShiftService)

### Still TODO (Backend):

- [ ] Create SalesmanShiftAccountingService
- [ ] Create DTOs (Request/Response objects)
- [ ] Create Controllers (REST API endpoints)
- [ ] Update existing services that reference old entities
- [ ] Integration tests

### Frontend:

- [ ] Update shift management UI
- [ ] Nozzle assignment interface
- [ ] Accounting screens
- [ ] Update reports to work with new structure

---

## API Endpoints to Create

### Shift Management

```
POST   /api/v1/salesman-shifts              - Start shift
GET    /api/v1/salesman-shifts              - List shifts (filtered by role)
GET    /api/v1/salesman-shifts/{id}         - Get shift details
PUT    /api/v1/salesman-shifts/{id}/close   - Close shift
DELETE /api/v1/salesman-shifts/{id}         - Delete shift (ADMIN only)
```

### Nozzle Management

```
POST   /api/v1/salesman-shifts/{id}/nozzles                      - Add nozzle to shift
PUT    /api/v1/salesman-shifts/{id}/nozzles/{assignmentId}/close - Close nozzle
GET    /api/v1/salesman-shifts/{id}/nozzles                      - List nozzles for shift
```

### Accounting

```
POST   /api/v1/salesman-shifts/{id}/accounting - Create accounting
GET    /api/v1/salesman-shifts/{id}/accounting - Get accounting
PUT    /api/v1/salesman-shifts/{id}/accounting - Update accounting
```

### Reports

```
GET    /api/v1/reports/shifts                 - Shift reports
GET    /api/v1/reports/nozzles                - Nozzle usage reports
GET    /api/v1/reports/salesman-performance   - Salesman performance
```

---

## Files Created/Modified

### New Files:

1. `/backend/src/main/java/com/reallink/pump/entities/SalesmanShift.java`
2. `/backend/src/main/java/com/reallink/pump/entities/NozzleAssignment.java`
3. `/backend/src/main/java/com/reallink/pump/repositories/SalesmanShiftRepository.java`
4. `/backend/src/main/java/com/reallink/pump/repositories/NozzleAssignmentRepository.java`
5. `/backend/src/main/java/com/reallink/pump/security/SecurityHelper.java`
6. `/backend/src/main/java/com/reallink/pump/services/SalesmanShiftService.java`

### Modified Files:

1. `/backend/src/main/java/com/reallink/pump/entities/ShiftMaster.java` (renamed from Shift)
2. `/backend/src/main/java/com/reallink/pump/entities/SalesmanBill.java`
3. `/backend/src/main/java/com/reallink/pump/entities/SalesmanBillPayment.java`
4. `/backend/src/main/java/com/reallink/pump/entities/SalesmanShiftAccounting.java`
5. `/backend/src/main/java/com/reallink/pump/repositories/ShiftRepository.java`
6. `/backend/src/main/java/com/reallink/pump/repositories/SalesmanBillRepository.java`
7. `/backend/src/main/java/com/reallink/pump/repositories/SalesmanBillPaymentRepository.java`
8. `/backend/src/main/java/com/reallink/pump/repositories/SalesmanShiftAccountingRepository.java`

---

## Summary

This refactoring transforms the shift management system from a nozzle-centric approach to a proper shift-centric model that:

- Matches industry standards
- Provides proper role-based security
- Enables correct accounting at the shift level
- Allows flexible nozzle management
- Maintains data integrity and audit trails

The implementation uses Spring Boot best practices including:

- `@PreAuthorize` for method-level security
- Transactional boundaries
- Proper validation
- Comprehensive logging
- Clean separation of concerns
