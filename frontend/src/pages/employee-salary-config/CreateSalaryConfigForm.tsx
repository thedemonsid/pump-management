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
import ReactSelect, { type CSSObjectWithLabel } from "react-select";
import { EmployeeSalaryConfigService } from "@/services/employee-salary-config-service";
import {
  type CreateEmployeeSalaryConfig,
  SalaryType,
} from "@/types/employee-salary";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { SalesmanService } from "@/services/salesman-service";
import { ManagerService } from "@/services/manager-service";
import type { Salesman, Manager } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CreateSalaryConfigFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface UserOption {
  value: string;
  label: string;
  role: string;
}

// React Select styles matching ExpenseSheet
const selectStyles = {
  control: (provided: CSSObjectWithLabel) => ({
    ...provided,
    minHeight: "36px",
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    "&:hover": {
      borderColor: "#9ca3af",
    },
    boxShadow: "none",
    "&:focus-within": {
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 1px #3b82f6",
    },
    fontSize: "16px",
  }),
  option: (
    provided: CSSObjectWithLabel,
    state: { isSelected: boolean; isFocused: boolean }
  ) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#3b82f6"
      : state.isFocused
      ? "#dbeafe"
      : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#111827",
    "&:hover": {
      backgroundColor: state.isSelected ? "#2563eb" : "#dbeafe",
    },
    fontSize: "16px",
  }),
  menu: (provided: CSSObjectWithLabel) => ({
    ...provided,
    zIndex: 9999,
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
  }),
  menuPortal: (base: CSSObjectWithLabel) => ({
    ...base,
    zIndex: 9999,
    pointerEvents: "auto" as const,
  }),
};

export function CreateSalaryConfigForm({
  open,
  onOpenChange,
  onSuccess,
}: CreateSalaryConfigFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [effectiveFromDate, setEffectiveFromDate] = useState<Date | undefined>(
    new Date()
  );
  const [effectiveToDate, setEffectiveToDate] = useState<Date | undefined>(
    undefined
  );

  const form = useForm<CreateEmployeeSalaryConfig>({
    defaultValues: {
      userId: "",
      pumpMasterId: user?.pumpMasterId || "",
      salaryType: "MONTHLY",
      basicSalaryAmount: 0,
      effectiveFrom: new Date().toISOString().split("T")[0],
      effectiveTo: undefined,
      halfDayRate: 0.5,
      overtimeRate: 1.5,
      notes: "",
    },
  });

  useEffect(() => {
    if (user?.pumpMasterId) {
      form.setValue("pumpMasterId", user.pumpMasterId);
    }
  }, [user, form]);

  // Fetch users (Salesmen and Managers)
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const [salesmen, managers] = await Promise.all([
          SalesmanService.getAll(),
          ManagerService.getAll(),
        ]);

        const salesmenOptions: UserOption[] = salesmen.map((s: Salesman) => ({
          value: s.id!,
          label: `${s.username} (Salesman)`,
          role: "SALESMAN",
        }));

        const managerOptions: UserOption[] = managers.map((m: Manager) => ({
          value: m.id!,
          label: `${m.username} (Manager)`,
          role: "MANAGER",
        }));

        setUsers([...salesmenOptions, ...managerOptions]);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to load employees. Please try again.");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const onSubmit = async (data: CreateEmployeeSalaryConfig) => {
    try {
      setIsSubmitting(true);

      // Convert dates to YYYY-MM-DD format
      const payload = {
        ...data,
        effectiveFrom: effectiveFromDate
          ? format(effectiveFromDate, "yyyy-MM-dd")
          : new Date().toISOString().split("T")[0],
        effectiveTo: effectiveToDate
          ? format(effectiveToDate, "yyyy-MM-dd")
          : null,
      };

      await EmployeeSalaryConfigService.create(payload);

      toast.success("Salary configuration created successfully.");

      form.reset();
      setEffectiveFromDate(new Date());
      setEffectiveToDate(undefined);
      onOpenChange(false);
      onSuccess();
    } catch (error: unknown) {
      console.error("Failed to create salary config:", error);

      const err = error as {
        message?: string;
      };

      // The API interceptor throws a new Error with format: "statusCode: message"
      // Example: "400: An active salary configuration already exists for this user. Please deactivate it first."
      let errorMessage =
        "Failed to create salary configuration. Please try again.";

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Salary Configuration</SheetTitle>
          <SheetDescription>
            Set up a new salary configuration for an employee. All fields marked
            with * are required.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 p-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Employee Selection */}
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee *</FormLabel>
                    <FormControl>
                      <ReactSelect
                        options={users}
                        value={
                          users.find((u) => u.value === field.value) || null
                        }
                        onChange={(option) =>
                          field.onChange(option?.value || "")
                        }
                        placeholder="Select employee (Salesman or Manager)"
                        styles={selectStyles}
                        isLoading={loadingUsers}
                        isDisabled={loadingUsers}
                        menuPortalTarget={document.body}
                      />
                    </FormControl>
                    <FormDescription>
                      Select the employee for this salary configuration
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Salary Type */}
              <FormField
                control={form.control}
                name="salaryType"
                render={({ field }) => (
                  <div className="flex flex-col gap-1">
                    <FormLabel>Salary Type *</FormLabel>
                    <ReactSelect
                      options={[
                        { value: SalaryType.DAILY, label: "Daily" },
                        { value: SalaryType.WEEKLY, label: "Weekly" },
                        { value: SalaryType.MONTHLY, label: "Monthly" },
                      ]}
                      value={
                        field.value
                          ? {
                              value: field.value,
                              label:
                                field.value.charAt(0) +
                                field.value.slice(1).toLowerCase(),
                            }
                          : null
                      }
                      onChange={(option) => field.onChange(option?.value || "")}
                      placeholder="Select salary type"
                      styles={selectStyles}
                      menuPortalTarget={document.body}
                    />
                    <FormDescription>
                      Choose how frequently the salary is calculated
                    </FormDescription>
                    <FormMessage />
                  </div>
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
                  render={() => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Effective From *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !effectiveFromDate && "text-muted-foreground"
                              )}
                            >
                              {effectiveFromDate ? (
                                format(effectiveFromDate, "PPP")
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
                            selected={effectiveFromDate}
                            onSelect={setEffectiveFromDate}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
                  render={() => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Effective To (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !effectiveToDate && "text-muted-foreground"
                              )}
                            >
                              {effectiveToDate ? (
                                format(effectiveToDate, "PPP")
                              ) : (
                                <span>Pick a date (optional)</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={effectiveToDate}
                            onSelect={setEffectiveToDate}
                            disabled={(date) => {
                              if (date < new Date("1900-01-01")) return true;
                              if (effectiveFromDate && date < effectiveFromDate)
                                return true;
                              return false;
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                    form.reset();
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Configuration
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
