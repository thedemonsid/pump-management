import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBankAccountStore } from '@/store/bank-account-store';
import { BankAccountService } from '@/services/bank-account-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { BankAccount, BankTransaction } from '@/types';
import { TransactionFormSchema, type TransactionFormValues } from '@/types';
import {
  BankAccountInfoCard,
  TransactionHistoryCard,
  TransactionDialog,
} from '@/components/bank-accounts';

export function BankAccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loading: accountLoading } = useBankAccountStore();

  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
  const [isDebitDialogOpen, setIsDebitDialogOpen] = useState(false);

  const creditForm = useForm<TransactionFormValues>({
    resolver: zodResolver(TransactionFormSchema),
    defaultValues: {
      amount: 0,
      description: '',
      paymentMethod: 'CASH',
      transactionDate: new Date().toISOString().slice(0, 16),
    },
  });

  const debitForm = useForm<TransactionFormValues>({
    resolver: zodResolver(TransactionFormSchema),
    defaultValues: {
      amount: 0,
      description: '',
      paymentMethod: 'CASH',
      transactionDate: new Date().toISOString().slice(0, 16),
    },
  });

  const loadBankAccount = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const account = await BankAccountService.getById(id);
      setBankAccount(account);
    } catch (err) {
      setError('Failed to load bank account');
      console.error('Error loading bank account:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadTransactions = useCallback(async () => {
    if (!id) return;

    try {
      const txns = await BankAccountService.getTransactions(id);
      setTransactions(txns);
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
  }, [id]);

  useEffect(() => {
    loadBankAccount();
    loadTransactions();
  }, [loadBankAccount, loadTransactions]);

  const onCreditSubmit = async (data: TransactionFormValues) => {
    if (!id) return;

    try {
      const transactionData = {
        bankAccountId: id,
        amount: data.amount,
        transactionType: 'CREDIT' as const,
        paymentMethod: data.paymentMethod,
        description: data.description,
        transactionDate: new Date(data.transactionDate).toISOString(),
      };

      await BankAccountService.credit(id, transactionData);

      // Reload data
      await loadBankAccount();
      await loadTransactions();

      // Reset form and close dialog
      creditForm.reset();
      setIsCreditDialogOpen(false);
    } catch (err) {
      console.error('Error creating credit transaction:', err);
      setError('Failed to create transaction');
    }
  };

  const onDebitSubmit = async (data: TransactionFormValues) => {
    if (!id) return;

    try {
      const transactionData = {
        bankAccountId: id,
        amount: data.amount,
        transactionType: 'DEBIT' as const,
        paymentMethod: data.paymentMethod,
        description: data.description,
        transactionDate: new Date(data.transactionDate).toISOString(),
      };

      await BankAccountService.debit(id, transactionData);

      // Reload data
      await loadBankAccount();
      await loadTransactions();

      // Reset form and close dialog
      debitForm.reset();
      setIsDebitDialogOpen(false);
    } catch (err) {
      console.error('Error creating debit transaction:', err);
      setError('Failed to create transaction');
    }
  };

  if (loading || accountLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading bank account details...</span>
        </div>
      </div>
    );
  }

  if (error || !bankAccount) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/bank-accounts')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bank Accounts
          </Button>
        </div>
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">
              {error || 'Bank account not found'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {bankAccount.accountHolderName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TransactionDialog
            isOpen={isCreditDialogOpen}
            onOpenChange={setIsCreditDialogOpen}
            type="credit"
            form={creditForm}
            onSubmit={onCreditSubmit}
          />
          <TransactionDialog
            isOpen={isDebitDialogOpen}
            onOpenChange={setIsDebitDialogOpen}
            type="debit"
            form={debitForm}
            onSubmit={onDebitSubmit}
          />
        </div>
      </div>

      {/* Bank Account Information */}
      <BankAccountInfoCard bankAccount={bankAccount} />

      {/* Transactions */}
      <TransactionHistoryCard transactions={transactions} />
    </div>
  );
}
