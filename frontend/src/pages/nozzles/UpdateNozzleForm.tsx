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
import { UpdateNozzleSchema } from '@/types';
import type { Nozzle, UpdateNozzle } from '@/types';

type UpdateNozzleFormData = UpdateNozzle;

interface UpdateNozzleFormProps {
  nozzle: Nozzle;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UpdateNozzleForm({
  nozzle,
  onSuccess,
  onCancel,
}: UpdateNozzleFormProps) {
  const { editNozzle } = useNozzleStore();
  const { tanks, fetchTanks } = useTankStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch tanks when component mounts
  useEffect(() => {
    fetchTanks();
  }, [fetchTanks]);

  const form = useForm<UpdateNozzleFormData>({
    resolver: zodResolver(UpdateNozzleSchema),
    defaultValues: {
      nozzleName: nozzle.nozzleName,
      companyName: nozzle.companyName,
      currentReading: nozzle.currentReading,
      tankId: nozzle.tankId,
      location: nozzle.location || '',
    },
  });

  const onSubmit = async (data: UpdateNozzleFormData) => {
    if (!nozzle.id) return;

    setIsSubmitting(true);
    try {
      // Only send fields that have actually changed
      const changes: UpdateNozzle = {};

      if (data.nozzleName !== nozzle.nozzleName) {
        changes.nozzleName = data.nozzleName;
      }
      if (data.companyName !== nozzle.companyName) {
        changes.companyName = data.companyName;
      }
      if (data.currentReading !== nozzle.currentReading) {
        changes.currentReading = data.currentReading;
      }
      if (data.tankId !== nozzle.tankId) {
        changes.tankId = data.tankId;
      }
      if (data.location !== nozzle.location) {
        changes.location = data.location;
      }

      // Only send update if there are actual changes
      if (Object.keys(changes).length > 0) {
        await editNozzle(nozzle.id, changes);
      }

      onSuccess?.();
    } catch (error) {
      console.error('Failed to update nozzle:', error);
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
                <FormLabel>Nozzle Name</FormLabel>
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
                <FormLabel>Company Name</FormLabel>
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
                <FormLabel>Associated Tank</FormLabel>
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
                <FormLabel>Current Reading</FormLabel>
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
              'Update Nozzle'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
