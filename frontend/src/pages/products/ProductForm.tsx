import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProductStore } from "@/store/product-store";
import {
  ProductSchema,
  type Product,
  ProductType,
  DEFAULT_PUMP_INFO,
} from "@/types";
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
import { z } from "zod";

// Form schema without id, pumpMasterId (these are handled by the store)
// Ensure productType is required for the form
const ProductFormSchema = ProductSchema.omit({
  id: true,
  pumpMasterId: true,
}).extend({
  productType: z.enum([ProductType.FUEL, ProductType.GENERAL]),
});

type ProductFormData = z.infer<typeof ProductFormSchema>;

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
}

const FUEL_UNITS = ["Liters", "Numbers", "Kg", "Gallons", "Cubic Meters"];

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { createProduct, editProduct, loading } = useProductStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratioNumerator, setRatioNumerator] = useState("1");
  const [ratioDenominator, setRatioDenominator] = useState("1");

  const form = useForm<ProductFormData>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: product
      ? {
          productType: product.productType || ProductType.GENERAL,
          productName: product.productName,
          alias: product.alias,
          lowStockCount: product.lowStockCount,
          purchaseRate: product.purchaseRate,
          salesRate: product.salesRate,
          hsnCode: product.hsnCode,
          salesUnit: product.salesUnit,
          purchaseUnit: product.purchaseUnit,
          stockConversionRatio: product.stockConversionRatio,
        }
      : {
          productType: ProductType.GENERAL,
          productName: "",
          alias: "",
          lowStockCount: 100,
          purchaseRate: 0,
          salesRate: 0,
          hsnCode: "",
          salesUnit: "Liters",
          purchaseUnit: "Liters",
          stockConversionRatio: 1.0,
        },
  });

  // Initialize ratio inputs from product data
  useState(() => {
    if (product?.stockConversionRatio) {
      // If ratio is a whole number or simple decimal, show as is
      if (product.stockConversionRatio === 1) {
        setRatioNumerator("1");
        setRatioDenominator("1");
      } else {
        setRatioNumerator(product.stockConversionRatio.toString());
        setRatioDenominator("1");
      }
    }
  });

  const updateConversionRatio = (numerator: string, denominator: string) => {
    const num = parseFloat(numerator) || 1;
    const den = parseFloat(denominator) || 1;
    const ratio = num / den;
    form.setValue("stockConversionRatio", ratio);
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      if (product?.id) {
        // Include existing pumpId and pumpCode when updating
        const updateData = {
          ...data,
          pumpMasterId: product.pumpMasterId,
        };
        await editProduct(product.id, updateData);
      } else {
        // Add default pump info for new products
        const productWithPumpInfo = {
          ...data,
          pumpMasterId: DEFAULT_PUMP_INFO.id,
        };
        await createProduct(productWithPumpInfo);
      }
      onSuccess();
      form.reset();
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Row 1: Product Type, Name, Alias */}
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="productType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={ProductType.FUEL}>Fuel</SelectItem>
                    <SelectItem value={ProductType.GENERAL}>General</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="productName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Petrol" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alias"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alias</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., PET" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 2: HSN Code, Purchase Rate, Sales Rate */}
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="hsnCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>HSN Code</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 27101910" {...field} />
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
                <FormLabel>Purchase Rate (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salesRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sales Rate (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 3: Sales Unit, Purchase Unit, Conversion Ratio */}
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="salesUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sales Unit</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FUEL_UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
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
            name="purchaseUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Unit</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FUEL_UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
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
            name="stockConversionRatio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conversion Ratio</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="1"
                      value={ratioDenominator}
                      onChange={(e) => {
                        setRatioDenominator(e.target.value);
                        updateConversionRatio(ratioNumerator, e.target.value);
                      }}
                      onBlur={() => {
                        updateConversionRatio(ratioNumerator, ratioDenominator);
                        field.onChange(
                          (parseFloat(ratioNumerator) || 1) /
                            (parseFloat(ratioDenominator) || 1)
                        );
                      }}
                      className="flex-1"
                    />
                    <span className="text-lg font-semibold text-muted-foreground">
                      :
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="1"
                      value={ratioNumerator}
                      onChange={(e) => {
                        setRatioNumerator(e.target.value);
                        updateConversionRatio(e.target.value, ratioDenominator);
                      }}
                      onBlur={() => {
                        updateConversionRatio(ratioNumerator, ratioDenominator);
                        field.onChange(
                          (parseFloat(ratioNumerator) || 1) /
                            (parseFloat(ratioDenominator) || 1)
                        );
                      }}
                      className="flex-1"
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-xs">
                  Purchase : Sales ratio
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 4: Low Stock Alert */}
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="lowStockCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Low Stock Alert</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="100"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || loading}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {product ? "Updating..." : "Creating..."}
              </>
            ) : product ? (
              "Update Product"
            ) : (
              "Create Product"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
