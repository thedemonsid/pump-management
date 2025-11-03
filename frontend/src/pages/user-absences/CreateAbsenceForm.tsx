import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUserAbsenceStore } from "@/store/user-absence-store";
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CalendarIcon } from "lucide-react";
import ReactSelect from "react-select";
import { SalesmanService } from "@/services/salesman-service";
import { ManagerService } from "@/services/manager-service";
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Form validation schema
const createAbsenceSchema = z.object({
  userId: z.string().min(1, "Please select a user"),
  absenceDate: z.string().min(1, "Absence date is required"),
  reason: z
    .string()
    .max(500, "Reason must not exceed 500 characters")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(1000, "Notes must not exceed 1000 characters")
    .optional()
    .or(z.literal("")),
});

type CreateAbsenceFormValues = z.infer<typeof createAbsenceSchema>;

interface CreateAbsenceFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface UserOption {
  value: string;
  label: string;
  role: string;
}

export function CreateAbsenceForm({
  onSuccess,
  onCancel,
}: CreateAbsenceFormProps) {
  const { createAbsence, loading } = useUserAbsenceStore();
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const form = useForm<CreateAbsenceFormValues>({
    resolver: zodResolver(createAbsenceSchema),
    defaultValues: {
      userId: "",
      absenceDate: format(new Date(), "yyyy-MM-dd"), // Default to today
      reason: "",
      notes: "",
    },
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const [salesmen, managers] = await Promise.all([
        SalesmanService.getAll(),
        ManagerService.getAll(),
      ]);

      const salesmanOptions: UserOption[] = salesmen.map((s) => ({
        value: s.id!,
        label: `${s.username} (${s.mobileNumber})`,
        role: "SALESMAN",
      }));

      const managerOptions: UserOption[] = managers.map((m) => ({
        value: m.id!,
        label: `${m.username} (${m.mobileNumber})`,
        role: "MANAGER",
      }));

      setUserOptions([...salesmanOptions, ...managerOptions]);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  const onSubmit = async (data: CreateAbsenceFormValues) => {
    try {
      await createAbsence({
        userId: data.userId,
        absenceDate: data.absenceDate,
        reason: data.reason || undefined,
        notes: data.notes || undefined,
      });
      form.reset();
      onSuccess();
    } catch (error) {
      // Error is already handled in the store with toast
      console.error("Failed to create absence:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* User Selection */}
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                User <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <ReactSelect
                  options={userOptions}
                  value={userOptions.find((opt) => opt.value === field.value)}
                  onChange={(option) => field.onChange(option?.value || "")}
                  placeholder="Select user (salesman or manager)"
                  className="text-base"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "40px",
                      fontSize: "16px",
                    }),
                    option: (base) => ({
                      ...base,
                      fontSize: "16px",
                    }),
                  }}
                />
              </FormControl>
              <FormDescription>
                Select the salesman or manager who was absent
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Absence Date */}
        <FormField
          control={form.control}
          name="absenceDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>
                Absence Date <span className="text-red-500">*</span>
              </FormLabel>
              <Popover
                open={isDatePickerOpen}
                onOpenChange={setIsDatePickerOpen}
              >
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), "PPP")
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
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => {
                      field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                      setIsDatePickerOpen(false);
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>Date when the user was absent</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Reason */}
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter reason for absence (optional)"
                  className="resize-none"
                  rows={3}
                  maxLength={500}
                  {...field}
                />
              </FormControl>
              <FormDescription>Optional, up to 500 characters</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes (optional)"
                  className="resize-none"
                  rows={3}
                  maxLength={1000}
                  {...field}
                />
              </FormControl>
              <FormDescription>Optional, up to 1000 characters</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Record Absence
          </Button>
        </div>
      </form>
    </Form>
  );
}
