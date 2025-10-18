import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFuelPurchaseStore } from "@/store/fuel-purchase-store";
import { useSupplierStore } from "@/store/supplier-store";
import { useTankStore } from "@/store/tank-store";
import { useProductStore } from "@/store/product-store";
import {
  UpdateFuelPurchaseSchema,
  type UpdateFuelPurchase,
  type FuelPurchase,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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

interface UpdateFuelPurchaseFormProps {
  fuelPurchase: FuelPurchase;
  onSuccess: () => void;
}

export function UpdateFuelPurchaseForm({
  fuelPurchase,
  onSuccess,
}: UpdateFuelPurchaseFormProps) {
  const { editFuelPurchase, loading } = useFuelPurchaseStore();
  const { suppliers, fetchSuppliers } = useSupplierStore();
  const { tanks, fetchTanks } = useTankStore();
  const { products, fetchProducts } = useProductStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSuppliers();
    fetchTanks();
    fetchProducts();
  }, [fetchSuppliers, fetchTanks, fetchProducts]);

  const form = useForm({
    resolver: zodResolver(UpdateFuelPurchaseSchema),
    defaultValues: {
      purchaseDate: fuelPurchase.purchaseDate,
      supplierId: fuelPurchase.supplierId,
      invoiceNumber: fuelPurchase.invoiceNumber,
      addToStock: fuelPurchase.addToStock,
      tankId: fuelPurchase.tankId,
      quantity: fuelPurchase.quantity,
      purchaseRate: fuelPurchase.purchaseRate,
      amount: fuelPurchase.amount,
      vehicleNumber: fuelPurchase.vehicleNumber || "",
      driverName: fuelPurchase.driverName || "",
      goodsReceivedBy: fuelPurchase.goodsReceivedBy || "",
      purchaseUnit: fuelPurchase.purchaseUnit,
      taxPercentage: fuelPurchase.taxPercentage,
      readingKm: fuelPurchase.readingKm || 0,
      bfrDensity: fuelPurchase.bfrDensity,
      aftDensity: fuelPurchase.aftDensity,
      bfrDipReading: fuelPurchase.bfrDipReading,
      aftDipReading: fuelPurchase.aftDipReading,
    },
  });

  const watchedQuantity = useWatch({
    control: form.control,
    name: "quantity",
  });

  const watchedPurchaseRate = useWatch({
    control: form.control,
    name: "purchaseRate",
  });

  const watchedTankId = useWatch({
    control: form.control,
    name: "tankId",
  });

  // Auto-set purchase rate and unit when tank is selected
  useEffect(() => {
    if (watchedTankId) {
      const selectedTank = tanks.find((tank) => tank.id === watchedTankId);
      if (selectedTank?.product?.id) {
        // Find the full product details from the products list
        const product = products.find((p) => p.id === selectedTank.product?.id);
        if (product) {
          // Set the purchase rate from the product
          form.setValue("purchaseRate", product.purchaseRate);
          // Set the purchase unit from the product
          form.setValue("purchaseUnit", product.purchaseUnit);
        }
      }
    }
  }, [watchedTankId, tanks, products, form]);

  useEffect(() => {
    const calculatedAmount =
      (watchedQuantity || 0) * (watchedPurchaseRate || 0);
    form.setValue("amount", calculatedAmount);
  }, [watchedQuantity, watchedPurchaseRate, form]);

  const onSubmit = async (data: UpdateFuelPurchase) => {
    setIsSubmitting(true);
    try {
      await editFuelPurchase(fuelPurchase.id!, data);
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
            name="purchaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="invoiceNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Number *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., INV001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a supplier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id!}>
                        {supplier.supplierName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tankId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tank *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tank" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tanks.map((tank) => (
                      <SelectItem key={tank.id} value={tank.id!}>
                        {tank.tankName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="purchaseUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Unit *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Liters" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity *</FormLabel>
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
            control={form.control}
            name="purchaseRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Rate *</FormLabel>
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
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="taxPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Percentage *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="18.00"
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
            control={form.control}
            name="bfrDensity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Before Density *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="0.850"
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
            control={form.control}
            name="aftDensity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>After Density *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="0.852"
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="bfrDipReading"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Before DIP Reading *</FormLabel>
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
            control={form.control}
            name="aftDipReading"
            render={({ field }) => (
              <FormItem>
                <FormLabel>After DIP Reading *</FormLabel>
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="readingKm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reading (KM)</FormLabel>
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
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="vehicleNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Truck ABC-1234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="driverName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Driver Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., John Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="goodsReceivedBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Goods Received By</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="addToStock"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Add to Stock</FormLabel>
                <FormDescription>
                  Check this if you want to add this fuel purchase to inventory
                  stock.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="submit"
            disabled={isSubmitting || loading}
            className="min-w-24"
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Fuel Purchase"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
