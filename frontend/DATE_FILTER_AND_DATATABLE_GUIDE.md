# Date Range Filter & DataTable Implementation Guide

This guide explains how to implement efficient date range filtering with backend support and use the DataTable component effectively in the pump management system.

## Table of Contents

1. [Date Range Filter Implementation](#date-range-filter-implementation)
2. [DataTable Component Usage](#datatable-component-usage)
3. [Backend Integration](#backend-integration)
4. [Performance Optimization](#performance-optimization)
5. [Best Practices](#best-practices)

---

## Date Range Filter Implementation

### 1. Frontend Setup

#### Step 2: Create Date Helper Functions

```typescript
import { subDays } from "date-fns";

// Helper function to get date from 7 days ago
const getOneWeekAgo = () => {
  return subDays(new Date(), 7);
};

// Helper function to get today's date
const getToday = () => {
  return new Date();
};
```

#### Step 3: Set Up State Management

```typescript
import { useState, useEffect } from "react";

export function YourPage() {
  // Date filter states - Initialize with default dates
  const [fromDate, setFromDate] = useState<Date | undefined>(getOneWeekAgo());
  const [toDate, setToDate] = useState<Date | undefined>(getToday());
  const [isFromDateOpen, setIsFromDateOpen] = useState(false);
  const [isToDateOpen, setIsToDateOpen] = useState(false);

  // Fetch data when dates change
  useEffect(() => {
    fetchData(fromDate, toDate);
  }, [fromDate, toDate]);

  // ... rest of component
}
```

#### Step 4: Create Date Picker UI

```tsx
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// From Date Picker
<div className="flex-1 min-w-[200px]">
  <label className="text-sm font-medium mb-2 block">From Date</label>
  <Popover open={isFromDateOpen} onOpenChange={setIsFromDateOpen}>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !fromDate && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {fromDate ? format(fromDate, "PPP") : "Pick a date"}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar
        mode="single"
        selected={fromDate}
        onSelect={(date) => {
          setFromDate(date);
          setIsFromDateOpen(false);
        }}
        disabled={(date) => date > new Date()} // Disable future dates
        initialFocus
      />
    </PopoverContent>
  </Popover>
</div>

// To Date Picker
<div className="flex-1 min-w-[200px]">
  <label className="text-sm font-medium mb-2 block">To Date</label>
  <Popover open={isToDateOpen} onOpenChange={setIsToDateOpen}>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !toDate && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {toDate ? format(toDate, "PPP") : "Pick a date"}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar
        mode="single"
        selected={toDate}
        onSelect={(date) => {
          setToDate(date);
          setIsToDateOpen(false);
        }}
        disabled={(date) => {
          // Disable dates after today
          if (date > new Date()) return true;
          // Disable dates before fromDate if fromDate is set
          if (fromDate && date < fromDate) return true;
          return false;
        }}
        initialFocus
      />
    </PopoverContent>
  </Popover>
</div>

// Reset Button
<Button variant="outline" onClick={handleClearFilters}>
  Reset to Default
</Button>
```

#### Step 5: Handle Filter Reset

```typescript
const handleClearFilters = () => {
  setFromDate(getOneWeekAgo());
  setToDate(getToday());
};
```

---

## DataTable Component Usage

### Basic DataTable Setup

The DataTable component is a powerful wrapper around TanStack Table (React Table) that provides sorting, filtering, pagination, and column visibility out of the box.

### Step 1: Define Column Definitions

Create a separate file for your columns (e.g., `YourDataColumns.tsx`):

```tsx
import type { ColumnDef } from "@tanstack/react-table";
import type { YourDataType } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";

interface ColumnsProps {
  onEdit: (item: YourDataType) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
}

export const getColumns = ({
  onEdit,
  onDelete,
  deletingId,
}: ColumnsProps): ColumnDef<YourDataType>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium">#{row.original.id}</div>,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      return formatDate(row.original.date);
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => formatCurrency(row.original.amount),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => item.id && onDelete(item.id)}
            disabled={deletingId === item.id}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
```

### Step 2: Use DataTable in Your Component

```tsx
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./YourDataColumns";

export function YourPage() {
  const [data, setData] = useState<YourDataType[]>([]);
  const [editingItem, setEditingItem] = useState<YourDataType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const columns = getColumns({
    onEdit: setEditingItem,
    onDelete: handleDelete,
    deletingId,
  });

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name" // Field to search on
      searchPlaceholder="Search by name..." // Placeholder text
      pageSize={10} // Rows per page
      enableRowSelection={false} // Enable/disable row selection
      enableColumnVisibility={true} // Show/hide column toggle
      enablePagination={true} // Enable pagination
      enableSorting={true} // Enable sorting
      enableFiltering={true} // Enable search filter
    />
  );
}
```

### DataTable Props Reference

| Prop                     | Type                      | Default       | Description                     |
| ------------------------ | ------------------------- | ------------- | ------------------------------- |
| `columns`                | `ColumnDef[]`             | Required      | Column definitions              |
| `data`                   | `T[]`                     | Required      | Array of data to display        |
| `searchKey`              | `string`                  | `undefined`   | Field name to search on         |
| `searchPlaceholder`      | `string`                  | `"Filter..."` | Search input placeholder        |
| `pageSize`               | `number`                  | `10`          | Initial rows per page           |
| `enableRowSelection`     | `boolean`                 | `false`       | Enable row selection checkboxes |
| `enableColumnVisibility` | `boolean`                 | `true`        | Show column visibility dropdown |
| `enablePagination`       | `boolean`                 | `true`        | Enable pagination controls      |
| `enableSorting`          | `boolean`                 | `true`        | Enable column sorting           |
| `enableFiltering`        | `boolean`                 | `true`        | Enable search filtering         |
| `onRowSelectionChange`   | `(rows: T[]) => void`     | `undefined`   | Callback when selection changes |
| `meta`                   | `Record<string, unknown>` | `undefined`   | Additional metadata             |

### Column Definition Options

```typescript
{
  accessorKey: "fieldName",      // Field from data object
  header: "Display Name",         // Static header
  // OR
  header: ({ column }) => {       // Dynamic header with sorting
    return (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Display Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    );
  },
  cell: ({ row }) => {            // Custom cell rendering
    return <div>{row.original.fieldName}</div>;
  },
  enableSorting: true,            // Enable sorting for this column
  enableHiding: true,             // Allow hiding this column
}
```

---

## Backend Integration

### Step 1: Update Service Layer

**Frontend Service** (`your-service.ts`):

```typescript
export class YourService {
  private static readonly BASE_PATH = "/api/v1/your-endpoint";

  // Add optional date parameters
  static async getAll(fromDate?: Date, toDate?: Date): Promise<YourType[]> {
    const params = new URLSearchParams();

    if (fromDate) {
      // Format date as YYYY-MM-DD
      params.append("fromDate", fromDate.toISOString().split("T")[0]);
    }

    if (toDate) {
      // Format date as YYYY-MM-DD
      params.append("toDate", toDate.toISOString().split("T")[0]);
    }

    const url = params.toString()
      ? `${this.BASE_PATH}?${params.toString()}`
      : this.BASE_PATH;
    const response = await api.get<YourType[]>(url);
    return response.data;
  }
}
```

### Step 2: Update Store (Zustand)

```typescript
interface YourState {
  items: YourType[];
  loading: boolean;
  error: string | null;

  fetchItems: (fromDate?: Date, toDate?: Date) => Promise<void>;
}

export const useYourStore = create<YourState>()(
  devtools((set) => ({
    items: [],
    loading: false,
    error: null,

    fetchItems: async (fromDate?: Date, toDate?: Date) => {
      set({ loading: true, error: null });
      try {
        const items = await YourService.getAll(fromDate, toDate);
        set({ items, loading: false });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch items";
        set({ error: errorMessage, loading: false });
        toast.error(errorMessage);
      }
    },
  }))
);
```

### Step 3: Backend Repository (Spring Boot)

**Repository** (`YourRepository.java`):

```java
@Repository
public interface YourRepository extends JpaRepository<YourEntity, UUID> {

    /**
     * Find records by pump master ID and date range (optimized with indexed query)
     *
     * @param pumpMasterId The pump master ID
     * @param fromDate The start date (inclusive)
     * @param toDate The end date (inclusive)
     * @return List of records within the date range
     */
    @Query("SELECT e FROM YourEntity e " +
           "WHERE e.pumpMaster.id = :pumpMasterId " +
           "AND e.date >= :fromDate " +
           "AND e.date <= :toDate " +
           "ORDER BY e.date DESC, e.id DESC")
    List<YourEntity> findByPumpMasterIdAndDateRange(
            @Param("pumpMasterId") UUID pumpMasterId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate);
}
```

### Step 4: Backend Service

**Service** (`YourService.java`):

```java
@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class YourService {

    private final YourRepository repository;

    public List<YourResponse> getByPumpMasterIdAndDateRange(
            @NotNull UUID pumpMasterId,
            LocalDate fromDate,
            LocalDate toDate) {

        // Set default values if dates are not provided
        LocalDate effectiveFromDate = fromDate != null ? fromDate : LocalDate.of(2000, 1, 1);
        LocalDate effectiveToDate = toDate != null ? toDate : LocalDate.now();

        return repository.findByPumpMasterIdAndDateRange(pumpMasterId, effectiveFromDate, effectiveToDate)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }
}
```

### Step 5: Backend Controller

**Controller** (`YourController.java`):

```java
@RestController
@RequestMapping("/api/v1/your-endpoint")
@RequiredArgsConstructor
public class YourController {

    private final YourService service;

    @GetMapping
    @Operation(summary = "Get records with optional date range filter")
    public ResponseEntity<List<YourResponse>> getRecords(
            HttpServletRequest request,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fromDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate toDate) {

        UUID pumpMasterId = extractPumpMasterId(request);

        // If date range is provided, use filtered query
        if (fromDate != null || toDate != null) {
            return ResponseEntity.ok(service.getByPumpMasterIdAndDateRange(pumpMasterId, fromDate, toDate));
        }

        // Otherwise, return all records
        return ResponseEntity.ok(service.getByPumpMasterId(pumpMasterId));
    }
}
```

### Step 6: Database Index for Performance

Create a migration file (e.g., `30-oct-2025-add-date-index.sql`):

```sql
-- Create composite index on pump_master_id and date
CREATE INDEX IF NOT EXISTS idx_your_table_pump_date
ON your_table (pump_master_id, date DESC);

-- Add index on date alone for date-only queries
CREATE INDEX IF NOT EXISTS idx_your_table_date
ON your_table (date DESC);
```

---

## Performance Optimization

### 1. Backend Filtering vs Frontend Filtering

**❌ Bad Practice - Frontend Filtering:**

```typescript
// Fetches ALL data, then filters in browser
const allData = await fetchAll(); // Could be 10,000+ records
const filtered = allData.filter(
  (item) => item.date >= fromDate && item.date <= toDate
);
```

**✅ Good Practice - Backend Filtering:**

```typescript
// Fetches only what's needed
const filtered = await fetchAll(fromDate, toDate); // Only ~100 records
```

### 2. Database Indexing

Always create indexes on:

- Date fields used in filtering
- Foreign keys (pump_master_id)
- Composite indexes for common query patterns

```sql
-- Composite index for (pump_master_id, date) queries
CREATE INDEX idx_table_pump_date ON table (pump_master_id, date DESC);
```

### 3. Default Date Ranges

Always set sensible defaults to prevent loading massive datasets:

```typescript
// Default to last 7 days
const [fromDate, setFromDate] = useState<Date | undefined>(
  subDays(new Date(), 7)
);
const [toDate, setToDate] = useState<Date | undefined>(new Date());
```

### 4. Lazy Loading & Pagination

For large datasets, use pagination at the backend:

```java
@Query("SELECT e FROM YourEntity e " +
       "WHERE e.pumpMaster.id = :pumpMasterId " +
       "AND e.date >= :fromDate AND e.date <= :toDate " +
       "ORDER BY e.date DESC")
Page<YourEntity> findByPumpMasterIdAndDateRange(
    @Param("pumpMasterId") UUID pumpMasterId,
    @Param("fromDate") LocalDate fromDate,
    @Param("toDate") LocalDate toDate,
    Pageable pageable);
```

---

## Best Practices

### 1. Date Handling

✅ **DO:**

- Use `LocalDate` in backend for date-only fields
- Format dates as ISO-8601 (YYYY-MM-DD) in API
- Always validate date ranges (fromDate <= toDate)
- Disable future dates when appropriate
- Set sensible defaults

❌ **DON'T:**

- Use timestamps when you only need dates
- Accept unbounded date ranges
- Forget timezone considerations

### 2. UI/UX

✅ **DO:**

- Show loading states during data fetch
- Display filtered record counts
- Provide "Reset to Default" button
- Auto-close calendar on date selection
- Show clear date format (PPP format from date-fns)

❌ **DON'T:**

- Make users manually type dates
- Hide the active filter state
- Require page refresh after filter change

### 3. DataTable

✅ **DO:**

- Keep columns focused and relevant
- Provide sort on important columns
- Use custom cell renderers for formatting
- Enable column visibility for user flexibility
- Set appropriate default page sizes

❌ **DON'T:**

- Display too many columns (causes horizontal scroll)
- Forget to format currency/dates
- Make actions column sortable/hideable

### 4. Performance

✅ **DO:**

- Filter at database level
- Use database indexes
- Implement pagination for large datasets
- Cache frequently accessed data
- Use memo/useMemo for expensive computations

❌ **DON'T:**

- Fetch all data and filter in browser
- Skip database indexes
- Re-render entire table on every state change

---

## Complete Example

Here's a complete working example combining everything:

```tsx
// FuelPurchasesPage.tsx
import { useEffect, useState } from "react";
import { useFuelPurchaseStore } from "@/store/fuel-purchase-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Loader2, Fuel, CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DataTable } from "@/components/ui/data-table";
import { getFuelPurchaseColumns } from "./FuelPurchasesColumns";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";

const getOneWeekAgo = () => subDays(new Date(), 7);
const getToday = () => new Date();

export function FuelPurchasesPage() {
  const { fuelPurchases, loading, error, fetchFuelPurchases } =
    useFuelPurchaseStore();

  const [fromDate, setFromDate] = useState<Date | undefined>(getOneWeekAgo());
  const [toDate, setToDate] = useState<Date | undefined>(getToday());
  const [isFromDateOpen, setIsFromDateOpen] = useState(false);
  const [isToDateOpen, setIsToDateOpen] = useState(false);

  // Fetch data when dates change
  useEffect(() => {
    fetchFuelPurchases(fromDate, toDate);
  }, [fetchFuelPurchases, fromDate, toDate]);

  const handleClearFilters = () => {
    setFromDate(getOneWeekAgo());
    setToDate(getToday());
  };

  const columns = getFuelPurchaseColumns({
    onEdit: (item) => console.log("Edit", item),
    onDelete: (id) => console.log("Delete", id),
    deletingId: null,
  });

  if (loading && fuelPurchases.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filter by Date Range</CardTitle>
          <CardDescription>
            Select a date range to filter records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            {/* From Date */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">
                From Date
              </label>
              <Popover open={isFromDateOpen} onOpenChange={setIsFromDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={(date) => {
                      setFromDate(date);
                      setIsFromDateOpen(false);
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* To Date */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">To Date</label>
              <Popover open={isToDateOpen} onOpenChange={setIsToDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={(date) => {
                      setToDate(date);
                      setIsToDateOpen(false);
                    }}
                    disabled={(date) => {
                      if (date > new Date()) return true;
                      if (fromDate && date < fromDate) return true;
                      return false;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button variant="outline" onClick={handleClearFilters}>
              Reset to Default
            </Button>
          </div>

          {(fromDate || toDate) && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {fuelPurchases.length} records
              {fromDate && ` from ${format(fromDate, "PPP")}`}
              {toDate && ` to ${format(toDate, "PPP")}`}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Records</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={fuelPurchases}
            searchKey="supplierName"
            searchPlaceholder="Search by supplier..."
            pageSize={10}
            enableRowSelection={false}
            enableColumnVisibility={true}
            enablePagination={true}
            enableSorting={true}
            enableFiltering={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Troubleshooting

### Issue: Dates not filtering correctly

**Solution:** Check date format in API calls. Backend expects `YYYY-MM-DD`:

```typescript
fromDate.toISOString().split("T")[0]; // "2025-10-30"
```

### Issue: Table performance slow with many rows

**Solution:** Implement backend pagination or reduce default date range:

```typescript
const getOneWeekAgo = () => subDays(new Date(), 7); // Instead of 30 days
```

### Issue: Calendar not closing on date select

**Solution:** Call state setter in onSelect:

```typescript
onSelect={(date) => {
  setFromDate(date);
  setIsFromDateOpen(false); // Close popover
}}
```

### Issue: Future dates selectable

**Solution:** Add disabled prop to Calendar:

```typescript
disabled={(date) => date > new Date()}
```

---

## Summary

✅ **Key Takeaways:**

1. Always filter data at the backend for performance
2. Use sensible default date ranges (e.g., last 7 days)
3. Create database indexes on date fields
4. Provide clear UI feedback (loading states, record counts)
5. Disable invalid date selections (future dates, before fromDate)
6. Use DataTable component for consistent UX
7. Format dates properly in API calls (ISO-8601)
8. Allow users to reset filters easily

By following this guide, you'll have efficient, user-friendly date filtering with powerful table functionality throughout your application!
