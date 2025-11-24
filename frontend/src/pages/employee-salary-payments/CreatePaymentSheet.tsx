import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, CalendarIcon } from "lucide-react";
import { EmployeeSalaryPaymentService } from "@/services/employee-salary-payment-service";
import { BankAccountService } from "@/services/bank-account-service";
import { CalculatedSalaryService } from "@/services/calculated-salary-service";
import type {
  CreateEmployeeSalaryPayment,
  User,
  BankAccount,
  CalculatedSalary,
} from "@/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CreatePaymentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userId: string;
  employee: User | null;
}

export function CreatePaymentSheet({
  open,
  onOpenChange,
  onSuccess,
  userId,
  employee,
}: CreatePaymentSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [calculatedSalaries, setCalculatedSalaries] = useState<
    CalculatedSalary[]
  >([]);

  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loadingSalaries, setLoadingSalaries] = useState(false);
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());

  const form = useForm<CreateEmployeeSalaryPayment>({
    defaultValues: {
      userId: userId,
      pumpMasterId: employee?.pumpMasterId || "",
      calculatedSalaryId: null,
      bankAccountId: "",
      amount: 0,
      paymentDate: new Date().toISOString(),
      paymentMethod: "CASH",
      referenceNumber: "",
      notes: "",
    },
  });

  // Fetch bank accounts when sheet opens
  useEffect(() => {
    const fetchBankAccounts = async () => {
      if (!open) return;

      try {
        setLoadingAccounts(true);
        const accounts = await BankAccountService.getAll();
        setBankAccounts(accounts);
      } catch (error) {
        console.error("Failed to fetch bank accounts:", error);
        toast.error("Failed to load bank accounts");
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchBankAccounts();
  }, [open]);

  // Fetch calculated salaries and existing payments for the user
  useEffect(() => {
    const fetchData = async () => {
      if (!open || !userId) return;

      try {
        setLoadingSalaries(true);

        // Fetch both salaries and payments in parallel
        const [salaries, payments] = await Promise.all([
          CalculatedSalaryService.getByUserId(userId),
          EmployeeSalaryPaymentService.getByUserId(userId),
        ]);

        // Get list of already linked salary IDs
        const linkedSalaryIds = new Set(
          payments
            .filter((p) => p.calculatedSalaryId)
            .map((p) => p.calculatedSalaryId!)
        );

        // Filter out already linked salaries
        const availableSalaries = salaries.filter(
          (salary) => !linkedSalaryIds.has(salary.id!)
        );

        // Sort by calculation date (newest first)
        availableSalaries.sort(
          (a, b) =>
            new Date(b.calculationDate).getTime() -
            new Date(a.calculationDate).getTime()
        );

        setCalculatedSalaries(availableSalaries);
      } catch (error) {
        console.error("Failed to fetch calculated salaries:", error);
        toast.error("Failed to load calculated salaries");
      } finally {
        setLoadingSalaries(false);
      }
    };

    fetchData();
  }, [open, userId]);

  // Update pumpMasterId when employee changes
  useEffect(() => {
    if (employee && open) {
      form.setValue("pumpMasterId", employee.pumpMasterId || "");
    }
  }, [employee, open, form]);

  // Update payment date when date picker changes
  useEffect(() => {
    if (paymentDate) {
      // Set time to current time or noon if you prefer a fixed time
      const dateWithTime = new Date(paymentDate);
      dateWithTime.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
      form.setValue("paymentDate", dateWithTime.toISOString());
    }
  }, [paymentDate, form]);

  const onSubmit = async (data: CreateEmployeeSalaryPayment) => {
    try {
      setIsSubmitting(true);

      // Convert calculatedSalaryId to null if empty string
      const paymentData = {
        ...data,
        calculatedSalaryId: data.calculatedSalaryId || null,
      };

      await EmployeeSalaryPaymentService.create(paymentData);
      toast.success("Salary payment created successfully.");
      form.reset();
      setPaymentDate(new Date());
      onSuccess();
    } catch (error) {
      console.error("Failed to create payment:", error);

      const err = error as {
        message?: string;
      };

      let errorMessage = "Failed to create payment. Please try again.";

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
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Salary Payment</SheetTitle>
          <SheetDescription>
            Record a new salary payment for {employee?.username || "employee"}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-6"
          >
            {/* Payment Date */}
            <FormField
              control={form.control}
              name="paymentDate"
              render={() => (
                <FormItem className="flex flex-col">
                  <FormLabel>Payment Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !paymentDate && "text-muted-foreground"
                          )}
                        >
                          {paymentDate ? (
                            format(paymentDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={paymentDate}
                        onSelect={setPaymentDate}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    The date when the payment was made
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0"
                      value={field.value === 0 ? "" : field.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(
                          value === "" ? 0 : parseFloat(value) || 0
                        );
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    The amount paid to the employee
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Method */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="RTGS">RTGS</SelectItem>
                      <SelectItem value="NEFT">NEFT</SelectItem>
                      <SelectItem value="IMPS">IMPS</SelectItem>
                      <SelectItem value="CHEQUE">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>The method used for payment</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bank Account */}
            <FormField
              control={form.control}
              name="bankAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Account *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={loadingAccounts}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bank account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id!}>
                          {account.bank} - {account.accountNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The bank account used for this payment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reference Number */}
            <FormField
              control={form.control}
              name="referenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter reference number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Transaction ID, cheque number, or other reference
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Calculated Salary (Optional) */}
            <FormField
              control={form.control}
              name="calculatedSalaryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Linked Calculated Salary (Optional)</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? null : value)
                    }
                    defaultValue={field.value || "none"}
                    disabled={loadingSalaries}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select calculated salary or leave as advance" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">
                        None (Advance Payment)
                      </SelectItem>
                      {calculatedSalaries.map((salary) => (
                        <SelectItem key={salary.id} value={salary.id!}>
                          {format(new Date(salary.fromDate), "dd MMM yyyy")} to{" "}
                          {format(new Date(salary.toDate), "dd MMM yyyy")} -{" "}
                          {formatCurrency(salary.netSalary)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Link this payment to a specific salary calculation, or leave
                    blank for advance payment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Any additional information about this payment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Payment"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
