import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUserAbsenceStore } from "@/store/user-absence-store";
import { useAuth } from "@/hooks/useAuth";
import { AbsenceType } from "@/types/user-absence";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, CalendarIcon } from "lucide-react";
import type { UserAbsence } from "@/types";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Form validation schema
const updateAbsenceSchema = z.object({
  absenceDate: z.string().min(1, "Absence date is required"),
  absenceType: z.enum(AbsenceType),
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
  isApproved: z.boolean(),
});

type UpdateAbsenceFormValues = z.infer<typeof updateAbsenceSchema>;

interface UpdateAbsenceFormProps {
  absence: UserAbsence;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UpdateAbsenceForm({
  absence,
  onSuccess,
  onCancel,
}: UpdateAbsenceFormProps) {
  const { editAbsence, loading } = useUserAbsenceStore();
  const { user } = useAuth();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  const form = useForm<UpdateAbsenceFormValues>({
    resolver: zodResolver(updateAbsenceSchema),
    defaultValues: {
      absenceDate: absence.absenceDate,
      absenceType: absence.absenceType || AbsenceType.FULL_DAY,
      reason: absence.reason || "",
      notes: absence.notes || "",
      isApproved: absence.isApproved,
    },
  });

  const onSubmit = async (data: UpdateAbsenceFormValues) => {
    try {
      await editAbsence(absence.id!, {
        absenceDate: data.absenceDate,
        absenceType: data.absenceType,
        reason: data.reason || undefined,
        notes: data.notes || undefined,
        isApproved: data.isApproved,
      });
      form.reset();
      onSuccess();
    } catch (error) {
      // Error is already handled in the store with toast
      console.error("Failed to update absence:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* User Info (read-only) */}
        <div className="rounded-lg border p-4 bg-muted/50">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">User:</span> {absence.username}
            </div>
            <div>
              <span className="font-medium">Role:</span> {absence.userRole}
            </div>
          </div>
        </div>

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

        {/* Absence Type */}
        <FormField
          control={form.control}
          name="absenceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Absence Type <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select absence type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={AbsenceType.FULL_DAY}>Full Day</SelectItem>
                  <SelectItem value={AbsenceType.HALF_DAY}>Half Day</SelectItem>
                  <SelectItem value={AbsenceType.OVERTIME}>Overtime</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Select the type of absence or overtime
              </FormDescription>
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

        {/* Approval Toggle (ADMIN only) */}
        {isAdmin && (
          <FormField
            control={form.control}
            name="isApproved"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Approval Status</FormLabel>
                  <FormDescription>
                    Approve or reject this absence record
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {absence.approvedBy && (
          <div className="text-sm text-muted-foreground">
            Approved by: {absence.approvedBy}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Absence
          </Button>
        </div>
      </form>
    </Form>
  );
}
