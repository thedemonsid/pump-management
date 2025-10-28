import type { ColumnDef } from "@tanstack/react-table";
import type { ExpenseResponse } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ArrowUpDown } from "lucide-react";

export const createColumns = (
  onEdit: (expense: ExpenseResponse) => void,
  onDelete: (id: string) => void,
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(row.original.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          },
        } as ColumnDef<ExpenseResponse>,
      ]
    : []),
];
