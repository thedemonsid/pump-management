import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSupplierStore } from '@/store/supplier-store';
import {
  UpdateSupplierSchema,
  type Supplier,
  type UpdateSupplier,
} from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

type UpdateSupplierFormData = UpdateSupplier;

interface UpdateSupplierFormProps {
  supplier: Supplier;
  onSuccess: () => void;
}

export function UpdateSupplierForm({
  supplier,
  onSuccess,
}: UpdateSupplierFormProps) {
  const { editSupplier, loading } = useSupplierStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateSupplierFormData>({
    resolver: zodResolver(UpdateSupplierSchema),
    defaultValues: {
      pumpMasterId: supplier.pumpMasterId,
      supplierName: supplier.supplierName,
      contactPersonName: supplier.contactPersonName,
      contactNumber: supplier.contactNumber,
      email: supplier.email || '',
      gstNumber: supplier.gstNumber,
      taxIdentificationNumber: supplier.taxIdentificationNumber,
      address: supplier.address,
      openingBalance: supplier.openingBalance,
      openingBalanceDate: supplier.openingBalanceDate,
    },
  });

  const onSubmit = async (data: UpdateSupplierFormData) => {
    setIsSubmitting(true);
    try {
      await editSupplier(supplier.id!, data);
      onSuccess();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="supplierName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., ABC Fuels Ltd" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPersonName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contactNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 9876543210" {...field} />
                </FormControl>
                <FormDescription>10-15 digit contact number</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="e.g., john.doe@abc.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="gstNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GST Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 22AAAAA0000A1Z5" {...field} />
                </FormControl>
                <FormDescription>
                  15-character GST identification number
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxIdentificationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Identification Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 12345678901" {...field} />
                </FormControl>
                <FormDescription>
                  11-character tax identification number
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., 123 Main Street, City, State, PIN 123456"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Complete address of the supplier (5-255 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="openingBalance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opening Balance</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 1000.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                </FormControl>
                <FormDescription>
                  Opening balance amount (₹). Use negative for outstanding
                  balance
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

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || loading}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Supplier'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
