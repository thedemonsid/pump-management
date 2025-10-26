import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSalesmanBillPaymentStore } from "@/store/salesman-bill-payment-store";
import { useBankAccountStore } from "@/store/bank-account-store";
import { useCustomerStore } from "@/store/customer-store";
import { PaymentMethod } from "@/types/customer-bill-payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ReactSelect, { type CSSObjectWithLabel } from "react-select";
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

const CreateShiftPaymentSchema = z.object({
  pumpMasterId: z.string().min(1, "Pump Master ID is required"),
  salesmanNozzleShiftId: z.string().min(1, "Shift is required"),
  customerId: z.string().min(1, "Customer is required"),
  bankAccountId: z.string().min(1, "Bank Account is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  paymentDate: z.date(),
  paymentMethod: z.string().min(1, "Payment method is required"),
  referenceNumber: z.string().min(1, "Reference number is required"),
  notes: z.string().optional(),
});

type CreateShiftPaymentFormData = z.infer<typeof CreateShiftPaymentSchema>;

interface CreateShiftPaymentFormProps {
  salesmanNozzleShiftId: string;
  pumpMasterId: string;
  onSuccess?: () => void;
}

export function CreateShiftPaymentForm({
  salesmanNozzleShiftId,
  pumpMasterId,
  onSuccess,
}: CreateShiftPaymentFormProps) {
  const { createPayment, loading } = useSalesmanBillPaymentStore();
  const { bankAccounts, fetchBankAccounts } = useBankAccountStore();
  const { customers, fetchCustomers } = useCustomerStore();

  const form = useForm<CreateShiftPaymentFormData>({
    resolver: zodResolver(CreateShiftPaymentSchema),
    defaultValues: {
      pumpMasterId,
      salesmanNozzleShiftId,
      customerId: "",
      bankAccountId: "",
      amount: 0,
      paymentDate: new Date(),
      paymentMethod: "",
      referenceNumber: "NA",
      notes: "",
    },
  });

  useEffect(() => {
    fetchBankAccounts();
    fetchCustomers();
  }, [fetchBankAccounts, fetchCustomers]);

  const onSubmit = async (data: CreateShiftPaymentFormData) => {
    try {
      await createPayment({
        pumpMasterId: data.pumpMasterId,
        salesmanNozzleShiftId: data.salesmanNozzleShiftId,
        customerId: data.customerId,
        bankAccountId: data.bankAccountId,
        amount: data.amount,
        paymentDate: data.paymentDate.toISOString(),
        paymentMethod: data.paymentMethod as PaymentMethod,
        referenceNumber: data.referenceNumber,
        notes: data.notes,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create payment:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <FormControl>
                <ReactSelect
                  options={customers.map((customer) => ({
                    value: customer.id || "",
                    label: customer.customerName,
                  }))}
                  value={
                    field.value
                      ? {
                          value: field.value,
                          label:
                            customers.find((c) => c.id === field.value)
                              ?.customerName || "",
                        }
                      : null
                  }
                  onChange={(option) => field.onChange(option?.value || "")}
                  placeholder="Select customer..."
                  styles={selectStyles}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bankAccountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Account</FormLabel>
              <FormControl>
                <ReactSelect
                  options={bankAccounts.map((account) => ({
                    value: account.id || "",
                    label: `${account.accountHolderName} (${account.accountNumber})`,
                  }))}
                  value={
                    field.value
                      ? {
                          value: field.value,
                          label: bankAccounts.find((a) => a.id === field.value)
                            ? `${
                                bankAccounts.find((a) => a.id === field.value)
                                  ?.accountHolderName
                              } (${
                                bankAccounts.find((a) => a.id === field.value)
                                  ?.accountNumber
                              })`
                            : "",
                        }
                      : null
                  }
                  onChange={(option) => field.onChange(option?.value || "")}
                  placeholder="Select bank account..."
                  styles={selectStyles}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={field.value === 0 ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? 0 : parseFloat(value) || 0);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Date</FormLabel>
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
        </div>

        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <FormControl>
                <ReactSelect
                  options={[
                    { value: PaymentMethod.CASH, label: "Cash" },
                    { value: PaymentMethod.CHEQUE, label: "Cheque" },
                    { value: PaymentMethod.UPI, label: "UPI" },
                    { value: PaymentMethod.RTGS, label: "RTGS" },
                    { value: PaymentMethod.NEFT, label: "NEFT" },
                    { value: PaymentMethod.IMPS, label: "IMPS" },
                  ]}
                  value={
                    field.value
                      ? {
                          value: field.value,
                          label: field.value,
                        }
                      : null
                  }
                  onChange={(option) => field.onChange(option?.value || "")}
                  placeholder="Select payment method..."
                  styles={selectStyles}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="referenceNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter reference number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Record Payment
          </Button>
        </div>
      </form>
    </Form>
  );
}
