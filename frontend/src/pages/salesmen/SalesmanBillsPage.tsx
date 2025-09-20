import { useEffect } from 'react';
import { useBillStore } from '@/store/bill-store';
import { Loader2 } from 'lucide-react';
import { CreateSalesmanBillForm } from './CreateSalesmanBillForm';

export function SalesmanBillsPage() {
  const { bills, loading, error, fetchBills } = useBillStore();

  // Filter bills to only show SALESMAN type
  const salesmanBills = bills.filter((bill) => bill.billType === 'SALESMAN');

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  // Log bills to console whenever they change
  useEffect(() => {
    if (salesmanBills.length > 0) {
      console.log('Salesman bills displayed:', salesmanBills);
    }
  }, [salesmanBills]);

  if (loading && bills.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading salesman bills...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-2">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">
          Salesman Bills ({salesmanBills.length})
        </h1>
      </div>

      {error && (
        <div className="bg-destructive/15 border border-destructive/20 rounded p-2">
          <p className="text-destructive text-xs">{error}</p>
        </div>
      )}

      {/* Inline Create Form */}
      <CreateSalesmanBillForm onSuccess={() => {}} />
    </div>
  );
}
