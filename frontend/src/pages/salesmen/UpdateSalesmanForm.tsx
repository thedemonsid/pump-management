import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useSalesmanStore } from "@/store/salesman-store";
import { z } from "zod";
import type { Salesman } from "@/types";

// Only use fields required by UpdateSalesmanRequest DTO
const UpdateSalesmanSchema = z.object({
  username: z
    .string()
    .min(3, "Username is required")
    .max(50, "Username must be between 3 and 50 characters")
    .optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  mobileNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Mobile number should be valid")
    .optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  aadharNumber: z
    .string()
    .max(12, "Aadhar number cannot exceed 12 characters")
    .optional(),
  panNumber: z
    .string()
    .max(10, "PAN number cannot exceed 10 characters")
    .optional(),
  enabled: z.boolean().optional(),
  openingBalance: z
    .number()
    .min(0, "Opening balance must be greater than or equal to 0")
    .optional(),
  openingBalanceDate: z.string().optional(),
});
type UpdateSalesmanFormData = z.infer<typeof UpdateSalesmanSchema>;

export function UpdateSalesmanForm({
  salesman,
  onSuccess,
  onCancel,
}: {
  salesman: Salesman;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const { editSalesman } = useSalesmanStore();
  // Ensure all required fields are present and dateOfJoining is formatted for input type=date
  const form = useForm<UpdateSalesmanFormData>({
    resolver: zodResolver(UpdateSalesmanSchema),
    defaultValues: {
      username: salesman.username,
      mobileNumber: salesman.mobileNumber,
      email: salesman.email || "",
      aadharNumber: salesman.aadharNumber || "",
      panNumber: salesman.panNumber || "",
      enabled: salesman.enabled,
      openingBalance: salesman.openingBalance || 0,
      openingBalanceDate:
        salesman.openingBalanceDate || new Date().toISOString().split("T")[0],
    },
  });
  const { formState, handleSubmit, control, reset } = form;
  const { isSubmitting } = formState;

  const onSubmit = async (data: UpdateSalesmanFormData) => {
    const submitData = {
      ...data,
      email: data.email && data.email.trim() !== "" ? data.email : undefined,
    };
    await editSalesman(salesman.id!, submitData);
    reset();
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter new password (leave empty to keep current)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="mobileNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter mobile number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="aadharNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aadhar Number (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter Aadhar number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="panNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PAN Number (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter PAN number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="openingBalance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opening Balance</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={field.value === 0 ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? 0 : parseFloat(value) || 0);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="openingBalanceDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opening Balance Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={control}
            name="enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Enabled Status</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Enable or disable this salesman
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
        </div>
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>Update Salesman</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
