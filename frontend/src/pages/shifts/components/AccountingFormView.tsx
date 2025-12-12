import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { format } from "date-fns";
import type {
  ShiftResponse,
  NozzleAssignmentResponse,
  SalesmanBillResponse,
} from "@/types";
import { FuelSalesTable } from "./FuelSalesTable";
import { NonCashSalesTable } from "./NonCashSalesTable";
import { CashSummaryRow } from "./CashSummaryRow";
import { ReconciliationSummary } from "./ReconciliationSummary";
import { AccountingFormActions } from "./AccountingFormActions";
import { PreAccountingCashDistribution } from "./PreAccountingCashDistribution";
import type { PreDistributionEntry } from "./PreAccountingCashDistribution";

interface AccountingFormViewProps {
  shift: ShiftResponse;
  nozzles: NozzleAssignmentResponse[];
  bills: SalesmanBillResponse[];
  hasAccounting: boolean;
  isEditing: boolean;
  isSaving: boolean;
  error: string | null;
  // Form state
  upiReceived: string;
  cardReceived: string;
  fleetCardReceived: string;
  credit: number;
  expenses: number;
  fuelSales: number;
  customerReceipt: number;
  systemReceivedAmount: number;
  actualCash: number;
  expectedCash: number;
  balance: number;
  preDistributions: PreDistributionEntry[];
  // Handlers
  onUpiChange: (value: string) => void;
  onCardChange: (value: string) => void;
  onFleetCardChange: (value: string) => void;
  onOpenDenominations: () => void;
  onPreDistributionsChange: (distributions: PreDistributionEntry[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function AccountingFormView({
  shift,
  nozzles,
  bills,
  hasAccounting,
  isEditing,
  isSaving,
  error,
  upiReceived,
  cardReceived,
  fleetCardReceived,
  credit,
  expenses,
  fuelSales,
  customerReceipt,
  systemReceivedAmount,
  actualCash,
  expectedCash,
  balance,
  preDistributions,
  onUpiChange,
  onCardChange,
  onFleetCardChange,
  onOpenDenominations,
  onPreDistributionsChange,
  onSubmit,
  onCancel,
}: AccountingFormViewProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Daily Fuel Sales & Reconciliation Sheet */}
      <div className="rounded-lg border bg-card">
        <div className="p-3 sm:p-6 border-b">
          <h2 className="text-lg sm:text-2xl font-semibold">
            🧾 Daily Fuel Sales & Reconciliation Sheet
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Complete accounting for {shift.salesmanUsername}'s shift on{" "}
            {format(new Date(shift.startDatetime), "PPP")}
          </p>
        </div>
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Salesman Bills - Credit Sales (Display Only) */}
          {bills.length > 0 &&
            (() => {
              // Group bills by product
              const productTotals = bills.reduce((acc, bill) => {
                const productName = bill.productName || "Unknown Product";
                if (!acc[productName]) {
                  acc[productName] = {
                    quantity: 0,
                    amount: 0,
                  };
                }
                acc[productName].quantity += bill.quantity;
                acc[productName].amount += bill.amount;
                return acc;
              }, {} as Record<string, { quantity: number; amount: number }>);

              return (
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Salesman Bills (All Products)
                  </h3>
                  <div className="rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="text-left p-2 sm:p-3 font-medium">
                              Product
                            </th>
                            <th className="text-right p-2 sm:p-3 font-medium">
                              Quantity
                            </th>
                            <th className="text-right p-2 sm:p-3 font-medium">
                              Amount (₹)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(productTotals).map(
                            ([productName, totals]) => (
                              <tr key={productName} className="border-b">
                                <td className="p-2 sm:p-3">{productName}</td>
                                <td className="text-right p-2 sm:p-3 font-mono">
                                  {totals.quantity.toFixed(2)}
                                </td>
                                <td className="text-right p-2 sm:p-3 font-mono">
                                  ₹{totals.amount.toFixed(2)}
                                </td>
                              </tr>
                            )
                          )}
                          <tr className="bg-muted/30 font-semibold">
                            <td colSpan={2} className="p-2 sm:p-3">
                              Total Bills Sales
                            </td>
                            <td className="text-right p-2 sm:p-3 font-mono">
                              ₹
                              {bills
                                .reduce((sum, bill) => sum + bill.amount, 0)
                                .toFixed(2)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

          {/* Fuel Sales Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Fuel Sales Summary</h3>
            <FuelSalesTable
              nozzles={nozzles}
              totalFuelSales={fuelSales}
              customerReceipt={customerReceipt}
              showTotal={true}
            />
          </div>

          {/* Non-Cash / Digital Sales */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Non-Cash / Digital Sales
            </h3>
            <NonCashSalesTable
              upiReceived={upiReceived}
              cardReceived={cardReceived}
              fleetCardReceived={fleetCardReceived}
              credit={credit}
              expenses={expenses}
              isEditable={true}
              onUpiChange={onUpiChange}
              onCardChange={onCardChange}
              onFleetCardChange={onFleetCardChange}
            />
          </div>

          {/* Cash Denominations */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Cash Denominations</h3>
            <CashSummaryRow
              totalCash={actualCash}
              onClick={onOpenDenominations}
              isEditable={true}
            />
          </div>

          {/* Reconciliation Summary */}
          <ReconciliationSummary
            openingCash={shift.openingCash}
            systemReceivedAmount={systemReceivedAmount}
            upiReceived={parseFloat(upiReceived || "0")}
            cardReceived={parseFloat(cardReceived || "0")}
            fleetCardReceived={parseFloat(fleetCardReceived || "0")}
            credit={credit}
            expenses={expenses}
            actualCash={actualCash}
            expectedCash={expectedCash}
            balance={balance}
          />
        </div>
      </div>

      {/* Pre-Accounting Cash Distribution - only when creating new accounting */}
      {!hasAccounting && (
        <PreAccountingCashDistribution
          cashInHand={actualCash}
          upiReceived={parseFloat(upiReceived || "0")}
          cardReceived={parseFloat(cardReceived || "0")}
          fleetCardReceived={parseFloat(fleetCardReceived || "0")}
          distributions={preDistributions}
          onDistributionsChange={onPreDistributionsChange}
        />
      )}

      {/* Actions */}
      <AccountingFormActions
        hasAccounting={hasAccounting}
        isEditing={isEditing}
        isSaving={isSaving}
        onCancel={onCancel}
      />
    </form>
  );
}
