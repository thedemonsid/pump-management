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
import { Loader2 } from 'lucide-react';
import { useSalesmanStore } from '@/store/salesman-store';
import { z } from 'zod';
// Only use fields required by CreateSalesmanRequest DTO
const CreateSalesmanSchema = z.object({
  username: z
    .string()
    .min(3, 'Username is required')
    .max(50, 'Username must be between 3 and 50 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  mobileNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Mobile number should be valid'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  aadharNumber: z
    .string()
    .max(12, 'Aadhar number cannot exceed 12 characters')
    .optional(),
  panNumber: z
    .string()
    .max(10, 'PAN number cannot exceed 10 characters')
    .optional(),
  enabled: z.boolean(),
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
      username: '',
      password: '',
      mobileNumber: '',
      email: '',
      aadharNumber: '',
      panNumber: '',
      enabled: true,
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
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password *</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="mobileNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Number *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter mobile number" {...field} />
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
                <FormLabel>Email (optional)</FormLabel>
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
            name="aadharNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aadhar Number (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter Aadhar number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="panNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PAN Number (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter PAN number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex items-center space-x-2">
          <FormField
            control={control}
            name="enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4"
                  />
                </FormControl>
                <FormLabel>Enabled</FormLabel>
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
