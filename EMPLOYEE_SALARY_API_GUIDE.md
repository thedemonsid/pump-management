# Employee Salary Management API Documentation

## Overview

This document provides a comprehensive guide for frontend developers to integrate with the Employee Salary Management backend APIs. The system allows managing employee salaries, configurations, calculations, and payments in a multi-tenant environment.

## Table of Contents

1. [Authentication & Multi-tenancy](#authentication--multi-tenancy)
2. [API Endpoints Overview](#api-endpoints-overview)
3. [Data Flow](#data-flow)
4. [API Endpoints](#api-endpoints)
   - [Employee Salary Configuration](#employee-salary-configuration)
   - [Calculated Salary](#calculated-salary)
   - [Employee Salary Payment](#employee-salary-payment)
5. [Common Request/Response Models](#common-requestresponse-models)
6. [Usage Examples](#usage-examples)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)

---

## Authentication & Multi-tenancy

### Important Notes

- All API requests require authentication
- The `pumpMasterId` is automatically extracted from the authenticated user's context
- All data is filtered by `pumpMasterId` to ensure multi-tenant data isolation
- Base URL: `/api/v1/`

---

## API Endpoints Overview

### Employee Salary Configuration

**Base Path:** `/api/v1/employee-salary-configs`

Manages salary configurations for employees (daily/weekly/monthly rates).

### Calculated Salary

**Base Path:** `/api/v1/calculated-salaries`

Manages calculated salary records for specific date ranges.

### Employee Salary Payment

**Base Path:** `/api/v1/employee-salary-payments`

Manages salary payments made to employees.

---

## Data Flow

```
1. Create Salary Configuration for Employee
   ↓
2. Calculate Salary for a Date Range (based on attendance, overtime, etc.)
   ↓
3. Make Payments against Calculated Salary or as Advance Payment
```

### Key Concepts

- **Opening Balance**: Added to User entity - tracks initial balance (positive = company owes employee, negative = employee owes company)
- **Salary Configuration**: Defines how an employee's salary is calculated (DAILY/WEEKLY/MONTHLY)
- **Calculated Salary**: Actual salary calculated for a specific period with attendance details
- **Salary Payment**: Payments made to employees (can be linked to calculated salary or as advance)

---

## API Endpoints

### Employee Salary Configuration

#### 1. Get All Salary Configurations

```http
GET /api/v1/employee-salary-configs
```

**Response:**

```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "username": "john_doe",
    "pumpMasterId": "uuid",
    "salaryType": "MONTHLY",
    "basicSalaryAmount": 30000.0,
    "effectiveFrom": "2025-01-01",
    "effectiveTo": null,
    "isActive": true,
    "halfDayRate": 0.5,
    "overtimeRate": 1.5,
    "notes": "Monthly salary configuration",
    "createdAt": "2025-01-01T10:00:00",
    "updatedAt": "2025-01-01T10:00:00"
  }
]
```

#### 2. Get Salary Configuration by ID

```http
GET /api/v1/employee-salary-configs/{id}
```

#### 3. Get Salary Configurations by User ID

```http
GET /api/v1/employee-salary-configs/user/{userId}
```

Returns all salary configurations (active and inactive) for a specific user.

#### 4. Get Active Salary Configuration for User

```http
GET /api/v1/employee-salary-configs/user/{userId}/active
```

Returns the currently active salary configuration for a user.

#### 5. Get Configurations by Status

```http
GET /api/v1/employee-salary-configs/status?isActive=true
```

**Query Parameters:**

- `isActive` (boolean): Filter by active/inactive status

#### 6. Create Salary Configuration

```http
POST /api/v1/employee-salary-configs
```

**Request Body:**

```json
{
  "userId": "uuid",
  "pumpMasterId": "uuid",
  "salaryType": "MONTHLY",
  "basicSalaryAmount": 30000.0,
  "effectiveFrom": "2025-01-01",
  "effectiveTo": null,
  "halfDayRate": 0.5,
  "overtimeRate": 1.5,
  "notes": "Monthly salary configuration"
}
```

**Salary Types:**

- `DAILY` - Salary calculated per day
- `WEEKLY` - Salary calculated per week
- `MONTHLY` - Salary calculated per month

**Validation Rules:**

- Only one active configuration allowed per user
- `basicSalaryAmount` must be > 0
- `halfDayRate` must be between 0.00 and 1.00
- `overtimeRate` must be >= 0.00

#### 7. Update Salary Configuration

```http
PUT /api/v1/employee-salary-configs/{id}
```

**Request Body:**

```json
{
  "salaryType": "MONTHLY",
  "basicSalaryAmount": 35000.0,
  "effectiveFrom": "2025-02-01",
  "effectiveTo": null,
  "isActive": true,
  "halfDayRate": 0.5,
  "overtimeRate": 1.5,
  "notes": "Updated salary"
}
```

#### 8. Deactivate Salary Configuration

```http
PUT /api/v1/employee-salary-configs/{id}/deactivate
```

Sets the configuration to inactive.

#### 9. Delete Salary Configuration

```http
DELETE /api/v1/employee-salary-configs/{id}
```

---

### Calculated Salary

#### 1. Get All Calculated Salaries

```http
GET /api/v1/calculated-salaries
```

**Response:**

```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "username": "john_doe",
    "pumpMasterId": "uuid",
    "salaryConfigId": "uuid",
    "fromDate": "2025-01-01",
    "toDate": "2025-01-31",
    "calculationDate": "2025-02-01",
    "totalDays": 31,
    "fullDayAbsences": 2,
    "halfDayAbsences": 1,
    "overtimeDays": 3,
    "workingDays": 28.5,
    "basicSalaryAmount": 30000.0,
    "overtimeAmount": 3000.0,
    "additionalPayment": 500.0,
    "additionalDeduction": 200.0,
    "grossSalary": 33000.0,
    "netSalary": 33300.0,
    "notes": "January 2025 salary",
    "createdAt": "2025-02-01T10:00:00",
    "updatedAt": "2025-02-01T10:00:00"
  }
]
```

#### 2. Get Calculated Salary by ID

```http
GET /api/v1/calculated-salaries/{id}
```

#### 3. Get Calculated Salaries by User ID

```http
GET /api/v1/calculated-salaries/user/{userId}
```

#### 4. Get Total Salary for User

```http
GET /api/v1/calculated-salaries/user/{userId}/total
```

Returns the total net salary calculated for the user (BigDecimal).

#### 5. Get Calculated Salaries by Date Range

```http
GET /api/v1/calculated-salaries/date-range?startDate=2025-01-01&endDate=2025-12-31
```

**Query Parameters:**

- `startDate` (ISO Date): Start date
- `endDate` (ISO Date): End date

#### 6. Get Calculated Salaries by Salary Config

```http
GET /api/v1/calculated-salaries/salary-config/{salaryConfigId}
```

#### 7. Create Calculated Salary

```http
POST /api/v1/calculated-salaries
```

**Request Body:**

```json
{
  "userId": "uuid",
  "pumpMasterId": "uuid",
  "salaryConfigId": "uuid",
  "fromDate": "2025-01-01",
  "toDate": "2025-01-31",
  "calculationDate": "2025-02-01",
  "totalDays": 31,
  "fullDayAbsences": 2,
  "halfDayAbsences": 1,
  "overtimeDays": 3,
  "workingDays": 28.5,
  "basicSalaryAmount": 30000.0,
  "overtimeAmount": 3000.0,
  "additionalPayment": 500.0,
  "additionalDeduction": 200.0,
  "grossSalary": 33000.0,
  "netSalary": 33300.0,
  "notes": "January 2025 salary"
}
```

**Calculation Logic:**

- `workingDays` = `totalDays` - `fullDayAbsences` - (`halfDayAbsences` × 0.5)
- `grossSalary` = `basicSalaryAmount` + `overtimeAmount`
- `netSalary` = `grossSalary` + `additionalPayment` - `additionalDeduction`

**Validation Rules:**

- `toDate` must be >= `fromDate`
- No overlapping salary periods for the same user
- All amounts must be >= 0
- `totalDays`, `fullDayAbsences`, `halfDayAbsences`, `overtimeDays` must be >= 0

#### 8. Update Calculated Salary

```http
PUT /api/v1/calculated-salaries/{id}
```

**Request Body:** Same as create, excluding `userId`, `pumpMasterId`, and `salaryConfigId`.

#### 9. Delete Calculated Salary

```http
DELETE /api/v1/calculated-salaries/{id}
```

---

### Employee Salary Payment

#### 1. Get All Salary Payments

```http
GET /api/v1/employee-salary-payments
```

**Response:**

```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "username": "john_doe",
    "pumpMasterId": "uuid",
    "calculatedSalaryId": "uuid",
    "bankAccountId": "uuid",
    "bankAccountNumber": "1234567890",
    "amount": 10000.0,
    "paymentDate": "2025-02-05T14:30:00",
    "paymentMethod": "BANK_TRANSFER",
    "referenceNumber": "PAY2025020501",
    "notes": "Partial salary payment",
    "createdAt": "2025-02-05T14:30:00",
    "updatedAt": "2025-02-05T14:30:00"
  }
]
```

#### 2. Get Salary Payment by ID

```http
GET /api/v1/employee-salary-payments/{id}
```

#### 3. Get Salary Payments by User ID

```http
GET /api/v1/employee-salary-payments/user/{userId}
```

#### 4. Get Total Paid for User

```http
GET /api/v1/employee-salary-payments/user/{userId}/total
```

Returns total amount paid to the user (BigDecimal).

#### 5. Get Payments by Calculated Salary

```http
GET /api/v1/employee-salary-payments/calculated-salary/{calculatedSalaryId}
```

#### 6. Get Total Paid for Calculated Salary

```http
GET /api/v1/employee-salary-payments/calculated-salary/{calculatedSalaryId}/total
```

#### 7. Get Advance Payments

```http
GET /api/v1/employee-salary-payments/advance
```

Returns payments not linked to any calculated salary (advance payments).

#### 8. Get Total Payments in Period

```http
GET /api/v1/employee-salary-payments/period?startDate=2025-01-01T00:00:00&endDate=2025-12-31T23:59:59
```

**Query Parameters:**

- `startDate` (ISO DateTime): Start date and time
- `endDate` (ISO DateTime): End date and time

#### 9. Create Salary Payment

```http
POST /api/v1/employee-salary-payments
```

**Request Body:**

```json
{
  "userId": "uuid",
  "pumpMasterId": "uuid",
  "calculatedSalaryId": "uuid",
  "bankAccountId": "uuid",
  "amount": 10000.0,
  "paymentDate": "2025-02-05T14:30:00",
  "paymentMethod": "BANK_TRANSFER",
  "referenceNumber": "PAY2025020501",
  "notes": "Partial salary payment"
}
```

**Payment Methods:**

- `CASH`
- `CHEQUE`
- `BANK_TRANSFER`
- `UPI`
- `CARD`

**Notes:**

- `calculatedSalaryId` is optional (null for advance payments)
- Creates a corresponding bank transaction automatically
- Bank transaction type will be DEBIT

**Validation Rules:**

- `amount` must be > 0
- User must belong to the specified pump master
- Bank account must belong to the specified pump master

#### 10. Update Salary Payment

```http
PUT /api/v1/employee-salary-payments/{id}
```

**Request Body:**

```json
{
  "calculatedSalaryId": "uuid",
  "bankAccountId": "uuid",
  "amount": 15000.0,
  "paymentDate": "2025-02-05T14:30:00",
  "paymentMethod": "BANK_TRANSFER",
  "referenceNumber": "PAY2025020501",
  "notes": "Updated payment amount"
}
```

#### 11. Delete Salary Payment

```http
DELETE /api/v1/employee-salary-payments/{id}
```

**Note:** Deleting a payment will also delete the associated bank transaction (cascade delete).

---

## Common Request/Response Models

### Salary Type Enum

```typescript
enum SalaryType {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
}
```

### Payment Method Enum

```typescript
enum PaymentMethod {
  CASH = "CASH",
  CHEQUE = "CHEQUE",
  BANK_TRANSFER = "BANK_TRANSFER",
  UPI = "UPI",
  CARD = "CARD",
}
```

---

## Usage Examples

### Example 1: Setup Employee Salary

```typescript
// Step 1: Create salary configuration for an employee
const createSalaryConfig = async (userId: string, pumpMasterId: string) => {
  const response = await fetch("/api/v1/employee-salary-configs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: userId,
      pumpMasterId: pumpMasterId,
      salaryType: "MONTHLY",
      basicSalaryAmount: 30000.0,
      effectiveFrom: "2025-01-01",
      effectiveTo: null,
      halfDayRate: 0.5,
      overtimeRate: 1.5,
      notes: "Monthly salary configuration",
    }),
  });
  return await response.json();
};
```

### Example 2: Calculate Monthly Salary

```typescript
// Step 2: Calculate salary for January 2025
const calculateSalary = async (userId: string, salaryConfigId: string) => {
  // Fetch attendance data (absences, overtime) from your attendance system
  const attendance = {
    totalDays: 31,
    fullDayAbsences: 2,
    halfDayAbsences: 1,
    overtimeDays: 3,
  };

  // Calculate working days
  const workingDays =
    attendance.totalDays -
    attendance.fullDayAbsences -
    attendance.halfDayAbsences * 0.5;

  // Calculate amounts (you'll need salary config data)
  const basicSalaryAmount = 30000.0; // From salary config
  const overtimeRate = 1.5; // From salary config
  const dailyRate = basicSalaryAmount / 30; // Assuming 30 days per month
  const overtimeAmount = dailyRate * overtimeRate * attendance.overtimeDays;
  const grossSalary = basicSalaryAmount + overtimeAmount;
  const netSalary = grossSalary + 500.0 - 200.0; // Additional payment - deduction

  const response = await fetch("/api/v1/calculated-salaries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: userId,
      pumpMasterId: pumpMasterId,
      salaryConfigId: salaryConfigId,
      fromDate: "2025-01-01",
      toDate: "2025-01-31",
      calculationDate: "2025-02-01",
      totalDays: attendance.totalDays,
      fullDayAbsences: attendance.fullDayAbsences,
      halfDayAbsences: attendance.halfDayAbsences,
      overtimeDays: attendance.overtimeDays,
      workingDays: workingDays,
      basicSalaryAmount: basicSalaryAmount,
      overtimeAmount: overtimeAmount,
      additionalPayment: 500.0,
      additionalDeduction: 200.0,
      grossSalary: grossSalary,
      netSalary: netSalary,
      notes: "January 2025 salary",
    }),
  });
  return await response.json();
};
```

### Example 3: Make Salary Payment

```typescript
// Step 3: Make a salary payment
const makeSalaryPayment = async (
  userId: string,
  calculatedSalaryId: string,
  bankAccountId: string
) => {
  const response = await fetch("/api/v1/employee-salary-payments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: userId,
      pumpMasterId: pumpMasterId,
      calculatedSalaryId: calculatedSalaryId, // null for advance payment
      bankAccountId: bankAccountId,
      amount: 10000.0,
      paymentDate: new Date().toISOString(),
      paymentMethod: "BANK_TRANSFER",
      referenceNumber: "PAY" + Date.now(),
      notes: "Partial salary payment",
    }),
  });
  return await response.json();
};
```

### Example 4: Calculate Employee Balance

```typescript
// Calculate total balance for an employee
const getEmployeeBalance = async (userId: string) => {
  // Get user's opening balance
  const userResponse = await fetch(`/api/v1/users/${userId}`);
  const user = await userResponse.json();
  const openingBalance = user.openingBalance;

  // Get total calculated salary
  const totalSalaryResponse = await fetch(
    `/api/v1/calculated-salaries/user/${userId}/total`
  );
  const totalSalary = await totalSalaryResponse.json();

  // Get total paid
  const totalPaidResponse = await fetch(
    `/api/v1/employee-salary-payments/user/${userId}/total`
  );
  const totalPaid = await totalPaidResponse.json();

  // Calculate net balance
  const netBalance = openingBalance + totalSalary - totalPaid;

  return {
    openingBalance,
    totalSalary,
    totalPaid,
    netBalance,
  };
};
```

---

## Error Handling

### Common Error Responses

```json
{
  "error": "SALARY_CONFIG_NOT_FOUND",
  "message": "Salary configuration with ID xxx not found",
  "timestamp": "2025-02-05T10:00:00"
}
```

### Error Codes

| Error Code                    | Description                                          |
| ----------------------------- | ---------------------------------------------------- |
| `SALARY_CONFIG_NOT_FOUND`     | Salary configuration not found                       |
| `CALCULATED_SALARY_NOT_FOUND` | Calculated salary not found                          |
| `SALARY_PAYMENT_NOT_FOUND`    | Salary payment not found                             |
| `ACTIVE_CONFIG_EXISTS`        | An active configuration already exists for this user |
| `INVALID_USER`                | User does not belong to the specified pump master    |
| `INVALID_PUMP_MASTER`         | Invalid pump master ID                               |
| `INVALID_DATE_RANGE`          | To date cannot be before from date                   |
| `OVERLAPPING_SALARY_PERIOD`   | A salary calculation already exists for this period  |
| `INVALID_BANK_ACCOUNT`        | Bank account does not belong to the pump master      |

---

## Best Practices

### 1. **Salary Configuration Management**

- Create only one active configuration per employee at a time
- When changing salary, deactivate the old config and create a new one
- Set `effectiveTo` date when deactivating configurations
- Use appropriate salary types (DAILY/WEEKLY/MONTHLY) based on employee type

### 2. **Salary Calculation**

- Validate attendance data before calculating salary
- Ensure no overlapping salary periods for the same employee
- Calculate `workingDays` accurately: `totalDays - fullDayAbsences - (halfDayAbsences × 0.5)`
- Always recalculate `grossSalary` and `netSalary` on frontend before submitting
- Use `calculationDate` to track when the salary was calculated

### 3. **Payment Management**

- Link payments to calculated salaries whenever possible
- Use advance payments (null `calculatedSalaryId`) only for actual advances
- Always provide unique `referenceNumber` (e.g., cheque number, transaction ID)
- Track payments by user to calculate outstanding balance
- Remember: Creating payment automatically creates a bank transaction (DEBIT type)

### 4. **Balance Calculation**

- Employee Balance = Opening Balance + Total Calculated Salary - Total Paid
- Positive balance means company owes employee
- Negative opening balance means employee owes company (e.g., loan)

### 5. **Multi-tenancy**

- Always pass `pumpMasterId` in requests
- Backend automatically filters data by `pumpMasterId`
- Don't try to access data from other pump masters

### 6. **Date Handling**

- Use ISO 8601 format for dates: `YYYY-MM-DD`
- Use ISO 8601 format for datetimes: `YYYY-MM-DDTHH:mm:ss`
- Backend returns timestamps in IST (Asia/Kolkata timezone)
- Be mindful of timezone conversions in your frontend

### 7. **Validation**

- Always validate forms on frontend before submission
- Check for required fields
- Validate numeric ranges (amounts > 0, rates between 0-1 for half day, etc.)
- Validate date ranges (to date >= from date)

---

## UI Implementation Suggestions

### 1. **Salary Configuration Page**

- List all employees with their active salary configurations
- Show salary type, amount, and effective dates
- Allow creating/editing/deactivating configurations
- Highlight employees without active configurations

### 2. **Salary Calculation Page**

- Select employee and date range
- Fetch attendance data (or allow manual entry)
- Calculate salary with live preview
- Show breakdown: basic salary, overtime, deductions, net salary
- Option to save calculation

### 3. **Payment Management Page**

- List pending salary payments (calculated but not paid)
- Show employee balance (opening + calculated - paid)
- Make payments with bank account selection
- Track payment history per employee
- Support advance payments

### 4. **Reports**

- Monthly salary summary by employee
- Payment history report
- Outstanding balance report
- Salary expense report

---

## Additional Resources

- User Management API (for fetching employee list): `/api/v1/users`
- Bank Account API (for payment bank accounts): `/api/v1/bank-accounts`
- User Absence API (for attendance data): `/api/v1/user-absences`

---

## Support

For any issues or questions regarding the API, please contact the backend development team.

**Last Updated:** November 19, 2025
