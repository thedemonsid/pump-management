import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useSalesmanStore } from '@/store/salesman-store';
import { z } from 'zod';
import { SalesmanSchema } from '@/types';
import type { Salesman } from '@/types';

// Only use fields required by UpdateSalesmanRequest DTO
const UpdateSalesmanSchema = SalesmanSchema.omit({
  id: true,
  pumpMasterId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  active: z.boolean(),
});
type UpdateSalesmanFormData = z.infer<typeof UpdateSalesmanSchema>;

export function UpdateSalesmanForm({
  salesman,
  onSuccess,
  onCancel,
}: {
  salesman: Salesman;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const { editSalesman } = useSalesmanStore();
  // Ensure all required fields are present and dateOfJoining is formatted for input type=date
  const form = useForm<UpdateSalesmanFormData>({
    resolver: zodResolver(UpdateSalesmanSchema),
    defaultValues: {
      name: salesman.name,
      employeeId: salesman.employeeId,
      contactNumber: salesman.contactNumber,
      email: salesman.email,
      address: salesman.address || '',
      aadharCardNumber: salesman.aadharCardNumber || '',
      panCardNumber: salesman.panCardNumber || '',
      active: salesman.active ?? true,
    },
  });
  const { formState, handleSubmit, control, reset } = form;
  const { isSubmitting } = formState;

  const onSubmit = async (data: UpdateSalesmanFormData) => {
    await editSalesman(salesman.id!, data);
    reset();
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter salesman name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="employeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter employee ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="contactNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="aadharCardNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aadhar Card Number</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter Aadhar card number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="panCardNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pan Card Number</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter Pan Card number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Status</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Enable or disable this salesman
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter salesman address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>Update Salesman</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
