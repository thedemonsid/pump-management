import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNozzleShiftStore } from "@/store/nozzle-shift-store";
import { useSalesmanStore } from "@/store/salesman-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import type { UpdateNozzleShiftRequest, NozzleShiftResponse } from "@/types";

const updateNozzleShiftSchema = z.object({
  closingTime: z.string().optional(),
  closingReading: z.number().min(0).optional(),
  fuelPrice: z.number().min(0).optional(),
  nextSalesmanId: z.string().optional(),
  closed: z.boolean().optional(),
});

type UpdateNozzleShiftFormData = z.infer<typeof updateNozzleShiftSchema>;

interface UpdateNozzleShiftFormProps {
  shift: NozzleShiftResponse;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UpdateNozzleShiftForm({
  shift,
  onSuccess,
  onCancel,
}: UpdateNozzleShiftFormProps) {
  const { editNozzleShift, loading } = useNozzleShiftStore();
  const { salesmen, fetchSalesmen } = useSalesmanStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateNozzleShiftFormData>({
    resolver: zodResolver(updateNozzleShiftSchema),
    defaultValues: {
      closingTime: shift.closingTime || new Date().toTimeString().slice(0, 5),
      closingReading: shift.closingReading || 0,
      fuelPrice: shift.fuelPrice,
      nextSalesmanId: shift.nextSalesmanId || "none",
      closed: shift.closed,
    },
  });

  // Fetch salesmen on mount
  useEffect(() => {
    fetchSalesmen();
  }, [fetchSalesmen]);

  const onSubmit = async (data: UpdateNozzleShiftFormData) => {
    try {
      setIsSubmitting(true);
      const request: UpdateNozzleShiftRequest = {
        closingTime: data.closingTime,
        closingReading: data.closingReading,
        fuelPrice: data.fuelPrice,
        nextSalesmanId:
          data.nextSalesmanId === "none" ? undefined : data.nextSalesmanId,
        closed: data.closed,
      };

      await editNozzleShift(shift.id, request);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update nozzle shift:", error);
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
            name="closingTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Closing Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="closingReading"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Closing Reading</FormLabel>
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
                    <SelectItem value="none">
                      <span className="text-muted-foreground">None</span>
                    </SelectItem>
                    {salesmen.map((salesman) => (
                      <SelectItem key={salesman.id} value={salesman.id!}>
                        {salesman.username} ({salesman.mobileNumber})
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
            name="closed"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Close Shift</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Mark this shift as closed
                  </p>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Display calculated values */}
        {shift.closingReading && shift.openingReading && (
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Calculated Values</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Dispensed Amount:</span>
                <div className="font-medium">
                  {(
                    shift.closingReading - shift.openingReading
                  ).toLocaleString()}{" "}
                  L
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Total Value:</span>
                <div className="font-medium">
                  ₹
                  {(
                    (shift.closingReading - shift.openingReading) *
                    shift.fuelPrice
                  ).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

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
                Updating...
              </>
            ) : (
              "Update Shift"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
