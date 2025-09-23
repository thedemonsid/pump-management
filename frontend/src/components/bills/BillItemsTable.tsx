import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ReactSelect, { type SelectInstance } from 'react-select';
import type { Product } from '@/types/product';

interface BillItem {
  product: string;
  quantity: string;
  price: string;
  total: string;
}

interface BillItemsTableProps {
  billItems: BillItem[];
  setBillItems: (items: BillItem[]) => void;
  products: Product[];
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  quantity: string;
  setQuantity: (qty: string) => void;
  price: string;
  setPrice: (price: string) => void;
  productSelectRef: React.RefObject<SelectInstance<
    { value: Product; label: string },
    false
  > | null>;
  fixedDiscount: string;
  setFixedDiscount: (discount: string) => void;
  gstPercent: string;
  setGstPercent: (gst: string) => void;
  gstIncluded: string;
}

export const BillItemsTable = ({
  billItems,
  setBillItems,
  products,
  selectedProduct,
  setSelectedProduct,
  quantity,
  setQuantity,
  price,
  setPrice,
  productSelectRef,
  fixedDiscount,
  setFixedDiscount,
  gstPercent,
  setGstPercent,
  gstIncluded,
}: BillItemsTableProps) => {
  const total =
    quantity && price
      ? (parseFloat(quantity) * parseFloat(price)).toFixed(2)
      : '0.00';

  const subtotal = billItems.reduce(
    (sum, item) => sum + parseFloat(item.total),
    0
  );
  const discountAmount = parseFloat(fixedDiscount) || 0;
  const discountedSubtotal = subtotal - discountAmount;

  let gstAmount = 0;
  let finalTotal = discountedSubtotal;

  if (gstIncluded === 'excluding') {
    gstAmount = discountedSubtotal * (parseFloat(gstPercent) / 100 || 0);
    finalTotal = discountedSubtotal + gstAmount;
  } else if (gstIncluded === 'including') {
    gstAmount =
      discountedSubtotal -
      discountedSubtotal / (1 + (parseFloat(gstPercent) / 100 || 0));
    finalTotal = discountedSubtotal;
  }

  const addItem = () => {
    if (selectedProduct && quantity && price) {
      const newItem: BillItem = {
        product: selectedProduct.productName,
        quantity,
        price,
        total,
      };
      setBillItems([...billItems, newItem]);
      setSelectedProduct(null);
      setQuantity('');
      setPrice('');
      setTimeout(() => {
        // Focus the underlying input of ReactSelect
        productSelectRef.current?.inputRef?.focus();
      }, 0);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8">#</TableHead>
          <TableHead>Product</TableHead>
          <TableHead className="w-40">Qty</TableHead>
          <TableHead className="w-40">Price</TableHead>
          <TableHead className="w-48">Total</TableHead>
          <TableHead className="w-20">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* Add Item Row */}
        <TableRow className="border-2 border-dashed border-blue-200 bg-blue-50/30">
          <TableCell className="text-center text-muted-foreground">+</TableCell>
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
              onChange={(option) => setSelectedProduct(option?.value || null)}
              options={products.map((product) => ({
                value: product,
                label: product.productName,
              }))}
              placeholder="Select Product"
              className="border-0 bg-transparent text-xs focus:bg-white"
              styles={{
                control: (provided) => ({
                  ...provided,
                  fontSize: '12px',
                  minHeight: '32px',
                  width: '200px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: 'white',
                  },
                  '&:focus-within': {
                    backgroundColor: 'white',
                  },
                }),
                option: (provided) => ({
                  ...provided,
                  fontSize: '12px',
                }),
                menu: (provided) => ({
                  ...provided,
                  zIndex: 9999,
                }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
              menuPortalTarget={document.body}
              onKeyDown={(e) => handleKeyPress(e, addItem)}
            />
          </TableCell>
          <TableCell>
            <Input
              placeholder="0"
              className="border-0 bg-transparent text-sm text-center focus:bg-white h-8"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, addItem)}
            />
          </TableCell>
          <TableCell>
            <Input
              placeholder="0.00"
              className="border-0 bg-transparent text-sm text-center focus:bg-white h-8"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, addItem)}
            />
          </TableCell>
          <TableCell className="text-center text-xs font-medium">
            ₹{total}
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

        {/* Bill Items */}
        {billItems.map((item, index) => (
          <TableRow key={index} className="hover:bg-slate-50">
            <TableCell className="text-center text-xs font-medium">
              {index + 1}
            </TableCell>
            <TableCell className="text-xs">{item.product}</TableCell>
            <TableCell className="text-center text-xs">
              {item.quantity}
            </TableCell>
            <TableCell className="text-center text-xs">₹{item.price}</TableCell>
            <TableCell className="text-center text-xs font-medium">
              ₹{item.total}
            </TableCell>
            <TableCell>
              <Button
                size="sm"
                variant="destructive"
                className="h-7 text-xs"
                onClick={() =>
                  setBillItems(billItems.filter((_, i) => i !== index))
                }
              >
                Del
              </Button>
            </TableCell>
          </TableRow>
        ))}

        {/* Calculations */}
        {billItems.length > 0 && (
          <>
            <TableRow className="border-t-2">
              <TableCell colSpan={4} className="text-right text-xs font-medium">
                Subtotal:
              </TableCell>
              <TableCell className="text-center text-xs font-medium">
                ₹{subtotal.toFixed(2)}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={3} className="text-right text-xs">
                Discount (₹):
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  placeholder="0"
                  className="h-8 text-sm text-center w-40"
                  value={fixedDiscount}
                  onChange={(e) => setFixedDiscount(e.target.value)}
                />
              </TableCell>
              <TableCell className="text-center text-xs">
                -₹{discountAmount.toFixed(2)}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={3} className="text-right text-xs">
                GST (%):
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  placeholder="18"
                  className="h-8 text-sm text-center w-40"
                  value={gstPercent}
                  onChange={(e) => setGstPercent(e.target.value)}
                />
              </TableCell>
              <TableCell className="text-center text-xs">
                {gstIncluded === 'excluding'
                  ? `+₹${gstAmount.toFixed(2)}`
                  : gstIncluded === 'including'
                  ? `(₹${gstAmount.toFixed(2)})`
                  : '-'}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>

            <TableRow className="border-t-2 bg-slate-100">
              <TableCell colSpan={4} className="text-right font-bold">
                Total:
              </TableCell>
              <TableCell className="text-center font-bold text-base">
                ₹{finalTotal.toFixed(2)}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </>
        )}
      </TableBody>
    </Table>
  );
};
