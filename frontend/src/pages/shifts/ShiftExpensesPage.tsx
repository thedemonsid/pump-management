import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useShiftStore } from "@/store/shifts/shift-store";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExpenseService } from "@/services/expense-service";
import { ExpenseSheet } from "@/components/expenses/ExpenseSheet";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  ArrowLeft,
  AlertCircle,
  Receipt,
  Trash2,
  Edit,
  Image as ImageIcon,
} from "lucide-react";
import { format } from "date-fns";
import type { ExpenseResponse } from "@/types";

export function ShiftExpensesPage() {
  const { shiftId } = useParams<{ shiftId: string }>();
  const navigate = useNavigate();
  const { currentShift, fetchShiftById } = useShiftStore();

  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [editingExpense, setEditingExpense] = useState<ExpenseResponse | null>(
    null
  );
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!shiftId) return;

      setIsLoading(true);
      try {
        // Load shift and expenses in parallel
        const [, expensesData] = await Promise.all([
          fetchShiftById(shiftId),
          ExpenseService.getBySalesmanShiftId(shiftId),
        ]);

        setExpenses(expensesData);
      } catch (err) {
        toast.error("Failed to load data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (shiftId) {
      loadData();
    }
  }, [shiftId, fetchShiftById]);

  const reloadExpenses = async () => {
    if (!shiftId) return;
    try {
      const expensesData = await ExpenseService.getBySalesmanShiftId(shiftId);
      setExpenses(expensesData);
    } catch (err) {
      console.error("Failed to reload expenses:", err);
    }
  };

  const handleCreateExpense = () => {
    setSheetMode("create");
    setEditingExpense(null);
    setIsSheetOpen(true);
  };

  const handleEditExpense = (expense: ExpenseResponse) => {
    setSheetMode("edit");
    setEditingExpense(expense);
    setIsSheetOpen(true);
  };

  const handleSheetClose = () => {
    // Just reload expenses when sheet closes (whether success or cancel)
    // ExpenseSheet already shows its own success toast
    reloadExpenses();
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
      await ExpenseService.delete(expenseId);
      toast.success("Expense deleted successfully!");
      // Reload expenses
      if (shiftId) {
        const expensesData = await ExpenseService.getBySalesmanShiftId(shiftId);
        setExpenses(expensesData);
      }
    } catch (err) {
      toast.error("Failed to delete expense");
      console.error(err);
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!currentShift) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Shift not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isShiftOpen = currentShift.status === "OPEN";
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/shifts/${shiftId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Shift Expenses</h1>
            <p className="text-sm text-muted-foreground">
              Manage expenses for {currentShift.salesmanUsername}'s shift
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={isShiftOpen ? "default" : "secondary"}
            className="text-lg px-4 py-2"
          >
            {currentShift.status}
          </Badge>
          <Button onClick={handleCreateExpense} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Shift Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Shift Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Salesman</p>
              <p className="text-lg font-semibold">
                {currentShift.salesmanUsername}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Start Time</p>
              <p className="text-lg font-semibold">
                {format(new Date(currentShift.startDatetime), "PPp")}
              </p>
            </div>
            {currentShift.endDatetime && (
              <div>
                <p className="text-sm text-muted-foreground">End Time</p>
                <p className="text-lg font-semibold">
                  {format(new Date(currentShift.endDatetime), "PPp")}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-lg font-semibold text-red-600">
                ₹{totalExpenses.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Expenses
              </CardTitle>
              <CardDescription>
                {expenses.length} expense(s) recorded
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No expenses recorded for this shift
              </p>
              <Button
                onClick={handleCreateExpense}
                className="mt-4"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Expense
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Expense Head</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead className="text-center">Image</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        {format(new Date(expense.expenseDate), "PP")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {expense.expenseHeadName}
                      </TableCell>
                      <TableCell>
                        {expense.referenceNumber ? (
                          <Badge variant="outline">
                            {expense.referenceNumber}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-red-600">
                        ₹{expense.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {expense.remarks || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {expense.fileStorageId ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              handleImageClick(
                                expense.fileStorageId!,
                                "Receipt/Invoice"
                              )
                            }
                          >
                            <div className="relative group">
                              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                <ImageIcon className="h-4 w-4 text-blue-600" />
                              </div>
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                View
                              </span>
                            </div>
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditExpense(expense)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Expense Sheet */}
      <ExpenseSheet
        open={isSheetOpen}
        onOpenChange={(open) => {
          setIsSheetOpen(open);
          if (!open) {
            handleSheetClose();
          }
        }}
        mode={sheetMode}
        expense={editingExpense || undefined}
        salesmanShiftId={shiftId}
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
