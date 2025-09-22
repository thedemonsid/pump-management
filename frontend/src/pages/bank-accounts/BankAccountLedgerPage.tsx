import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Loader2,
  Building2,
  Calendar,
  CreditCard,
  Search,
  FileText,
  Plus,
  Minus,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useBankAccountStore } from '@/store/bank-account-store';
import { useBankAccountLedgerStore } from '@/store/bank-account-ledger-store';
import { BankAccountService } from '@/services/bank-account-service';
import { DataTable } from '@/components/ui/data-table';
import { ledgerColumns } from './ledger-columns';
import { TransactionForm } from '@/components/bank-accounts/transaction-form';
import { TransactionFormSchema, type TransactionFormValues } from '@/types';

export function BankAccountLedgerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { bankAccounts, fetchBankAccounts } = useBankAccountStore();
  const { ledgerData, summary, loading, hasSearched, computeLedgerData } =
    useBankAccountLedgerStore();

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
  const [isDebitDialogOpen, setIsDebitDialogOpen] = useState(false);

  const creditForm = useForm<TransactionFormValues>({
    resolver: zodResolver(TransactionFormSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: 'CASH',
      description: '',
      transactionDate: new Date().toISOString().slice(0, 16),
    },
  });

  const debitForm = useForm<TransactionFormValues>({
    resolver: zodResolver(TransactionFormSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: 'CASH',
      description: '',
      transactionDate: new Date().toISOString().slice(0, 16),
    },
  });

  const handleCreditTransaction = async (data: TransactionFormValues) => {
    if (!id) return;
    try {
      await BankAccountService.credit(id, {
        bankAccountId: id,
        amount: data.amount,
        transactionType: 'CREDIT',
        paymentMethod: data.paymentMethod,
        description: data.description,
        transactionDate: data.transactionDate,
      });
      setIsCreditDialogOpen(false);
      creditForm.reset();
      toast.success('Credit transaction added successfully');
      // Refresh ledger data if it's already been searched
      if (hasSearched) {
        handleFetchLedger();
      }
    } catch (error) {
      console.error('Failed to create credit transaction:', error);
      toast.error('Failed to add credit transaction');
    }
  };

  const handleDebitTransaction = async (data: TransactionFormValues) => {
    if (!id) return;
    try {
      await BankAccountService.debit(id, {
        bankAccountId: id,
        amount: data.amount,
        transactionType: 'DEBIT',
        paymentMethod: data.paymentMethod,
        description: data.description,
        transactionDate: data.transactionDate,
      });
      setIsDebitDialogOpen(false);
      debitForm.reset();
      toast.success('Debit transaction added successfully');
      // Refresh ledger data if it's already been searched
      if (hasSearched) {
        handleFetchLedger();
      }
    } catch (error) {
      console.error('Failed to create debit transaction:', error);
      toast.error('Failed to add debit transaction');
    }
  };

  const bankAccount = bankAccounts.find((b) => b.id === id);

  useEffect(() => {
    if (bankAccounts.length === 0) {
      fetchBankAccounts();
    }
  }, [bankAccounts.length, fetchBankAccounts]);

  useEffect(() => {
    if (bankAccount?.openingBalanceDate) {
      setFromDate(bankAccount.openingBalanceDate);
    }
  }, [bankAccount]);

  const handleFetchLedger = () => {
    if (!id || !fromDate) return;
    computeLedgerData({
      bankAccountId: id,
      fromDate,
      toDate,
      openingBalance: bankAccount?.openingBalance || 0,
    });
  };

  if (!bankAccount) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">
            Loading bank account details...
          </span>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Bank Account Ledger
              </h1>
              <p className="text-lg text-muted-foreground">
                {bankAccount.accountHolderName} - {bankAccount.accountNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Dialog
              open={isCreditDialogOpen}
              onOpenChange={setIsCreditDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Credit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Credit Transaction</DialogTitle>
                  <DialogDescription>
                    Add a new credit transaction to this bank account.
                  </DialogDescription>
                </DialogHeader>
                <TransactionForm
                  form={creditForm}
                  onSubmit={handleCreditTransaction}
                  onCancel={() => setIsCreditDialogOpen(false)}
                  type="credit"
                />
              </DialogContent>
            </Dialog>

            <Dialog
              open={isDebitDialogOpen}
              onOpenChange={setIsDebitDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Minus className="h-4 w-4 mr-2" />
                  Add Debit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Debit Transaction</DialogTitle>
                  <DialogDescription>
                    Add a new debit transaction to this bank account.
                  </DialogDescription>
                </DialogHeader>
                <TransactionForm
                  form={debitForm}
                  onSubmit={handleDebitTransaction}
                  onCancel={() => setIsDebitDialogOpen(false)}
                  type="debit"
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Separator />
      </div>

      {/* Date Range Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Date Range Filter
          </CardTitle>
          <CardDescription>
            Select the date range and click fetch to view ledger entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="from-date" className="text-sm font-medium">
                From Date
              </Label>
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-date" className="text-sm font-medium">
                To Date
              </Label>
              <Input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-center gap-4">
            <Button
              onClick={handleFetchLedger}
              disabled={loading || !fromDate}
              size="lg"
              className="min-w-[200px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching Data...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Fetch Ledger Details
                </>
              )}
            </Button>
            {hasSearched && (
              <Button
                onClick={() =>
                  navigate(
                    `/bank-accounts/${id}/ledger/report?fromDate=${fromDate}&toDate=${toDate}`
                  )
                }
                variant="outline"
                size="lg"
                className="min-w-[150px]"
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Show content only after search */}
      {hasSearched && (
        <>
          {/* Opening Balance Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Opening balance and account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Opening Balance
                  </p>
                  <p className="text-xl font-semibold text-foreground">
                    {formatCurrency(bankAccount?.openingBalance || 0)}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Balance Date
                  </p>
                  <p className="text-xl font-semibold text-foreground">
                    {bankAccount?.openingBalanceDate
                      ? formatDate(bankAccount.openingBalanceDate)
                      : 'Not specified'}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Opening Balance for Period
                  </p>
                  <p className="text-xl font-semibold text-foreground">
                    {formatCurrency(summary.balanceBefore)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Before Date Range */}
          <Card>
            <CardHeader>
              <CardTitle>Summary Before Selected Date Range</CardTitle>
              <CardDescription>
                Financial summary before {formatDate(fromDate)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg bg-muted/20">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Total Credits
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(summary.totalCreditsBefore)}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-muted/20">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Total Debits
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(summary.totalDebitsBefore)}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-muted/20">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Balance
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      summary.balanceBefore >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(Math.abs(summary.balanceBefore))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ledger Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Ledger Entries
              </CardTitle>
              <CardDescription>
                Transaction history for the selected date range
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={ledgerColumns}
                data={ledgerData}
                searchKey="description"
                searchPlaceholder="Search transactions..."
              />
            </CardContent>
          </Card>

          {/* Summary Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>
                Complete financial overview including all transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Total Credits (Till Date)
                  </p>
                  <p className="text-xl font-bold text-green-700">
                    {formatCurrency(summary.totalCreditsTillDate)}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg ">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Total Debits (Till Date)
                  </p>
                  <p className="text-xl font-bold text-red-700">
                    {formatCurrency(summary.totalDebitsTillDate)}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg ">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Closing Balance
                  </p>
                  <p
                    className={`text-xl font-bold ${
                      summary.closingBalance >= 0
                        ? 'text-green-700'
                        : 'text-red-700'
                    }`}
                  >
                    {formatCurrency(Math.abs(summary.closingBalance))}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Credits in Range
                  </p>
                  <p className="text-xl font-bold text-orange-700">
                    {formatCurrency(summary.totalCreditsInRange)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Show message if no search performed yet */}
      {!hasSearched && !loading && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Ready to View Ledger Details
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Select your desired date range above and click "Fetch Ledger
                  Details" to view the bank account's transaction history and
                  financial summary.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
