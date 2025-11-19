import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { EmployeeSalaryConfigService } from "@/services/employee-salary-config-service";
import {
  UpdateEmployeeSalaryConfigSchema,
  type EmployeeSalaryConfig,
  type UpdateEmployeeSalaryConfig,
  SalaryType,
} from "@/types/employee-salary";
import { toast } from "sonner";

interface UpdateSalaryConfigFormProps {
  config: EmployeeSalaryConfig;
  onSuccess: () => void;
}

export function UpdateSalaryConfigForm({
  config,
  onSuccess,
}: UpdateSalaryConfigFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(UpdateEmployeeSalaryConfigSchema),
    defaultValues: {
      salaryType: config.salaryType,
      basicSalaryAmount: config.basicSalaryAmount,
      effectiveFrom: config.effectiveFrom.split("T")[0],
      effectiveTo: config.effectiveTo
        ? config.effectiveTo.split("T")[0]
        : undefined,
      halfDayRate: config.halfDayRate,
      overtimeRate: config.overtimeRate,
      notes: config.notes || "",
    },
  });

  const onSubmit = async (data: UpdateEmployeeSalaryConfig) => {
    try {
      setIsSubmitting(true);

      // Convert effectiveTo to null if empty string
      const payload = {
        ...data,
        effectiveTo: data.effectiveTo || null,
      };

      await EmployeeSalaryConfigService.update(config.id!, payload);

      toast.success("Salary configuration updated successfully.");

      onSuccess();
    } catch (error: unknown) {
      console.error("Failed to update salary config:", error);

      const err = error as {
        message?: string;
      };

      // The API interceptor throws a new Error with format: "statusCode: message"
      let errorMessage =
        "Failed to update salary configuration. Please try again.";

      if (err.message) {
        // Extract message after the status code (format: "400: actual message")
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
        {/* Employee Info (Read Only) */}
        <div className="bg-muted p-4 rounded-md">
          <p className="text-sm font-medium">Employee: {config.username}</p>
          <p className="text-sm text-muted-foreground mt-1">
            You cannot change the employee for an existing configuration.
          </p>
        </div>

        {/* Salary Type */}
        <FormField
          control={form.control}
          name="salaryType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select salary type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={SalaryType.DAILY}>Daily</SelectItem>
                  <SelectItem value={SalaryType.WEEKLY}>Weekly</SelectItem>
                  <SelectItem value={SalaryType.MONTHLY}>Monthly</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose how frequently the salary is calculated
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Basic Salary Amount */}
        <FormField
          control={form.control}
          name="basicSalaryAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Basic Salary Amount (₹) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter basic salary amount"
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseFloat(e.target.value) || 0)
                  }
                />
              </FormControl>
              <FormDescription>
                Base salary amount before any deductions or additions
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="effectiveFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Effective From *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>
                  Start date for this configuration
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="effectiveTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Effective To</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ""} />
                </FormControl>
                <FormDescription>
                  End date (leave empty for ongoing)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Rates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="halfDayRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Half Day Rate (0-1) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    placeholder="0.5"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormDescription>
                  Multiplier for half-day work (default: 0.5)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="overtimeRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Overtime Rate *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="1.5"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormDescription>
                  Multiplier for overtime work (default: 1.5)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
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
                  placeholder="Add any additional notes or remarks..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional notes about this salary configuration (max 500
                characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Configuration
          </Button>
        </div>
      </form>
    </Form>
  );
}
