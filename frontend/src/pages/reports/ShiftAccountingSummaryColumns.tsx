import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import type { ShiftResponse, SalesmanShiftAccountingResponse } from "@/types";

export interface ShiftAccountingData {
  shift: ShiftResponse;
  accounting: SalesmanShiftAccountingResponse | null;
}

const formatDateTime = (dateStr: string) => {
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy hh:mm a");
  } catch {
    return dateStr;
  }
};

const formatCurrency = (amount: number) => {
  return `₹${amount.toFixed(2)}`;
};

const getBalanceColor = (balance: number) => {
  if (balance === 0) return "text-green-600";
  if (balance > 0) return "text-blue-600";
  return "text-red-600";
};

const getBalanceText = (balance: number) => {
  if (balance === 0) return "Balanced";
  if (balance > 0) return "Excess";
  return "Shortage";
};

export const shiftAccountingColumns: ColumnDef<ShiftAccountingData>[] = [
  {
    accessorKey: "shift.startDatetime",
    header: "Date & Time",
    cell: ({ row }) => {
      const { shift } = row.original;
      return (
        <div className="flex flex-col min-w-[180px]">
          <span className="font-medium">
            {formatDateTime(shift.startDatetime)}
          </span>
          {shift.endDatetime && (
            <span className="text-xs text-muted-foreground">
              to {formatDateTime(shift.endDatetime)}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "shift.salesmanFullName",
    header: "Salesman",
    cell: ({ row }) => {
      const { shift } = row.original;
      return (
        <div className="flex items-center gap-2 min-w-[150px]">
          <User className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="font-medium">
              {shift.salesmanFullName || shift.salesmanUsername}
            </span>
            <span className="text-xs text-muted-foreground">
              {shift.salesmanUsername}
            </span>
          </div>
        </div>
      );
    },
    filterFn: (row, _id, value) => {
      const { shift } = row.original;
      const searchValue = value.toLowerCase();
      const fullName = shift.salesmanFullName?.toLowerCase() || "";
      const username = shift.salesmanUsername?.toLowerCase() || "";
      return fullName.includes(searchValue) || username.includes(searchValue);
    },
  },
  {
    id: "duration",
    header: "Duration",
    cell: ({ row }) => {
      const { shift } = row.original;
      const duration = shift.endDatetime
        ? Math.round(
            (new Date(shift.endDatetime).getTime() -
              new Date(shift.startDatetime).getTime()) /
              (1000 * 60 * 60)
          )
        : 0;
      return <span className="text-sm">{duration}h</span>;
    },
  },
  {
    accessorKey: "accounting.fuelSales",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-end"
        >
          Fuel Sales
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { accounting } = row.original;
      if (!accounting) return <span className="text-muted-foreground">-</span>;
      return (
        <div className="text-right font-medium">
          {formatCurrency(accounting.fuelSales)}
        </div>
      );
    },
  },
  {
    accessorKey: "accounting.customerReceipt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-end"
        >
          Customer Receipt
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { accounting } = row.original;
      if (!accounting) return <span className="text-muted-foreground">-</span>;
      return (
        <div className="text-right">
          {formatCurrency(accounting.customerReceipt)}
        </div>
      );
    },
  },
  {
    accessorKey: "accounting.systemReceivedAmount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-end"
        >
          System Received
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { accounting } = row.original;
      if (!accounting) return <span className="text-muted-foreground">-</span>;
      return (
        <div className="text-right font-medium">
          {formatCurrency(accounting.systemReceivedAmount)}
        </div>
      );
    },
  },
  {
    accessorKey: "accounting.upiReceived",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-end"
        >
          UPI
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { accounting } = row.original;
      if (!accounting) return <span className="text-muted-foreground">-</span>;
      return (
        <div className="text-right">
          {formatCurrency(accounting.upiReceived)}
        </div>
      );
    },
  },
  {
    accessorKey: "accounting.cardReceived",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-end"
        >
          Card
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { accounting } = row.original;
      if (!accounting) return <span className="text-muted-foreground">-</span>;
      return (
        <div className="text-right">
          {formatCurrency(accounting.cardReceived)}
        </div>
      );
    },
  },
  {
    accessorKey: "accounting.credit",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-end"
        >
          Credit
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { accounting } = row.original;
      if (!accounting) return <span className="text-muted-foreground">-</span>;
      return (
        <div className="text-right">{formatCurrency(accounting.credit)}</div>
      );
    },
  },
  {
    accessorKey: "accounting.expenses",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-end"
        >
          Expenses
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { accounting } = row.original;
      if (!accounting) return <span className="text-muted-foreground">-</span>;
      return (
        <div className="text-right">{formatCurrency(accounting.expenses)}</div>
      );
    },
  },
  {
    accessorKey: "accounting.cashInHand",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-end"
        >
          Cash in Hand
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { accounting } = row.original;
      if (!accounting) return <span className="text-muted-foreground">-</span>;
      return (
        <div className="text-right font-medium">
          {formatCurrency(accounting.cashInHand)}
        </div>
      );
    },
  },
  {
    accessorKey: "accounting.balanceAmount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full justify-end"
        >
          Balance
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { accounting } = row.original;
      if (!accounting) return <span className="text-muted-foreground">-</span>;
      return (
        <div
          className={`text-right font-bold ${getBalanceColor(
            accounting.balanceAmount
          )}`}
        >
          {formatCurrency(accounting.balanceAmount)}
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const { accounting } = row.original;
      if (!accounting) {
        return <Badge variant="outline">Pending</Badge>;
      }
      return (
        <Badge
          variant={
            accounting.balanceAmount === 0
              ? "default"
              : accounting.balanceAmount > 0
              ? "secondary"
              : "destructive"
          }
        >
          {getBalanceText(accounting.balanceAmount)}
        </Badge>
      );
    },
  },
];
