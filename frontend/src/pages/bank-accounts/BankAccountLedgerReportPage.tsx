import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useBankAccountStore } from '@/store/bank-account-store';
import { useBankAccountLedgerStore } from '@/store/bank-account-ledger-store';
import { BankAccountLedgerReportViewer } from '@/components/reports/BankAccountLedgerReport';
import { Loader2 } from 'lucide-react';

export function BankAccountLedgerReportPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const { bankAccounts, fetchBankAccounts } = useBankAccountStore();
  const { ledgerData, summary, loading, hasSearched, computeLedgerData } =
    useBankAccountLedgerStore();

  const fromDate = searchParams.get('fromDate') || '2020-04-01';
  const toDate =
    searchParams.get('toDate') || new Date().toISOString().split('T')[0];

  const bankAccount = bankAccounts.find((b) => b.id === id);

  useEffect(() => {
    if (bankAccounts.length === 0) {
      fetchBankAccounts();
    }
  }, [bankAccounts.length, fetchBankAccounts]);

  useEffect(() => {
    if (bankAccount && !hasSearched) {
      computeLedgerData({
        bankAccountId: id!,
        fromDate,
        toDate,
        openingBalance: bankAccount?.openingBalance || 0,
      });
    }
  }, [bankAccount, hasSearched, fromDate, toDate, computeLedgerData, id]);

  // Transform ledger data to match report component expectations
  const transformedLedgerData = ledgerData.map((entry) => ({
    ...entry,
    transactionDetails: entry.transactionDetails,
  }));

  // Transform summary to match report component expectations
  const transformedSummary = summary
    ? {
        totalCreditsBefore: summary.totalCreditsBefore,
        totalDebitsBefore: summary.totalDebitsBefore,
        balanceBefore: summary.balanceBefore,
      }
    : {
        totalCreditsBefore: 0,
        totalDebitsBefore: 0,
        balanceBefore: 0,
      };

  if (!bankAccount) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading bank account details...</span>
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
    <BankAccountLedgerReportViewer
      bankAccount={bankAccount}
      ledgerData={transformedLedgerData}
      summary={transformedSummary}
      fromDate={fromDate}
      toDate={toDate}
    />
  );
}
