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
import ReactSelect, { type CSSObjectWithLabel } from "react-select";
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

// React Select styles matching SalesmanBillsPage
const selectStyles = {
  control: (provided: CSSObjectWithLabel) => ({
    ...provided,
    minHeight: "36px",
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    "&:hover": {
      borderColor: "#9ca3af",
    },
    boxShadow: "none",
    "&:focus-within": {
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 1px #3b82f6",
    },
    fontSize: "16px",
  }),
  option: (
    provided: CSSObjectWithLabel,
    state: { isSelected: boolean; isFocused: boolean }
  ) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#3b82f6"
      : state.isFocused
      ? "#dbeafe"
      : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#111827",
    "&:hover": {
      backgroundColor: state.isSelected ? "#2563eb" : "#dbeafe",
    },
    fontSize: "16px",
  }),
  menu: (provided: CSSObjectWithLabel) => ({
    ...provided,
    zIndex: 9999,
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
  }),
  menuPortal: (base: CSSObjectWithLabel) => ({ ...base, zIndex: 9999 }),
};

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
    if (isSalesman) return ExpenseTypeEnum.NOZZLE_SHIFT; // Salesmen can only create shift expenses
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

    // Fetch active shifts
    // For salesmen, filter by their userId
    // For admins/managers, fetch all active shifts
    if (isSalesman && user?.userId) {
      fetchActiveShifts(user.userId);
    } else if (isAdmin) {
      fetchActiveShifts(); // Fetch all active shifts for admin
    }
  }, [
    fetchActiveExpenseHeads,
    fetchBankAccounts,
    fetchActiveShifts,
    isSalesman,
    isAdmin,
    user?.userId,
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

      if (isSalesman) {
        // Salesmen can ONLY create shift expenses
        defaultExpenseType = ExpenseTypeEnum.NOZZLE_SHIFT;
        if (activeShifts.length > 0) {
          defaultShiftId = activeShifts[0].id || "";
        }
      } else if (salesmanNozzleShiftId) {
        // If opened from shift context, default to NOZZLE_SHIFT
        defaultExpenseType = ExpenseTypeEnum.NOZZLE_SHIFT;
        defaultShiftId = salesmanNozzleShiftId;
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
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
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

        <div className="space-y-4 p-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="expenseHeadId"
                rules={{ required: "Expense head is required" }}
                render={({ field }) => (
                  <div className="flex flex-col gap-1">
                    <FormLabel>Expense Head *</FormLabel>
                    <ReactSelect
                      options={expenseHeads.map((head) => ({
                        value: head.id,
                        label: head.headName,
                      }))}
                      value={
                        field.value
                          ? {
                              value: field.value,
                              label:
                                expenseHeads.find((h) => h.id === field.value)
                                  ?.headName || "",
                            }
                          : null
                      }
                      onChange={(option) => field.onChange(option?.value || "")}
                      placeholder="Select expense head..."
                      styles={selectStyles}
                    />
                    <FormMessage />
                  </div>
                )}
              />
              {/* Only show expense type selection for Admin/Manager, not for Salesman */}
              {!salesmanNozzleShiftId && !isSalesman && (
                <FormField
                  control={form.control}
                  name="expenseType"
                  rules={{ required: "Expense type is required" }}
                  render={({ field }) => {
                    const expenseTypeOptions = [];
                    if (isAdmin) {
                      expenseTypeOptions.push({
                        value: ExpenseTypeEnum.NOZZLE_SHIFT,
                        label: "Nozzle Shift",
                      });
                    }
                    expenseTypeOptions.push({
                      value: ExpenseTypeEnum.BANK_ACCOUNT,
                      label: "Bank Account",
                    });

                    return (
                      <div className="flex flex-col gap-1">
                        <FormLabel>Expense Type *</FormLabel>
                        <ReactSelect
                          options={expenseTypeOptions}
                          value={
                            field.value
                              ? expenseTypeOptions.find(
                                  (opt) => opt.value === field.value
                                )
                              : null
                          }
                          onChange={(option) =>
                            field.onChange(option?.value || "")
                          }
                          placeholder="Select expense type..."
                          styles={selectStyles}
                        />
                        <FormMessage />
                      </div>
                    );
                  }}
                />
              )}
              {/* Shift selection - shown for salesmen OR when expense type is NOZZLE_SHIFT */}
              {((isSalesman && !salesmanNozzleShiftId) ||
                (watchExpenseType === ExpenseTypeEnum.NOZZLE_SHIFT &&
                  !salesmanNozzleShiftId)) && (
                <FormField
                  control={form.control}
                  name="salesmanNozzleShiftId"
                  rules={{
                    required:
                      isSalesman ||
                      watchExpenseType === ExpenseTypeEnum.NOZZLE_SHIFT
                        ? "Shift is required for shift expenses"
                        : false,
                  }}
                  render={({ field }) => (
                    <div className="flex flex-col gap-1">
                      <FormLabel>Select Shift *</FormLabel>
                      <ReactSelect
                        options={activeShifts.map((shift) => ({
                          value: shift.id!,
                          label: `${shift.salesmanUsername} - ${
                            shift.nozzleName
                          } (${new Date(
                            shift.startDateTime
                          ).toLocaleDateString()})`,
                        }))}
                        value={
                          field.value
                            ? {
                                value: field.value,
                                label: (() => {
                                  const shift = activeShifts.find(
                                    (s) => s.id === field.value
                                  );
                                  return shift
                                    ? `${shift.salesmanUsername} - ${
                                        shift.nozzleName
                                      } (${new Date(
                                        shift.startDateTime
                                      ).toLocaleDateString()})`
                                    : "";
                                })(),
                              }
                            : null
                        }
                        onChange={(option) =>
                          field.onChange(option?.value || "")
                        }
                        placeholder="Select shift..."
                        styles={selectStyles}
                      />
                      {isSalesman && activeShifts.length === 0 && (
                        <FormDescription>
                          You need an active shift to create expenses
                        </FormDescription>
                      )}
                      {!isSalesman && (
                        <FormDescription>
                          Select the shift this expense belongs to
                        </FormDescription>
                      )}
                      <FormMessage />
                    </div>
                  )}
                />
              )}{" "}
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
                      <div className="flex flex-col gap-1">
                        <FormLabel>Bank Account *</FormLabel>
                        <ReactSelect
                          options={bankAccounts.map((account) => ({
                            value: account.id!,
                            label: `${account.accountHolderName} - ${account.accountNumber}`,
                          }))}
                          value={
                            field.value
                              ? {
                                  value: field.value,
                                  label: (() => {
                                    const account = bankAccounts.find(
                                      (a) => a.id === field.value
                                    );
                                    return account
                                      ? `${account.accountHolderName} - ${account.accountNumber}`
                                      : "";
                                  })(),
                                }
                              : null
                          }
                          onChange={(option) =>
                            field.onChange(option?.value || "")
                          }
                          placeholder="Select bank account..."
                          styles={selectStyles}
                        />
                        <FormMessage />
                      </div>
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
                  min: {
                    value: 0.01,
                    message: "Amount must be greater than 0",
                  },
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
              <div className="flex justify-end space-x-2 mt-6">
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
