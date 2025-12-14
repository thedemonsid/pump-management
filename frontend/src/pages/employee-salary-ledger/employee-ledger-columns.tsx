"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { EmployeeLedgerEntry } from "@/types/employee-ledger";
import { Badge } from "@/components/ui/badge";

const MAX_DESCRIPTION_LENGTH = 120;

// eslint-disable-next-line react-refresh/only-export-components
const DescriptionCell = ({ entry }: { entry: EmployeeLedgerEntry }) => {
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = entry.description.length > MAX_DESCRIPTION_LENGTH;
  const displayText =
    expanded || !shouldTruncate
      ? entry.description
      : `${entry.description.slice(0, MAX_DESCRIPTION_LENGTH).trimEnd()}…`;
  const hidePaymentMeta = entry.referenceType === "PAYMENT";

  return (
    <div className="max-w-md space-y-1">
      <p className="text-sm break-words whitespace-pre-wrap">{displayText}</p>
      {shouldTruncate && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-xs text-primary hover:underline focus:outline-none"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
      {entry.paymentMethod && !hidePaymentMeta && (
        <p className="text-xs text-muted-foreground">
          Method: {entry.paymentMethod}
        </p>
      )}
      {entry.referenceNumber && !hidePaymentMeta && (
        <p className="text-xs text-muted-foreground">
          Ref: {entry.referenceNumber}
        </p>
      )}
    </div>
  );
};

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
      return <DescriptionCell entry={entry} />;
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
