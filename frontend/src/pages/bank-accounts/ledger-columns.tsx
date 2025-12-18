"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { BankAccountLedgerEntry } from "@/types/bank-account-ledger";
import { format } from "date-fns";

export const ledgerColumns: ColumnDef<BankAccountLedgerEntry>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const entry = row.original;
      return (
        <div className="font-medium">{format(new Date(entry.date), "PPP")}</div>
      );
    },
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const entry = row.original;
      return <div className="font-medium">{entry.action}</div>;
    },
  },
  {
    accessorKey: "credit",
    header: "Credit",
    cell: ({ row }) => {
      const entry = row.original;
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount);
      };

      return (
        <div className="text-right font-medium text-green-600">
          {entry.credit > 0 ? formatCurrency(entry.credit) : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "debit",
    header: "Debit",
    cell: ({ row }) => {
      const entry = row.original;
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount);
      };

      return (
        <div className="text-right font-medium text-red-600">
          {entry.debit > 0 ? formatCurrency(entry.debit) : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => {
      const entry = row.original;
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount);
      };

      return (
        <div
          className={`text-right font-bold ${
            entry.balance >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {formatCurrency(Math.abs(entry.balance))}
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
        <div className="text-sm max-w-xs truncate">{entry.description}</div>
      );
    },
  },
  {
    accessorKey: "entryBy",
    header: "Entry By",
    cell: ({ row }) => {
      const entry = row.original;
      return <div className="text-sm">{entry.entryBy || "-"}</div>;
    },
  },
];
