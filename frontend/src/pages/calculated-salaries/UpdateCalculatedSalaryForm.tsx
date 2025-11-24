import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Loader2 } from "lucide-react";
import { CalculatedSalaryService } from "@/services/calculated-salary-service";
import {
  UpdateCalculatedSalarySchema,
  type UpdateCalculatedSalary,
  type CalculatedSalary,
} from "@/types/employee-salary";
import { toast } from "sonner";

interface UpdateCalculatedSalaryFormProps {
  salary: CalculatedSalary;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UpdateCalculatedSalaryForm({
  salary,
  onSuccess,
  onCancel,
}: UpdateCalculatedSalaryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateCalculatedSalary>({
    resolver: zodResolver(UpdateCalculatedSalarySchema),
    defaultValues: {
      fromDate: salary.fromDate,
      toDate: salary.toDate,
      calculationDate: salary.calculationDate,
      totalDays: salary.totalDays,
      fullDayAbsences: salary.fullDayAbsences,
      halfDayAbsences: salary.halfDayAbsences,
      overtimeDays: salary.overtimeDays,
      workingDays: salary.workingDays,
      basicSalaryAmount: salary.basicSalaryAmount,
      overtimeAmount: salary.overtimeAmount,
      additionalPayment: salary.additionalPayment || 0,
      additionalDeduction: salary.additionalDeduction || 0,
      grossSalary: salary.grossSalary,
      netSalary: salary.netSalary,
      notes: salary.notes || "",
    },
  });

  // Watch form values for auto-calculation
  const fromDate = form.watch("fromDate");
  const toDate = form.watch("toDate");
  const totalDays = form.watch("totalDays");
  const fullDayAbsences = form.watch("fullDayAbsences");
  const halfDayAbsences = form.watch("halfDayAbsences");
  const overtimeDays = form.watch("overtimeDays");
  const workingDays = form.watch("workingDays");
  const basicSalaryAmount = form.watch("basicSalaryAmount");
  const overtimeAmount = form.watch("overtimeAmount");
  const additionalPayment = form.watch("additionalPayment");
  const additionalDeduction = form.watch("additionalDeduction");

  // Calculate total days from date range
  useEffect(() => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      const diffTime = Math.abs(to.getTime() - from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      form.setValue("totalDays", diffDays);
    }
  }, [fromDate, toDate, form]);

  // Calculate working days
  useEffect(() => {
    const calculatedWorkingDays =
      (totalDays || 0) -
      (fullDayAbsences || 0) -
      (halfDayAbsences || 0) * 0.5 +
      (overtimeDays || 0);
    form.setValue("workingDays", Math.max(0, calculatedWorkingDays));
  }, [form, totalDays, fullDayAbsences, halfDayAbsences, overtimeDays]);

  // Calculate gross and net salary with deduction for absent days
  useEffect(() => {
    // Calculate salary deduction based on 30-day month
    // Daily rate = monthlySalary / 30
    // Deduction = absentDays * dailyRate
    let adjustedBasicSalary = basicSalaryAmount || 0;

    if ((totalDays || 0) > 0) {
      const absentDays = (totalDays || 0) - (workingDays || 0);
      const dailyRate = (basicSalaryAmount || 0) / 30; // Fixed 30-day month
      const deduction = absentDays * dailyRate;
      adjustedBasicSalary = Math.round((basicSalaryAmount || 0) - deduction);
    }

    const gross = Math.round(
      adjustedBasicSalary + (overtimeAmount || 0) + (additionalPayment || 0)
    );
    const net = Math.round(gross - (additionalDeduction || 0));
    form.setValue("grossSalary", Math.max(0, gross));
    form.setValue("netSalary", Math.max(0, net));
  }, [
    form,
    totalDays,
    workingDays,
    basicSalaryAmount,
    overtimeAmount,
    additionalPayment,
    additionalDeduction,
  ]);

  const onSubmit = async (data: UpdateCalculatedSalary) => {
    try {
      setIsSubmitting(true);
      await CalculatedSalaryService.update(salary.id!, data);
      toast.success("Salary updated successfully!");
      onSuccess();
    } catch (error) {
      console.error("Failed to update calculated salary:", error);

      const err = error as {
        message?: string;
      };

      let errorMessage = "Failed to update salary. Please try again.";

      if (err.message) {
        const match = err.message.match(/^\d+:\s*(.+)$/);
        if (match && match[1]) {
          errorMessage = match[1];
        } else {
          errorMessage = err.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* From Date */}
          <FormField
            control={form.control}
            name="fromDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>From Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* To Date */}
          <FormField
            control={form.control}
            name="toDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>To Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Calculation Date */}
          <FormField
            control={form.control}
            name="calculationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calculation Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Total Days (Read-only) */}
          <FormField
            control={form.control}
            name="totalDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Days</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value || 0}
                    readOnly
                    className="bg-muted"
                  />
                </FormControl>
                <FormDescription>Automatically calculated</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Attendance Section */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-4">Attendance Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Full Day Absences */}
            <FormField
              control={form.control}
              name="fullDayAbsences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Day Absences</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      {...field}
                      value={field.value || 0}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Half Day Absences */}
            <FormField
              control={form.control}
              name="halfDayAbsences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Half Day Absences</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      {...field}
                      value={field.value || 0}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Overtime Days */}
            <FormField
              control={form.control}
              name="overtimeDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overtime Days</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      {...field}
                      value={field.value || 0}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Working Days (Read-only) */}
            <FormField
              control={form.control}
              name="workingDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Working Days</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || 0}
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormDescription>Automatically calculated</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Salary Components Section */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-4">Salary Components</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Salary Amount */}
            <FormField
              control={form.control}
              name="basicSalaryAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Basic Salary Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      {...field}
                      value={field.value || 0}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Overtime Amount */}
            <FormField
              control={form.control}
              name="overtimeAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overtime Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      {...field}
                      value={field.value || 0}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Payment */}
            <FormField
              control={form.control}
              name="additionalPayment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Payment</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      {...field}
                      value={field.value || 0}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormDescription>Bonuses, allowances, etc.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Deduction */}
            <FormField
              control={form.control}
              name="additionalDeduction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Deduction</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      {...field}
                      value={field.value || 0}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormDescription>Penalties, advances, etc.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Gross Salary (Read-only) */}
            <FormField
              control={form.control}
              name="grossSalary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gross Salary</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || 0}
                      readOnly
                      className="bg-muted font-semibold"
                    />
                  </FormControl>
                  <FormDescription>Automatically calculated</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Net Salary (Read-only) */}
            <FormField
              control={form.control}
              name="netSalary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Net Salary</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || 0}
                      readOnly
                      className="bg-muted font-bold text-lg"
                    />
                  </FormControl>
                  <FormDescription>Automatically calculated</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes..."
                  className="resize-none"
                  rows={3}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Salary
          </Button>
        </div>
      </form>
    </Form>
  );
}
