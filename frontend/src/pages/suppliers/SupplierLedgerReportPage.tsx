import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useSupplierStore } from '@/store/supplier-store';
import { useSupplierLedgerStore } from '@/store/supplier-ledger-store';
import { SupplierLedgerReportViewer } from '@/components/reports/SupplierLedgerReport';
import { Loader2 } from 'lucide-react';

export function SupplierLedgerReportPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const { suppliers, fetchSuppliers } = useSupplierStore();
  const { ledgerData, summary, loading, hasSearched, computeLedgerData } =
    useSupplierLedgerStore();

  const fromDate = searchParams.get('fromDate') || '2020-04-01';
  const toDate =
    searchParams.get('toDate') || new Date().toISOString().split('T')[0];

  const supplier = suppliers.find((s) => s.id === id);

  useEffect(() => {
    if (suppliers.length === 0) {
      fetchSuppliers();
    }
  }, [suppliers.length, fetchSuppliers]);

  useEffect(() => {
    if (supplier && !hasSearched) {
      computeLedgerData({
        supplierId: id!,
        fromDate,
        toDate,
        openingBalance: supplier?.openingBalance || 0,
      });
    }
  }, [supplier, hasSearched, fromDate, toDate, computeLedgerData, id]);

  // Transform ledger data to match report component expectations
  const transformedLedgerData = ledgerData.map((entry) => ({
    ...entry,
    productDetails: entry.purchaseDetails
      ? {
          productName: entry.purchaseDetails.productName,
          quantity: entry.purchaseDetails.quantity,
          purchaseRate: entry.purchaseDetails.purchaseRate,
          amount: entry.purchaseDetails.amount,
          purchaseUnit: entry.purchaseDetails.purchaseUnit,
          taxPercentage: entry.purchaseDetails.taxPercentage,
        }
      : entry.fuelPurchaseDetails
      ? {
          productName: entry.fuelPurchaseDetails.productName,
          quantity: entry.fuelPurchaseDetails.quantity,
          purchaseRate: entry.fuelPurchaseDetails.purchaseRate,
          amount: entry.fuelPurchaseDetails.amount,
          purchaseUnit: entry.fuelPurchaseDetails.purchaseUnit,
          taxPercentage: entry.fuelPurchaseDetails.taxPercentage,
          tankName: entry.fuelPurchaseDetails.tankName,
          density: entry.fuelPurchaseDetails.density,
          dipReading: entry.fuelPurchaseDetails.dipReading,
        }
      : undefined,
  }));

  // Transform summary to match report component expectations
  const transformedSummary = summary
    ? {
        totalPurchaseBefore: summary.totalPurchasesBefore,
        totalPaidBefore: summary.totalPaidBefore,
        totalDebtBefore: summary.totalDebtBefore,
      }
    : {
        totalPurchaseBefore: 0,
        totalPaidBefore: 0,
        totalDebtBefore: 0,
      };

  if (!supplier) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading supplier details...</span>
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
    <SupplierLedgerReportViewer
      supplier={supplier}
      ledgerData={transformedLedgerData}
      summary={transformedSummary}
      fromDate={fromDate}
      toDate={toDate}
    />
  );
}
