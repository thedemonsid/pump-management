import type { UseFormReturn } from "react-hook-form";
import type { TransactionFormValues } from "@/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SingleDatePicker } from "@/components/shared/SingleDatePicker";
import { Loader2, Plus, Minus } from "lucide-react";

interface TransactionFormProps {
  form: UseFormReturn<TransactionFormValues>;
  onSubmit: (data: TransactionFormValues) => void;
  onCancel: () => void;
  type: "credit" | "debit";
}

export function TransactionForm({
  form,
  onSubmit,
  onCancel,
  type,
}: TransactionFormProps) {
  const isCredit = type === "credit";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...field}
                  value={field.value === 0 ? "" : field.value}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? 0 : parseFloat(value) || 0);
                  }}
                  className="text-right"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter transaction description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="RTGS">RTGS</SelectItem>
                  <SelectItem value="NEFT">NEFT</SelectItem>
                  <SelectItem value="IMPS">IMPS</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="transactionDate"
          render={({ field }) => (
            <FormItem>
              <SingleDatePicker
                date={field.value ? new Date(field.value) : undefined}
                onDateChange={(date) => {
                  if (date) {
                    // Set time to current time when date is selected
                    const now = new Date();
                    date.setHours(now.getHours());
                    date.setMinutes(now.getMinutes());
                    date.setSeconds(now.getSeconds());
                    field.onChange(date.toISOString().slice(0, 16));
                  } else {
                    field.onChange(undefined);
                  }
                }}
                label="Transaction Date"
                disabled={form.formState.isSubmitting}
                disableFutureDates={true}
                placeholder="Select transaction date"
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isCredit ? (
              <Plus className="mr-2 h-4 w-4" />
            ) : (
              <Minus className="mr-2 h-4 w-4" />
            )}
            Add {isCredit ? "Credit" : "Debit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
