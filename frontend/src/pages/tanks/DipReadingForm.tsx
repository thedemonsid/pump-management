import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DipReadingService } from "@/services";
import {
  CreateDipReadingSchema,
  type CreateDipReading,
  type DipReading,
  type Tank,
} from "@/types";
import { toast } from "sonner";
import { useTankLedgerStore } from "@/store/tank-ledger-store";
import { formatOpeningLevelDate } from "@/store/tank-store";

interface DipReadingFormProps {
  tank: Tank;
  reading?: DipReading | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DipReadingForm({
  tank,
  reading,
  onSuccess,
  onCancel,
}: DipReadingFormProps) {
  const isEditing = !!reading;
  const { getCurrentLevel } = useTankLedgerStore();
  const [calculatingSystemLevel, setCalculatingSystemLevel] = useState(false);

  const form = useForm<CreateDipReading>({
    resolver: zodResolver(CreateDipReadingSchema),
    defaultValues: {
      tankId: reading?.tankId || tank.id || "",
      pumpMasterId: reading?.pumpMasterId || tank.pumpMasterId || "",
      dipLevel: reading?.dipLevel || undefined,
      density: reading?.density || undefined,
      temperature: reading?.temperature || undefined,
      fuelLevelLitres: reading?.fuelLevelLitres || undefined,
      fuelLevelSystem: reading?.fuelLevelSystem || undefined,
      variance: reading?.variance || undefined,
      remarks: reading?.remarks || "",
    },
  });

  // Calculate system level automatically
  useEffect(() => {
    const calculateSystemLevel = async () => {
      if (!tank.id) return;

      setCalculatingSystemLevel(true);
      try {
        const today = new Date().toISOString().split("T")[0];
        const fromDate = tank.openingLevelDate
          ? formatOpeningLevelDate(tank.openingLevelDate) || today
          : today;

        const currentLevel = await getCurrentLevel({
          tankId: tank.id,
          fromDate,
          toDate: today,
        });

        // Set the calculated system level
        form.setValue("fuelLevelSystem", currentLevel);
      } catch (error) {
        console.error("Failed to calculate system level:", error);
        // Fallback to tank's current level if available
        if (tank.currentLevel) {
          form.setValue("fuelLevelSystem", tank.currentLevel);
        }
      } finally {
        setCalculatingSystemLevel(false);
      }
    };

    calculateSystemLevel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tank.id]);

  // Auto-calculate variance when fuel levels change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "fuelLevelLitres" || name === "fuelLevelSystem") {
        const physicalLevel = value.fuelLevelLitres;
        const systemLevel = value.fuelLevelSystem;

        if (
          physicalLevel !== undefined &&
          systemLevel !== undefined &&
          !isNaN(physicalLevel) &&
          !isNaN(systemLevel)
        ) {
          const calculatedVariance = physicalLevel - systemLevel;
          form.setValue("variance", calculatedVariance);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: CreateDipReading) => {
    try {
      // Calculate variance if both fuel levels are provided
      if (
        data.fuelLevelLitres !== undefined &&
        data.fuelLevelSystem !== undefined
      ) {
        data.variance = data.fuelLevelLitres - data.fuelLevelSystem;
      }

      if (isEditing && reading) {
        await DipReadingService.update(reading.id, data);
        toast.success("Dip reading updated successfully");
      } else {
        await DipReadingService.create(data);
        toast.success("Dip reading created successfully");
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save dip reading:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save dip reading";
      toast.error(errorMessage);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Dip Level */}
          <FormField
            control={form.control}
            name="dipLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dip Level (mm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Temperature */}
          <FormField
            control={form.control}
            name="temperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temperature (°C)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Density */}
          <FormField
            control={form.control}
            name="density"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Density (kg/m³)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="0.0000"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fuel Level (Physical) */}
          <FormField
            control={form.control}
            name="fuelLevelLitres"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Physical Level (L)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>From dip reading</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* System Fuel Level */}
        <FormField
          control={form.control}
          name="fuelLevelSystem"
          render={({ field }) => (
            <FormItem>
              <FormLabel>System Level (L)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={
                      calculatingSystemLevel ? "Calculating..." : "0.00"
                    }
                    {...field}
                    value={field.value ?? ""}
                    readOnly
                    disabled={calculatingSystemLevel}
                    className="bg-muted"
                  />
                  {calculatingSystemLevel && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Auto-calculated from tank ledger (read-only)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Remarks */}
        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remarks</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any observations or notes..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional notes about this reading
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="flex-1"
          >
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEditing ? "Update Reading" : "Save Reading"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={form.formState.isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
