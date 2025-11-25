import { format } from "date-fns";
import type {
  SalesmanShiftAccountingResponse,
  NozzleAssignmentResponse,
  SalesmanBillResponse,
} from "@/types";
import { FuelSalesTable } from "./FuelSalesTable";
import { NonCashSalesTable } from "./NonCashSalesTable";
import { CashSummaryRow } from "./CashSummaryRow";
import { ReconciliationSummary } from "./ReconciliationSummary";

interface AccountingSummaryViewProps {
  accounting: SalesmanShiftAccountingResponse;
  nozzles: NozzleAssignmentResponse[];
  bills: SalesmanBillResponse[];
  onViewDenominations: () => void;
}

export function AccountingSummaryView({
  accounting,
  nozzles,
  bills,
  onViewDenominations,
}: AccountingSummaryViewProps) {
  const actualCash = accounting.cashInHand;
  const expectedCash =
    accounting.openingCash +
    accounting.systemReceivedAmount -
    accounting.upiReceived -
    accounting.cardReceived -
    accounting.fleetCardReceived -
    accounting.credit -
    accounting.expenses;
  const balance = actualCash - expectedCash;

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-1 sm:p-6 border-b">
        <h2 className="text-lg sm:text-2xl font-semibold">
          🧾 Daily Fuel Sales & Reconciliation Sheet
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Created on {format(new Date(accounting.createdAt), "PPp")}
        </p>
      </div>
      <div className="p-1 sm:p-6 space-y-4 sm:space-y-6">
        {/* Salesman Bills - Credit Sales (Display Only) */}
        {bills.length > 0 && (
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
              Salesman Bills (All Products)
            </h3>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-2 sm:p-3 font-medium">
                        Bill No
                      </th>
                      <th className="text-left p-2 sm:p-3 font-medium">
                        Product
                      </th>
                      <th className="text-right p-2 sm:p-3 font-medium">
                        Quantity
                      </th>
                      <th className="text-right p-2 sm:p-3 font-medium">
                        Rate (₹)
                      </th>
                      <th className="text-right p-2 sm:p-3 font-medium">
                        Amount (₹)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill) => (
                      <tr key={bill.id} className="border-b">
                        <td className="p-2 sm:p-3 font-mono">{bill.billNo}</td>
                        <td className="p-2 sm:p-3">
                          {bill.productName || "Unknown Product"}
                        </td>
                        <td className="text-right p-2 sm:p-3 font-mono">
                          {bill.quantity.toFixed(2)}
                        </td>
                        <td className="text-right p-2 sm:p-3 font-mono">
                          ₹{bill.rate.toFixed(2)}
                        </td>
                        <td className="text-right p-2 sm:p-3 font-mono">
                          ₹{bill.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-muted/30 font-semibold">
                      <td colSpan={4} className="p-2 sm:p-3">
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
        )}

        {/* Fuel Sales Summary */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
            Fuel Sales Summary
          </h3>
          <FuelSalesTable
            nozzles={nozzles}
            totalFuelSales={accounting.fuelSales}
            customerReceipt={accounting.customerReceipt}
            showTotal={true}
          />
        </div>

        {/* Non-Cash / Digital Sales */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
            Non-Cash / Digital Sales
          </h3>
          <NonCashSalesTable
            upiReceived={accounting.upiReceived.toString()}
            cardReceived={accounting.cardReceived.toString()}
            fleetCardReceived={accounting.fleetCardReceived.toString()}
            credit={accounting.credit}
            expenses={accounting.expenses}
            isEditable={false}
            onUpiChange={() => {}}
            onCardChange={() => {}}
            onFleetCardChange={() => {}}
          />
        </div>

        {/* Cash Denominations */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
            Cash Denominations
          </h3>
          <CashSummaryRow
            totalCash={actualCash}
            onClick={onViewDenominations}
            isEditable={false}
          />
        </div>

        {/* Reconciliation Summary */}
        <ReconciliationSummary
          openingCash={accounting.openingCash}
          systemReceivedAmount={accounting.systemReceivedAmount}
          upiReceived={accounting.upiReceived}
          cardReceived={accounting.cardReceived}
          fleetCardReceived={accounting.fleetCardReceived}
          credit={accounting.credit}
          expenses={accounting.expenses}
          actualCash={actualCash}
          expectedCash={expectedCash}
          balance={balance}
        />
      </div>
    </div>
  );
}
