import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useMemo } from "react";
import type { Customer, Product, SalesmanNozzleShiftResponse } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ReactSelect, { type CSSObjectWithLabel } from "react-select";

// ReactSelect styling to match create-bill
const selectStyles = {
  control: (provided: CSSObjectWithLabel) => ({
    ...provided,
    minHeight: "36px",
    borderColor: "#e5e7eb", // gray-200
    backgroundColor: "#ffffff", // white
    "&:hover": {
      borderColor: "#9ca3af", // gray-400
    },
    boxShadow: "none",
    "&:focus-within": {
      borderColor: "#3b82f6", // blue-500
      boxShadow: "0 0 0 1px #3b82f6",
    },
    fontSize: "16px",
  }),
  option: (
    provided: CSSObjectWithLabel,
    state: { isSelected: boolean; isFocused: boolean }
  ) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#3b82f6" // blue-500
      : state.isFocused
      ? "#dbeafe" // blue-100
      : "#ffffff", // white
    color: state.isSelected ? "#ffffff" : "#111827", // white : gray-900
    "&:hover": {
      backgroundColor: state.isSelected ? "#2563eb" : "#dbeafe", // blue-600 : blue-100
    },
    fontSize: "16px",
  }),
  menu: (provided: CSSObjectWithLabel) => ({
    ...provided,
    zIndex: 9999,
    backgroundColor: "#ffffff", // white
    border: "1px solid #e5e7eb", // gray-200
  }),
  menuPortal: (base: CSSObjectWithLabel) => ({ ...base, zIndex: 9999 }),
};

export interface BillFormData {
  billNo: string;
  billDate: string;
  customerId: string;
  productId: string;
  salesmanNozzleShiftId: string;
  quantity: string;
  rate: string;
  vehicleNo: string;
  driverName: string;
}

export interface BillFormImages {
  meterImage: File | null;
  vehicleImage: File | null;
  extraImage: File | null;
}

interface CompactBillFormProps {
  formData: BillFormData;
  images: BillFormImages;
  customers: Customer[];
  products: Product[];
  activeShifts?: SalesmanNozzleShiftResponse[];
  loadingFormData: boolean;
  loading: boolean;
  onSubmit: () => void;
  onChange: (field: keyof BillFormData, value: string) => void;
  onImageChange: (field: keyof BillFormImages, file: File | null) => void;
  resetKey?: number; // Key to force reset of image upload components
}

export function CompactBillForm({
  formData,
  customers,
  products,
  activeShifts = [],
  loadingFormData,
  loading,
  onSubmit,
  onChange,
  onImageChange,
  resetKey = 0,
}: CompactBillFormProps) {
  // Get selected shift to auto-populate product
  const selectedShift = useMemo(() => {
    return activeShifts.find(
      (shift) => shift.id === formData.salesmanNozzleShiftId
    );
  }, [activeShifts, formData.salesmanNozzleShiftId]);

  // Auto-select product when shift is selected
  useEffect(() => {
    if (selectedShift && selectedShift.productName && products.length > 0) {
      // Find the product ID by matching the product name
      const matchingProduct = products.find(
        (p) =>
          p.productName.toLowerCase() ===
          selectedShift.productName.toLowerCase()
      );

      if (
        matchingProduct &&
        matchingProduct.id &&
        formData.productId !== matchingProduct.id
      ) {
        onChange("productId", matchingProduct.id);
      }
    }
  }, [selectedShift, products, formData.productId, onChange]);

  // Auto-populate rate when product is selected
  useEffect(() => {
    if (formData.productId && products.length > 0) {
      const selectedProduct = products.find((p) => p.id === formData.productId);

      if (selectedProduct && selectedProduct.salesRate) {
        // Only update rate if it's empty or zero to allow user changes
        if (!formData.rate || formData.rate === "0" || formData.rate === "") {
          onChange("rate", selectedProduct.salesRate.toString());
        }
      }
    }
  }, [formData.productId, products, formData.rate, onChange]);

  // Calculate total
  const total = useMemo(() => {
    const qty = parseFloat(formData.quantity) || 0;
    const rate = parseFloat(formData.rate) || 0;
    return (qty * rate).toFixed(2);
  }, [formData.quantity, formData.rate]);

  return (
    <div className="space-y-4">
      {/* Bill Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="space-y-2">
          <Label htmlFor="bill-date" className="text-sm font-medium">
            Date *
          </Label>
          <Input
            id="bill-date"
            type="date"
            value={formData.billDate}
            onChange={(e) => onChange("billDate", e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shift-select" className="text-sm font-medium">
            Active Shift *
          </Label>
          <ReactSelect
            inputId="shift-select"
            value={
              formData.salesmanNozzleShiftId
                ? activeShifts
                    .filter(
                      (shift) => shift.id === formData.salesmanNozzleShiftId
                    )
                    .map((shift) => ({
                      value: shift.id!,
                      label: `${shift.nozzleName} - ${shift.productName} (${shift.salesmanUsername})`,
                    }))[0] || null
                : null
            }
            onChange={(option) =>
              onChange("salesmanNozzleShiftId", option?.value || "")
            }
            options={activeShifts.map((shift) => ({
              value: shift.id!,
              label: `${shift.nozzleName} - ${shift.productName} (${shift.salesmanUsername})`,
            }))}
            placeholder="Select shift"
            className="text-base"
            styles={selectStyles}
            menuPortalTarget={document.body}
            isLoading={loadingFormData}
            isDisabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer-select" className="text-sm font-medium">
            Customer *
          </Label>
          <ReactSelect
            inputId="customer-select"
            value={
              formData.customerId
                ? customers
                    .filter((customer) => customer.id === formData.customerId)
                    .map((customer) => ({
                      value: customer.id!,
                      label: customer.customerName,
                    }))[0] || null
                : null
            }
            onChange={(option) => onChange("customerId", option?.value || "")}
            options={customers.map((customer) => ({
              value: customer.id!,
              label: customer.customerName,
            }))}
            placeholder="Select customer"
            className="text-base"
            styles={selectStyles}
            menuPortalTarget={document.body}
            isLoading={loadingFormData}
            isDisabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-select" className="text-sm font-medium">
            Fuel Product *{" "}
            <span className="text-xs text-muted-foreground">(Auto)</span>
          </Label>
          <ReactSelect
            inputId="product-select"
            value={
              formData.productId
                ? products
                    .filter((product) => product.id === formData.productId)
                    .map((product) => ({
                      value: product.id!,
                      label: product.productName,
                    }))[0] || null
                : null
            }
            onChange={(option) => onChange("productId", option?.value || "")}
            options={products.map((product) => ({
              value: product.id!,
              label: product.productName,
            }))}
            placeholder={selectedShift ? "Auto-selected" : "Select shift first"}
            className="text-base"
            styles={selectStyles}
            menuPortalTarget={document.body}
            isLoading={loadingFormData}
            isDisabled={!!selectedShift || loading}
          />
        </div>
      </div>

      {/* Bill Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bill Details</CardTitle>
          <CardDescription>Single product credit sale</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 font-medium text-sm text-muted-foreground pb-2 border-b">
              <div className="col-span-2">Quantity (L)</div>
              <div className="col-span-2">Rate (₹/L)</div>
              <div className="col-span-2">Total (₹)</div>
              <div className="col-span-3">Vehicle No.</div>
              <div className="col-span-3">Driver Name</div>
            </div>

            {/* Input Row */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-2">
                <Input
                  type="number"
                  step="0.001"
                  placeholder="0.000"
                  value={formData.quantity}
                  onChange={(e) => onChange("quantity", e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.rate}
                  readOnly
                  onChange={(e) => onChange("rate", e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="col-span-2">
                <Input
                  value={`₹${total}`}
                  disabled
                  className="w-full font-semibold bg-muted"
                />
              </div>
              <div className="col-span-3">
                <Input
                  placeholder="MH12AB1234"
                  value={formData.vehicleNo}
                  onChange={(e) => onChange("vehicleNo", e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="col-span-3">
                <Input
                  placeholder="Driver Name"
                  value={formData.driverName}
                  onChange={(e) => onChange("driverName", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Total Summary */}
            <Separator />
            <div className="flex justify-end">
              <div className="space-y-2 w-64">
                <div className="flex justify-between items-center py-2 px-4 bg-primary/10 rounded-md">
                  <span className="font-semibold">Final Total:</span>
                  <span className="text-xl font-bold">₹{total}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Uploads */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attachments</CardTitle>
          <CardDescription>
            Upload meter reading, vehicle & additional images (optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ImageUpload
              key={`meter-${resetKey}`}
              id="meter-image"
              label="Meter Reading"
              onChange={(file) => onImageChange("meterImage", file)}
              disabled={loading}
            />
            <ImageUpload
              key={`vehicle-${resetKey}`}
              id="vehicle-image"
              label="Vehicle Image"
              onChange={(file) => onImageChange("vehicleImage", file)}
              disabled={loading}
            />
            <ImageUpload
              key={`extra-${resetKey}`}
              id="extra-image"
              label="Additional"
              onChange={(file) => onImageChange("extraImage", file)}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-center pt-4">
        <Button onClick={onSubmit} disabled={loading} className="px-8">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Plus className="mr-2 h-4 w-4" />
          Save Bill
        </Button>
      </div>
    </div>
  );
}
