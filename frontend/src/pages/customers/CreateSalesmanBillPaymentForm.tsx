import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSalesmanBillPaymentStore } from "@/store/salesman-bill-payment-store";
import { useSalesmanBillStore } from "@/store/salesman-bill-store";
import { useSalesmanStore } from "@/store/salesman-store";
import { PaymentMethod } from "@/types/customer-bill-payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const CreateSalesmanBillPaymentSchema = z.object({
  pumpMasterId: z.string().min(1, "Pump Master ID is required"),
  salesmanShiftId: z.string().min(1, "Salesman Shift is required"),
  customerId: z.string().min(1, "Customer ID is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  paymentDate: z.date(),
  paymentMethod: z.string().min(1, "Payment method is required"),
  referenceNumber: z.string().min(1, "Reference number is required"),
  notes: z.string().optional(),
});

type CreateSalesmanBillPaymentFormData = z.infer<
  typeof CreateSalesmanBillPaymentSchema
>;

interface CreateSalesmanBillPaymentFormProps {
  customerId: string;
  pumpMasterId: string;
  onSuccess: () => void;
}

export function CreateSalesmanBillPaymentForm({
  customerId,
  pumpMasterId,
  onSuccess,
}: CreateSalesmanBillPaymentFormProps) {
  const { createPayment, loading } = useSalesmanBillPaymentStore();
  const { customerBills: salesmanBills, fetchBillsByCustomerId } =
    useSalesmanBillStore();
  const { fetchSalesmen } = useSalesmanStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBillsByCustomerId(customerId);
    fetchSalesmen();
  }, [fetchBillsByCustomerId, fetchSalesmen, customerId]);

  const form = useForm<CreateSalesmanBillPaymentFormData>({
    resolver: zodResolver(CreateSalesmanBillPaymentSchema),
    defaultValues: {
      pumpMasterId,
      customerId,
      salesmanShiftId: "",
      amount: 0,
      paymentDate: new Date(),
      paymentMethod: "",
      referenceNumber: "",
      notes: "",
    },
  });

  const onSubmit = async (data: CreateSalesmanBillPaymentFormData) => {
    setIsSubmitting(true);
    try {
      await createPayment({
        ...data,
        paymentDate: data.paymentDate.toISOString(),
        paymentMethod: data.paymentMethod as PaymentMethod,
        notes: data.notes || undefined,
      });
      onSuccess();
    } catch (error) {
      console.error("Failed to create payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get unique salesman nozzle shifts from salesman bills
  const filteredBills = salesmanBills.filter(
    (bill) => bill.customerId === customerId
  );

  const uniqueShifts = filteredBills.reduce(
    (acc: Array<{ id: string; displayName: string }>, bill) => {
      if (
        bill.salesmanShiftId &&
        !acc.find((s) => s.id === bill.salesmanShiftId)
      ) {
        acc.push({
          id: bill.salesmanShiftId,
          displayName: `Shift ${bill.salesmanShiftId.slice(-8)} - ${format(
            new Date(bill.billDate),
            "PPP"
          )}`,
        });
      }
      return acc;
    },
    []
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="salesmanShiftId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salesman Shift</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select salesman shift" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {uniqueShifts.map((shift) => (
                      <SelectItem key={shift.id} value={shift.id}>
                        {shift.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Payment Date (Optional)</FormLabel>
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
                <p className="text-xs text-muted-foreground">
                  Defaults to today if not specified
                </p>
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
        </div>

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
          <Button
            type="submit"
            disabled={isSubmitting || loading}
            className="min-w-[120px]"
          >
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
  );
}
