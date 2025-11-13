import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ReconciliationSummaryProps {
  openingCash: number;
  systemReceivedAmount: number;
  upiReceived: number;
  cardReceived: number;
  fleetCardReceived: number;
  credit: number;
  expenses: number;
  actualCash: number;
  expectedCash: number;
  balance: number;
}

export function ReconciliationSummary({
  openingCash,
  systemReceivedAmount,
  upiReceived,
  cardReceived,
  fleetCardReceived,
  credit,
  expenses,
  actualCash,
  expectedCash,
  balance,
}: ReconciliationSummaryProps) {
  return (
    <div>
      <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
        Reconciliation Summary
      </h3>
      <div className="rounded-md border">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-2 sm:p-3 font-medium text-xs sm:text-sm">
                Description
              </th>
              <th className="text-right p-2 sm:p-3 font-medium text-xs sm:text-sm">
                Amount (₹)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t bg-blue-50 dark:bg-blue-950">
              <td className="p-2 sm:p-3 font-semibold text-xs sm:text-sm">
                Opening Cash
              </td>
              <td className="p-2 sm:p-3 text-right font-mono font-semibold text-xs sm:text-sm">
                {openingCash.toFixed(2)}
              </td>
            </tr>
            <tr className="border-t">
              <td className="p-2 sm:p-3 text-xs sm:text-sm">
                Add: Total Sales Expected
              </td>
              <td className="p-2 sm:p-3 text-right font-mono text-xs sm:text-sm">
                {systemReceivedAmount.toFixed(2)}
              </td>
            </tr>
            <tr className="border-t">
              <td className="p-2 sm:p-3 text-xs sm:text-sm">
                Less: Non-Cash Sales
              </td>
              <td className="p-2 sm:p-3 text-right font-mono text-xs sm:text-sm text-red-600">
                -
                {(
                  upiReceived +
                  cardReceived +
                  fleetCardReceived +
                  credit
                ).toFixed(2)}
              </td>
            </tr>
            <tr className="border-t">
              <td className="p-2 sm:p-3 text-xs sm:text-sm">Less: Expenses</td>
              <td className="p-2 sm:p-3 text-right font-mono text-xs sm:text-sm text-red-600">
                -{expenses.toFixed(2)}
              </td>
            </tr>
            <tr className="border-t bg-amber-50 dark:bg-amber-950">
              <td className="p-2 sm:p-3 font-semibold text-xs sm:text-sm">
                Expected Cash in Hand
              </td>
              <td className="p-2 sm:p-3 text-right font-mono font-semibold text-xs sm:text-sm">
                {expectedCash.toFixed(2)}
              </td>
            </tr>
            <tr className="border-t bg-green-50 dark:bg-green-950">
              <td className="p-2 sm:p-3 font-semibold text-xs sm:text-sm">
                Actual Cash (from count)
              </td>
              <td className="p-2 sm:p-3 text-right font-mono font-semibold text-xs sm:text-sm">
                {actualCash.toFixed(2)}
              </td>
            </tr>
            <tr className="border-t bg-muted">
              <td className="p-2 sm:p-3 font-bold text-sm sm:text-lg">
                Balance / Difference
              </td>
              <td className="p-2 sm:p-3 text-right">
                <span
                  className={`font-mono font-bold text-sm sm:text-lg ${
                    balance === 0
                      ? "text-green-600"
                      : balance > 0
                      ? "text-blue-600"
                      : "text-red-600"
                  }`}
                >
                  {balance >= 0 ? "+" : ""}
                  {balance.toFixed(2)}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {balance !== 0 && (
        <Alert
          className="mt-4"
          variant={balance > 0 ? "default" : "destructive"}
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {balance > 0
              ? `Excess cash of ₹${balance.toFixed(2)} in hand`
              : `Cash shortage of ₹${Math.abs(balance).toFixed(2)} detected`}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
