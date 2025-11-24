# Calculated Salaries - Sheet-Based Interface

## Overview

The Calculated Salaries feature has been redesigned as a **sheet-based inline editor** that works directly from the Employee Salary Config page. No dialogs or separate pages - everything is done in a spreadsheet-like interface!

## How It Works

### Navigation Flow

1. Go to **Employee Salary Config** page
2. Find an employee's salary configuration
3. Click the **📊 (FileSpreadsheet)** icon button
4. Opens the Calculated Salaries sheet for that specific employee

### URL Structure

```
/calculated-salaries/:configId/:userId
```

Example: `/calculated-salaries/abc123/user456`

## Features

### ✨ Sheet-Based Editing

- **Inline Editing**: Edit cells directly in the table (like Excel/Google Sheets)
- **No Dialogs**: All CRUD operations happen in-place
- **Toggle Edit Mode**: Click the Save icon to enable editing for a row
- **Real-time Calculations**: Values update automatically as you type

### ➕ Adding New Salary Calculations

1. Click "Add New Calculation" button
2. A new editable row appears at the top
3. Fill in the details directly in the cells
4. Click ✓ (Check) to save or ✗ (X) to cancel

### ✏️ Editing Existing Records

1. Click the 💾 (Save) icon on any row
2. Row becomes editable with input fields
3. Make your changes
4. Click ✓ (Check) to save or ✗ (X) to discard

### 🗑️ Deleting Records

1. Click the 🗑️ (Trash) icon on any row
2. Confirm deletion in the dialog
3. Record is permanently removed

### 🔢 Automatic Calculations

The sheet automatically calculates:

1. **Total Days** = Days between From Date and To Date
2. **Working Days** = Total Days - Full Day Absences - (Half Day Absences × 0.5) + Overtime Days
3. **Gross Salary** = Basic Salary + Overtime Amount + Additional Payment
4. **Net Salary** = Gross Salary - Additional Deduction

These calculations happen **in real-time** as you type!

## Table Columns

| Column     | Editable | Auto-Calculated | Description                       |
| ---------- | -------- | --------------- | --------------------------------- |
| From Date  | ✅       | ❌              | Start date of salary period       |
| To Date    | ✅       | ❌              | End date of salary period         |
| Total Days | ❌       | ✅              | Calculated from date range        |
| Full Abs.  | ✅       | ❌              | Full day absences                 |
| Half Abs.  | ✅       | ❌              | Half day absences                 |
| Overtime   | ✅       | ❌              | Overtime days                     |
| Working    | ❌       | ✅              | Calculated working days           |
| Basic      | ✅       | ❌              | Basic salary amount               |
| OT Amount  | ✅       | ❌              | Overtime payment                  |
| Add. Pay   | ✅       | ❌              | Additional payments (bonuses)     |
| Add. Ded.  | ✅       | ❌              | Additional deductions (penalties) |
| Gross      | ❌       | ✅              | Gross salary (auto-calculated)    |
| Net        | ❌       | ✅              | Net salary (auto-calculated)      |
| Notes      | ✅       | ❌              | Free-text notes                   |
| Actions    | -        | -               | Save/Cancel/Delete buttons        |

## Files Modified/Created

### Modified Files

1. **EmployeeSalaryConfigPage.tsx**

   - Added FileSpreadsheet icon import
   - Added navigate functionality
   - Added "View Salaries" button (spreadsheet icon) in the actions column

2. **App.tsx**

   - Updated route to use parameters: `/calculated-salaries/:configId/:userId`

3. **app-sidebar.tsx**
   - Removed direct "Calculated Salaries" menu item (accessed via config page)

### Created/Updated Files

1. **CalculatedSalariesPage.tsx** - Completely rewritten as sheet-based interface
2. **CreateCalculatedSalaryForm.tsx** - No longer used (keeping for reference)
3. **UpdateCalculatedSalaryForm.tsx** - No longer used (keeping for reference)

## UI/UX Highlights

### Header Section

- **Back Button**: Returns to Salary Config page
- **Employee Info**: Shows employee name, salary type, and basic amount
- **Add Button**: Adds new calculation row at the top

### Table Features

- **Horizontal Scroll**: Table scrolls horizontally for many columns
- **Badge Indicators**: Total Days and Working Days shown in badges
- **Currency Formatting**: All amounts displayed in ₹ INR format
- **Date Formatting**: Dates shown as "19 Nov 2025"
- **Action Buttons**:
  - Edit mode: ✓ (Save) and ✗ (Cancel)
  - View mode: 💾 (Edit) and 🗑️ (Delete)

### Loading States

- Spinner shown while fetching data
- Individual save spinners for each row being saved
- Disabled buttons during save operations

### Visual States

- **New Row**: Editable from the start
- **Edit Mode**: Input fields appear in place of text
- **View Mode**: Clean, formatted display
- **Read-only Fields**: Grayed out background (auto-calculated fields)

## Example Workflow

### Calculate Monthly Salary for an Employee

1. Go to Employee Salary Config page
2. Find "John Doe" (Monthly salary: ₹30,000)
3. Click 📊 icon next to his config
4. Click "Add New Calculation"
5. Fill in the sheet:

   - From Date: `2025-11-01`
   - To Date: `2025-11-30`
   - Full Absences: `2`
   - Half Absences: `1`
   - Overtime: `0`
   - Basic: `30000` (pre-filled from config)
   - OT Amount: `0`
   - Add. Payment: `5000` (bonus)
   - Add. Deduction: `1000` (advance)
   - Notes: "November 2025 salary with performance bonus"

6. Observe auto-calculations:

   - Total Days: `30`
   - Working Days: `27.5` (30 - 2 - 0.5 + 0)
   - Gross: `₹35,000.00` (30000 + 0 + 5000)
   - Net: `₹34,000.00` (35000 - 1000)

7. Click ✓ to save
8. Success! New row saved and switches to view mode

## Benefits of Sheet-Based Design

✅ **Faster Data Entry**: No dialog opening/closing
✅ **Excel-like Experience**: Familiar to users
✅ **See All Data**: Multiple records visible at once
✅ **Quick Edits**: Toggle edit mode instantly
✅ **Real-time Feedback**: Calculations update as you type
✅ **Context Aware**: Always shows employee info in header
✅ **Less Clicking**: Fewer steps to complete tasks

## Access Control

- Only **ADMIN** and **MANAGER** roles can access
- Unauthorized users see "Access Denied" message

## Error Handling

- Toast notifications for all operations
- Form validation on save
- Network error messages
- Confirmation dialog for deletions

## Performance

- Optimized re-renders with proper state management
- Individual row save operations (doesn't reload entire table)
- Automatic refresh after successful operations

## Future Enhancements

- Bulk import from CSV
- Copy from previous month
- Salary calculation templates
- Export to Excel
- Print-friendly view
- Keyboard shortcuts (Enter to save, Escape to cancel)
- Row selection for batch operations
