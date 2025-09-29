'use client';

import type { ColumnDef } from '@tanstack/react-table';
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { Tank } from '@/types';

interface TableMeta {
  onView?: (tank: Tank) => void;
  onEdit?: (tank: Tank) => void;
  onDelete?: (id: string) => void;
  currentBalances?: Record<string, number>;
  balancesLoading?: Record<string, boolean>;
  deletingId?: string | null;
}

export const columns: ColumnDef<Tank>[] = [
  {
    accessorKey: 'tankName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Tank Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const tank = row.original;
      return <div className="font-medium">{tank.tankName}</div>;
    },
  },
  {
    accessorKey: 'product.productName',
    header: 'Product',
    cell: ({ row }) => {
      const tank = row.original;
      return <div>{tank.product?.productName || 'No Product'}</div>;
    },
  },
  {
    accessorKey: 'capacity',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Capacity (L)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const tank = row.original;
      const formatCapacity = (capacity: number) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'decimal',
          maximumFractionDigits: 2,
        }).format(capacity);
      };
      return <div className="font-mono">{formatCapacity(tank.capacity)} L</div>;
    },
  },
  {
    accessorKey: 'currentLevel',
    header: 'Current Level (L)',
    cell: ({ row, table }) => {
      const tank = row.original;
      const meta = table.options.meta as TableMeta | undefined;
      const currentBalances = meta?.currentBalances || {};
      const balancesLoading = meta?.balancesLoading || {};

      const formatVolume = (volume: number) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'decimal',
          maximumFractionDigits: 2,
        }).format(volume);
      };

      if (balancesLoading[tank.id!]) {
        return (
          <div className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Calculating...</span>
          </div>
        );
      }

      return (
        <div className="font-mono">
          {formatVolume(currentBalances[tank.id!] ?? tank.currentLevel ?? 0)} L
        </div>
      );
    },
  },
  {
    accessorKey: 'fillPercentage',
    header: 'Fill %',
    cell: ({ row, table }) => {
      const tank = row.original;
      const meta = table.options.meta as TableMeta | undefined;
      const currentBalances = meta?.currentBalances || {};

      const currentLevel = currentBalances[tank.id!] ?? tank.currentLevel ?? 0;
      const fillPercentage =
        tank.capacity > 0 ? (currentLevel / tank.capacity) * 100 : 0;

      return (
        <div className="flex items-center gap-2">
          {fillPercentage > 0 ? (
            <>
              <div className="w-12 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    fillPercentage >= 50
                      ? 'bg-green-500'
                      : fillPercentage >= 25
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{
                    width: `${Math.min(fillPercentage, 100)}%`,
                  }}
                ></div>
              </div>
              <span className="text-sm">{fillPercentage.toFixed(1)}%</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">N/A</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'isLowLevel',
    header: 'Level Status',
    cell: ({ row, table }) => {
      const tank = row.original;
      const meta = table.options.meta as TableMeta | undefined;
      const currentBalances = meta?.currentBalances || {};

      const currentLevel = currentBalances[tank.id!] ?? tank.currentLevel ?? 0;
      const isLowLevel = currentLevel <= (tank.lowLevelAlert ?? 0);

      return isLowLevel ? (
        <Badge variant="destructive">Low Level</Badge>
      ) : (
        <Badge variant="secondary">Normal</Badge>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row, table }) => {
      const tank = row.original;

      const meta = table.options.meta as TableMeta | undefined;
      const onView = meta?.onView;
      const onEdit = meta?.onEdit;
      const onDelete = meta?.onDelete;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(tank.id!)}
            >
              Copy tank ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {onView && (
              <DropdownMenuItem onClick={() => onView(tank)}>
                <Eye className="mr-2 h-4 w-4" />
                View Ledger
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(tank)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {onDelete && tank.id && (
              <DropdownMenuItem
                onClick={() => onDelete(tank.id!)}
                className="text-red-600"
                disabled={meta?.deletingId === tank.id}
              >
                {meta?.deletingId === tank.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
