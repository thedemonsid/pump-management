import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { NozzleTestService } from "@/services/nozzle-test-service";
import type { NozzleAssignmentResponse } from "@/types";

const formSchema = z.object({
  nozzleId: z.string().min(1, "Please select a nozzle"),
  testQuantity: z.string().min(1, "Test quantity is required"),
  testDate: z.date({
    error: "Test date is required",
  }),
  testTime: z.string().min(1, "Test time is required"),
  remarks: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RegisterNozzleTestSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shiftId: string;
  nozzles: NozzleAssignmentResponse[];
  onSuccess: () => void;
}

export function RegisterNozzleTestSheet({
  open,
  onOpenChange,
  shiftId,
  nozzles,
  onSuccess,
}: RegisterNozzleTestSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nozzleId: "",
      testQuantity: "",
      testDate: new Date(),
      testTime: format(new Date(), "HH:mm"),
      remarks: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Combine date and time
      const [hours, minutes] = values.testTime.split(":").map(Number);
      const testDatetime = new Date(values.testDate);
      testDatetime.setHours(hours, minutes, 0, 0);

      await NozzleTestService.createTest(shiftId, {
        nozzleId: values.nozzleId,
        testQuantity: parseFloat(values.testQuantity),
        testDatetime: testDatetime.toISOString(),
        remarks: values.remarks,
      });

      toast.success("Nozzle test registered successfully");
      form.reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error registering test:", error);
      toast.error("Failed to register nozzle test");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter only open nozzles
  const openNozzles = nozzles.filter((n) => n.status === "OPEN");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Register Nozzle Test</SheetTitle>
          <SheetDescription>
            Record a nozzle test reading. Test quantities will be subtracted
            from sales calculations.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            {/* Nozzle Selection */}
            <FormField
              control={form.control}
              name="nozzleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nozzle</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select nozzle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {openNozzles.map((nozzle) => (
                        <SelectItem key={nozzle.id} value={nozzle.nozzleId}>
                          {nozzle.nozzleName} - {nozzle.productName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the nozzle that was tested
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Test Quantity */}
            <FormField
              control={form.control}
              name="testQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Quantity (Liters)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="e.g., 5.000"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Amount dispensed during test
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Test Date */}
            <FormField
              control={form.control}
              name="testDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Test Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full pl-3 text-left font-normal"
                          disabled={isSubmitting}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
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
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Test Time */}
            <FormField
              control={form.control}
              name="testTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Time</FormLabel>
                  <FormControl>
                    <Input {...field} type="time" disabled={isSubmitting} />
                  </FormControl>
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
                  <FormLabel>Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Any notes about the test..."
                      className="resize-none"
                      rows={3}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional notes about the test
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="gap-2 sm:gap-0">
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
                Register Test
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
