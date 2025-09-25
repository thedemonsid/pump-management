'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { TankLedgerEntry } from '@/types/tank-transaction';

export const tankLedgerColumns: ColumnDef<TankLedgerEntry>[] = [
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
      const entry = row.original;
      return (
        <div className="font-medium">
          {new Date(entry.date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })}
        </div>
      );
    },
  },
  {
    accessorKey: 'action',
    header: 'Action',
    cell: ({ row }) => {
      const entry = row.original;
      return <div className="font-medium">{entry.action}</div>;
    },
  },
  {
    accessorKey: 'creditVolume',
    header: 'Credit Volume (L)',
    cell: ({ row }) => {
      const entry = row.original;
      const formatVolume = (volume: number) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'decimal',
          maximumFractionDigits: 2,
        }).format(volume);
      };

      return (
        <div className="text-right font-medium text-green-600">
          {entry.type === 'addition' ? formatVolume(entry.volume) : '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'debtVolume',
    header: 'Debt Volume (L)',
    cell: ({ row }) => {
      const entry = row.original;
      const formatVolume = (volume: number) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'decimal',
          maximumFractionDigits: 2,
        }).format(volume);
      };

      return (
        <div className="text-right font-medium text-red-600">
          {entry.type === 'removal' ? formatVolume(entry.volume) : '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'currentVolume',
    header: 'Current Volume (L)',
    cell: ({ row }) => {
      const entry = row.original;
      const formatVolume = (volume: number) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'decimal',
          maximumFractionDigits: 2,
        }).format(volume);
      };

      return (
        <div className="text-right font-bold">{formatVolume(entry.level)}</div>
      );
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const entry = row.original;
      return (
        <div className="text-sm max-w-xs truncate">{entry.description}</div>
      );
    },
  },
  {
    accessorKey: 'supplierName',
    header: 'Supplier',
    cell: ({ row }) => {
      const entry = row.original;
      return <div className="text-sm">{entry.supplierName || '-'}</div>;
    },
  },
  {
    accessorKey: 'invoiceNumber',
    header: 'Invoice',
    cell: ({ row }) => {
      const entry = row.original;
      return <div className="text-sm">{entry.invoiceNumber || '-'}</div>;
    },
  },
  {
    accessorKey: 'entryBy',
    header: 'Entry By',
    cell: ({ row }) => {
      const entry = row.original;
      return <div className="text-sm">{entry.entryBy || '-'}</div>;
    },
  },
];
