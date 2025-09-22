'use client';

import type { ColumnDef } from '@tanstack/react-table';
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BankAccount } from '@/types';

interface TableMeta {
  onView?: (bankAccount: BankAccount) => void;
  onEdit?: (bankAccount: BankAccount) => void;
  onDelete?: (id: string) => void;
  currentBalances?: Record<string, number>;
  balancesLoading?: Record<string, boolean>;
}

export const columns: ColumnDef<BankAccount>[] = [
  {
    accessorKey: 'accountHolderName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
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
    accessorKey: 'accountNumber',
    header: 'Account Number',
    cell: ({ row }) => {
      const bankAccount = row.original;
      return (
        <div className="font-mono text-sm">{bankAccount.accountNumber}</div>
      );
    },
  },
  {
    accessorKey: 'bank',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Bank
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'branch',
    header: 'Branch',
  },
  {
    accessorKey: 'ifscCode',
    header: 'IFSC Code',
    cell: ({ row }) => {
      const bankAccount = row.original;
      return <div className="font-mono text-sm">{bankAccount.ifscCode}</div>;
    },
  },
  {
    accessorKey: 'openingBalance',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Opening Balance
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const bankAccount = row.original;
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
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
    accessorKey: 'currentBalance',
    header: 'Current Balance',
    cell: ({ row, table }) => {
      const bankAccount = row.original;
      const meta = table.options.meta as TableMeta | undefined;
      const currentBalances = meta?.currentBalances || {};
      const balancesLoading = meta?.balancesLoading || {};

      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
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
    accessorKey: 'openingBalanceDate',
    header: 'Opening Date',
    cell: ({ row }) => {
      const bankAccount = row.original;
      return bankAccount.openingBalanceDate
        ? new Date(bankAccount.openingBalanceDate).toLocaleDateString()
        : '-';
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row, table }) => {
      const bankAccount = row.original;

      // Get the actions from the table props if available
      const meta = table.options.meta as TableMeta | undefined;
      const onView = meta?.onView;
      const onEdit = meta?.onEdit;
      const onDelete = meta?.onDelete;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(bankAccount.id!)}
            >
              Copy bank account ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {onView && (
              <DropdownMenuItem onClick={() => onView(bankAccount)}>
                <Eye className="mr-2 h-4 w-4" />
                View Ledger
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(bankAccount)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {onDelete && bankAccount.id && (
              <DropdownMenuItem
                onClick={() => onDelete(bankAccount.id!)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
