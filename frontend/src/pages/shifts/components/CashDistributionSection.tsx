import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { BankAccountService } from "@/services/bank-account-service";
import { SalesmanShiftAccountingService } from "@/services/salesman-shift-accounting-service";
import type { BankAccount } from "@/types";
import type { CashDistributionResponse } from "@/types/salesman-shift-accounting";

interface DistributionEntry {
  id: string;
  bankAccountId: string;
  amount: string;
}

interface CashDistributionSectionProps {
  shiftId: string;
  cashInHand: number;
  upiReceived: number;
  cardReceived: number;
  customerReceipt: number;
  isAdminOrManager: boolean;
  onDistributionChange?: () => void;
}

export function CashDistributionSection({
  shiftId,
  cashInHand,
  upiReceived,
  cardReceived,
  customerReceipt,
  isAdminOrManager,
  onDistributionChange,
}: CashDistributionSectionProps) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [distributions, setDistributions] = useState<
    CashDistributionResponse[]
  >([]);
  const [entries, setEntries] = useState<DistributionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load bank accounts and existing distributions
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [accounts, existingDistributions] = await Promise.all([
          BankAccountService.getAll(),
          SalesmanShiftAccountingService.getCashDistributions(shiftId),
        ]);
        setBankAccounts(accounts);
        setDistributions(existingDistributions);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load bank accounts");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [shiftId]);

  // Calculate totals - total to deposit includes cash, UPI, card, and customer receipts
  const totalToDeposit =
    cashInHand + upiReceived + cardReceived + customerReceipt;
  const totalDistributed = distributions.reduce((sum, d) => sum + d.amount, 0);
  const totalPending = entries.reduce(
    (sum, e) => sum + (parseFloat(e.amount) || 0),
    0
  );
  const remaining = totalToDeposit - totalDistributed - totalPending;

  // Add a new distribution entry
  const addEntry = () => {
    setEntries([
      ...entries,
      {
        id: crypto.randomUUID(),
        bankAccountId: "",
        amount: "",
      },
    ]);
  };

  // Remove an entry
  const removeEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  // Update entry
  const updateEntry = (
    id: string,
    field: "bankAccountId" | "amount",
    value: string
  ) => {
    setEntries(
      entries.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  // Submit distributions
  const handleSubmit = async () => {
    // Validate entries
    const validEntries = entries.filter(
      (e) => e.bankAccountId && parseFloat(e.amount) > 0
    );

    if (validEntries.length === 0) {
      toast.error("Please add at least one valid distribution");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const request = {
        distributions: validEntries.map((e) => ({
          bankAccountId: e.bankAccountId,
          amount: parseFloat(e.amount),
        })),
      };

      const newDistributions =
        await SalesmanShiftAccountingService.distributeCash(shiftId, request);

      setDistributions([...distributions, ...newDistributions]);
      setEntries([]);
      toast.success("Cash distributed successfully!");
      onDistributionChange?.();
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to distribute cash";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a single distribution
  const handleDeleteDistribution = async (transactionId: string) => {
    try {
      await SalesmanShiftAccountingService.deleteCashDistribution(
        transactionId
      );
      setDistributions(distributions.filter((d) => d.id !== transactionId));
      toast.success("Distribution deleted");
      onDistributionChange?.();
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to delete distribution";
      toast.error(errorMessage);
    }
  };

  // Delete all distributions
  const handleDeleteAll = async () => {
    if (!confirm("Are you sure you want to delete all distributions?")) return;

    try {
      await SalesmanShiftAccountingService.deleteCashDistributions(shiftId);
      setDistributions([]);
      toast.success("All distributions deleted");
      onDistributionChange?.();
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to delete distributions";
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Building2 className="h-5 w-5" />
          Bank Deposit Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Amount Breakdown */}
        <div className="p-3 bg-muted/30 rounded-lg space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Amounts to Deposit
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cash:</span>
              <span className="font-mono">₹{cashInHand.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">UPI:</span>
              <span className="font-mono">₹{upiReceived.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Card:</span>
              <span className="font-mono">₹{cardReceived.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Receipts:</span>
              <span className="font-mono">₹{customerReceipt.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-xs text-muted-foreground">Total to Deposit</p>
            <p className="text-sm sm:text-lg font-semibold font-mono">
              ₹{totalToDeposit.toFixed(2)}
            </p>
          </div>
          <div className="p-2 sm:p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <p className="text-xs text-muted-foreground">Distributed</p>
            <p className="text-sm sm:text-lg font-semibold font-mono text-green-600">
              ₹{totalDistributed.toFixed(2)}
            </p>
          </div>
          <div className="p-2 sm:p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="text-sm sm:text-lg font-semibold font-mono text-orange-600">
              ₹{remaining.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Existing distributions */}
        {distributions.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Deposited Amounts</Label>
              {isAdminOrManager && distributions.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={handleDeleteAll}
                >
                  Delete All
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {distributions.map((dist) => (
                <div
                  key={dist.id}
                  className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {dist.bankName} - {dist.bankAccountName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {dist.accountNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-sm sm:text-base">
                      ₹{dist.amount.toFixed(2)}
                    </span>
                    {isAdminOrManager && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteDistribution(dist.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add new distributions - only for admin/manager */}
        {isAdminOrManager && (
          <div className="space-y-3 pt-2 border-t">
            <Label className="text-sm font-medium">Add New Distribution</Label>

            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col sm:flex-row gap-2 p-2 bg-muted/30 rounded-lg"
              >
                <div className="flex-1">
                  <Select
                    value={entry.bankAccountId}
                    onValueChange={(value) =>
                      updateEntry(entry.id, "bankAccountId", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select bank account" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id!}>
                          {account.bank} - {account.accountHolderName} (
                          {account.accountNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={entry.amount}
                    onChange={(e) =>
                      updateEntry(entry.id, "amount", e.target.value)
                    }
                    className="w-32"
                    min="0"
                    step="0.01"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeEntry(entry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={addEntry}
                className="flex-1 sm:flex-none"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Bank
              </Button>

              {entries.length > 0 && (
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Deposit"
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {!isAdminOrManager && distributions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No deposits yet. Only managers can add bank deposits.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
