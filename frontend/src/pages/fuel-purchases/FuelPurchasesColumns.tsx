import type { ColumnDef } from "@tanstack/react-table";
import type { FuelPurchase } from "@/types";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2, Calendar } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/index";
import { ArrowUpDown } from "lucide-react";

interface FuelPurchaseColumnsProps {
  onEdit: (fuelPurchase: FuelPurchase) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
}

export const getFuelPurchaseColumns = ({
  onEdit,
  onDelete,
  deletingId,
}: FuelPurchaseColumnsProps): ColumnDef<FuelPurchase>[] => [
  {
    accessorKey: "fuelPurchaseId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Purchase ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">#{row.original.fuelPurchaseId}</div>
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
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        {formatDate(row.original.purchaseDate)}
      </div>
    ),
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
  },
  {
    accessorKey: "invoiceNumber",
    header: "Invoice #",
  },
  {
    accessorKey: "tankName",
    header: "Tank",
  },
  {
    accessorKey: "productName",
    header: "Product",
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div>
        {row.original.quantity} {row.original.purchaseUnit}
      </div>
    ),
  },
  {
    accessorKey: "purchaseRate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Rate
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => formatCurrency(row.original.purchaseRate),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-semibold">{formatCurrency(row.original.amount)}</div>
    ),
  },
  {
    accessorKey: "taxPercentage",
    header: "Tax %",
    cell: ({ row }) => `${row.original.taxPercentage}%`,
  },
  {
    accessorKey: "vehicleNumber",
    header: "Vehicle",
    cell: ({ row }) => row.original.vehicleNumber || "N/A",
  },
  {
    accessorKey: "driverName",
    header: "Driver",
    cell: ({ row }) => row.original.driverName || "N/A",
  },
  {
    accessorKey: "goodsReceivedBy",
    header: "Received By",
    cell: ({ row }) => row.original.goodsReceivedBy || "N/A",
  },
  {
    accessorKey: "bfrDipReading",
    header: "Before DIP",
  },
  {
    accessorKey: "aftDipReading",
    header: "After DIP",
  },
  {
    accessorKey: "bfrDensity",
    header: "Before Density",
  },
  {
    accessorKey: "aftDensity",
    header: "After Density",
  },
  {
    accessorKey: "readingKm",
    header: "Reading KM",
    cell: ({ row }) => row.original.readingKm || "N/A",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const fuelPurchase = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(fuelPurchase)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fuelPurchase.id && onDelete(fuelPurchase.id)}
            disabled={deletingId === fuelPurchase.id}
          >
            {deletingId === fuelPurchase.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      );
    },
  },
];
