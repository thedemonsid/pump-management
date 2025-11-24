# Calculated Salaries Frontend Documentation

## Overview

This document describes the frontend implementation for the Calculated Salaries feature in the Pump Management System.

## Files Created

### 1. **CalculatedSalariesPage.tsx**

- **Location**: `/frontend/src/pages/calculated-salaries/CalculatedSalariesPage.tsx`
- **Purpose**: Main page component for managing calculated salaries
- **Features**:
  - Display all calculated salaries in a table
  - Filter by user ID and date range
  - View detailed salary breakdown
  - Create new salary calculations
  - Edit existing salary calculations
  - Delete salary records
  - Role-based access control (ADMIN and MANAGER only)

### 2. **CreateCalculatedSalaryForm.tsx**

- **Location**: `/frontend/src/pages/calculated-salaries/CreateCalculatedSalaryForm.tsx`
- **Purpose**: Form component for creating new salary calculations
- **Features**:
  - User and salary config selection
  - Date range selection (from/to dates)
  - Automatic total days calculation
  - Attendance tracking (full day absences, half day absences, overtime)
  - Automatic working days calculation
  - Salary components (basic, overtime, additional payments/deductions)
  - Automatic gross and net salary calculation
  - Notes field for additional information
  - Form validation using Zod schema

### 3. **UpdateCalculatedSalaryForm.tsx**

- **Location**: `/frontend/src/pages/calculated-salaries/UpdateCalculatedSalaryForm.tsx`
- **Purpose**: Form component for updating existing salary calculations
- **Features**:
  - Pre-filled form with existing salary data
  - All features from CreateForm
  - Automatic recalculation on value changes

### 4. **index.ts**

- **Location**: `/frontend/src/pages/calculated-salaries/index.ts`
- **Purpose**: Barrel export file for clean imports

## Key Features

### 🔢 Automatic Calculations

- **Total Days**: Automatically calculated from date range
- **Working Days**: Calculated as: `totalDays - fullDayAbsences - (halfDayAbsences * 0.5) + overtimeDays`
- **Gross Salary**: Calculated as: `basicSalary + overtimeAmount + additionalPayment`
- **Net Salary**: Calculated as: `grossSalary - additionalDeduction`

### 🔍 Filtering

- Filter by User ID
- Filter by Date Range (from/to dates)
- Combined filters support
- Clear filters button

### 📊 Detailed View

The detailed view dialog shows:

- Employee information (name, user ID)
- Salary period (from date, to date, total days, calculation date)
- Attendance details (working days, absences, overtime)
- Salary breakdown (basic, overtime, additional payments/deductions, gross, net)
- Notes

### 🎨 UI Components

- Clean, modern interface using shadcn/ui components
- Responsive design (mobile-friendly)
- Table view with badges for visual clarity
- Dialog-based forms for create/edit operations
- Alert dialog for delete confirmation
- Toast notifications for user feedback

### 🔐 Access Control

- Only ADMIN and MANAGER roles can access this feature
- Unauthorized users see an "Access Denied" message

## Integration Points

### Routes

Added to `/frontend/src/App.tsx`:

```typescript
{
  path: "/calculated-salaries",
  element: <CalculatedSalariesPage />,
  requiredRoles: ["ADMIN", "MANAGER"],
}
```

### Navigation

Added to `/frontend/src/components/app-sidebar.tsx`:

```typescript
{
  title: "Calculated Salaries",
  url: "/calculated-salaries",
  icon: BadgeDollarSign,
}
```

### API Service

Uses existing service: `/frontend/src/services/calculated-salary-service.ts`

### Types

Uses existing types from: `/frontend/src/types/employee-salary.ts`

- `CalculatedSalary`
- `CreateCalculatedSalary`
- `UpdateCalculatedSalary`
- `SalaryPeriodParams`

## Data Flow

1. **Loading**: Component fetches salaries using `CalculatedSalaryService.getAll()`
2. **Filtering**:
   - By User ID: `CalculatedSalaryService.getByUserId(userId)`
   - By Date Range: `CalculatedSalaryService.getByDateRange(params)`
3. **Creating**: Form data submitted to `CalculatedSalaryService.create(data)`
4. **Updating**: Form data submitted to `CalculatedSalaryService.update(id, data)`
5. **Deleting**: Record deleted via `CalculatedSalaryService.delete(id)`

## Usage

### Accessing the Page

1. Log in as ADMIN or MANAGER
2. Navigate to "Calculated Salaries" from the sidebar

### Creating a Salary Calculation

1. Click "Calculate Salary" button
2. Fill in employee details (User ID, Salary Config ID)
3. Select date range
4. Enter attendance details (absences, overtime)
5. Enter salary components (basic salary, overtime amount)
6. Add additional payments/deductions if needed
7. Add notes (optional)
8. Click "Calculate Salary" to save

### Viewing Details

1. Click the document icon (📄) next to any salary record
2. View complete breakdown in the dialog

### Editing a Salary

1. Click the edit icon (✏️) next to any salary record
2. Modify the values as needed
3. Click "Update Salary" to save changes

### Deleting a Salary

1. Click the trash icon (🗑️) next to any salary record
2. Confirm deletion in the alert dialog

### Filtering

1. Click "Show Filters" button
2. Enter User ID and/or select date range
3. Filters apply automatically
4. Click "Clear Filters" to reset

## Currency Formatting

All amounts are displayed in Indian Rupees (INR) format:

```
₹1,234.56
```

## Date Formatting

Dates are displayed in the format:

```
19 Nov 2025
```

## Notes

- All calculations happen in real-time as you type
- Read-only fields (Total Days, Working Days, Gross Salary, Net Salary) are automatically calculated
- The form validates all required fields before submission
- Error messages are shown using toast notifications
- Success messages confirm actions

## Dependencies

- React Hook Form (form management)
- Zod (validation)
- date-fns (date formatting)
- Sonner (toast notifications)
- shadcn/ui (UI components)
- Lucide React (icons)

## Future Enhancements

Potential improvements:

- Export to PDF/Excel
- Bulk salary calculation
- Salary history timeline
- Integration with payment processing
- Email notifications
- Automated salary calculation based on attendance data
- Salary templates
- Approval workflow
