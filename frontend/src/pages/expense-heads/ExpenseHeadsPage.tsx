import { useEffect, useState } from "react";
import { useExpenseHeadStore } from "@/store/expense-head-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { ExpenseHeadSheet } from "@/components/expense-heads/ExpenseHeadSheet";
import { DataTable } from "@/components/ui/data-table";
import { createColumns } from "./columns";
import { toast } from "sonner";
import type { ExpenseHeadResponse } from "@/types";

export function ExpenseHeadsPage() {
  const { expenseHeads, loading, fetchExpenseHeads, toggleExpenseHeadActive } =
    useExpenseHeadStore();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [editingExpenseHead, setEditingExpenseHead] =
    useState<ExpenseHeadResponse | null>(null);

  useEffect(() => {
    fetchExpenseHeads();
  }, [fetchExpenseHeads]);

  const handleCreate = () => {
    setSheetMode("create");
    setEditingExpenseHead(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (expenseHead: ExpenseHeadResponse) => {
    setSheetMode("edit");
    setEditingExpenseHead(expenseHead);
    setIsSheetOpen(true);
  };

  const handleToggleActive = async (id: string) => {
    try {
      await toggleExpenseHeadActive(id);
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error("Failed to update status");
      console.error("Failed to toggle active status:", error);
    }
  };

  const columns = createColumns(handleEdit, handleToggleActive);

  const safeExpenseHeads = Array.isArray(expenseHeads) ? expenseHeads : [];

  if (loading && (!expenseHeads || expenseHeads.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading expense heads...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expense Heads</h1>
          <p className="text-muted-foreground">
            Manage expense categories for your pump station
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense Head
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Head Categories</CardTitle>
          <CardDescription>
            View and manage all expense head categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={safeExpenseHeads}
            searchKey="headName"
            searchPlaceholder="Search expense heads..."
            pageSize={10}
            enableRowSelection={false}
            enableColumnVisibility={true}
            enablePagination={true}
            enableSorting={true}
            enableFiltering={true}
          />
        </CardContent>
      </Card>

      <ExpenseHeadSheet
        expenseHead={editingExpenseHead}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        mode={sheetMode}
      />
    </div>
  );
}
