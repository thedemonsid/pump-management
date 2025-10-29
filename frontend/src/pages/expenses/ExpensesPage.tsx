import { useEffect, useState, useMemo } from "react";
import { useExpenseStore } from "@/store/expense-store";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Loader2,
  FileText,
  Calendar,
  DollarSign,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExpenseSheet } from "@/components/expenses/ExpenseSheet";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ExpensePDF } from "@/components/pdf-reports/ExpensePDF";
import { DataTable } from "@/components/ui/data-table";
import { createColumns } from "./columns";
import { toast } from "sonner";
import type { ExpenseResponse } from "@/types";

// Helper function to get first day of current month
const getFirstDayOfMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString()
    .split("T")[0];
};

// Helper function to get today's date
const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};

// Helper function to get first day of last month
const getFirstDayOfLastMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() - 1, 1)
    .toISOString()
    .split("T")[0];
};

// Helper function to get last day of last month
const getLastDayOfLastMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 0)
    .toISOString()
    .split("T")[0];
};

// Helper function to get date 7 days ago
const getDateDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
};

export function ExpensesPage() {
  const { user } = useAuth();
  const { expenses, loading, fetchExpensesByDateRange, removeExpense } =
    useExpenseStore();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [editingExpense, setEditingExpense] = useState<ExpenseResponse | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Date range state - default to current month
  const [fromDate, setFromDate] = useState(getFirstDayOfMonth());
  const [toDate, setToDate] = useState(getTodayDate());

  const isAdmin = user?.role === "ADMIN" || user?.role === "MANAGER";

  useEffect(() => {
    if (fromDate && toDate) {
      fetchExpensesByDateRange(fromDate, toDate);
    }
  }, [fromDate, toDate, fetchExpensesByDateRange]);

  const handleCreate = () => {
    setSheetMode("create");
    setEditingExpense(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (expense: ExpenseResponse) => {
    setSheetMode("edit");
    setEditingExpense(expense);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    try {
      await removeExpense(deletingId);
      toast.success("Expense deleted successfully");
    } catch (error) {
      toast.error("Failed to delete expense");
      console.error("Failed to delete expense:", error);
    } finally {
      setDeletingId(null);
      setShowDeleteDialog(false);
    }
  };

  // Date preset functions
  const setThisMonth = () => {
    setFromDate(getFirstDayOfMonth());
    setToDate(getTodayDate());
  };

  const setLastMonth = () => {
    setFromDate(getFirstDayOfLastMonth());
    setToDate(getLastDayOfLastMonth());
  };

  const setLast7Days = () => {
    setFromDate(getDateDaysAgo(7));
    setToDate(getTodayDate());
  };

  const setLast30Days = () => {
    setFromDate(getDateDaysAgo(30));
    setToDate(getTodayDate());
  };

  const columns = createColumns(handleEdit, handleDeleteClick, isAdmin);

  const safeExpenses = useMemo(
    () => (Array.isArray(expenses) ? expenses : []),
    [expenses]
  );

  // Calculate total
  const totalAmount = useMemo(
    () => safeExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0),
    [safeExpenses]
  );

  // Calculate head-wise totals
  const headWiseTotals = useMemo(() => {
    const totalsMap = new Map<
      string,
      { expenseHeadName: string; amount: number; count: number }
    >();

    safeExpenses.forEach((expense) => {
      const headId = expense.expenseHeadId;
      const headName = expense.expenseHeadName || "Unknown";
      const existing = totalsMap.get(headId) || {
        expenseHeadName: headName,
        amount: 0,
        count: 0,
      };
      existing.amount += expense.amount || 0;
      existing.count += 1;
      totalsMap.set(headId, existing);
    });

    return Array.from(totalsMap.values()).sort((a, b) => b.amount - a.amount);
  }, [safeExpenses]);

  if (loading && (!expenses || expenses.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading expenses...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? "Manage all expenses for your pump station"
              : "View and add your shift expenses"}
          </p>
        </div>
        <div className="flex gap-2">
          <PDFDownloadLink
            document={
              <ExpensePDF
                data={safeExpenses.map((expense) => ({
                  id: expense.id,
                  referenceNumber: expense.referenceNumber || "N/A",
                  expenseHeadName: expense.expenseHeadName || "Unknown",
                  amount: expense.amount,
                  expenseDate: expense.expenseDate,
                  description: expense.remarks || "",
                }))}
                headWiseTotals={headWiseTotals}
                fromDate={fromDate}
                toDate={toDate}
                totalAmount={totalAmount}
              />
            }
            fileName={`expense-report-${fromDate}-to-${toDate}.pdf`}
          >
            {({ loading }) => (
              <Button variant="outline" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </>
                )}
              </Button>
            )}
          </PDFDownloadLink>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter by Date Range</CardTitle>
          <CardDescription>
            Select date range to view expenses (defaults to current month)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={setLast7Days}>
              Last 7 Days
            </Button>
            <Button variant="outline" size="sm" onClick={setLast30Days}>
              Last 30 Days
            </Button>
            <Button variant="outline" size="sm" onClick={setThisMonth}>
              This Month
            </Button>
            <Button variant="outline" size="sm" onClick={setLastMonth}>
              Last Month
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fromDate">From Date</Label>
              <Input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                max={toDate}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toDate">To Date</Label>
              <Input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                min={fromDate}
                max={getTodayDate()}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeExpenses.length}</div>
            <p className="text-xs text-muted-foreground">
              In selected date range
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
              }).format(totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">Sum in date range</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Expense
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
              }).format(
                safeExpenses.length > 0 ? totalAmount / safeExpenses.length : 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Per expense</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Records</CardTitle>
          <CardDescription>View and manage all expense entries</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={safeExpenses}
            searchKey="referenceNumber"
            searchPlaceholder="Search by reference number..."
            pageSize={10}
            enableRowSelection={false}
            enableColumnVisibility={true}
            enablePagination={true}
            enableSorting={true}
            enableFiltering={true}
          />
        </CardContent>
      </Card>

      {/* Head-wise Expense Summary */}
      {headWiseTotals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Head-wise Expense Summary
            </CardTitle>
            <CardDescription>
              Expenses grouped by expense head in the selected date range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {headWiseTotals.map((headTotal, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-base">
                      {headTotal.expenseHeadName}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {headTotal.count} expense
                      {headTotal.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                      }).format(headTotal.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((headTotal.amount / totalAmount) * 100).toFixed(1)}% of
                      total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <ExpenseSheet
        expense={editingExpense}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        mode={sheetMode}
      />

      {isAdmin && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This will permanently delete this expense record. This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeletingId(null);
                  setShowDeleteDialog(false);
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
