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
import ReactSelect, {
  type SelectInstance,
  type CSSObjectWithLabel,
} from 'react-select';
import type { Product } from '@/types/product';

interface BillItem {
  product: string;
  quantity: string;
  price: string;
  total: string;
  discount: string;
  gst: string;
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
  itemDiscount: string;
  setItemDiscount: (discount: string) => void;
  itemGst: string;
  setItemGst: (gst: string) => void;
  onAddItem?: (item: BillItem & { productId: string }) => void;
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
  itemDiscount,
  setItemDiscount,
  itemGst,
  setItemGst,
  onAddItem,
}: BillItemsTableProps) => {
  // Match BillHeader select styles
  const selectStyles = {
    control: (provided: CSSObjectWithLabel) => ({
      ...provided,
      minHeight: '36px',
      borderColor: '#e5e7eb',
      backgroundColor: '#ffffff',
      '&:hover': { borderColor: '#9ca3af' },
      boxShadow: 'none',
      '&:focus-within': {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 1px #3b82f6',
      },
      fontSize: '16px',
    }),
    option: (
      provided: CSSObjectWithLabel,
      state: { isSelected: boolean; isFocused: boolean }
    ) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#3b82f6'
        : state.isFocused
        ? '#dbeafe'
        : '#ffffff',
      color: state.isSelected ? '#ffffff' : '#111827',
      fontSize: '16px',
      '&:hover': {
        backgroundColor: state.isSelected ? '#2563eb' : '#dbeafe',
      },
    }),
    menu: (provided: CSSObjectWithLabel) => ({
      ...provided,
      zIndex: 9999,
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
    }),
    menuPortal: (base: CSSObjectWithLabel) => ({ ...base, zIndex: 9999 }),
  };
  const total =
    quantity && price
      ? (parseFloat(quantity) * parseFloat(price)).toFixed(2)
      : '0.00';

  const subtotal = billItems.reduce(
    (sum, item) => sum + (parseFloat(item.total) * (1 - parseFloat(item.discount || '0') / 100)),
    0
  );
  const finalTotal = subtotal;

  const addItem = () => {
    if (selectedProduct && quantity && price) {
      const newItem: BillItem & { productId: string } = {
        product: selectedProduct.productName,
        quantity,
        price,
        total,
        discount: itemDiscount,
        gst: itemGst,
        productId: selectedProduct.id || '',
      };

      if (onAddItem) {
        onAddItem(newItem);
      } else {
        setBillItems([...billItems, newItem]);
      }

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
    <div className="p-4 bg-muted/50 rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8">#</TableHead>
            <TableHead>Product</TableHead>
            <TableHead className="w-32">Qty</TableHead>
            <TableHead className="w-32">Price</TableHead>
            <TableHead className="w-32">Discount %</TableHead>
            <TableHead className="w-32">GST %</TableHead>
            <TableHead className="w-40">Total</TableHead>
            <TableHead className="w-40">After Discount</TableHead>
            <TableHead className="w-20">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Add Item Row */}
          <TableRow className="border-2 border-dashed border-blue-200 bg-blue-50/30">
            <TableCell className="text-center text-muted-foreground">
              +
            </TableCell>
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
                    setPrice(option.value.salesRate.toString());
                  }
                }}
                options={Array.isArray(products) ? products.map((product) => ({
                  value: product,
                  label: product.productName,
                })) : []}
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
                value={itemDiscount}
                onChange={(e) => setItemDiscount(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addItem)}
              />
            </TableCell>
            <TableCell>
              <Input
                placeholder="0"
                className="text-sm text-center h-8 bg-white border border-gray-200"
                value={itemGst}
                onChange={(e) => setItemGst(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addItem)}
              />
            </TableCell>
            <TableCell className="text-center text-xs font-medium">
              ₹{total}
            </TableCell>
            <TableCell className="text-center text-xs font-medium">
              ₹{(parseFloat(total) * (1 - parseFloat(itemDiscount || '0') / 100)).toFixed(2)}
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
              <TableCell className="text-center text-xs">
                ₹{item.price}
              </TableCell>
              <TableCell className="text-center text-xs">
                {item.discount}%
              </TableCell>
              <TableCell className="text-center text-xs">{item.gst}%</TableCell>
              <TableCell className="text-center text-xs font-medium">
                ₹{item.total}
              </TableCell>
              <TableCell className="text-center text-xs font-medium">
                ₹{(parseFloat(item.total) * (1 - parseFloat(item.discount || '0') / 100)).toFixed(2)}
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
                <TableCell
                  colSpan={7}
                  className="text-right text-xs font-medium"
                >
                  Subtotal:
                </TableCell>
                <TableCell className="text-center text-xs font-medium">
                  ₹{subtotal.toFixed(2)}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>

              <TableRow className="border-t-2 bg-slate-100">
                <TableCell colSpan={7} className="text-right font-bold">
                  Total:
                </TableCell>
                <TableCell className="text-center font-bold text-base">
                  ₹{finalTotal.toFixed(2)}
                </TableCell>
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
