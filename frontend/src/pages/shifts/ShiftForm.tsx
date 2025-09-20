import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useShiftStore } from '@/store/shift-store';
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
import { DEFAULT_PUMP_INFO } from '@/types';
import type { Shift } from '@/types';
import { z } from 'zod';

// Form schema for creating/editing
const ShiftFormSchema = z.object({
  pumpMasterId: z.uuid(),
  name: z.string().min(2, 'Shift name is required').max(50),
  description: z.string().max(200).optional(),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
  isActive: z.boolean(),
});
type ShiftFormData = z.infer<typeof ShiftFormSchema>;

interface ShiftFormProps {
  shift?: Shift;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ShiftForm({ shift, onSuccess, onCancel }: ShiftFormProps) {
  const { createShift, editShift } = useShiftStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ShiftFormData>({
    resolver: zodResolver(ShiftFormSchema),
    defaultValues: {
      pumpMasterId: DEFAULT_PUMP_INFO.id,
      name: shift?.name || '',
      description: shift?.description || '',
      startTime: shift?.startTime ? shift.startTime.slice(0, 5) : '09:00',
      endTime: shift?.endTime ? shift.endTime.slice(0, 5) : '17:00',
      isActive: shift?.isActive ?? true,
    },
  });

  const onSubmit = async (data: ShiftFormData) => {
    setIsSubmitting(true);
    try {
      // Convert time to HH:MM:SS format
      const formattedData = {
        ...data,
        startTime: data.startTime + ':00',
        endTime: data.endTime + ':00',
      };

      if (shift?.id) {
        // Editing existing shift
        await editShift(shift.id, formattedData);
      } else {
        // Creating new shift
        await createShift(formattedData);
      }
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to save shift:', error);
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shift Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter shift name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter shift description (optional)"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Enable or disable this shift
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

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              onCancel?.();
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {shift ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>{shift ? 'Update Shift' : 'Create Shift'}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
