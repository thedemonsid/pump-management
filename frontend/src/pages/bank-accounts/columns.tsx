"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BankAccount } from "@/types";

interface TableMeta {
  onView?: (bankAccount: BankAccount) => void;
  onEdit?: (bankAccount: BankAccount) => void;
  currentBalances?: Record<string, number>;
  balancesLoading?: Record<string, boolean>;
}

export const columns: ColumnDef<BankAccount>[] = [
  {
    accessorKey: "accountHolderName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Account Holder
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const bankAccount = row.original;
      return <div className="font-medium">{bankAccount.accountHolderName}</div>;
    },
  },
  {
    accessorKey: "accountNumber",
    header: "Account Number",
    cell: ({ row }) => {
      const bankAccount = row.original;
      return (
        <div className="font-mono text-sm">{bankAccount.accountNumber}</div>
      );
    },
  },
  {
    accessorKey: "bank",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Bank
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "branch",
    header: "Branch",
  },
  {
    accessorKey: "ifscCode",
    header: "IFSC Code",
    cell: ({ row }) => {
      const bankAccount = row.original;
      return <div className="font-mono text-sm">{bankAccount.ifscCode}</div>;
    },
  },
  {
    accessorKey: "openingBalance",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Opening Balance
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const bankAccount = row.original;
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount);
      };

      return (
        <div className="font-mono">
          {formatCurrency(bankAccount.openingBalance)}
        </div>
      );
    },
  },
  {
    accessorKey: "currentBalance",
    header: "Current Balance",
    cell: ({ row, table }) => {
      const bankAccount = row.original;
      const meta = table.options.meta as TableMeta | undefined;
      const currentBalances = meta?.currentBalances || {};
      const balancesLoading = meta?.balancesLoading || {};

      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount);
      };

      if (balancesLoading[bankAccount.id!]) {
        return (
          <div className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Calculating...</span>
          </div>
        );
      }

      return (
        <div className="font-mono">
          {formatCurrency(
            currentBalances[bankAccount.id!] ??
              bankAccount.currentBalance ??
              bankAccount.openingBalance
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "openingBalanceDate",
    header: "Opening Date",
    cell: ({ row }) => {
      const bankAccount = row.original;
      return bankAccount.openingBalanceDate
        ? new Date(bankAccount.openingBalanceDate).toLocaleDateString()
        : "-";
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row, table }) => {
      const bankAccount = row.original;

      // Get the actions from the table props if available
      const meta = table.options.meta as TableMeta | undefined;
      const onView = meta?.onView;
      const onEdit = meta?.onEdit;

      return (
        <div className="flex items-center gap-2">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(bankAccount)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Ledger
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(bankAccount)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];
