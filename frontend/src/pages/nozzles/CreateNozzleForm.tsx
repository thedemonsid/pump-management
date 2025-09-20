import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNozzleStore } from '@/store/nozzle-store';
import { useTankStore } from '@/store/tank-store';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { CreateNozzleSchema, DEFAULT_PUMP_INFO } from '@/types';
import type { CreateNozzle } from '@/types';

type CreateNozzleFormData = CreateNozzle;

interface CreateNozzleFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateNozzleForm({
  onSuccess,
  onCancel,
}: CreateNozzleFormProps) {
  const { createNozzle } = useNozzleStore();
  const { tanks, fetchTanks } = useTankStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch tanks when component mounts
  useEffect(() => {
    fetchTanks();
  }, [fetchTanks]);

  const form = useForm<CreateNozzleFormData>({
    resolver: zodResolver(CreateNozzleSchema),
    defaultValues: {
      pumpMasterId: DEFAULT_PUMP_INFO.id,
      nozzleName: '',
      companyName: '',
      currentReading: 0,
      tankId: '',
      location: '',
    },
  });

  const onSubmit = async (data: CreateNozzleFormData) => {
    setIsSubmitting(true);
    try {
      await createNozzle(data);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create nozzle:', error);
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
            name="nozzleName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nozzle Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter nozzle name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tankId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Associated Tank *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tank" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tanks.map((tank) => (
                      <SelectItem key={tank.id} value={tank.id!}>
                        {tank.tankName} (
                        {tank.product?.productName || 'No Product'})
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
            name="currentReading"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Reading *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="Enter current reading"
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
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Physical location (optional)"
                    maxLength={50}
                    {...field}
                  />
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
                Creating...
              </>
            ) : (
              'Create Nozzle'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
