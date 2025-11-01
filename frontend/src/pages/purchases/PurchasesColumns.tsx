import type { ColumnDef } from "@tanstack/react-table";
import type { Purchase } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Pencil, Eye } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/index";

interface ColumnsProps {
  onEdit: (purchase: Purchase) => void;
  onViewItems: (purchase: Purchase) => void;
}

export const getPurchaseColumns = ({
  onEdit,
  onViewItems,
}: ColumnsProps): ColumnDef<Purchase>[] => [
  {
    accessorKey: "invoiceNumber",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Invoice No
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.original.invoiceNumber}</div>
    ),
  },
  {
    accessorKey: "purchaseDate",
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
    cell: ({ row }) => formatDate(row.original.purchaseDate),
  },
  {
    accessorKey: "supplierName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Supplier
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => row.original.supplierName,
  },
  {
    id: "items",
    header: "Items",
    cell: ({ row }) => {
      const purchase = row.original;
      if (purchase.purchaseItems && purchase.purchaseItems.length > 0) {
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewItems(purchase)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View {purchase.purchaseItems.length} item(s)
          </Button>
        );
      }
      return <span className="text-sm text-muted-foreground">No items</span>;
    },
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
    cell: ({ row }) => formatCurrency(row.original.totalAmount || 0),
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
      <span className="font-semibold">
        {formatCurrency(row.original.netAmount || 0)}
      </span>
    ),
  },
  {
    accessorKey: "paymentType",
    header: "Payment Type",
    cell: ({ row }) => (
      <Badge
        variant={row.original.paymentType === "CASH" ? "default" : "secondary"}
      >
        {row.original.paymentType}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const purchase = row.original;
      return (
        <Button variant="outline" size="sm" onClick={() => onEdit(purchase)}>
          <Pencil className="h-4 w-4" />
        </Button>
      );
    },
  },
];
