import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Loader2, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreateCalculatedSalarySheet } from "./CreateCalculatedSalarySheet";
import { CalculatedSalaryService } from "@/services/calculated-salary-service";
import { EmployeeSalaryConfigService } from "@/services/employee-salary-config-service";
import type { CalculatedSalary, EmployeeSalaryConfig } from "@/types";
import { toast } from "sonner";
import { format } from "date-fns";

export function CalculatedSalariesPage() {
  const { configId, userId } = useParams<{
    configId: string;
    userId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [salaries, setSalaries] = useState<CalculatedSalary[]>([]);
  const [config, setConfig] = useState<EmployeeSalaryConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [deletingSalary, setDeletingSalary] = useState<CalculatedSalary | null>(
    null
  );

  // Check if user has permission
  const canManageSalaries = user?.role === "ADMIN" || user?.role === "MANAGER";

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch salary config
      const configData = await EmployeeSalaryConfigService.getById(configId!);
      setConfig(configData);

      // Fetch calculated salaries for this user
      const salariesData = await CalculatedSalaryService.getByUserId(userId!);

      // Sort by calculation date (newest first)
      salariesData.sort(
        (a, b) =>
          new Date(b.calculationDate).getTime() -
          new Date(a.calculationDate).getTime()
      );

      setSalaries(salariesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);

      const err = error as {
        message?: string;
      };

      let errorMessage = "Failed to load data. Please try again.";

      if (err.message) {
        const match = err.message.match(/^\d+:\s*(.+)$/);
        if (match && match[1]) {
          errorMessage = match[1];
        } else {
          errorMessage = err.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManageSalaries && configId && userId) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManageSalaries, configId, userId]);

  const handleDelete = async () => {
    if (!deletingSalary) return;

    try {
      await CalculatedSalaryService.delete(deletingSalary.id!);
      toast.success("Salary calculation deleted successfully.");
      fetchData();
      setDeletingSalary(null);
    } catch (error) {
      console.error("Failed to delete salary:", error);

      const err = error as {
        message?: string;
      };

      let errorMessage =
        "Failed to delete salary calculation. Please try again.";

      if (err.message) {
        const match = err.message.match(/^\d+:\s*(.+)$/);
        if (match && match[1]) {
          errorMessage = match[1];
        } else {
          errorMessage = err.message;
        }
      }

      toast.error(errorMessage);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const calculateAbsenceDeduction = (salary: CalculatedSalary) => {
    const absentDays = salary.totalDays - salary.workingDays;
    if (absentDays <= 0) return 0;
    const dailyRate = salary.basicSalaryAmount / 30; // Fixed 30-day month
    return Math.round(absentDays * dailyRate);
  };

  if (!canManageSalaries) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Access Denied
          </h2>
          <p className="text-muted-foreground mt-2">
            You don't have permission to manage salary calculations. Only ADMIN
            and MANAGER roles can access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading && salaries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading salary calculations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Calculated Salaries - {config?.username || "Employee"}
          </h1>
          <p className="text-muted-foreground">
            Salary Type: {config?.salaryType} | Basic Amount:{" "}
            {formatCurrency(config?.basicSalaryAmount || 0)}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/employee-salary-config")}
        >
          Back to Config
        </Button>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Salary Calculations</CardTitle>
              <CardDescription>
                View and manage all salary calculations for this employee
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateSheetOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Salary Calculation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {salaries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No salary calculations found. Create one to get started.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Working Days</TableHead>
                    <TableHead>Absences</TableHead>
                    <TableHead>Overtime</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>OT Amount</TableHead>
                    <TableHead>Adjustments</TableHead>
                    <TableHead>Gross Salary</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Calculation Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaries.map((salary) => (
                    <TableRow key={salary.id}>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {format(new Date(salary.fromDate), "dd MMM yyyy")}
                          </div>
                          <div className="text-muted-foreground">
                            to {format(new Date(salary.toDate), "dd MMM yyyy")}
                          </div>
                          <Badge variant="outline" className="mt-1">
                            {salary.totalDays} days
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{salary.workingDays}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {salary.fullDayAbsences > 0 && (
                            <div className="text-red-600">
                              Full: {salary.fullDayAbsences}
                            </div>
                          )}
                          {salary.halfDayAbsences > 0 && (
                            <div className="text-orange-600">
                              Half: {salary.halfDayAbsences}
                            </div>
                          )}
                          {(salary.fullDayAbsences > 0 ||
                            salary.halfDayAbsences > 0) && (
                            <div className="text-red-600 font-semibold text-xs mt-1">
                              Deduction:{" "}
                              {formatCurrency(
                                calculateAbsenceDeduction(salary)
                              )}
                            </div>
                          )}
                          {salary.fullDayAbsences === 0 &&
                            salary.halfDayAbsences === 0 && (
                              <span className="text-muted-foreground">
                                None
                              </span>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {salary.overtimeDays > 0 ? (
                          <Badge variant="secondary">
                            {salary.overtimeDays} days
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(salary.basicSalaryAmount)}
                      </TableCell>
                      <TableCell>
                        {salary.overtimeAmount > 0
                          ? formatCurrency(salary.overtimeAmount)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {salary.additionalPayment > 0 && (
                            <div className="text-green-600">
                              +{formatCurrency(salary.additionalPayment)}
                            </div>
                          )}
                          {salary.additionalDeduction > 0 && (
                            <div className="text-red-600">
                              -{formatCurrency(salary.additionalDeduction)}
                            </div>
                          )}
                          {salary.additionalPayment === 0 &&
                            salary.additionalDeduction === 0 && (
                              <span className="text-muted-foreground">
                                None
                              </span>
                            )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(salary.grossSalary)}
                      </TableCell>
                      <TableCell className="font-bold text-lg">
                        {formatCurrency(salary.netSalary)}
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(salary.calculationDate),
                          "dd MMM yyyy"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingSalary(salary)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Sheet */}
      <CreateCalculatedSalarySheet
        open={isCreateSheetOpen}
        onOpenChange={setIsCreateSheetOpen}
        onSuccess={() => {
          setIsCreateSheetOpen(false);
          fetchData();
        }}
        configId={configId!}
        userId={userId!}
        config={config}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingSalary}
        onOpenChange={() => setDeletingSalary(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the salary calculation for the period
              from{" "}
              {deletingSalary &&
                format(new Date(deletingSalary.fromDate), "dd MMM yyyy")}{" "}
              to{" "}
              {deletingSalary &&
                format(new Date(deletingSalary.toDate), "dd MMM yyyy")}
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
