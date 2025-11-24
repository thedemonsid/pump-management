import type { NozzleAssignmentResponse } from "@/types";

interface FuelSalesTableProps {
  nozzles: NozzleAssignmentResponse[];
  totalFuelSales: number;
  customerReceipt?: number;
  showTotal?: boolean;
}

export function FuelSalesTable({
  nozzles,
  totalFuelSales,
  customerReceipt = 0,
  showTotal = true,
}: FuelSalesTableProps) {
  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full relative">
          <thead className="bg-muted/50">
            <tr>
              <th className="sticky left-0 z-10 bg-muted/50 text-left p-2 sm:p-3 font-medium min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm">
                Nozzle
              </th>
              <th className="text-center p-2 sm:p-3 font-medium min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm">
                Product
              </th>
              <th className="text-right p-2 sm:p-3 font-medium min-w-[70px] sm:min-w-[100px] text-xs sm:text-sm">
                Opening (L)
              </th>
              <th className="text-right p-2 sm:p-3 font-medium min-w-[70px] sm:min-w-[100px] text-xs sm:text-sm">
                Closing (L)
              </th>
              <th className="text-right p-2 sm:p-3 font-medium min-w-[70px] sm:min-w-[100px] text-xs sm:text-sm">
                Dispensed (L)
              </th>
              <th className="text-right p-2 sm:p-3 font-medium min-w-[70px] sm:min-w-[100px] text-xs sm:text-sm">
                Tests (L)
              </th>
              <th className="text-right p-2 sm:p-3 font-medium min-w-[70px] sm:min-w-[100px] text-xs sm:text-sm">
                Sales (L)
              </th>
              <th className="text-right p-2 sm:p-3 font-medium min-w-[70px] sm:min-w-[100px] text-xs sm:text-sm">
                Rate (₹)
              </th>
              <th className="sticky right-0 z-10 bg-muted/50 text-right p-2 sm:p-3 font-medium min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm">
                Amount (₹)
              </th>
            </tr>
          </thead>
          <tbody>
            {nozzles.map((nozzle) => {
              const dispensedAmount = nozzle.dispensedAmount || 0;
              const testQuantity = nozzle.totalTestQuantity || 0;
              const salesLitres = dispensedAmount - testQuantity;

              return (
                <tr key={nozzle.id} className="border-t">
                  <td className="sticky left-0 z-10 bg-background p-2 sm:p-3 text-xs sm:text-sm">
                    {nozzle.nozzleName}
                  </td>
                  <td className="p-2 sm:p-3 text-center text-xs sm:text-sm">
                    {nozzle.productName || "-"}
                  </td>
                  <td className="p-2 sm:p-3 text-right font-mono text-xs sm:text-sm text-muted-foreground">
                    {(nozzle.openingBalance || 0).toFixed(3)}
                  </td>
                  <td className="p-2 sm:p-3 text-right font-mono text-xs sm:text-sm text-muted-foreground">
                    {(nozzle.closingBalance || 0).toFixed(3)}
                  </td>
                  <td className="p-2 sm:p-3 text-right font-mono text-xs sm:text-sm">
                    {dispensedAmount.toFixed(3)}
                  </td>
                  <td className="p-2 sm:p-3 text-right font-mono text-xs sm:text-sm">
                    {testQuantity > 0 ? (
                      <span className="text-orange-600 dark:text-orange-400">
                        -{testQuantity.toFixed(3)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0.000</span>
                    )}
                  </td>
                  <td className="p-2 sm:p-3 text-right font-mono text-xs sm:text-sm font-semibold">
                    {salesLitres.toFixed(3)}
                  </td>
                  <td className="p-2 sm:p-3 text-right font-mono text-xs sm:text-sm">
                    {(nozzle.productRate || 0).toFixed(2)}
                  </td>
                  <td className="sticky right-0 z-10 bg-background p-2 sm:p-3 text-right font-mono text-xs sm:text-sm">
                    ₹{(nozzle.totalAmount || 0).toFixed(2)}
                  </td>
                </tr>
              );
            })}
            <tr className="border-t bg-muted/30">
              <td
                className="sticky left-0 z-10 bg-muted/30 p-2 sm:p-3 font-semibold text-xs sm:text-sm"
                colSpan={8}
              >
                Total Fuel Sales
              </td>
              <td className="sticky right-0 z-10 bg-muted/30 p-2 sm:p-3 text-right font-mono font-semibold text-xs sm:text-sm">
                ₹{totalFuelSales.toFixed(2)}
              </td>
            </tr>
            {showTotal && customerReceipt > 0 && (
              <>
                <tr className="border-t">
                  <td
                    className="sticky left-0 z-10 bg-background p-2 sm:p-3 text-xs sm:text-sm"
                    colSpan={8}
                  >
                    Customer Receipts
                  </td>
                  <td className="sticky right-0 z-10 bg-background p-2 sm:p-3 text-right font-mono text-xs sm:text-sm text-green-600 dark:text-green-400">
                    ₹{customerReceipt.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-t bg-blue-50 dark:bg-blue-950">
                  <td
                    className="sticky left-0 z-10 bg-blue-50 dark:bg-blue-950 p-2 sm:p-3 font-semibold text-xs sm:text-sm"
                    colSpan={8}
                  >
                    Total (Fuel Sales + Receipts)
                  </td>
                  <td className="sticky right-0 z-10 bg-blue-50 dark:bg-blue-950 p-2 sm:p-3 text-right font-mono font-semibold text-xs sm:text-sm">
                    ₹{(totalFuelSales + customerReceipt).toFixed(2)}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
