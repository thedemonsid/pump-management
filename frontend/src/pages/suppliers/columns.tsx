'use client';

import type { ColumnDef } from '@tanstack/react-table';
import {
  ArrowUpDown,
  MoreHorizontal,
  Phone,
  Mail,
  Eye,
  Pencil,
  Trash2,
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
import type { Supplier } from '@/types';

interface TableMeta {
  onView?: (supplier: Supplier) => void;
  onEdit?: (supplier: Supplier) => void;
  onDelete?: (id: string) => void;
}

export const columns: ColumnDef<Supplier>[] = [
  {
    accessorKey: 'supplierName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Supplier Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const supplier = row.original;
      return <div className="font-medium">{supplier.supplierName}</div>;
    },
  },
  {
    accessorKey: 'contactPersonName',
    header: 'Contact Person',
  },
  {
    accessorKey: 'contactNumber',
    header: 'Contact Number',
    cell: ({ row }) => {
      const supplier = row.original;
      return (
        <div className="flex items-center gap-1">
          <Phone className="h-3 w-3" />
          {supplier.contactNumber}
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const supplier = row.original;
      return supplier.email ? (
        <div className="flex items-center gap-1">
          <Mail className="h-3 w-3" />
          {supplier.email}
        </div>
      ) : null;
    },
  },
  {
    accessorKey: 'gstNumber',
    header: 'GST Number',
    cell: ({ row }) => {
      const supplier = row.original;
      return <div className="font-mono text-sm">{supplier.gstNumber}</div>;
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
      const supplier = row.original;
      const balance = supplier.openingBalance;
      if (balance === undefined || balance === null) return '-';

      return (
        <div
          className={`font-mono ${
            balance < 0 ? 'text-red-600' : 'text-green-600'
          }`}
        >
          ₹{balance.toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: 'openingBalanceDate',
    header: 'Opening Balance Date',
    cell: ({ row }) => {
      const supplier = row.original;
      return supplier.openingBalanceDate
        ? new Date(supplier.openingBalanceDate).toLocaleDateString()
        : '-';
    },
  },
  {
    accessorKey: 'address',
    header: 'Address',
    cell: ({ row }) => {
      const supplier = row.original;
      return (
        <div className="max-w-xs truncate" title={supplier.address}>
          {supplier.address}
        </div>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row, table }) => {
      const supplier = row.original;

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
              onClick={() => navigator.clipboard.writeText(supplier.id!)}
            >
              Copy supplier ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {onView && (
              <DropdownMenuItem onClick={() => onView(supplier)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(supplier)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {onDelete && supplier.id && (
              <DropdownMenuItem
                onClick={() => onDelete(supplier.id!)}
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
