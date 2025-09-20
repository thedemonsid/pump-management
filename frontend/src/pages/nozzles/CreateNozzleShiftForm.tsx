import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNozzleShiftStore } from '@/store/nozzle-shift-store';
import { useNozzleStore } from '@/store/nozzle-store';
import { useSalesmanStore } from '@/store/salesman-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Loader2 } from 'lucide-react';
import type { CreateNozzleShiftRequest } from '@/types';

const createNozzleShiftSchema = z.object({
  shiftDate: z.string().min(1, 'Shift date is required'),
  openingTime: z.string().min(1, 'Opening time is required'),
  nozzleId: z.string().min(1, 'Nozzle is required'),
  salesmanId: z.string().min(1, 'Salesman is required'),
  openingReading: z.number().min(0, 'Opening reading must be positive'),
  fuelPrice: z.number().min(0, 'Fuel price must be positive'),
  nextSalesmanId: z.string().optional(),
});

type CreateNozzleShiftFormData = z.infer<typeof createNozzleShiftSchema>;

interface CreateNozzleShiftFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  preselectedNozzleId?: string;
}

export function CreateNozzleShiftForm({
  onSuccess,
  onCancel,
  preselectedNozzleId,
}: CreateNozzleShiftFormProps) {
  const { createNozzleShift, loading } = useNozzleShiftStore();
  const { nozzles, fetchNozzles } = useNozzleStore();
  const { salesmen, fetchSalesmen } = useSalesmanStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateNozzleShiftFormData>({
    resolver: zodResolver(createNozzleShiftSchema),
    defaultValues: {
      shiftDate: new Date().toISOString().split('T')[0], // Today's date
      openingTime: new Date().toTimeString().slice(0, 5), // Current time
      nozzleId: preselectedNozzleId || '',
      salesmanId: '',
      openingReading: 0,
      fuelPrice: 0,
      nextSalesmanId: '',
    },
  });

  // Fetch data on mount
  React.useEffect(() => {
    fetchNozzles();
    fetchSalesmen();
  }, [fetchNozzles, fetchSalesmen]);

  const selectedNozzle = nozzles.find(
    (nozzle) => nozzle.id === preselectedNozzleId
  );

  const onSubmit = async (data: CreateNozzleShiftFormData) => {
    try {
      setIsSubmitting(true);
      const request: CreateNozzleShiftRequest = {
        shiftDate: data.shiftDate,
        openingTime: data.openingTime,
        nozzleId: data.nozzleId,
        salesmanId: data.salesmanId,
        openingReading: data.openingReading,
        fuelPrice: data.fuelPrice,
        nextSalesmanId: data.nextSalesmanId || undefined,
      };

      await createNozzleShift(request);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create nozzle shift:', error);
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
            name="shiftDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shift Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="openingTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opening Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nozzleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nozzle</FormLabel>
                {preselectedNozzleId ? (
                  <div className="p-2 border rounded bg-gray-50">
                    {selectedNozzle
                      ? `${selectedNozzle.nozzleName} - ${selectedNozzle.companyName}`
                      : 'Loading...'}
                  </div>
                ) : (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a nozzle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {nozzles.map((nozzle) => (
                        <SelectItem key={nozzle.id} value={nozzle.id!}>
                          {nozzle.nozzleName} - {nozzle.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salesmanId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salesman</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a salesman" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {salesmen.map((salesman) => (
                      <SelectItem key={salesman.id} value={salesman.id!}>
                        {salesman.name} ({salesman.employeeId})
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
            name="openingReading"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opening Reading</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.001"
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
            name="fuelPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fuel Price (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
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
            name="nextSalesmanId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Next Salesman (Optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select next salesman" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {salesmen.map((salesman) => (
                      <SelectItem key={salesman.id} value={salesman.id!}>
                        {salesman.name} ({salesman.employeeId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || loading}>
            {isSubmitting || loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Shift'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
