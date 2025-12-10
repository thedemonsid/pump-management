import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSupplierPaymentStore } from "@/store/supplier-payment-store";
import { useBankAccountStore } from "@/store/bank-account-store";
import { SupplierPaymentMethod } from "@/types/supplier-payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import ReactSelect, { type CSSObjectWithLabel } from "react-select";
import { toast } from "sonner";

interface FormValues {
  pumpMasterId: string;
  supplierId: string;
  purchaseId?: string;
  fuelPurchaseId?: string;
  bankAccountId: string;
  amount: string;
  paymentDate: Date;
  paymentMethod: SupplierPaymentMethod;
  referenceNumber: string;
  notes: string;
}

// React Select styles matching ExpenseSheet
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

interface CreateSupplierPaymentFormProps {
  supplierId: string;
  pumpMasterId: string;
  purchaseId?: string;
  fuelPurchaseId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSupplierPaymentForm({
  supplierId,
  pumpMasterId,
  purchaseId,
  fuelPurchaseId,
  open,
  onOpenChange,
}: CreateSupplierPaymentFormProps) {
  const { createPayment, loading } = useSupplierPaymentStore();
  const { bankAccounts, fetchBankAccounts } = useBankAccountStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBankAccounts();
  }, [fetchBankAccounts]);

  const form = useForm<FormValues>({
    defaultValues: {
      pumpMasterId,
      supplierId,
      purchaseId: purchaseId || "",
      fuelPurchaseId: fuelPurchaseId || "",
      amount: "",
      paymentDate: new Date(),
      paymentMethod: SupplierPaymentMethod.CASH,
      bankAccountId: "",
      referenceNumber: "NA",
      notes: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Validate required fields
      if (!data.bankAccountId) {
        toast.error("Please select a bank account");
        setIsSubmitting(false);
        return;
      }

      if (!data.amount || parseFloat(data.amount) <= 0) {
        toast.error("Amount must be greater than 0");
        setIsSubmitting(false);
        return;
      }

      if (!data.referenceNumber) {
        toast.error("Reference number is required");
        setIsSubmitting(false);
        return;
      }

      await createPayment({
        pumpMasterId: data.pumpMasterId,
        supplierId: data.supplierId,
        bankAccountId: data.bankAccountId,
        amount: parseFloat(data.amount),
        paymentDate: data.paymentDate.toISOString(),
        paymentMethod: data.paymentMethod,
        referenceNumber: data.referenceNumber,
        purchaseId: data.purchaseId || undefined,
        fuelPurchaseId: data.fuelPurchaseId || undefined,
        notes: data.notes || undefined,
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to create payment");
      console.error("Failed to create payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Supplier Payment</SheetTitle>
          <SheetDescription>
            Record a new payment to this supplier
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 p-1 mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bankAccountId"
                  rules={{ required: "Bank Account is required" }}
                  render={({ field }) => (
                    <FormItem className="col-span-2">
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
                  name="paymentMethod"
                  rules={{ required: "Payment method is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method *</FormLabel>
                      <ReactSelect
                        options={Object.values(SupplierPaymentMethod).map(
                          (method) => ({
                            value: method,
                            label: method.replace("_", " "),
                          })
                        )}
                        value={
                          field.value
                            ? {
                                value: field.value,
                                label: field.value.replace("_", " "),
                              }
                            : null
                        }
                        onChange={(option) =>
                          field.onChange(option?.value || "")
                        }
                        placeholder="Select payment method..."
                        styles={selectStyles}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentDate"
                  rules={{ required: "Payment date is required" }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Payment Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
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
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="referenceNumber"
                  rules={{ required: "Reference number is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Number *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter reference number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchaseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase ID (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter purchase ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fuelPurchaseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuel Purchase ID (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter fuel purchase ID"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes about the payment"
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
                <Button type="submit" disabled={isSubmitting || loading}>
                  {isSubmitting || loading ? (
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
