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
import { Plus, Loader2, Trash2, Edit } from "lucide-react";
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
import { CreatePaymentSheet } from "./CreatePaymentSheet";
import { UpdatePaymentForm } from "./UpdatePaymentForm";
import { EmployeeSalaryPaymentService } from "@/services/employee-salary-payment-service";
import { UserService } from "@/services/user-service";
import type { EmployeeSalaryPayment, User } from "@/types";
import { toast } from "sonner";
import { format } from "date-fns";

export function EmployeeSalaryPaymentsPage() {
  const { userId } = useParams<{
    userId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [payments, setPayments] = useState<EmployeeSalaryPayment[]>([]);
  const [employee, setEmployee] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [editingPayment, setEditingPayment] =
    useState<EmployeeSalaryPayment | null>(null);
  const [deletingPayment, setDeletingPayment] =
    useState<EmployeeSalaryPayment | null>(null);
  const [balanceInfo, setBalanceInfo] = useState<{
    openingBalance: number;
    totalSalary: number;
    totalPaid: number;
    netBalance: number;
  } | null>(null);

  // Check if user has permission
  const canManagePayments = user?.role === "ADMIN" || user?.role === "MANAGER";

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch employee details
      const employeeData = await UserService.getById(userId!);
      setEmployee(employeeData);

      // Fetch payments for this user
      const paymentsData = await EmployeeSalaryPaymentService.getByUserId(
        userId!
      );

      // Sort by payment date (newest first)
      paymentsData.sort(
        (a, b) =>
          new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      );

      setPayments(paymentsData);

      // Fetch balance information
      const balance =
        await EmployeeSalaryPaymentService.calculateEmployeeBalance(userId!);
      setBalanceInfo(balance);
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
    if (canManagePayments && userId) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManagePayments, userId]);

  const handleEdit = (payment: EmployeeSalaryPayment) => {
    setEditingPayment(payment);
  };

  const handleDelete = async () => {
    if (!deletingPayment) return;

    try {
      await EmployeeSalaryPaymentService.delete(deletingPayment.id!);
      toast.success("Payment deleted successfully.");
      fetchData();
      setDeletingPayment(null);
    } catch (error) {
      console.error("Failed to delete payment:", error);

      const err = error as {
        message?: string;
      };

      let errorMessage = "Failed to delete payment. Please try again.";

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

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      CASH: "Cash",
      UPI: "UPI",
      RTGS: "RTGS",
      NEFT: "NEFT",
      IMPS: "IMPS",
      CHEQUE: "Cheque",
    };
    return labels[method] || method;
  };

  const getPaymentMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      CASH: "default",
      UPI: "default",
      RTGS: "outline",
      NEFT: "outline",
      IMPS: "outline",
      CHEQUE: "secondary",
    };
    return colors[method] || "default";
  };

  if (!canManagePayments) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Access Denied
          </h2>
          <p className="text-muted-foreground mt-2">
            You don't have permission to manage salary payments. Only ADMIN and
            MANAGER roles can access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading salary payments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Salary Payments - {employee?.username || "Employee"}
          </h1>
          <p className="text-muted-foreground">
            Role: {employee?.role} | Total Payments: {payments.length}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/employee-salary-config")}
        >
          Back to Config
        </Button>
      </div>

      {/* Balance Summary Card */}
      {balanceInfo && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Balance Summary</CardTitle>
            <CardDescription>Employee salary balance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Opening Balance</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(balanceInfo.openingBalance)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Total Salary Earned
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(balanceInfo.totalSalary)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(balanceInfo.totalPaid)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Net Balance</p>
                <p
                  className={`text-2xl font-bold ${
                    balanceInfo.netBalance >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(balanceInfo.netBalance)}
                </p>
                {balanceInfo.netBalance < 0 && (
                  <p className="text-xs text-red-600">Employee owes company</p>
                )}
                {balanceInfo.netBalance > 0 && (
                  <p className="text-xs text-green-600">
                    Company owes employee
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Salary Payments</CardTitle>
              <CardDescription>
                View and manage all salary payments for this employee
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateSheetOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Payment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No payments found. Create one to get started.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Reference Number</TableHead>
                    <TableHead>Bank Account</TableHead>
                    <TableHead>Linked Salary</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="font-medium">
                          {format(new Date(payment.paymentDate), "dd MMM yyyy")}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-lg">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            getPaymentMethodColor(payment.paymentMethod) as
                              | "default"
                              | "secondary"
                              | "outline"
                          }
                        >
                          {getPaymentMethodLabel(payment.paymentMethod)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {payment.referenceNumber}
                      </TableCell>
                      <TableCell>{payment.bankAccountNumber || "-"}</TableCell>
                      <TableCell>
                        {payment.calculatedSalaryId ? (
                          <Badge variant="secondary">Linked</Badge>
                        ) : (
                          <Badge variant="outline">Advance</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {payment.notes || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(payment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingPayment(payment)}
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
      <CreatePaymentSheet
        open={isCreateSheetOpen}
        onOpenChange={setIsCreateSheetOpen}
        onSuccess={() => {
          setIsCreateSheetOpen(false);
          fetchData();
        }}
        userId={userId!}
        employee={employee}
      />

      {/* Edit Sheet */}
      {editingPayment && (
        <UpdatePaymentForm
          open={!!editingPayment}
          onOpenChange={(open: boolean) => !open && setEditingPayment(null)}
          payment={editingPayment}
          onSuccess={() => {
            setEditingPayment(null);
            fetchData();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingPayment}
        onOpenChange={() => setDeletingPayment(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the payment of{" "}
              {deletingPayment && formatCurrency(deletingPayment.amount)} made
              on{" "}
              {deletingPayment &&
                format(new Date(deletingPayment.paymentDate), "dd MMM yyyy")}
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
