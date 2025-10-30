import type { ColumnDef } from "@tanstack/react-table";
import type { ExpenseResponse } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, ArrowUpDown, Image as ImageIcon } from "lucide-react";

export const createColumns = (
  onEdit: (expense: ExpenseResponse) => void,
  onImageClick: (imageId: string, title: string) => void,
  isAdmin: boolean = true
): ColumnDef<ExpenseResponse>[] => [
  {
    accessorKey: "expenseDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent px-0"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("expenseDate"));
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "expenseHeadName",
    header: "Expense Head",
    cell: ({ row }) => {
      const headName = row.getValue("expenseHeadName") as string | undefined;
      return <div className="font-medium">{headName || "-"}</div>;
    },
  },
  {
    accessorKey: "expenseType",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("expenseType") as string;
      return (
        <Badge variant={type === "SALESMAN_SHIFT" ? "default" : "secondary"}>
          {type === "SALESMAN_SHIFT" ? "Shift" : "Bank"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent px-0"
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "referenceNumber",
    header: "Reference",
    cell: ({ row }) => {
      const reference = row.getValue("referenceNumber") as string | undefined;
      return <div className="max-w-[150px] truncate">{reference || "-"}</div>;
    },
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: ({ row }) => {
      const remarks = row.getValue("remarks") as string | undefined;
      return (
        <div className="max-w-[200px] truncate" title={remarks}>
          {remarks || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "fileStorageId",
    header: () => <div className="text-center">Image</div>,
    cell: ({ row }) => {
      const fileStorageId = row.original.fileStorageId;
      return (
        <div className="flex justify-center">
          {fileStorageId ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onImageClick(fileStorageId, "Receipt/Invoice")}
            >
              <div className="relative group">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 text-blue-600" />
                </div>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  View
                </span>
              </div>
            </Button>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )}
        </div>
      );
    },
  },
  ...(isAdmin
    ? [
        {
          id: "actions",
          header: () => <div className="text-right">Actions</div>,
          cell: ({ row }: { row: { original: ExpenseResponse } }) => {
            return (
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(row.original)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            );
          },
        } as ColumnDef<ExpenseResponse>,
      ]
    : []),
];
