import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useBankAccountStore } from "@/store/bank-account-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BankAccountForm } from "./BankAccountForm";
import { BankAccountService } from "@/services/bank-account-service";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import type { BankAccount } from "@/types";

export function BankAccountsPage() {
  const { bankAccounts, loading, error, fetchBankAccounts } =
    useBankAccountStore();
  const navigate = useNavigate();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBankAccount, setEditingBankAccount] =
    useState<BankAccount | null>(null);
  const [currentBalances, setCurrentBalances] = useState<
    Record<string, number>
  >({});
  const [balancesLoading, setBalancesLoading] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    fetchBankAccounts();
  }, [fetchBankAccounts]);

  const calculateCurrentBalances = useCallback(async () => {
    const today = new Date();
    const twoDaysBefore = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
    const twoDaysAfter = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
    const fromDate = twoDaysBefore.toISOString().split("T")[0];
    const toDate = twoDaysAfter.toISOString().split("T")[0];

    const balances: Record<string, number> = {};
    const loadingStates: Record<string, boolean> = {};

    // Start loading for all bank accounts
    bankAccounts.forEach((account) => {
      loadingStates[account.id!] = true;
    });
    setBalancesLoading(loadingStates);

    // Calculate balance for each bank account
    await Promise.all(
      bankAccounts.map(async (account) => {
        if (!account.id) return;

        try {
          // Get opening balance for 2 days before today
          const openingBalance = await BankAccountService.getOpeningBalance(
            account.id,
            fromDate
          );

          // Get transactions for the date range
          const transactions =
            await BankAccountService.getTransactionsWithDateRange(
              account.id,
              fromDate,
              toDate
            );

          // Calculate running balance
          let runningBalance = openingBalance;
          transactions.forEach((transaction) => {
            if (transaction.transactionType === "CREDIT") {
              runningBalance += transaction.amount;
            } else if (transaction.transactionType === "DEBIT") {
              runningBalance -= transaction.amount;
            }
          });

          balances[account.id] = runningBalance;
        } catch (error) {
          console.error(
            `Failed to calculate balance for bank account ${account.id}:`,
            error
          );
          // Fallback to account's current balance or opening balance
          balances[account.id] =
            account.currentBalance ?? account.openingBalance;
        } finally {
          loadingStates[account.id] = false;
        }
      })
    );

    setCurrentBalances(balances);
    setBalancesLoading(loadingStates);
  }, [bankAccounts]);

  // Calculate current balances for all bank accounts
  useEffect(() => {
    if (bankAccounts.length > 0) {
      calculateCurrentBalances();
    }
  }, [bankAccounts, calculateCurrentBalances]);

  if (loading && bankAccounts.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading bank accounts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Bank Accounts</h1>
          <p className="text-muted-foreground">
            Manage bank accounts for financial transactions
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Bank Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Bank Account</DialogTitle>
              <DialogDescription>
                Add a new bank account to the system
              </DialogDescription>
            </DialogHeader>
            <BankAccountForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Bank Account List</CardTitle>
          <CardDescription>
            A list of all bank accounts in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bankAccounts.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No bank accounts found. Create your first bank account to get
              started.
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={bankAccounts}
              searchKey="accountHolderName"
              searchPlaceholder="Filter bank accounts..."
              meta={{
                onView: (bankAccount: BankAccount) =>
                  navigate(`/bank-accounts/${bankAccount.id}/ledger`),
                onEdit: (bankAccount: BankAccount) =>
                  setEditingBankAccount(bankAccount),
                currentBalances,
                balancesLoading,
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={editingBankAccount !== null}
        onOpenChange={() => setEditingBankAccount(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Bank Account</DialogTitle>
            <DialogDescription>
              Update bank account information
            </DialogDescription>
          </DialogHeader>
          {editingBankAccount && (
            <BankAccountForm
              bankAccount={editingBankAccount}
              onSuccess={() => setEditingBankAccount(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
