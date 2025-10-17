import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { Loader2 } from "lucide-react";
import type { Customer, Product, SalesmanNozzleShiftResponse } from "@/types";

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

interface BillFormProps {
  formData: BillFormData;
  images?: BillFormImages;
  customers: Customer[];
  products: Product[];
  activeShifts?: SalesmanNozzleShiftResponse[];
  loadingFormData: boolean;
  loading: boolean;
  isEditMode?: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  onChange: (field: keyof BillFormData, value: string) => void;
  onImageChange?: (field: keyof BillFormImages, file: File | null) => void;
}

export function BillForm({
  formData,
  customers,
  products,
  activeShifts = [],
  loadingFormData,
  loading,
  isEditMode = false,
  onSubmit,
  onCancel,
  onChange,
  onImageChange,
}: BillFormProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="bill-no">Bill Number</Label>
          <Input
            id="bill-no"
            value={formData.billNo}
            onChange={(e) => onChange("billNo", e.target.value)}
            placeholder={isEditMode ? "" : "Auto-generated"}
            disabled={isEditMode}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="bill-date">Bill Date</Label>
          <Input
            id="bill-date"
            type="date"
            value={formData.billDate}
            onChange={(e) => onChange("billDate", e.target.value)}
          />
        </div>
      </div>

      {!isEditMode && (
        <div className="grid gap-2">
          <Label htmlFor="shift">Active Shift *</Label>
          <Select
            value={formData.salesmanNozzleShiftId}
            onValueChange={(value) => onChange("salesmanNozzleShiftId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select active shift" />
            </SelectTrigger>
            <SelectContent>
              {loadingFormData ? (
                <SelectItem value="loading" disabled>
                  Loading shifts...
                </SelectItem>
              ) : activeShifts.length === 0 ? (
                <SelectItem value="no-shifts" disabled>
                  No active shifts available
                </SelectItem>
              ) : (
                activeShifts.map((shift) => (
                  <SelectItem key={shift.id} value={shift.id!}>
                    {shift.nozzleName} - {shift.productName} (
                    {shift.salesmanUsername})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="customer">Customer *</Label>
        <Select
          value={formData.customerId}
          onValueChange={(value) => onChange("customerId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select customer" />
          </SelectTrigger>
          <SelectContent>
            {loadingFormData ? (
              <SelectItem value="loading" disabled>
                Loading customers...
              </SelectItem>
            ) : customers.length === 0 ? (
              <SelectItem value="no-customers" disabled>
                No customers available
              </SelectItem>
            ) : (
              customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id!}>
                  {customer.customerName}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="product">Fuel Product *</Label>
        <Select
          value={formData.productId}
          onValueChange={(value) => onChange("productId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select fuel product" />
          </SelectTrigger>
          <SelectContent>
            {loadingFormData ? (
              <SelectItem value="loading" disabled>
                Loading products...
              </SelectItem>
            ) : products.length === 0 ? (
              <SelectItem value="no-products" disabled>
                No fuel products available
              </SelectItem>
            ) : (
              products.map((product) => (
                <SelectItem key={product.id} value={product.id!}>
                  {product.productName} - {product.salesUnit}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="quantity">Quantity (L) *</Label>
          <Input
            id="quantity"
            type="number"
            step="0.001"
            placeholder="0.000"
            value={formData.quantity}
            onChange={(e) => onChange("quantity", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="rate">Rate (₹/L) *</Label>
          <Input
            id="rate"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.rate}
            onChange={(e) => onChange("rate", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="vehicle-no">Vehicle Number</Label>
          <Input
            id="vehicle-no"
            placeholder="MH12AB1234"
            value={formData.vehicleNo}
            onChange={(e) => onChange("vehicleNo", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="driver-name">Driver Name</Label>
          <Input
            id="driver-name"
            placeholder="John Doe"
            value={formData.driverName}
            onChange={(e) => onChange("driverName", e.target.value)}
          />
        </div>
      </div>

      {!isEditMode && onImageChange && (
        <>
          <div className="border-t pt-4 mt-2">
            <h3 className="text-sm font-medium mb-4">Attachments (Optional)</h3>
            <div className="grid gap-4">
              <ImageUpload
                id="meter-image"
                label="Meter Reading Image"
                onChange={(file) => onImageChange("meterImage", file)}
                disabled={loading}
              />
              <ImageUpload
                id="vehicle-image"
                label="Vehicle Image"
                onChange={(file) => onImageChange("vehicleImage", file)}
                disabled={loading}
              />
              <ImageUpload
                id="extra-image"
                label="Additional Image"
                onChange={(file) => onImageChange("extraImage", file)}
                disabled={loading}
              />
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? "Update Bill" : "Create Bill"}
        </Button>
      </div>
    </div>
  );
}
