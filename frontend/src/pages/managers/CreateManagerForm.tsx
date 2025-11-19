import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useManagerStore } from "@/store/manager-store";
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
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, Loader2 } from "lucide-react";

// Form validation schema
const createManagerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(255, "Password must be at most 255 characters"),
  mobileNumber: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      "Mobile number should be valid (E.164 format)"
    ),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  aadharNumber: z
    .string()
    .max(12, "Aadhar number must be at most 12 digits")
    .optional()
    .or(z.literal("")),
  panNumber: z
    .string()
    .max(10, "PAN number must be at most 10 characters")
    .optional()
    .or(z.literal("")),
  enabled: z.boolean(),
  openingBalance: z
    .number()
    .min(0, "Opening balance must be greater than or equal to 0"),
  openingBalanceDate: z.string().min(1, "Opening balance date is required"),
});

type CreateManagerFormValues = z.infer<typeof createManagerSchema>;

interface CreateManagerFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateManagerForm({
  onSuccess,
  onCancel,
}: CreateManagerFormProps) {
  const { createManager, loading } = useManagerStore();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<CreateManagerFormValues>({
    resolver: zodResolver(createManagerSchema),
    defaultValues: {
      username: "",
      password: "",
      mobileNumber: "",
      email: "",
      aadharNumber: "",
      panNumber: "",
      enabled: true,
      openingBalance: 0,
      openingBalanceDate: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: CreateManagerFormValues) => {
    try {
      await createManager(data);
      form.reset();
      onSuccess();
    } catch (error) {
      // Error is already handled in the store with toast
      console.error("Failed to create manager:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Username */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Username <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="john_manager" {...field} />
                </FormControl>
                <FormDescription>3-50 characters</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Password <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>Minimum 6 characters</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mobile Number */}
          <FormField
            control={form.control}
            name="mobileNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Mobile Number <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="+919876543210" {...field} />
                </FormControl>
                <FormDescription>
                  E.164 format (e.g., +919876543210)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="manager@example.com"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Aadhar Number */}
          <FormField
            control={form.control}
            name="aadharNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aadhar Number</FormLabel>
                <FormControl>
                  <Input placeholder="123456789012" maxLength={12} {...field} />
                </FormControl>
                <FormDescription>Optional, 12 digits</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* PAN Number */}
          <FormField
            control={form.control}
            name="panNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PAN Number</FormLabel>
                <FormControl>
                  <Input placeholder="ABCDE1234F" maxLength={10} {...field} />
                </FormControl>
                <FormDescription>Optional, 10 characters</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Opening Balance */}
          <FormField
            control={form.control}
            name="openingBalance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Opening Balance <span className="text-red-500">*</span>
                </FormLabel>
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
                <FormDescription>Initial balance amount</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Opening Balance Date */}
          <FormField
            control={form.control}
            name="openingBalanceDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Opening Balance Date <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>Date of opening balance</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Enabled Toggle */}
        <FormField
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <FormDescription>
                  Enable or disable this manager account
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

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Manager
          </Button>
        </div>
      </form>
    </Form>
  );
}
