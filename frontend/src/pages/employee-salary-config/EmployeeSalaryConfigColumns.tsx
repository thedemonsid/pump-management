import type { ColumnDef } from "@tanstack/react-table";
import type { EmployeeSalaryConfig } from "@/types/employee-salary";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  Pencil,
  XCircle,
  CheckCircle,
  FileSpreadsheet,
  Wallet,
  BookOpen,
} from "lucide-react";
import { format } from "date-fns";

interface ColumnsProps {
  onEdit: (config: EmployeeSalaryConfig) => void;
  onDeactivate: (config: EmployeeSalaryConfig) => void;
  onViewSalaries: (config: EmployeeSalaryConfig) => void;
  onViewPayments: (config: EmployeeSalaryConfig) => void;
  onViewLedger: (config: EmployeeSalaryConfig) => void;
  formatCurrency: (amount: number) => string;
  getSalaryTypeLabel: (type: string) => string;
}

export const getEmployeeSalaryConfigColumns = ({
  onEdit,
  onDeactivate,
  onViewSalaries,
  onViewPayments,
  onViewLedger,
  formatCurrency,
  getSalaryTypeLabel,
}: ColumnsProps): ColumnDef<EmployeeSalaryConfig>[] => [
  {
    accessorKey: "username",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Employee
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.username || "Unknown User"}
      </div>
    ),
  },
  {
    accessorKey: "salaryType",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Salary Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <Badge variant="outline">
        {getSalaryTypeLabel(row.original.salaryType)}
      </Badge>
    ),
  },
  {
    accessorKey: "basicSalaryAmount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Basic Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-semibold">
        {formatCurrency(row.original.basicSalaryAmount)}
      </div>
    ),
  },
  {
    accessorKey: "effectiveFrom",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Effective From
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) =>
      format(new Date(row.original.effectiveFrom), "dd MMM yyyy"),
  },
  {
    accessorKey: "effectiveTo",
    header: "Effective To",
    cell: ({ row }) =>
      row.original.effectiveTo
        ? format(new Date(row.original.effectiveTo), "dd MMM yyyy")
        : "-",
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) =>
      row.original.isActive ? (
        <Badge className="bg-green-500">
          <CheckCircle className="mr-1 h-3 w-3" />
          Active
        </Badge>
      ) : (
        <Badge variant="secondary">
          <XCircle className="mr-1 h-3 w-3" />
          Inactive
        </Badge>
      ),
  },
  {
    id: "rates",
    header: "Rates",
    cell: ({ row }) => (
      <div className="text-sm space-y-1">
        <div>Half Day: {(row.original.halfDayRate * 100).toFixed(0)}%</div>
        <div>Overtime: {(row.original.overtimeRate * 100).toFixed(0)}%</div>
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const config = row.original;
      return (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewLedger(config)}
            title="View Salary Ledger"
          >
            <BookOpen className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewSalaries(config)}
            title="View Calculated Salaries"
          >
            <FileSpreadsheet className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewPayments(config)}
            title="View Salary Payments"
          >
            <Wallet className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(config)}
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          {config.isActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeactivate(config)}
              title="Deactivate"
            >
              <XCircle className="h-4 w-4 text-orange-500" />
            </Button>
          )}
        </div>
      );
    },
  },
];
