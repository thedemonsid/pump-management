"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { EmployeeLedgerEntry } from "@/types/employee-ledger";
import { Badge } from "@/components/ui/badge";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const employeeLedgerColumns: ColumnDef<EmployeeLedgerEntry>[] = [
  {
    accessorKey: "date",
    header: "Date & Time",
    cell: ({ row }) => {
      const entry = row.original;
      return (
        <div className="font-medium whitespace-nowrap">
          {formatDate(entry.date)}
        </div>
      );
    },
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const entry = row.original;
      return (
        <div className="flex items-center gap-2">
          <Badge
            variant={entry.type === "credit" ? "default" : "destructive"}
            className={
              entry.type === "credit"
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-red-100 text-red-800 hover:bg-red-200"
            }
          >
            {entry.action}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const entry = row.original;
      return (
        <div className="max-w-md">
          <p className="text-sm">{entry.description}</p>
          {entry.paymentMethod && (
            <p className="text-xs text-muted-foreground mt-1">
              Method: {entry.paymentMethod}
            </p>
          )}
          {entry.referenceNumber && (
            <p className="text-xs text-muted-foreground">
              Ref: {entry.referenceNumber}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "creditAmount",
    header: "Credit (Salary)",
    cell: ({ row }) => {
      const entry = row.original;
      return (
        <div className="text-right font-semibold">
          {entry.type === "credit" ? (
            <span className="text-green-700">
              {formatCurrency(entry.creditAmount)}
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "debitAmount",
    header: "Debit (Payment)",
    cell: ({ row }) => {
      const entry = row.original;
      return (
        <div className="text-right font-semibold">
          {entry.type === "debit" ? (
            <span className="text-red-700">
              {formatCurrency(entry.debitAmount)}
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => {
      const entry = row.original;
      const isNegative = entry.balance < 0;
      return (
        <div className="text-right font-bold">
          <span className={isNegative ? "text-red-700" : "text-blue-700"}>
            {formatCurrency(Math.abs(entry.balance))}
          </span>
          {isNegative && (
            <span className="text-xs text-red-600 ml-1">(DR)</span>
          )}
        </div>
      );
    },
  },
];
