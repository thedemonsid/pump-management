import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBankAccountStore } from '@/store/bank-account-store';
import {
  BankAccountSchema,
  type BankAccount,
  DEFAULT_PUMP_INFO,
} from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

// Form schema without id, pumpMasterId, createdAt, updatedAt, version (these are handled by the store/API)
const BankAccountFormSchema = BankAccountSchema.omit({
  id: true,
  pumpMasterId: true,
  createdAt: true,
  updatedAt: true,
  version: true,
});

type BankAccountFormData = z.infer<typeof BankAccountFormSchema>;

interface BankAccountFormProps {
  bankAccount?: BankAccount;
  onSuccess: () => void;
}

export function BankAccountForm({
  bankAccount,
  onSuccess,
}: BankAccountFormProps) {
  const { createBankAccount, editBankAccount, loading } = useBankAccountStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BankAccountFormData>({
    resolver: zodResolver(BankAccountFormSchema),
    defaultValues: bankAccount
      ? {
          accountHolderName: bankAccount.accountHolderName,
          accountNumber: bankAccount.accountNumber,
          ifscCode: bankAccount.ifscCode,
          bank: bankAccount.bank,
          branch: bankAccount.branch,
          openingBalance: bankAccount.openingBalance,
          openingBalanceDate: bankAccount.openingBalanceDate,
        }
      : {
          accountHolderName: '',
          accountNumber: '',
          ifscCode: '',
          bank: '',
          branch: '',
          openingBalance: 0,
          openingBalanceDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        },
  });

  const onSubmit = async (data: BankAccountFormData) => {
    setIsSubmitting(true);
    try {
      if (bankAccount?.id) {
        // Include existing pumpMasterId when updating
        const updateData = {
          ...data,
          pumpMasterId: DEFAULT_PUMP_INFO.id!,
        };
        await editBankAccount(bankAccount.id, updateData);
      } else {
        // Add default pump master ID for new bank accounts
        const bankAccountWithPumpInfo = {
          ...data,
          pumpMasterId: DEFAULT_PUMP_INFO.id!,
        };
        await createBankAccount(bankAccountWithPumpInfo);
      }
      onSuccess();
      form.reset();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="accountHolderName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Holder Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 123456789012" {...field} />
                </FormControl>
                <FormDescription>10-20 digit account number</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ifscCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IFSC Code</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., SBIN0001234" {...field} />
                </FormControl>
                <FormDescription>11 character IFSC code</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="bank"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., State Bank of India" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="branch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Main Branch" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="openingBalance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opening Balance (₹)</FormLabel>
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
                <FormDescription>
                  Initial balance in the account
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="openingBalanceDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opening Balance Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>
                  Date when the opening balance was recorded
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting || loading}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {bankAccount ? 'Update' : 'Create'} Bank Account
          </Button>
        </div>
      </form>
    </Form>
  );
}
