import { useEffect, useState, useMemo } from "react";
import { useExpenseStore } from "@/store/expense-store";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
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
  CalendarIcon,
  DollarSign,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ExpenseSheet } from "@/components/expenses/ExpenseSheet";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ExpensePDF } from "@/components/pdf-reports/ExpensePDF";
import { DataTable } from "@/components/ui/data-table";
import { createColumns } from "./columns";
import { toast } from "sonner";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import api from "@/services/api";
import type { ExpenseResponse } from "@/types";

// Helper function to get date from 7 days ago
const getOneWeekAgo = () => {
  return subDays(new Date(), 7);
};

// Helper function to get today's date
const getToday = () => {
  return new Date();
};

export function ExpensesPage() {
  const { user } = useAuth();
  const { expenses, loading, fetchExpensesByDateRange } = useExpenseStore();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [editingExpense, setEditingExpense] = useState<ExpenseResponse | null>(
    null
  );

  // Date filter states - Initialize with default dates (last 7 days)
  const [fromDate, setFromDate] = useState<Date | undefined>(getOneWeekAgo());
  const [toDate, setToDate] = useState<Date | undefined>(getToday());
  const [isFromDateOpen, setIsFromDateOpen] = useState(false);
  const [isToDateOpen, setIsToDateOpen] = useState(false);

  // Image dialog states
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const isAdmin = user?.role === "ADMIN" || user?.role === "MANAGER";

  // Fetch data when dates change
  useEffect(() => {
    if (fromDate && toDate) {
      // Format dates as YYYY-MM-DD for API
      const fromDateStr = fromDate.toISOString().split("T")[0];
      const toDateStr = toDate.toISOString().split("T")[0];
      fetchExpensesByDateRange(fromDateStr, toDateStr);
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

  // Handle filter reset
  const handleClearFilters = () => {
    setFromDate(getOneWeekAgo());
    setToDate(getToday());
  };

  // Handle image click
  const handleImageClick = async (imageId: string, title: string) => {
    try {
      const response = await api.get(`/api/v1/files/${imageId}`, {
        responseType: "blob",
      });
      const imageUrl = URL.createObjectURL(response.data);
      setSelectedImage({ url: imageUrl, title });
      setIsImageDialogOpen(true);
    } catch (err) {
      toast.error("Failed to load image");
      console.error(err);
    }
  };

  const columns = createColumns(handleEdit, handleImageClick, isAdmin);

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
                fromDate={fromDate?.toISOString().split("T")[0] || ""}
                toDate={toDate?.toISOString().split("T")[0] || ""}
                totalAmount={totalAmount}
              />
            }
            fileName={`expense-report-${
              fromDate?.toISOString().split("T")[0]
            }-to-${toDate?.toISOString().split("T")[0]}.pdf`}
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
          <CardTitle>Filter by Date Range</CardTitle>
          <CardDescription>
            Select a date range to filter expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            {/* From Date */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">
                From Date
              </label>
              <Popover open={isFromDateOpen} onOpenChange={setIsFromDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={(date) => {
                      setFromDate(date);
                      setIsFromDateOpen(false);
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* To Date */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">To Date</label>
              <Popover open={isToDateOpen} onOpenChange={setIsToDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={(date) => {
                      setToDate(date);
                      setIsToDateOpen(false);
                    }}
                    disabled={(date) => {
                      if (date > new Date()) return true;
                      if (fromDate && date < fromDate) return true;
                      return false;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button variant="outline" onClick={handleClearFilters}>
              Reset to Default
            </Button>
          </div>

          {(fromDate || toDate) && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {safeExpenses.length} records
              {fromDate && ` from ${format(fromDate, "PPP")}`}
              {toDate && ` to ${format(toDate, "PPP")}`}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
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

      {/* Image Preview Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.title || "Image"}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            {selectedImage?.url && (
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
