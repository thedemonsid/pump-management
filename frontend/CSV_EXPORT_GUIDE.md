# CSV Export Implementation Guide

This guide explains how to implement CSV export functionality for reports in the pump management system.

## Table of Contents

1. [Basic CSV Export Implementation](#basic-csv-export-implementation)
2. [Export Button Setup](#export-button-setup)
3. [Advanced Features](#advanced-features)
4. [Best Practices](#best-practices)
5. [Complete Example](#complete-example)

---

## Basic CSV Export Implementation

### Step 1: Create the Export Function

Add this function to your report page component:

```typescript
const handleExport = () => {
  if (data.length === 0) {
    toast.error("No data to export");
    return;
  }

  try {
    // Step 1: Define CSV headers
    const headers = [
      "Column 1",
      "Column 2",
      "Column 3",
      // Add all your column names here
    ];

    // Step 2: Map data to CSV rows
    const rows = data.map((item) => {
      return [
        item.field1,
        item.field2,
        item.field3?.toFixed(2) || "0.00", // Format numbers
        format(new Date(item.date), "dd/MM/yyyy"), // Format dates
        // Map all your fields here
      ];
    });

    // Step 3: Add totals row (optional)
    rows.push([
      "TOTAL",
      "",
      totalAmount.toFixed(2),
      // Add other total values
    ]);

    // Step 4: Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell.toString()}"`).join(",")),
    ].join("\n");

    // Step 5: Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    // Step 6: Set filename
    const filename = `report-${format(new Date(), "yyyy-MM-dd")}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Report exported successfully");
  } catch (error) {
    console.error("Error exporting report:", error);
    toast.error("Failed to export report");
  }
};
```

---

## Export Button Setup

### Step 1: Add Export Button to UI

Place the button in your card header:

```tsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Report Title</CardTitle>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={data.length === 0}
      >
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    </div>
  </CardHeader>
  <CardContent>{/* Your table or data display */}</CardContent>
</Card>
```

### Step 2: Import Required Icons

```typescript
import { Download } from "lucide-react";
```

---

## Advanced Features

### 1. Dynamic Filename with Date Range

```typescript
const filename = `${reportName}-${
  fromDate ? format(fromDate, "yyyy-MM-dd") : "all"
}-to-${toDate ? format(toDate, "yyyy-MM-dd") : "all"}.csv`;
```

**Example Output:** `shift-accounting-report-2025-11-07-to-2025-11-14.csv`

### 2. Handling Nested Objects

```typescript
const rows = data.map((item) => {
  return [
    item.user.fullName || item.user.username, // Nested object
    item.accounting?.amount || "0.00", // Optional chaining
    item.details.address.city, // Deep nesting
  ];
});
```

### 3. Formatting Currency

```typescript
const formatCurrency = (amount: number) => {
  return amount.toFixed(2); // Always 2 decimal places
};

// In rows mapping
rows.map((item) => [
  formatCurrency(item.fuelSales),
  formatCurrency(item.expenses),
]);
```

### 4. Formatting Dates

```typescript
import { format, parseISO } from "date-fns";

// For Date objects
format(new Date(item.date), "dd/MM/yyyy");

// For ISO strings
format(parseISO(item.dateString), "dd/MM/yyyy hh:mm a");
```

### 5. Handling Null/Undefined Values

```typescript
const rows = data.map((item) => {
  return [
    item.name || "-", // String fallback
    item.amount?.toFixed(2) || "0.00", // Number fallback
    item.date ? format(new Date(item.date), "dd/MM/yyyy") : "-", // Date fallback
  ];
});
```

### 6. Escaping Special Characters in CSV

The pattern `"${cell.toString()}"` wraps each cell in quotes to handle:

- Commas in text
- Line breaks
- Special characters

```typescript
row.map((cell) => `"${cell.toString()}"`).join(",");
```

### 7. Adding Summary Rows

```typescript
// Add totals row
rows.push(["TOTAL", "", "", totalAmount.toFixed(2), totalQuantity.toString()]);

// Add multiple summary rows
rows.push([""]); // Empty row for spacing
rows.push(["Summary"]);
rows.push(["Total Records:", data.length.toString()]);
rows.push(["Generated On:", format(new Date(), "dd/MM/yyyy hh:mm a")]);
```

### 8. Conditional Fields

```typescript
const rows = data.map((item) => {
  const baseFields = [item.id, item.name, item.date];

  // Add conditional fields
  if (item.hasAccounting) {
    return [...baseFields, item.accounting.amount, item.accounting.status];
  } else {
    return [...baseFields, "N/A", "Pending"];
  }
});
```

---

## Best Practices

### ✅ DO:

1. **Check for Empty Data**

   ```typescript
   if (data.length === 0) {
     toast.error("No data to export");
     return;
   }
   ```

2. **Disable Button When No Data**

   ```tsx
   <Button disabled={data.length === 0} onClick={handleExport}>
     Export
   </Button>
   ```

3. **Use Try-Catch for Error Handling**

   ```typescript
   try {
     // Export logic
     toast.success("Report exported successfully");
   } catch (error) {
     console.error("Error exporting report:", error);
     toast.error("Failed to export report");
   }
   ```

4. **Format Numbers Consistently**

   ```typescript
   amount.toFixed(2); // Always 2 decimals for currency
   quantity.toString(); // Convert numbers to strings
   ```

5. **Use Meaningful Filenames**

   ```typescript
   const filename = `${reportType}-${dateRange}-${timestamp}.csv`;
   ```

6. **Clean Up Resources**

   ```typescript
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link); // Remove after download
   ```

7. **Provide User Feedback**
   ```typescript
   toast.success("Report exported successfully");
   ```

### ❌ DON'T:

1. **Don't Forget to Handle Null Values**

   ```typescript
   // Bad
   item.amount.toFixed(2); // Will crash if null

   // Good
   item.amount?.toFixed(2) || "0.00";
   ```

2. **Don't Mix Date Formats**

   ```typescript
   // Bad - Inconsistent formats
   row1: "14-11-2025";
   row2: "2025/11/14";

   // Good - Consistent format
   format(date, "dd/MM/yyyy");
   ```

3. **Don't Leave Totals Unformatted**

   ```typescript
   // Bad
   rows.push(["TOTAL", 12345.6789]);

   // Good
   rows.push(["TOTAL", totalAmount.toFixed(2)]);
   ```

4. **Don't Use Plain Commas Without Quotes**

   ```typescript
   // Bad - Will break CSV if cell contains comma
   rows.join(",");

   // Good - Escape with quotes
   row.map((cell) => `"${cell.toString()}"`).join(",");
   ```

5. **Don't Forget Error Messages**
   ```typescript
   // Bad - Silent failure
   catch (error) {
     console.error(error);
   }
   // Good - User feedback
   catch (error) {
     console.error(error);
     toast.error("Failed to export report");
   }
   ```

---

## Complete Example

Here's a complete working example from the Shift Accounting Report:

```typescript
import { format } from "date-fns";
import { toast } from "sonner";
import { Download } from "lucide-react";

export default function ShiftAccountingReportPage() {
  const [shiftsData, setShiftsData] = useState<ShiftAccountingData[]>([]);
  const [fromDate, setFromDate] = useState<Date | undefined>(getOneWeekAgo());
  const [toDate, setToDate] = useState<Date | undefined>(getToday());

  const totals = calculateTotals(); // Your totals calculation function

  const handleExport = () => {
    if (shiftsData.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      // Define headers
      const headers = [
        "Date",
        "Start Time",
        "End Time",
        "Salesman Name",
        "Salesman Username",
        "Duration (hours)",
        "Fuel Sales",
        "Customer Receipt",
        "System Received",
        "UPI",
        "Card",
        "Credit",
        "Expenses",
        "Cash in Hand",
        "Balance Amount",
        "Status",
      ];

      // Map data to rows
      const rows = shiftsData.map((data) => {
        const { shift, accounting } = data;
        const duration = shift.endDatetime
          ? Math.round(
              (new Date(shift.endDatetime).getTime() -
                new Date(shift.startDatetime).getTime()) /
                (1000 * 60 * 60)
            )
          : 0;

        const startDate = new Date(shift.startDatetime);
        const endDate = shift.endDatetime ? new Date(shift.endDatetime) : null;

        return [
          format(startDate, "dd/MM/yyyy"),
          format(startDate, "hh:mm a"),
          endDate ? format(endDate, "hh:mm a") : "-",
          shift.salesmanFullName || shift.salesmanUsername,
          shift.salesmanUsername,
          duration.toString(),
          accounting?.fuelSales?.toFixed(2) || "0.00",
          accounting?.customerReceipt?.toFixed(2) || "0.00",
          accounting?.systemReceivedAmount?.toFixed(2) || "0.00",
          accounting?.upiReceived?.toFixed(2) || "0.00",
          accounting?.cardReceived?.toFixed(2) || "0.00",
          accounting?.credit?.toFixed(2) || "0.00",
          accounting?.expenses?.toFixed(2) || "0.00",
          accounting?.cashInHand?.toFixed(2) || "0.00",
          accounting?.balanceAmount?.toFixed(2) || "0.00",
          accounting ? getBalanceText(accounting.balanceAmount) : "Pending",
        ];
      });

      // Add totals row
      rows.push([
        "TOTAL",
        "",
        "",
        "",
        "",
        "",
        totals.fuelSales.toFixed(2),
        totals.customerReceipt.toFixed(2),
        totals.systemReceived.toFixed(2),
        totals.upiReceived.toFixed(2),
        totals.cardReceived.toFixed(2),
        totals.credit.toFixed(2),
        totals.expenses.toFixed(2),
        totals.cashInHand.toFixed(2),
        totals.balanceAmount.toFixed(2),
        getBalanceText(totals.balanceAmount),
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${cell.toString()}"`).join(",")
        ),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      const filename = `shift-accounting-report-${
        fromDate ? format(fromDate, "yyyy-MM-dd") : "all"
      }-to-${toDate ? format(toDate, "yyyy-MM-dd") : "all"}.csv`;

      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Report exported successfully");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    }
  };

  return (
    <div>
      {/* Your UI */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Shift Accounting Details</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={shiftsData.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>{/* Your table/data display */}</CardContent>
      </Card>
    </div>
  );
}
```

---

## Common Data Types & Formatting

### 1. Currency/Money

```typescript
const amount = 1234.56789;
amount.toFixed(2); // "1234.57"
```

### 2. Dates

```typescript
// Full date
format(new Date(), "dd/MM/yyyy"); // "14/11/2025"

// Date with time
format(new Date(), "dd/MM/yyyy hh:mm a"); // "14/11/2025 03:30 PM"

// Time only
format(new Date(), "hh:mm a"); // "03:30 PM"
```

### 3. Booleans

```typescript
item.isActive ? "Yes" : "No";
item.isActive ? "Active" : "Inactive";
```

### 4. Enums/Status

```typescript
const statusText = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

statusText[item.status] || "Unknown";
```

### 5. Arrays

```typescript
// Join array values
item.tags.join("; "); // "tag1; tag2; tag3"

// Count
item.items.length.toString(); // "5"
```

### 6. Percentages

```typescript
const percentage = 0.156;
(percentage * 100).toFixed(2) + "%"; // "15.60%"
```

---

## Troubleshooting

### Issue: File downloads as .txt instead of .csv

**Solution:** Ensure correct MIME type:

```typescript
const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
```

### Issue: Special characters not displaying correctly

**Solution:** Use UTF-8 encoding and add BOM:

```typescript
const BOM = "\uFEFF";
const csvContent = BOM + [headers.join(","), ...rows].join("\n");
```

### Issue: Commas in data breaking CSV structure

**Solution:** Wrap cells in quotes:

```typescript
row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(",");
```

### Issue: Numbers showing as text in Excel

**Solution:** Don't wrap numeric cells in quotes (but be careful with commas):

```typescript
row.map((cell) => {
  if (typeof cell === "number") {
    return cell.toString();
  }
  return `"${cell.toString()}"`;
});
```

### Issue: Large numbers showing in scientific notation

**Solution:** Add a leading space or apostrophe:

```typescript
`"${largeNumber}"` or `" ${largeNumber}"`
```

---

## Summary

✅ **Key Takeaways:**

1. Always check for empty data before exporting
2. Use consistent date and number formatting
3. Handle null/undefined values gracefully
4. Wrap cells in quotes to handle special characters
5. Provide meaningful filenames with dates
6. Add totals/summary rows when appropriate
7. Show user feedback with toast messages
8. Disable export button when no data available
9. Clean up DOM elements after download
10. Use try-catch for error handling

By following this guide, you can implement consistent, robust CSV export functionality across all your reports! 📊✨
