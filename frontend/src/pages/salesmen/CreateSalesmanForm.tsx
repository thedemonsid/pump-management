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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { DEFAULT_PUMP_INFO, SalesmanSchema } from '@/types';
import { useSalesmanStore } from '@/store/salesman-store';
import { z } from 'zod';
// Only use fields required by CreateSalesmanRequest DTO
const CreateSalesmanSchema = SalesmanSchema.pick({
  pumpMasterId: true,
  name: true,
  employeeId: true,
  email: true,
  contactNumber: true,
  address: true,
  aadharCardNumber: true,
  panCardNumber: true,
  active: true,
}).extend({
  active: z.boolean(),
});
type CreateSalesmanFormData = z.infer<typeof CreateSalesmanSchema>;

export function CreateSalesmanForm({
  onSuccess,
  onCancel,
}: {
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const { createSalesman } = useSalesmanStore();
  const form = useForm<CreateSalesmanFormData>({
    resolver: zodResolver(CreateSalesmanSchema),
    defaultValues: {
      pumpMasterId: DEFAULT_PUMP_INFO.id,
      name: '',
      employeeId: '',
      contactNumber: '',
      address: '',
      aadharCardNumber: '',
      panCardNumber: '',
      active: true,
    },
  });
  const { formState, handleSubmit, reset, control } = form;
  const { isSubmitting } = formState;

  const onSubmit = async (data: CreateSalesmanFormData) => {
    const submitData = {
      ...data,
      email: data.email && data.email.trim() !== '' ? data.email : undefined,
    };
    await createSalesman(submitData);
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
                    placeholder="Enter Pan Card address"
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
                Creating...
              </>
            ) : (
              <>Create Salesman</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
