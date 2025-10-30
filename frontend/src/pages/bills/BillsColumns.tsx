import type { ColumnDef } from "@tanstack/react-table";
import type { BillResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Eye } from "lucide-react";

interface ColumnsProps {
  onViewItems: (bill: BillResponse) => void;
  onViewPayments: (bill: BillResponse) => void;
}

export const getBillsColumns = ({
  onViewItems,
  onViewPayments,
}: ColumnsProps): ColumnDef<BillResponse>[] => [
  {
    accessorKey: "billNo",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Bill No
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium">{row.original.billNo}</div>,
  },
  {
    accessorKey: "billDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return new Date(row.original.billDate).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    accessorKey: "customerName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Customer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.original.customerName}>
        {row.original.customerName}
      </div>
    ),
  },
  {
    accessorKey: "rateType",
    header: "Rate Type",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original.rateType}</Badge>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-right font-medium">
        ₹
        {row.original.totalAmount.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>
    ),
  },
  {
    accessorKey: "discountAmount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Discount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-right">
        ₹
        {row.original.discountAmount.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>
    ),
  },
  {
    accessorKey: "taxAmount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tax
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-right">
        ₹
        {row.original.taxAmount.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>
    ),
  },
  {
    accessorKey: "netAmount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Net Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-right font-semibold">
        ₹
        {row.original.netAmount.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      if (!row.original.createdAt) return "-";
      return new Date(row.original.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: ({ row }) => {
      if (!row.original.updatedAt) return "-";
      return new Date(row.original.updatedAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    id: "items",
    header: "Items",
    cell: ({ row }) => {
      const bill = row.original;
      return (
        <div className="text-center">
          <Button variant="outline" size="sm" onClick={() => onViewItems(bill)}>
            <Eye className="h-4 w-4 mr-1" />
            View ({bill.billItems?.length || 0})
          </Button>
        </div>
      );
    },
  },
  {
    id: "payments",
    header: "Payments",
    cell: ({ row }) => {
      const bill = row.original;
      return (
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewPayments(bill)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View ({bill.payments?.length || 0})
          </Button>
        </div>
      );
    },
  },
];
