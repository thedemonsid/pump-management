import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useExpenseHeadStore } from "@/store/expense-head-store";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ExpenseHeadResponse, UpdateExpenseHeadRequest } from "@/types";

interface ExpenseHeadSheetProps {
  expenseHead: ExpenseHeadResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
}

export function ExpenseHeadSheet({
  expenseHead,
  open,
  onOpenChange,
  mode,
}: ExpenseHeadSheetProps) {
  const { addExpenseHead, updateExpenseHead } = useExpenseHeadStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateExpenseHeadRequest>({
    defaultValues: {
      headName: "",
      description: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (mode === "edit" && expenseHead) {
      form.reset({
        headName: expenseHead.headName,
        description: expenseHead.description || "",
        isActive: expenseHead.isActive,
      });
    } else if (mode === "create") {
      form.reset({
        headName: "",
        description: "",
        isActive: true,
      });
    }
  }, [expenseHead, mode, form]);

  const onSubmit = async (data: UpdateExpenseHeadRequest) => {
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await addExpenseHead({
          headName: data.headName!,
          description: data.description,
          isActive: data.isActive,
        });
        toast.success("Expense head created successfully");
      } else if (mode === "edit" && expenseHead) {
        await updateExpenseHead(expenseHead.id, data);
        toast.success("Expense head updated successfully");
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error(
        mode === "create"
          ? "Failed to create expense head"
          : "Failed to update expense head"
      );
      console.error("Error saving expense head:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Create Expense Head" : "Edit Expense Head"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Add a new expense head category to organize your expenses."
              : "Update the expense head details."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-6"
          >
            <FormField
              control={form.control}
              name="headName"
              rules={{
                required: "Expense head name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
                maxLength: {
                  value: 100,
                  message: "Name must not exceed 100 characters",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Head Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Fuel Purchase, Maintenance"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              rules={{
                maxLength: {
                  value: 255,
                  message: "Description must not exceed 255 characters",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a description for this expense head"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable or disable this expense head
                    </div>
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

            <div className="flex justify-end gap-3 pt-4">
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
                {mode === "create" ? "Create" : "Update"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
