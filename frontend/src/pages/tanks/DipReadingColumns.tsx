import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { DipReading } from "@/types";

interface DipReadingColumnsProps {
  onEdit: (reading: DipReading) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
}

const formatNumber = (num: number | undefined) => {
  if (num === undefined || num === null) return "N/A";
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(num);
};

const getVarianceBadge = (variance: number | undefined) => {
  if (variance === undefined || variance === null)
    return <span className="text-muted-foreground">N/A</span>;

  const absVariance = Math.abs(variance);
  if (absVariance < 10) {
    return (
      <Badge variant="secondary" className="gap-1">
        {variance > 0 && <TrendingUp className="h-3 w-3" />}
        {variance < 0 && <TrendingDown className="h-3 w-3" />}
        {formatNumber(variance)} L
      </Badge>
    );
  } else if (absVariance < 50) {
    return (
      <Badge
        variant="outline"
        className="border-yellow-500 text-yellow-600 gap-1"
      >
        {variance > 0 && <TrendingUp className="h-3 w-3" />}
        {variance < 0 && <TrendingDown className="h-3 w-3" />}
        {formatNumber(variance)} L
      </Badge>
    );
  } else {
    return (
      <Badge variant="destructive" className="gap-1">
        {variance > 0 && <TrendingUp className="h-3 w-3" />}
        {variance < 0 && <TrendingDown className="h-3 w-3" />}
        {formatNumber(variance)} L
      </Badge>
    );
  }
};

export const getDipReadingColumns = ({
  onEdit,
  onDelete,
  deletingId,
}: DipReadingColumnsProps): ColumnDef<DipReading>[] => [
  {
    accessorKey: "readingTimestamp",
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
    cell: ({ row }) => {
      const date = new Date(row.original.readingTimestamp);
      return (
        <div>
          <div className="font-medium">{format(date, "PPP")}</div>
          <div className="text-xs text-muted-foreground">
            {format(date, "p")}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "dipLevel",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Dip Level (mm)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => formatNumber(row.original.dipLevel),
  },
  {
    accessorKey: "temperature",
    header: "Temperature (°C)",
    cell: ({ row }) => formatNumber(row.original.temperature),
  },
  {
    accessorKey: "density",
    header: "Density (kg/m³)",
    cell: ({ row }) => formatNumber(row.original.density),
  },
  {
    accessorKey: "fuelLevelLitres",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Physical Level (L)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">
        {formatNumber(row.original.fuelLevelLitres)}
      </div>
    ),
  },
  {
    accessorKey: "fuelLevelSystem",
    header: "System Level (L)",
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {formatNumber(row.original.fuelLevelSystem)}
      </div>
    ),
  },
  {
    accessorKey: "variance",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Variance
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => getVarianceBadge(row.original.variance),
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: ({ row }) => {
      const remarks = row.original.remarks;
      if (!remarks)
        return <span className="text-muted-foreground text-xs">—</span>;
      return (
        <div className="max-w-[200px] truncate text-sm" title={remarks}>
          {remarks}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const reading = row.original;
      const isDeleting = deletingId === reading.id;
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(reading)}
            disabled={isDeleting}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => reading.id && onDelete(reading.id)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      );
    },
  },
];
