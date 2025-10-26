import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { useExpenseStore } from "@/store/expense-store";
import { useExpenseHeadStore } from "@/store/expense-head-store";
import { useBankAccountStore } from "@/store/bank-account-store";
import { useSalesmanNozzleShiftStore } from "@/store/salesman-nozzle-shift-store";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type {
  ExpenseResponse,
  CreateExpenseRequest,
  ExpenseType,
} from "@/types";
import { ExpenseTypeEnum } from "@/types";

interface ExpenseSheetProps {
  expense: ExpenseResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  salesmanNozzleShiftId?: string;
}

interface FormValues {
  expenseHeadId: string;
  expenseType: ExpenseType;
  salesmanNozzleShiftId?: string;
  bankAccountId?: string;
  expenseDate: string;
  amount: string;
  remarks?: string;
  referenceNumber?: string;
}

export function ExpenseSheet({
  expense,
  open,
  onOpenChange,
  mode,
  salesmanNozzleShiftId,
}: ExpenseSheetProps) {
  const { user } = useAuth();
  const { addExpense, updateExpense } = useExpenseStore();
  const { expenseHeads, fetchActiveExpenseHeads } = useExpenseHeadStore();
  const { bankAccounts, fetchBankAccounts } = useBankAccountStore();
  const { activeShifts, fetchActiveShifts } = useSalesmanNozzleShiftStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === "ADMIN" || user?.role === "MANAGER";
  const isSalesman = user?.role === "SALESMAN";

  // Determine initial default values
  const getInitialExpenseType = () => {
    if (salesmanNozzleShiftId) return ExpenseTypeEnum.NOZZLE_SHIFT;
    return ExpenseTypeEnum.BANK_ACCOUNT;
  };

  const form = useForm<FormValues>({
    defaultValues: {
      expenseHeadId: "",
      expenseType: getInitialExpenseType(),
      salesmanNozzleShiftId: salesmanNozzleShiftId || "",
      bankAccountId: "",
      expenseDate: new Date().toISOString().split("T")[0],
      amount: "",
      remarks: "",
      referenceNumber: "",
    },
  });

  const watchExpenseType = form.watch("expenseType");

  useEffect(() => {
    fetchActiveExpenseHeads();
    fetchBankAccounts();
    if (isSalesman) {
      fetchActiveShifts();
    }
  }, [
    fetchActiveExpenseHeads,
    fetchBankAccounts,
    fetchActiveShifts,
    isSalesman,
  ]);

  useEffect(() => {
    if (mode === "edit" && expense) {
      form.reset({
        expenseHeadId: expense.expenseHeadId,
        expenseType: expense.expenseType,
        salesmanNozzleShiftId: expense.salesmanNozzleShiftId || "",
        bankAccountId: expense.bankAccountId || "",
        expenseDate: expense.expenseDate,
        amount: expense.amount.toString(),
        remarks: expense.remarks || "",
        referenceNumber: expense.referenceNumber || "",
      });
    } else if (mode === "create") {
      // Determine default expense type
      let defaultExpenseType = ExpenseTypeEnum.BANK_ACCOUNT;
      let defaultShiftId = "";

      if (salesmanNozzleShiftId) {
        // If opened from shift context, default to NOZZLE_SHIFT
        defaultExpenseType = ExpenseTypeEnum.NOZZLE_SHIFT;
        defaultShiftId = salesmanNozzleShiftId;
      } else if (isSalesman && activeShifts.length > 0) {
        // If salesman has active shifts, default to their first active shift
        defaultExpenseType = ExpenseTypeEnum.NOZZLE_SHIFT;
        defaultShiftId = activeShifts[0].id || "";
      }

      form.reset({
        expenseHeadId: "",
        expenseType: defaultExpenseType,
        salesmanNozzleShiftId: defaultShiftId,
        bankAccountId: "",
        expenseDate: new Date().toISOString().split("T")[0],
        amount: "",
        remarks: "",
        referenceNumber: "",
      });
    }
  }, [expense, mode, form, salesmanNozzleShiftId, isSalesman, activeShifts]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      console.log("Form data being submitted:", data);

      // Validate shift selection for NOZZLE_SHIFT type
      if (
        data.expenseType === ExpenseTypeEnum.NOZZLE_SHIFT &&
        !data.salesmanNozzleShiftId
      ) {
        toast.error("Please select a shift for shift expenses");
        setIsSubmitting(false);
        return;
      }

      // Validate bank account selection for BANK_ACCOUNT type
      if (
        data.expenseType === ExpenseTypeEnum.BANK_ACCOUNT &&
        !data.bankAccountId
      ) {
        toast.error("Please select a bank account");
        setIsSubmitting(false);
        return;
      }

      const requestData: CreateExpenseRequest = {
        expenseHeadId: data.expenseHeadId,
        expenseType: data.expenseType,
        expenseDate: data.expenseDate,
        amount: parseFloat(data.amount),
        remarks: data.remarks,
        referenceNumber: data.referenceNumber,
      };

      if (data.expenseType === ExpenseTypeEnum.NOZZLE_SHIFT) {
        // Only include salesmanNozzleShiftId if it has a valid value
        if (data.salesmanNozzleShiftId) {
          requestData.salesmanNozzleShiftId = data.salesmanNozzleShiftId;
        }
      } else {
        // Only include bankAccountId if it has a valid value
        if (data.bankAccountId) {
          requestData.bankAccountId = data.bankAccountId;
        }
      }

      console.log("Request data being sent to API:", requestData);

      if (mode === "create") {
        await addExpense(requestData);
        toast.success("Expense created successfully");
      } else if (mode === "edit" && expense) {
        await updateExpense(expense.id, requestData);
        toast.success("Expense updated successfully");
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error(
        mode === "create"
          ? "Failed to create expense"
          : "Failed to update expense"
      );
      console.error("Error saving expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Add Expense" : "Edit Expense"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Record a new expense entry."
              : "Update the expense details."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-6"
          >
            <FormField
              control={form.control}
              name="expenseHeadId"
              rules={{ required: "Expense head is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expense Head *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select expense head" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expenseHeads.map((head) => (
                        <SelectItem key={head.id} value={head.id}>
                          {head.headName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!salesmanNozzleShiftId && (
              <FormField
                control={form.control}
                name="expenseType"
                rules={{ required: "Expense type is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expense Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select expense type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(isAdmin ||
                          (isSalesman && activeShifts.length > 0)) && (
                          <SelectItem value={ExpenseTypeEnum.NOZZLE_SHIFT}>
                            Nozzle Shift
                          </SelectItem>
                        )}
                        <SelectItem value={ExpenseTypeEnum.BANK_ACCOUNT}>
                          Bank Account
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {isSalesman && activeShifts.length === 0 && (
                      <FormDescription>
                        You need an active shift to create shift expenses
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchExpenseType === ExpenseTypeEnum.NOZZLE_SHIFT &&
              !salesmanNozzleShiftId && (
                <FormField
                  control={form.control}
                  name="salesmanNozzleShiftId"
                  rules={{
                    required:
                      watchExpenseType === ExpenseTypeEnum.NOZZLE_SHIFT
                        ? "Shift is required for shift expenses"
                        : false,
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Shift *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select shift" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {activeShifts.map((shift) => (
                            <SelectItem key={shift.id} value={shift.id!}>
                              {shift.salesmanUsername} - {shift.nozzleName} (
                              {new Date(
                                shift.startDateTime
                              ).toLocaleDateString()}
                              )
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the shift this expense belongs to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

            {watchExpenseType === ExpenseTypeEnum.BANK_ACCOUNT &&
              !salesmanNozzleShiftId && (
                <FormField
                  control={form.control}
                  name="bankAccountId"
                  rules={{
                    required:
                      watchExpenseType === ExpenseTypeEnum.BANK_ACCOUNT
                        ? "Bank account is required"
                        : false,
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Account *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select bank account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bankAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id!}>
                              {account.accountHolderName} -{" "}
                              {account.accountNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

            <FormField
              control={form.control}
              name="expenseDate"
              rules={{ required: "Expense date is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expense Date *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              rules={{
                required: "Amount is required",
                min: { value: 0.01, message: "Amount must be greater than 0" },
                pattern: {
                  value: /^\d+(\.\d{1,2})?$/,
                  message: "Invalid amount format (max 2 decimal places)",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referenceNumber"
              rules={{
                maxLength: {
                  value: 100,
                  message: "Reference number must not exceed 100 characters",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Invoice/Receipt number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Optional invoice, receipt, or reference number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              rules={{
                maxLength: {
                  value: 500,
                  message: "Remarks must not exceed 500 characters",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes or remarks"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {mode === "create" ? "Create" : "Update"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
