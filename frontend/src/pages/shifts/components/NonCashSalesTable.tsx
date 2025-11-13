import { Input } from "@/components/ui/input";

interface NonCashSalesTableProps {
  upiReceived: string;
  cardReceived: string;
  fleetCardReceived: string;
  credit: number;
  expenses: number;
  isEditable: boolean;
  onUpiChange: (value: string) => void;
  onCardChange: (value: string) => void;
  onFleetCardChange: (value: string) => void;
}

export function NonCashSalesTable({
  upiReceived,
  cardReceived,
  fleetCardReceived,
  credit,
  expenses,
  isEditable,
  onUpiChange,
  onCardChange,
  onFleetCardChange,
}: NonCashSalesTableProps) {
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-2 sm:p-3 font-medium text-xs sm:text-sm">
              Payment Type
            </th>
            <th className="text-right p-2 sm:p-3 font-medium text-xs sm:text-sm">
              Amount (₹)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="p-2 sm:p-3 text-xs sm:text-sm">UPI Sales</td>
            <td className="p-2 sm:p-3 text-right">
              {isEditable ? (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={upiReceived === "0" ? "" : upiReceived}
                  onChange={(e) => {
                    const value = e.target.value;
                    onUpiChange(value === "" ? "0" : value);
                  }}
                  placeholder="0.00"
                  className="text-right font-mono max-w-[200px] ml-auto text-xs sm:text-sm"
                />
              ) : (
                <span className="font-mono text-xs sm:text-sm">
                  ₹{parseFloat(upiReceived).toFixed(2)}
                </span>
              )}
            </td>
          </tr>
          <tr className="border-t">
            <td className="p-2 sm:p-3 text-xs sm:text-sm">Card Sales</td>
            <td className="p-2 sm:p-3 text-right">
              {isEditable ? (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cardReceived === "0" ? "" : cardReceived}
                  onChange={(e) => {
                    const value = e.target.value;
                    onCardChange(value === "" ? "0" : value);
                  }}
                  placeholder="0.00"
                  className="text-right font-mono max-w-[200px] ml-auto text-xs sm:text-sm"
                />
              ) : (
                <span className="font-mono text-xs sm:text-sm">
                  ₹{parseFloat(cardReceived).toFixed(2)}
                </span>
              )}
            </td>
          </tr>
          <tr className="border-t">
            <td className="p-2 sm:p-3 text-xs sm:text-sm">Fleet Card Sales</td>
            <td className="p-2 sm:p-3 text-right">
              {isEditable ? (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={fleetCardReceived === "0" ? "" : fleetCardReceived}
                  onChange={(e) => {
                    const value = e.target.value;
                    onFleetCardChange(value === "" ? "0" : value);
                  }}
                  placeholder="0.00"
                  className="text-right font-mono max-w-[200px] ml-auto text-xs sm:text-sm"
                />
              ) : (
                <span className="font-mono text-xs sm:text-sm">
                  ₹{parseFloat(fleetCardReceived).toFixed(2)}
                </span>
              )}
            </td>
          </tr>
          <tr className="border-t">
            <td className="p-2 sm:p-3 text-xs sm:text-sm">Credit Sales</td>
            <td className="p-2 sm:p-3 text-right font-mono text-xs sm:text-sm text-red-600 dark:text-red-400">
              ₹{credit.toFixed(2)}
            </td>
          </tr>
          <tr className="border-t">
            <td className="p-2 sm:p-3 text-xs sm:text-sm">Expenses</td>
            <td className="p-2 sm:p-3 text-right font-mono text-xs sm:text-sm text-red-600 dark:text-red-400">
              ₹{expenses.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
