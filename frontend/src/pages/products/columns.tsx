"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils/index";

interface TableMeta {
  onEdit?: (product: Product) => void;
}

export const columns: ColumnDef<Product>[] = [
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
    cell: ({ row }) => {
      const product = row.original;
      return <div className="font-medium">{product.productName}</div>;
    },
  },
  {
    accessorKey: "alias",
    header: "Alias",
    cell: ({ row }) => {
      const product = row.original;
      return <Badge variant="secondary">{product.alias}</Badge>;
    },
  },
  {
    accessorKey: "productType",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Product Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const product = row.original;
      return <Badge variant="outline">{product.productType}</Badge>;
    },
  },
  {
    accessorKey: "hsnCode",
    header: "HSN Code",
    cell: ({ row }) => {
      const product = row.original;
      return <div className="font-mono text-sm">{product.hsnCode}</div>;
    },
  },
  {
    accessorKey: "gstPercentage",
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
    cell: ({ row }) => {
      const product = row.original;
      return <Badge variant="outline">{product.gstPercentage}%</Badge>;
    },
  },
  {
    accessorKey: "purchaseRate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Purchase Rate
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const product = row.original;
      return <div>{formatCurrency(product.purchaseRate)}</div>;
    },
  },
  {
    accessorKey: "salesRate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Sales Rate
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const product = row.original;
      return <div>{formatCurrency(product.salesRate)}</div>;
    },
  },
  {
    accessorKey: "salesUnit",
    header: "Units",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div>
          {product.salesUnit}
          {product.salesUnit !== product.purchaseUnit &&
            ` / ${product.purchaseUnit}`}
        </div>
      );
    },
  },
  {
    accessorKey: "lowStockCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Low Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const product = row.original;
      return (
        <Badge variant={product.lowStockCount < 50 ? "destructive" : "outline"}>
          {product.lowStockCount}
        </Badge>
      );
    },
  },
  {
    accessorKey: "openingBalance",
    header: "Opening Balance",
    cell: ({ row }) => {
      const product = row.original;
      return product.productType === "GENERAL" ? (
        <Badge
          variant={
            (product.openingBalance ?? 0) < 0 ? "destructive" : "secondary"
          }
        >
          {product.openingBalance ?? 0}
        </Badge>
      ) : (
        <span className="text-muted-foreground text-sm">N/A</span>
      );
    },
  },
  {
    accessorKey: "stockQuantity",
    header: "Stock Quantity",
    cell: ({ row }) => {
      const product = row.original;
      return product.productType === "GENERAL" ? (
        <Badge
          variant={
            (product.stockQuantity ?? 0) < product.lowStockCount
              ? "destructive"
              : "secondary"
          }
        >
          {product.stockQuantity ?? 0} {product.salesUnit}
        </Badge>
      ) : (
        <span className="text-muted-foreground text-sm">N/A</span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row, table }) => {
      const product = row.original;
      const meta = table.options.meta as TableMeta | undefined;
      const onEdit = meta?.onEdit;

      return (
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button variant="ghost" size="icon" onClick={() => onEdit(product)}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];
