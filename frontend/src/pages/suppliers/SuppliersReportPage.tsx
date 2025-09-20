import { useEffect, useState } from 'react';
import { useSupplierStore } from '@/store/supplier-store';
import { usePurchaseStore } from '@/store/purchase-store';
import { useFuelPurchaseStore } from '@/store/fuel-purchase-store';
import { useSupplierPaymentStore } from '@/store/supplier-payment-store';
import { SuppliersReportViewer } from '@/components/reports/SuppliersReport';
import { Loader2 } from 'lucide-react';

export function SuppliersReportPage() {
  const { suppliers, loading, error, fetchSuppliers } = useSupplierStore();
  const { purchases, fetchPurchases } = usePurchaseStore();
  const { fuelPurchases, fetchFuelPurchases } = useFuelPurchaseStore();
  const { payments, fetchPayments } = useSupplierPaymentStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchSuppliers(),
          fetchPurchases(),
          fetchFuelPurchases(),
          fetchPayments(),
        ]);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchSuppliers, fetchPurchases, fetchFuelPurchases, fetchPayments]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading suppliers report...</span>
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
    <SuppliersReportViewer
      suppliers={suppliers}
      purchases={purchases}
      fuelPurchases={fuelPurchases}
      payments={payments}
    />
  );
}
