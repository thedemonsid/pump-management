import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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

interface PurchaseItemsListProps {
  purchaseItems: LocalPurchaseItem[];
  setPurchaseItems: (items: LocalPurchaseItem[]) => void;
  gstIncluded: string;
  paymentType: string;
  totals: {
    subtotal: number;
    tax: number;
    netAmount: number;
  };
}

export function PurchaseItemsList({
  purchaseItems,
  setPurchaseItems,
  gstIncluded,
  paymentType,
  totals,
}: PurchaseItemsListProps) {
  const handleToggleStock = (index: number) => {
    const updatedItems = [...purchaseItems];
    updatedItems[index] = {
      ...updatedItems[index],
      addToStock: !updatedItems[index].addToStock,
    };
    setPurchaseItems(updatedItems);
  };

  // Calculate item-wise breakdown for excluding GST
  const getItemBreakdown = (item: LocalPurchaseItem) => {
    const itemTotal = parseFloat(item.total);
    const taxPercentage = parseFloat(item.taxPercentage || "0");

    if (gstIncluded === "excluding") {
      const taxAmount = (itemTotal * taxPercentage) / 100;
      const netAmount = itemTotal + taxAmount;
      return {
        baseAmount: itemTotal,
        taxAmount,
        netAmount,
      };
    } else {
      // For including GST, extract the base and tax
      const divisor = 1 + taxPercentage / 100;
      const baseAmount = itemTotal / divisor;
      const taxAmount = itemTotal - baseAmount;
      return {
        baseAmount,
        taxAmount,
        netAmount: itemTotal,
      };
    }
  };

  if (purchaseItems.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-muted/50 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Purchase Items</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8">#</TableHead>
            <TableHead>Product</TableHead>
            <TableHead className="w-24 text-center">Qty</TableHead>
            <TableHead className="w-24 text-center">Rate</TableHead>
            <TableHead className="w-20 text-center">Tax %</TableHead>
            <TableHead className="w-20 text-center">Unit</TableHead>
            <TableHead className="w-32 text-center">Base Amt</TableHead>
            {gstIncluded === "excluding" &&
              paymentType?.toUpperCase() !== "CREDIT" && (
                <>
                  <TableHead className="w-32 text-center">Tax Amt</TableHead>
                  <TableHead className="w-32 text-center">Net Amt</TableHead>
                </>
              )}
            {(gstIncluded === "including" ||
              paymentType?.toUpperCase() === "CREDIT") && (
              <TableHead className="w-32 text-center">Total</TableHead>
            )}
            <TableHead className="w-24 text-center">Add Stock</TableHead>
            <TableHead className="w-20 text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchaseItems.map((item, index) => {
            const breakdown = getItemBreakdown(item);
            return (
              <TableRow key={index} className="hover:bg-slate-50">
                <TableCell className="text-center text-xs font-medium">
                  {index + 1}
                </TableCell>
                <TableCell className="text-xs">{item.product}</TableCell>
                <TableCell className="text-center text-xs">
                  {item.quantity}
                </TableCell>
                <TableCell className="text-center text-xs">
                  ₹{parseFloat(item.price).toFixed(2)}
                </TableCell>
                <TableCell className="text-center text-xs">
                  {item.taxPercentage}%
                </TableCell>
                <TableCell className="text-center text-xs">
                  {item.purchaseUnit}
                </TableCell>
                <TableCell className="text-center text-xs font-medium">
                  ₹{breakdown.baseAmount.toFixed(2)}
                </TableCell>
                {gstIncluded === "excluding" &&
                  paymentType?.toUpperCase() !== "CREDIT" && (
                    <>
                      <TableCell className="text-center text-xs font-medium text-orange-600">
                        ₹{breakdown.taxAmount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center text-xs font-bold text-green-600">
                        ₹{breakdown.netAmount.toFixed(2)}
                      </TableCell>
                    </>
                  )}
                {(gstIncluded === "including" ||
                  paymentType?.toUpperCase() === "CREDIT") && (
                  <TableCell className="text-center text-xs font-medium">
                    ₹{parseFloat(item.total).toFixed(2)}
                  </TableCell>
                )}
                <TableCell className="text-center">
                  <Checkbox
                    checked={item.addToStock}
                    onCheckedChange={() => handleToggleStock(index)}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 text-xs"
                    onClick={() =>
                      setPurchaseItems(
                        purchaseItems.filter((_, i) => i !== index)
                      )
                    }
                  >
                    Del
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}

          {/* Totals Rows */}
          <>
            {/* Show breakdown for EXCLUDING GST when payment is not CREDIT */}
            {gstIncluded === "excluding" &&
            paymentType?.toUpperCase() !== "CREDIT" ? (
              <>
                <TableRow className="bg-slate-50">
                  <TableCell
                    colSpan={6}
                    className="text-right text-sm font-semibold"
                  >
                    Subtotal (Base Amount):
                  </TableCell>
                  <TableCell className="text-center text-sm font-semibold">
                    ₹{totals.subtotal.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center text-sm font-semibold text-orange-600">
                    ₹{totals.tax.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center text-sm font-bold text-green-600">
                    ₹{totals.netAmount.toFixed(2)}
                  </TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              </>
            ) : (
              <TableRow className="bg-slate-100 font-bold">
                <TableCell colSpan={6} className="text-right text-sm">
                  Total Amount:
                </TableCell>
                <TableCell className="text-center text-sm">
                  ₹{totals.subtotal.toFixed(2)}
                </TableCell>
                <TableCell colSpan={3}></TableCell>
              </TableRow>
            )}
          </>
        </TableBody>
      </Table>
    </div>
  );
}
