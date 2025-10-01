"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import type { LedgerEntry } from "@/types/ledger";

export const ledgerColumns: ColumnDef<LedgerEntry>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const entry = row.original;
      return (
        <div className="font-medium">
          {new Date(entry.date).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "invoiceNo",
    header: "Invoice No.",
    cell: ({ row }) => {
      const entry = row.original;
      return <div className="font-mono text-sm">{entry.invoiceNo}</div>;
    },
  },
  {
    accessorKey: "billDetails",
    header: "Bill Details",
    cell: ({ row }) => {
      const entry = row.original;
      return entry.billDetails ? (
        <div className="space-y-1">
          <div className="font-medium">Bill #{entry.billDetails.billNo}</div>
          <div className="text-xs text-muted-foreground">
            {entry.billDetails.billItems.length} item(s)
          </div>
        </div>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "billAmount",
    header: "Bill Amount",
    cell: ({ row }) => {
      const entry = row.original;
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount);
      };

      return (
        <div className="text-right font-medium">
          {entry.billAmount > 0 ? formatCurrency(entry.billAmount) : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "amountPaid",
    header: "Payment Amount",
    cell: ({ row }) => {
      const entry = row.original;
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount);
      };

      const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      };

      return (
        <div className="text-right font-medium">
          {entry.amountPaid > 0 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  {formatCurrency(entry.amountPaid)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <div className="font-medium">Payment Details</div>
                  {entry.type === "bill" && entry.billDetails?.payments ? (
                    <div className="mt-1 space-y-1">
                      {entry.billDetails.payments.map((p, idx) => (
                        <div key={idx}>
                          <div>Amount: {formatCurrency(p.amount)}</div>
                          <div>Method: {p.paymentMethod}</div>
                          <div>Date: {formatDate(p.paymentDate)}</div>
                          {p.referenceNumber && (
                            <div>Ref: {p.referenceNumber}</div>
                          )}
                          {p.notes && <div>Notes: {p.notes}</div>}
                        </div>
                      ))}
                    </div>
                  ) : entry.type === "payment" && entry.paymentDetails ? (
                    <div className="mt-1 space-y-1">
                      <div>Method: {entry.paymentDetails.paymentMethod}</div>
                      <div>
                        Amount: {formatCurrency(entry.paymentDetails.amount)}
                      </div>
                      {entry.paymentDetails.referenceNumber && (
                        <div>Ref: {entry.paymentDetails.referenceNumber}</div>
                      )}
                      {entry.paymentDetails.notes && (
                        <div>Notes: {entry.paymentDetails.notes}</div>
                      )}
                    </div>
                  ) : null}
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            "-"
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "balanceAmount",
    header: "Running Balance",
    cell: ({ row }) => {
      const entry = row.original;
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount);
      };

      return (
        <div
          className={`text-right font-bold ${
            entry.balanceAmount >= 0 ? "text-red-600" : "text-green-600"
          }`}
        >
          {formatCurrency(Math.abs(entry.balanceAmount))}
          {entry.balanceAmount < 0 && " (Credit)"}
        </div>
      );
    },
  },
  {
    accessorKey: "entryBy",
    header: "Entry By",
    cell: ({ row }) => {
      const entry = row.original;
      return (
        <div className="text-sm text-muted-foreground">{entry.entryBy}</div>
      );
    },
  },
  {
    accessorKey: "comments",
    header: "Comments",
    cell: ({ row }) => {
      const entry = row.original;
      return <div className="text-sm max-w-xs truncate">{entry.comments}</div>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const entry = row.original;

      if (entry.type === "bill" && entry.billDetails) {
        return (
          <Link to={`/bills/${entry.billDetails!.id}`}>
            <Eye className="h-4 w-4 text-blue-600 hover:text-blue-800 cursor-pointer" />
          </Link>
        );
      }

      return null;
    },
  },
];
