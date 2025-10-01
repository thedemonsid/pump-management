import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useCustomerStore } from "@/store/customer-store";
import { useLedgerStore } from "@/store/ledger-store";
import { CustomerLedgerReportViewer } from "@/components/reports/CustomerLedgerReport";
import { Loader2 } from "lucide-react";

export function CustomerLedgerReportPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const { customers, fetchCustomers } = useCustomerStore();
  const { ledgerData, summary, loading, hasSearched, computeLedgerData } =
    useLedgerStore();

  const fromDate = searchParams.get("fromDate") || "2020-04-01";
  const toDate =
    searchParams.get("toDate") || new Date().toISOString().split("T")[0];

  const customer = customers.find((c) => c.id === id);

  useEffect(() => {
    if (customers.length === 0) {
      fetchCustomers();
    }
  }, [customers.length, fetchCustomers]);

  useEffect(() => {
    if (customer && !hasSearched) {
      computeLedgerData({
        customerId: id!,
        fromDate,
        toDate,
        openingBalance: customer?.openingBalance || 0,
      });
    }
  }, [customer, hasSearched, fromDate, toDate, computeLedgerData, id]);

  // Transform ledger data to match report component expectations
  const transformedLedgerData = ledgerData.map((entry) => ({
    ...entry,
    billDetails: entry.billDetails
      ? {
          billNo: entry.billDetails.billNo,
          billType: entry.billDetails.rateType,
          totalAmount: entry.billDetails.totalAmount,
          discountAmount: entry.billDetails.discountAmount,
          taxAmount: entry.billDetails.taxAmount,
          netAmount: entry.billDetails.netAmount,
          billItems: entry.billDetails.billItems.map((item) => ({
            productName: item.productName || "Unknown Product",
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount || 0,
          })),
        }
      : undefined,
  }));

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading customer details...</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading ledger report...</span>
        </div>
      </div>
    );
  }

  return (
    <CustomerLedgerReportViewer
      customer={customer}
      ledgerData={transformedLedgerData}
      summary={summary}
      fromDate={fromDate}
      toDate={toDate}
    />
  );
}
