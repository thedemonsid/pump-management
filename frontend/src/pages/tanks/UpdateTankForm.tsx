import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTankStore } from "@/store/tank-store";
import { useProductStore } from "@/store/product-store";
import { UpdateTankSchema, type Tank, type UpdateTank } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Loader2 } from "lucide-react";

interface UpdateTankFormProps {
  tank: Tank;
  onSuccess: () => void;
}

export function UpdateTankForm({ tank, onSuccess }: UpdateTankFormProps) {
  const { editTank, loading } = useTankStore();
  const { products, fetchProducts } = useProductStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch products when component mounts
  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  const form = useForm<UpdateTank>({
    resolver: zodResolver(UpdateTankSchema),
    defaultValues: {
      tankName: tank.tankName,
      capacity: tank.capacity,
      openingLevel: tank.openingLevel || 0,
      openingLevelDate:
        tank.openingLevelDate || new Date().toISOString().split("T")[0],
      lowLevelAlert: tank.lowLevelAlert || 0,
      tankLocation: tank.tankLocation || "",
      productId: tank.productId,
    },
  });

  const onSubmit = async (data: UpdateTank) => {
    setIsSubmitting(true);
    try {
      await editTank(tank.id!, data);
      onSuccess();
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tankName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tank Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Tank A" {...field} />
                </FormControl>
                <FormDescription>
                  Name or identifier for this tank
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity (Liters)</FormLabel>
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
                <FormDescription>Maximum capacity of the tank</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="openingLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opening Level (Liters)</FormLabel>
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
                <FormDescription>
                  Opening fuel level in the tank
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="openingLevelDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opening Level Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>
                  Date when the opening level was recorded
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="lowLevelAlert"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Low Level Alert (Liters)</FormLabel>
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
                <FormDescription>
                  Alert threshold for low fuel level
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tankLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tank Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Underground - Section A" {...field} />
              </FormControl>
              <FormDescription>
                Physical location of the tank (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id!}>
                      {product.productName} ({product.alias})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                The fuel product stored in this tank (optional for updates)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || loading}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Tank"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
