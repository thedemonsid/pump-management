"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Phone, MapPin, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Customer } from "@/types";

interface TableMeta {
  onView?: (customer: Customer) => void;
  onEdit?: (customer: Customer) => void;
  onDelete?: (id: string) => void;
}

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "customerName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Customer Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const customer = row.original;
      return <div className="font-medium">{customer.customerName}</div>;
    },
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="flex items-center gap-1">
          <Phone className="h-3 w-3" />
          {customer.phoneNumber}
        </div>
      );
    },
  },
  {
    accessorKey: "gstNumber",
    header: "GST Number",
    cell: ({ row }) => {
      const customer = row.original;
      return <div className="font-mono text-sm">{customer.gstNumber}</div>;
    },
  },
  {
    accessorKey: "panNumber",
    header: "PAN Number",
    cell: ({ row }) => {
      const customer = row.original;
      return <div className="font-mono text-sm">{customer.panNumber}</div>;
    },
  },
  {
    accessorKey: "creditLimit",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Credit Limit
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="font-mono">
          ₹{customer.creditLimit.toLocaleString()}
        </div>
      );
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
      const customer = row.original;
      if (
        customer.openingBalance === undefined ||
        customer.openingBalance === null
      )
        return "-";

      return (
        <div
          className={`font-mono ${
            customer.openingBalance > 0 ? "text-red-600" : "text-green-600"
          }`}
        >
          ₹{customer.openingBalance.toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: "openingBalanceDate",
    header: "Opening Balance Date",
    cell: ({ row }) => {
      const customer = row.original;
      return customer.openingBalanceDate
        ? new Date(customer.openingBalanceDate).toLocaleDateString()
        : "-";
    },
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="max-w-xs truncate" title={customer.address}>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{customer.address}</span>
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row, table }) => {
      const customer = row.original;

      // Get the actions from the table props if available
      const meta = table.options.meta as TableMeta | undefined;
      const onView = meta?.onView;
      const onEdit = meta?.onEdit;
      const onDelete = meta?.onDelete;

      return (
        <div className="flex items-center gap-2">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(customer)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
          )}
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(customer)}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onDelete && customer.id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(customer.id!)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];
