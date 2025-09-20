import { useEffect, useState } from 'react';
import { useCustomerStore } from '@/store/customer-store';
import { useBillStore } from '@/store/bill-store';
import { useCustomerBillPaymentStore } from '@/store/customer-bill-payment-store';
import { useLedgerStore } from '@/store/ledger-store';
import { CustomersReportViewer } from '@/components/reports/CustomersReport';
import { Loader2 } from 'lucide-react';

export function CustomersReportPage() {
  const { customers, loading, error, fetchCustomers } = useCustomerStore();
  const { bills, fetchBills } = useBillStore();
  const { payments, fetchPayments } = useCustomerBillPaymentStore();
  const { computeCustomerSummaries } = useLedgerStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchCustomers(), fetchBills(), fetchPayments()]);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchCustomers, fetchBills, fetchPayments]);

  // Compute customer summaries using the ledger store
  const customerSummaries = computeCustomerSummaries(
    customers,
    bills,
    payments
  );

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading customers report...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Error Loading Report
          </h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <CustomersReportViewer
      customers={customers}
      customerSummaries={customerSummaries}
    />
  );
}
