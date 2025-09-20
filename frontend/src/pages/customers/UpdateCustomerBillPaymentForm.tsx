import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCustomerBillPaymentStore } from '@/store/customer-bill-payment-store';
import { useBankAccountStore } from '@/store/bank-account-store';
import { useBillStore } from '@/store/bill-store';
import { PaymentMethod } from '@/types/customer-bill-payment';
import type { CustomerBillPaymentResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const UpdateCustomerBillPaymentSchema = z.object({
  pumpMasterId: z.string().min(1, 'Pump Master ID is required'),
  billId: z.string().optional(),
  customerId: z.string().min(1, 'Customer ID is required'),
  bankAccountId: z.string().min(1, 'Bank Account is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentDate: z.date(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  referenceNumber: z.string().min(1, 'Reference number is required'),
  notes: z.string().optional(),
});

type UpdateCustomerBillPaymentFormData = z.infer<
  typeof UpdateCustomerBillPaymentSchema
>;

interface UpdateCustomerBillPaymentFormProps {
  payment: CustomerBillPaymentResponse;
  onSuccess: () => void;
}

export function UpdateCustomerBillPaymentForm({
  payment,
  onSuccess,
}: UpdateCustomerBillPaymentFormProps) {
  const { editPayment, loading } = useCustomerBillPaymentStore();
  const { bankAccounts, fetchBankAccounts } = useBankAccountStore();
  const { bills, fetchBillsByCustomerId } = useBillStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBankAccounts();
    fetchBillsByCustomerId(payment.customerId);
  }, [fetchBankAccounts, fetchBillsByCustomerId, payment.customerId]);

  const form = useForm<UpdateCustomerBillPaymentFormData>({
    resolver: zodResolver(UpdateCustomerBillPaymentSchema),
    defaultValues: {
      pumpMasterId: payment.pumpMasterId,
      customerId: payment.customerId,
      bankAccountId: payment.bankAccountId,
      billId: payment.billId || undefined,
      amount: payment.amount,
      paymentDate: new Date(payment.paymentDate),
      paymentMethod: payment.paymentMethod,
      referenceNumber: payment.referenceNumber,
      notes: payment.notes || '',
    },
  });

  const onSubmit = async (data: UpdateCustomerBillPaymentFormData) => {
    setIsSubmitting(true);
    try {
      await editPayment(payment.id, {
        pumpMasterId: data.pumpMasterId,
        billId: data.billId,
        customerId: data.customerId,
        bankAccountId: data.bankAccountId,
        amount: data.amount,
        paymentDate: data.paymentDate.toISOString(),
        paymentMethod: data.paymentMethod as PaymentMethod,
        referenceNumber: data.referenceNumber,
        notes: data.notes || undefined,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to update payment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="bankAccountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Account</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank account" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {bankAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id!}>
                        {account.accountHolderName} - {account.accountNumber}
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
            name="billId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bill (Optional)</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value || undefined)}
                  value={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bill (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {bills.map((bill) => (
                      <SelectItem key={bill.id} value={bill.id}>
                        Bill #{bill.billNo} - ₹{bill.netAmount}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Leave empty for general customer payment
                </FormDescription>
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
                    {Object.values(PaymentMethod).map((method) => (
                      <SelectItem key={method} value={method}>
                        {method.replace('_', ' ')}
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
            name="paymentDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Payment Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
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
                        date > new Date() || date < new Date('1900-01-01')
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
                  placeholder="Additional notes about the payment"
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
            className="min-w-[100px]"
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Payment'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
