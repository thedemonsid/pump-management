import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ReactSelect, {
  type SelectInstance,
  type CSSObjectWithLabel,
} from "react-select";
import type { Product } from "@/types/product";
import { Checkbox } from "@/components/ui/checkbox";

interface LocalPurchaseItem {
  product: string;
  quantity: string;
  price: string;
  total: string;
  productId: string;
  taxPercentage: string;
  purchaseUnit: string;
  addToStock: boolean;
}

interface PurchaseItemsTableProps {
  products: Product[];
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  quantity: string;
  setQuantity: (quantity: string) => void;
  price: string;
  setPrice: (price: string) => void;
  productSelectRef: React.RefObject<SelectInstance<
    { value: Product; label: string },
    false
  > | null>;
  itemTaxPercentage: string;
  setItemTaxPercentage: (tax: string) => void;
  onAddItem: (item: LocalPurchaseItem) => void;
}

export function PurchaseItemsTable({
  products,
  selectedProduct,
  setSelectedProduct,
  quantity,
  setQuantity,
  price,
  setPrice,
  productSelectRef,
  itemTaxPercentage,
  setItemTaxPercentage,
  onAddItem,
}: PurchaseItemsTableProps) {
  // Match BillItemsTable select styles
  const selectStyles = {
    control: (provided: CSSObjectWithLabel) => ({
      ...provided,
      minHeight: "36px",
      borderColor: "#e5e7eb",
      backgroundColor: "#ffffff",
      "&:hover": { borderColor: "#9ca3af" },
      boxShadow: "none",
      "&:focus-within": {
        borderColor: "#3b82f6",
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
        ? "#3b82f6"
        : state.isFocused
        ? "#dbeafe"
        : "#ffffff",
      color: state.isSelected ? "#ffffff" : "#111827",
      fontSize: "16px",
      "&:hover": {
        backgroundColor: state.isSelected ? "#2563eb" : "#dbeafe",
      },
    }),
    menu: (provided: CSSObjectWithLabel) => ({
      ...provided,
      zIndex: 9999,
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
    }),
    menuPortal: (base: CSSObjectWithLabel) => ({ ...base, zIndex: 9999 }),
  };

  const total =
    quantity && price
      ? (parseFloat(quantity) * parseFloat(price)).toFixed(2)
      : "0.00";

  const addItem = () => {
    if (selectedProduct && quantity && price) {
      const newItem: LocalPurchaseItem = {
        product: selectedProduct.productName,
        quantity,
        price,
        total,
        taxPercentage: itemTaxPercentage,
        purchaseUnit: selectedProduct.salesUnit || "Units",
        addToStock: true,
        productId: selectedProduct.id || "",
      };

      onAddItem(newItem);
      setTimeout(() => {
        // Focus the underlying input of ReactSelect
        productSelectRef.current?.inputRef?.focus();
      }, 0);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      action();
    }
  };

  return (
    <div className="p-4 bg-muted/50 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Add Purchase Item</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="w-32">Qty</TableHead>
            <TableHead className="w-32">Rate</TableHead>
            <TableHead className="w-32">Tax %</TableHead>
            <TableHead className="w-32">Unit</TableHead>
            <TableHead className="w-40">Total</TableHead>
            <TableHead className="w-24">Add Stock</TableHead>
            <TableHead className="w-20">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Add Item Row */}
          <TableRow className="bg-white">
            <TableCell>
              <ReactSelect
                ref={productSelectRef}
                value={
                  selectedProduct
                    ? {
                        value: selectedProduct,
                        label: selectedProduct.productName,
                      }
                    : null
                }
                onChange={(option) => {
                  setSelectedProduct(option?.value || null);
                  if (option?.value) {
                    setPrice(
                      option.value.purchaseRate?.toString() ||
                        option.value.salesRate.toString()
                    );
                    // Automatically set tax percentage from product
                    setItemTaxPercentage(
                      option.value.gstPercentage?.toString() || "0"
                    );
                  }
                }}
                options={
                  Array.isArray(products)
                    ? products
                        .filter((product) => product.productType === "GENERAL")
                        .map((product) => ({
                          value: product,
                          label: product.productName,
                        }))
                    : []
                }
                placeholder="Select Product"
                className="text-base"
                styles={selectStyles}
                menuPortalTarget={document.body}
                onKeyDown={(e) => handleKeyPress(e, addItem)}
              />
            </TableCell>
            <TableCell>
              <Input
                placeholder="0"
                className="text-sm text-center h-8 bg-white border border-gray-200"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addItem)}
              />
            </TableCell>
            <TableCell>
              <Input
                placeholder="0.00"
                className="text-sm text-center h-8 bg-white border border-gray-200"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addItem)}
              />
            </TableCell>
            <TableCell>
              <Input
                placeholder="0"
                className="text-sm text-center h-8 bg-white border border-gray-200"
                value={itemTaxPercentage}
                onChange={(e) => setItemTaxPercentage(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addItem)}
              />
            </TableCell>
            <TableCell className="text-center text-xs font-medium">
              {selectedProduct?.salesUnit || "Units"}
            </TableCell>
            <TableCell className="text-center text-xs font-medium">
              ₹{total}
            </TableCell>
            <TableCell className="text-center">
              <Checkbox checked={true} disabled />
            </TableCell>
            <TableCell>
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={addItem}
                disabled={!selectedProduct || !quantity || !price}
              >
                Add
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
