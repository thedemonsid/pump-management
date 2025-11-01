import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactSelect, { type CSSObjectWithLabel } from "react-select";
import type { Supplier } from "@/types/supplier";

interface PurchaseHeaderProps {
  purchaseDate: string;
  setPurchaseDate: (date: string) => void;
  suppliers: Supplier[];
  selectedSupplier: Supplier | null;
  setSelectedSupplier: (supplier: Supplier | null) => void;
  invoiceNumber: string;
  setInvoiceNumber: (invoice: string) => void;
  paymentType: string;
  setPaymentType: (type: string) => void;
  gstIncluded: string;
  setGstIncluded: (included: string) => void;
  goodsReceivedBy?: string;
  setGoodsReceivedBy?: (name: string) => void;
}

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
    color: state.isSelected
      ? "#ffffff" // white
      : "#111827", // gray-900
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

export function PurchaseHeader({
  purchaseDate,
  setPurchaseDate,
  suppliers,
  selectedSupplier,
  setSelectedSupplier,
  invoiceNumber,
  setInvoiceNumber,
  paymentType,
  setPaymentType,
  gstIncluded,
  setGstIncluded,
  goodsReceivedBy,
  setGoodsReceivedBy,
}: PurchaseHeaderProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="space-y-2">
        <Label htmlFor="purchase-date" className="text-sm font-medium">
          Date
        </Label>
        <Input
          id="purchase-date"
          type="date"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplier-select" className="text-sm font-medium">
          Supplier
        </Label>
        <ReactSelect
          inputId="supplier-select"
          value={
            selectedSupplier
              ? {
                  value: selectedSupplier.id,
                  label: selectedSupplier.supplierName,
                }
              : null
          }
          onChange={(option) => {
            const supplier = Array.isArray(suppliers)
              ? suppliers.find((s) => s.id === option?.value)
              : null;
            setSelectedSupplier(supplier || null);
          }}
          options={
            Array.isArray(suppliers)
              ? suppliers.map((supplier) => ({
                  value: supplier.id,
                  label: supplier.supplierName,
                }))
              : []
          }
          placeholder="Select Supplier"
          className="text-base"
          styles={selectStyles}
          menuPortalTarget={document.body}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="invoice-number" className="text-sm font-medium">
          Invoice Number
        </Label>
        <Input
          id="invoice-number"
          type="text"
          placeholder="INV-001"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment-type" className="text-sm font-medium">
          Payment Type
        </Label>
        <ReactSelect
          inputId="payment-type"
          value={
            paymentType
              ? {
                  value: paymentType,
                  label: paymentType.toUpperCase(),
                }
              : null
          }
          onChange={(option) => setPaymentType(option?.value || "")}
          options={[
            { value: "CASH", label: "CASH" },
            { value: "CREDIT", label: "CREDIT" },
          ]}
          placeholder="Type of Payment"
          className="text-base"
          styles={selectStyles}
          menuPortalTarget={document.body}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gst-select" className="text-sm font-medium">
          GST
        </Label>
        <ReactSelect
          inputId="gst-select"
          value={
            gstIncluded
              ? {
                  value: gstIncluded,
                  label: gstIncluded === "including" ? "Inc" : "Exc",
                }
              : null
          }
          onChange={(option) => setGstIncluded(option?.value || "")}
          options={[
            { value: "including", label: "Inc" },
            { value: "excluding", label: "Exc" },
          ]}
          placeholder="GST"
          className="text-base"
          styles={selectStyles}
          menuPortalTarget={document.body}
        />
      </div>

      {setGoodsReceivedBy !== undefined && (
        <div className="space-y-2">
          <Label htmlFor="goods-received-by" className="text-sm font-medium">
            Goods Received By
          </Label>
          <Input
            id="goods-received-by"
            type="text"
            placeholder="Name"
            value={goodsReceivedBy || ""}
            onChange={(e) => setGoodsReceivedBy(e.target.value)}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
