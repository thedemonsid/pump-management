import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBillStore } from '@/store/bill-store';
import { Loader2 } from 'lucide-react';
import { CreateBillForm } from './CreateBillForm';
import { Button } from '@/components/ui/button';

export function BillsPage() {
  const navigate = useNavigate();
  const { bills, loading, error, fetchBills } = useBillStore();

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  // Log bills to console whenever they change
  useEffect(() => {
    if (bills.length > 0) {
      console.log('Bills displayed:', bills);
    }
  }, [bills]);

  if (loading && bills.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading bills...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-2">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Bills ({bills.length})</h1>
        <Button onClick={() => navigate('/bills/bill-details')}>
          View All Bills
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/15 border border-destructive/20 rounded p-2">
          <p className="text-destructive text-xs">{error}</p>
        </div>
      )}

      {/* Inline Create Form */}
      <CreateBillForm onSuccess={() => {}} />
    </div>
  );
}
