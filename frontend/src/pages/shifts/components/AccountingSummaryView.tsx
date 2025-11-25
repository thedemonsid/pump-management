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
        {(() => {
          // Filter to only show credit bills
          const creditBills = bills.filter(
            (bill) => bill.paymentType === "CREDIT"
          );

          if (creditBills.length === 0) return null;

          // Calculate total credit bills amount
          const totalCreditAmount = creditBills.reduce((sum, bill) => sum + bill.amount, 0);

          return (
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                Credit Bills Summary
              </h3>
              <div className="rounded-md border bg-muted/20 p-3 sm:p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-muted-foreground">
                    Total Credit Bills ({creditBills.length} bills)
                  </span>
                  <span className="text-lg sm:text-xl font-semibold font-mono">
                    ₹{totalCreditAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

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
