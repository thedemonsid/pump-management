"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Purchase } from "@/types/purchase";

export interface LedgerEntry {
  date: string;
  invoiceNo: string;
  productName?: string;
  fuelPurchaseDetails?: {
    productName: string;
    quantity: number;
    purchaseRate: number;
  };
  purchaseDetails?: Purchase;
  purchaseAmount: number;
  amountPaid: number;
  balanceAmount: number;
  entryBy: string;
  comments: string;
}

export const columns: ColumnDef<LedgerEntry>[] = [
  {
    accessorKey: "date",
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
      const date = row.getValue("date") as string;
      return new Date(date).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    },
  },
  {
    accessorKey: "invoiceNo",
    header: "Invoice No.",
    cell: ({ row }) => {
      const invoiceNo = row.getValue("invoiceNo") as string;
      return <div className="font-mono text-sm">{invoiceNo}</div>;
    },
  },
  {
    accessorKey: "productName",
    header: "Product Name",
    cell: ({ row }) => {
      const entry = row.original;
      const productName =
        entry.purchaseDetails?.purchaseItems?.[0]?.productName ||
        entry.fuelPurchaseDetails?.productName ||
        "-";
      return <div className="text-sm">{productName}</div>;
    },
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
      const entry = row.original;
      const quantity =
        entry.purchaseDetails?.purchaseItems?.reduce(
          (sum, item) => sum + item.quantity,
          0
        ) || entry.fuelPurchaseDetails?.quantity;
      return <div className="text-right text-sm">{quantity || "-"}</div>;
    },
  },
  {
    accessorKey: "rate",
    header: "Rate",
    cell: ({ row }) => {
      const entry = row.original;
      const rate =
        entry.purchaseDetails?.purchaseItems?.[0]?.purchaseRate ||
        entry.fuelPurchaseDetails?.purchaseRate;
      if (!rate) return <div className="text-right">-</div>;

      return (
        <div className="text-right text-sm">
          ₹{rate.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </div>
      );
    },
  },
  {
    accessorKey: "purchaseAmount",
    header: "Purchase Amount",
    cell: ({ row }) => {
      const amount = row.getValue("purchaseAmount") as number;
      if (amount <= 0) return <div className="text-right">-</div>;

      return (
        <div className="text-right font-medium">
          ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </div>
      );
    },
  },
  {
    accessorKey: "amountPaid",
    header: "Payment Amount",
    cell: ({ row }) => {
      const amount = row.getValue("amountPaid") as number;
      if (amount <= 0) return <div className="text-right">-</div>;

      return (
        <div className="text-right font-medium">
          ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </div>
      );
    },
  },
  {
    accessorKey: "balanceAmount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Running Balance
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const balance = row.getValue("balanceAmount") as number;
      const isNegative = balance < 0;

      return (
        <div
          className={`text-right font-bold ${
            isNegative ? "text-red-600" : "text-green-600"
          }`}
        >
          ₹
          {Math.abs(balance).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })}
          {isNegative && " (Adv.)"}
        </div>
      );
    },
  },
  {
    accessorKey: "entryBy",
    header: "Entry By",
    cell: ({ row }) => {
      const entryBy = row.getValue("entryBy") as string;
      return <div className="text-sm text-muted-foreground">{entryBy}</div>;
    },
  },
  {
    accessorKey: "comments",
    header: "Comments",
    cell: ({ row }) => {
      const comments = row.getValue("comments") as string;
      return (
        <div className="text-sm max-w-xs truncate" title={comments}>
          {comments}
        </div>
      );
    },
  },
];
