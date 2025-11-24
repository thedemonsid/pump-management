import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, CalendarIcon } from "lucide-react";
import { CalculatedSalaryService } from "@/services/calculated-salary-service";
import { UserAbsenceService } from "@/services/user-absence-service";
import type { CreateCalculatedSalary, EmployeeSalaryConfig } from "@/types";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

interface CreateCalculatedSalarySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  configId: string;
  userId: string;
  config: EmployeeSalaryConfig | null;
}

export function CreateCalculatedSalarySheet({
  open,
  onOpenChange,
  onSuccess,
  configId,
  userId,
  config,
}: CreateCalculatedSalarySheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to get previous month date range
  const getPreviousMonthDates = () => {
    const today = new Date();
    const firstDayOfCurrentMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );
    const lastDayOfPreviousMonth = new Date(
      firstDayOfCurrentMonth.getTime() - 1
    );
    const firstDayOfPreviousMonth = new Date(
      lastDayOfPreviousMonth.getFullYear(),
      lastDayOfPreviousMonth.getMonth(),
      1
    );

    return {
      from: firstDayOfPreviousMonth,
      to: lastDayOfPreviousMonth,
    };
  };

  const previousMonthDates = getPreviousMonthDates();
  const [fromDate, setFromDate] = useState<Date | undefined>(
    previousMonthDates.from
  );
  const [toDate, setToDate] = useState<Date | undefined>(previousMonthDates.to);

  const form = useForm<CreateCalculatedSalary>({
    defaultValues: {
      userId: userId,
      pumpMasterId: config?.pumpMasterId || "",
      salaryConfigId: configId,
      fromDate: previousMonthDates.from.toISOString().split("T")[0],
      toDate: previousMonthDates.to.toISOString().split("T")[0],
      totalDays: 0,
      fullDayAbsences: 0,
      halfDayAbsences: 0,
      workingDays: 0,
      overtimeDays: 0,
      basicSalaryAmount: 0,
      overtimeAmount: 0,
      additionalPayment: 0,
      additionalDeduction: 0,
      grossSalary: 0,
      netSalary: 0,
      calculationDate: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  // Watch form values for auto-calculations
  const [
    fullDayAbsences,
    halfDayAbsences,
    totalDays,
    workingDays,
    basicSalaryAmount,
    overtimeAmount,
    additionalPayment,
    additionalDeduction,
  ] = form.watch([
    "fullDayAbsences",
    "halfDayAbsences",
    "totalDays",
    "workingDays",
    "basicSalaryAmount",
    "overtimeAmount",
    "additionalPayment",
    "additionalDeduction",
  ]);

  // Calculate total days when dates change
  useEffect(() => {
    if (fromDate && toDate) {
      const days = differenceInDays(toDate, fromDate) + 1;
      if (days >= 0) {
        form.setValue("totalDays", days);
      }
    }
  }, [fromDate, toDate, form]);

  // Calculate working days when absences change
  useEffect(() => {
    const totalDays = form.getValues("totalDays");

    const workingDays = totalDays - fullDayAbsences - halfDayAbsences * 0.5;

    form.setValue("workingDays", workingDays);
  }, [fullDayAbsences, halfDayAbsences, form]);

  // Calculate gross and net salary with deduction for absent days
  useEffect(() => {
    // Calculate salary deduction based on 30-day month
    // Daily rate = monthlySalary / 30
    // Deduction = absentDays * dailyRate
    let adjustedBasicSalary = basicSalaryAmount;

    if (totalDays > 0) {
      const absentDays = totalDays - workingDays;
      const dailyRate = basicSalaryAmount / 30; // Fixed 30-day month
      const deduction = absentDays * dailyRate;
      adjustedBasicSalary = Math.round(basicSalaryAmount - deduction);
    }

    const grossSalary = Math.round(
      adjustedBasicSalary + overtimeAmount + additionalPayment
    );
    const netSalary = Math.round(grossSalary - additionalDeduction);

    form.setValue("grossSalary", grossSalary);
    form.setValue("netSalary", netSalary);
  }, [
    totalDays,
    workingDays,
    basicSalaryAmount,
    overtimeAmount,
    additionalPayment,
    additionalDeduction,
    form,
  ]);

  // Set basic salary amount and pumpMasterId from config
  useEffect(() => {
    if (config && open) {
      form.setValue("basicSalaryAmount", config.basicSalaryAmount || 0);
      form.setValue("pumpMasterId", config.pumpMasterId || "");
    }
  }, [config, open, form]);

  // Fetch absences when dates change or sheet opens
  useEffect(() => {
    const fetchAbsences = async () => {
      if (!userId || !fromDate || !toDate || !open) {
        return;
      }

      try {
        const startDate = format(fromDate, "yyyy-MM-dd");
        const endDate = format(toDate, "yyyy-MM-dd");

        const fetchedAbsences = await UserAbsenceService.getByDateRange(
          startDate,
          endDate
        );

        // Filter absences for the specific user
        const userAbsences = fetchedAbsences.filter(
          (absence) => absence.userId === userId
        );

        // Calculate full day and half day absences
        const fullDays = userAbsences.filter(
          (absence) => absence.absenceType === "FULL_DAY"
        ).length;

        const halfDays = userAbsences.filter(
          (absence) => absence.absenceType === "HALF_DAY"
        ).length;

        const overtimeDays = userAbsences.filter(
          (absence) => absence.absenceType === "OVERTIME"
        ).length;

        // Set the calculated values
        form.setValue("fullDayAbsences", fullDays);
        form.setValue("halfDayAbsences", halfDays);
        form.setValue("overtimeDays", overtimeDays);
      } catch (error) {
        console.error("Error fetching absences:", error);
        toast.error("Failed to fetch absence data");
      }
    };

    fetchAbsences();
  }, [userId, fromDate, toDate, open, form]);

  const onSubmit = async (data: CreateCalculatedSalary) => {
    try {
      setIsSubmitting(true);

      const payload = {
        ...data,
        fromDate: fromDate ? format(fromDate, "yyyy-MM-dd") : "",
        toDate: toDate ? format(toDate, "yyyy-MM-dd") : "",
        calculationDate: format(new Date(), "yyyy-MM-dd"),
      };

      await CalculatedSalaryService.create(payload);

      toast.success("Salary calculation created successfully.");

      const newPreviousMonthDates = getPreviousMonthDates();
      form.reset({
        userId: userId,
        pumpMasterId: config?.pumpMasterId || "",
        salaryConfigId: configId,
        fromDate: newPreviousMonthDates.from.toISOString().split("T")[0],
        toDate: newPreviousMonthDates.to.toISOString().split("T")[0],
        totalDays: 0,
        fullDayAbsences: 0,
        halfDayAbsences: 0,
        workingDays: 0,
        overtimeDays: 0,
        basicSalaryAmount: config?.basicSalaryAmount || 0,
        overtimeAmount: 0,
        additionalPayment: 0,
        additionalDeduction: 0,
        grossSalary: 0,
        netSalary: 0,
        calculationDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setFromDate(newPreviousMonthDates.from);
      setToDate(newPreviousMonthDates.to);
      onSuccess();
    } catch (error: unknown) {
      console.error("Failed to create salary calculation:", error);

      const err = error as {
        message?: string;
      };

      let errorMessage =
        "Failed to create salary calculation. Please try again.";

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Salary Calculation</SheetTitle>
          <SheetDescription>
            Calculate salary for {config?.username || "employee"} based on
            attendance and adjustments. All fields marked with * are required.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 p-1 mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Period Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Period</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fromDate"
                    render={() => (
                      <FormItem className="flex flex-col">
                        <FormLabel>From Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !fromDate && "text-muted-foreground"
                                )}
                              >
                                {fromDate ? (
                                  format(fromDate, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={fromDate}
                              onSelect={setFromDate}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="toDate"
                    render={() => (
                      <FormItem className="flex flex-col">
                        <FormLabel>To Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !toDate && "text-muted-foreground"
                                )}
                              >
                                {toDate ? (
                                  format(toDate, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={toDate}
                              onSelect={setToDate}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01") ||
                                (fromDate ? date < fromDate : false)
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="totalDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Days (Auto-calculated)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          disabled
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormDescription>
                        Automatically calculated from date range
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Attendance Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Attendance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullDayAbsences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Day Absences (Auto-filled)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            disabled
                            className="bg-muted"
                          />
                        </FormControl>
                        <FormDescription>
                          Automatically filled from absence records
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="halfDayAbsences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Half Day Absences (Auto-filled)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            disabled
                            className="bg-muted"
                          />
                        </FormControl>
                        <FormDescription>
                          Automatically filled from absence records
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="workingDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Working Days (Auto-calculated)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          disabled
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormDescription>
                        Total days minus absences (half day = 0.5)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="overtimeDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overtime Days (Auto-filled)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          disabled
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormDescription>
                        Automatically filled from absence records
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Salary Components Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Salary Components</h3>
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
                          min="0"
                          placeholder="0.00"
                          value={field.value === 0 ? "" : field.value}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(
                              value === "" ? 0 : parseFloat(value) || 0
                            );
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Base salary for the period
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="overtimeAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overtime Amount (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={field.value === 0 ? "" : field.value}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(
                              value === "" ? 0 : parseFloat(value) || 0
                            );
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Payment for overtime hours
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Adjustments Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Adjustments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="additionalPayment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Payment (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={field.value === 0 ? "" : field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? 0 : parseFloat(value) || 0
                              );
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Bonuses, incentives, etc.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalDeduction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Deduction (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={field.value === 0 ? "" : field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? 0 : parseFloat(value) || 0
                              );
                            }}
                          />
                        </FormControl>
                        <FormDescription>Fines, advances, etc.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Calculated Totals Section */}
              <div className="space-y-4 p-4 bg-muted rounded-lg">
                <h3 className="text-sm font-semibold">Calculated Totals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="grossSalary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gross Salary (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            disabled
                            className="bg-background font-semibold"
                          />
                        </FormControl>
                        <FormDescription>
                          Basic + OT + Additional Payment
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="netSalary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Net Salary (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            disabled
                            className="bg-background font-bold text-lg"
                          />
                        </FormControl>
                        <FormDescription>
                          Gross - Additional Deduction
                        </FormDescription>
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
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes or remarks..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional notes about this salary calculation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Calculation
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
