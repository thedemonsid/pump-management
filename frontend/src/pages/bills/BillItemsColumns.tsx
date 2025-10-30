import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export interface BillItem {
  id?: string;
  productId: string;
  productName?: string;
  quantity: number;
  salesUnit?: string;
  rate: number;
  hsnCode?: string;
  discount: number;
  gst: number;
  netAmount: number;
}

export const getBillItemsColumns = (): ColumnDef<BillItem>[] => [
  {
    accessorKey: "productName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Product Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.productName || `Product ${row.original.productId}`}
      </div>
    ),
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
    cell: ({ row }) => <div>{row.original.quantity}</div>,
  },
  {
    accessorKey: "salesUnit",
    header: "Unit",
    cell: ({ row }) => <div>{row.original.salesUnit || "-"}</div>,
  },
  {
    accessorKey: "rate",
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
    cell: ({ row }) => <div>₹{row.original.rate.toLocaleString("en-IN")}</div>,
  },
  {
    accessorKey: "hsnCode",
    header: "HSN Code",
    cell: ({ row }) => <div>{row.original.hsnCode || "-"}</div>,
  },
  {
    accessorKey: "discount",
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
      <div className={row.original.discount > 0 ? "text-green-600" : ""}>
        ₹{row.original.discount.toLocaleString("en-IN")}
      </div>
    ),
  },
  {
    accessorKey: "gst",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          GST %
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.original.gst}%</div>,
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
      <div className="font-semibold text-lg">
        ₹{row.original.netAmount.toLocaleString("en-IN")}
      </div>
    ),
  },
];
