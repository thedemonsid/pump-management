import type { ColumnDef } from "@tanstack/react-table";
import type { ProductSalesUnitChangeLog } from "@/types/product-sales-unit-change-log";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";
import { format, parseISO } from "date-fns";

const getPriceChangeIndicator = (
  oldPrice: number | null | undefined,
  newPrice: number | null | undefined
) => {
  if (!oldPrice || !newPrice) return null;

  const difference = newPrice - oldPrice;
  const percentChange = ((difference / oldPrice) * 100).toFixed(2);

  if (difference > 0) {
    return (
      <div className="flex items-center gap-1 text-red-600">
        <TrendingUp className="h-4 w-4" />
        <span className="text-sm font-medium">
          +₹{difference.toFixed(2)} ({percentChange}%)
        </span>
      </div>
    );
  } else if (difference < 0) {
    return (
      <div className="flex items-center gap-1 text-green-600">
        <TrendingDown className="h-4 w-4" />
        <span className="text-sm font-medium">
          -₹{Math.abs(difference).toFixed(2)} ({Math.abs(Number(percentChange))}
          %)
        </span>
      </div>
    );
  }

  return <span className="text-sm text-muted-foreground">No change</span>;
};

export const getProductSalesUnitChangeColumns =
  (): ColumnDef<ProductSalesUnitChangeLog>[] => [
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date & Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">
          {format(parseISO(row.original.createdAt), "dd MMM yyyy")}
          <br />
          <span className="text-xs text-muted-foreground">
            {format(parseISO(row.original.createdAt), "hh:mm a")}
          </span>
        </div>
      ),
    },
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
        <div className="font-medium">{row.original.productName}</div>
      ),
    },
    {
      accessorKey: "productType",
      header: "Type",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.productType === "FUEL" ? "default" : "secondary"
          }
        >
          {row.original.productType}
        </Badge>
      ),
    },
    {
      id: "unitChange",
      header: "Unit Change",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {row.original.oldSalesUnit}
            </span>
            <span className="text-xs">→</span>
            <span className="text-sm font-medium">
              {row.original.newSalesUnit}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "priceChange",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Price Change
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      accessorFn: (row) => row.newSalesRate ?? 0,
      cell: ({ row }) => {
        const log = row.original;
        if (log.oldSalesRate && log.newSalesRate) {
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  ₹{log.oldSalesRate.toFixed(2)}
                </span>
                <span className="text-xs">→</span>
                <span className="font-medium">
                  ₹{log.newSalesRate.toFixed(2)}
                </span>
              </div>
              {getPriceChangeIndicator(log.oldSalesRate, log.newSalesRate)}
            </div>
          );
        }
        return <span className="text-sm text-muted-foreground">N/A</span>;
      },
    },
    {
      accessorKey: "changedBy",
      header: "Changed By",
      cell: ({ row }) => (
        <div className="text-sm">{row.original.changedBy || "System"}</div>
      ),
    },
    {
      accessorKey: "changeReason",
      header: "Reason",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground max-w-xs truncate">
          {row.original.changeReason || "-"}
        </div>
      ),
    },
  ];
