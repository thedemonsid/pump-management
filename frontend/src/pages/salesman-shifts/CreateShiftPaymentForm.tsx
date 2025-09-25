import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSalesmanBillPaymentStore } from '@/store/salesman-bill-payment-store';
import { useBankAccountStore } from '@/store/bank-account-store';
import { useCustomerStore } from '@/store/customer-store';
import { PaymentMethod } from '@/types/customer-bill-payment';
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

const CreateShiftPaymentSchema = z.object({
  pumpMasterId: z.string().min(1, 'Pump Master ID is required'),
  salesmanNozzleShiftId: z.string().min(1, 'Shift is required'),
  customerId: z.string().min(1, 'Customer is required'),
  bankAccountId: z.string().min(1, 'Bank Account is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentDate: z.date(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  referenceNumber: z.string().min(1, 'Reference number is required'),
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
      customerId: '',
      bankAccountId: '',
      amount: 0,
      paymentDate: new Date(),
      paymentMethod: '',
      referenceNumber: '',
      notes: '',
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
      console.error('Failed to create payment:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem
                        key={customer.id || customer.customerName}
                        value={customer.id || ''}
                      >
                        {customer.customerName}
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
            name="bankAccountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Account</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank account" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {bankAccounts.map((account) => (
                      <SelectItem
                        key={account.id || account.accountNumber}
                        value={account.id || ''}
                      >
                        {account.accountHolderName} ({account.accountNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
        </div>

        <div className="grid grid-cols-2 gap-4">
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
                    <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                    <SelectItem value={PaymentMethod.CHEQUE}>Cheque</SelectItem>
                    <SelectItem value={PaymentMethod.UPI}>UPI</SelectItem>
                    <SelectItem value={PaymentMethod.RTGS}>RTGS</SelectItem>
                    <SelectItem value={PaymentMethod.NEFT}>NEFT</SelectItem>
                    <SelectItem value={PaymentMethod.IMPS}>IMPS</SelectItem>
                  </SelectContent>
                </Select>
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
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Record Payment
          </Button>
        </div>
      </form>
    </Form>
  );
}
