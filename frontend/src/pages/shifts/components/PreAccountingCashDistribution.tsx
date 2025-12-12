import { useState, useEffect } from "react";
import { Plus, Trash2, Building2 } from "lucide-react";
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
import { BankAccountService } from "@/services/bank-account-service";
import type { BankAccount } from "@/types";

export interface PreDistributionEntry {
  bankAccountId: string;
  amount: string;
  paymentMethod: "CASH" | "UPI" | "RTGS" | "NEFT" | "IMPS" | "CHEQUE" | "CARD";
}

interface PreAccountingCashDistributionProps {
  cashInHand: number;
  upiReceived: number;
  cardReceived: number;
  distributions: PreDistributionEntry[];
  onDistributionsChange: (distributions: PreDistributionEntry[]) => void;
}

export function PreAccountingCashDistribution({
  cashInHand,
  upiReceived,
  cardReceived,
  distributions,
  onDistributionsChange,
}: PreAccountingCashDistributionProps) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load bank accounts
  useEffect(() => {
    const loadBankAccounts = async () => {
      setIsLoading(true);
      try {
        const accounts = await BankAccountService.getAll();
        setBankAccounts(accounts);
      } catch (err) {
        console.error("Failed to load bank accounts:", err);
        setError("Failed to load bank accounts");
      } finally {
        setIsLoading(false);
      }
    };

    loadBankAccounts();
  }, []);

  // Calculate totals
  const totalToDeposit = cashInHand + upiReceived + cardReceived;
  const totalPending = distributions.reduce(
    (sum, e) => sum + (parseFloat(e.amount) || 0),
    0
  );
  const remaining = totalToDeposit - totalPending;

  // Add a new distribution entry
  const addEntry = () => {
    onDistributionsChange([
      ...distributions,
      {
        bankAccountId: "",
        amount: "",
        paymentMethod: "CASH",
      },
    ]);
  };

  // Remove an entry
  const removeEntry = (index: number) => {
    onDistributionsChange(distributions.filter((_, i) => i !== index));
  };

  // Update entry
  const updateEntry = (
    index: number,
    field: "bankAccountId" | "amount" | "paymentMethod",
    value: string
  ) => {
    onDistributionsChange(
      distributions.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    );
  };

  if (isLoading) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Building2 className="h-5 w-5" />
          Plan Bank Deposit Distribution (Optional)
        </CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground">
          You can plan how to distribute cash to bank accounts. This will be
          saved when you create the accounting.
        </p>
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
            Amounts Available to Deposit
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
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
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-xs text-muted-foreground">Total Available</p>
            <p className="text-sm sm:text-lg font-semibold font-mono">
              ₹{totalToDeposit.toFixed(2)}
            </p>
          </div>
          <div className="p-2 sm:p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <p className="text-xs text-muted-foreground">Planned</p>
            <p className="text-sm sm:text-lg font-semibold font-mono text-green-600">
              ₹{totalPending.toFixed(2)}
            </p>
          </div>
          <div className="p-2 sm:p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="text-sm sm:text-lg font-semibold font-mono text-orange-600">
              ₹{remaining.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Distribution entries */}
        {distributions.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Planned Distributions</Label>

            {distributions.map((entry, index) => {
              const selectedAccount = bankAccounts.find(
                (acc) => acc.id === entry.bankAccountId
              );

              return (
                <div
                  key={index}
                  className="flex flex-col gap-2 p-2 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      Bank Account
                    </Label>
                    <Select
                      value={entry.bankAccountId}
                      onValueChange={(value) =>
                        updateEntry(index, "bankAccountId", value)
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
                  {selectedAccount && (
                    <div className="text-xs text-muted-foreground pl-1">
                      {selectedAccount.accountNumber}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Payment Method
                      </Label>
                      <Select
                        value={entry.paymentMethod}
                        onValueChange={(value) =>
                          updateEntry(index, "paymentMethod", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CASH">Cash</SelectItem>
                          <SelectItem value="UPI">UPI</SelectItem>
                          <SelectItem value="NEFT">NEFT</SelectItem>
                          <SelectItem value="RTGS">RTGS</SelectItem>
                          <SelectItem value="IMPS">IMPS</SelectItem>
                          <SelectItem value="CARD">CARD</SelectItem>
                          <SelectItem value="CHEQUE">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Amount
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={entry.amount}
                          onChange={(e) =>
                            updateEntry(index, "amount", e.target.value)
                          }
                          className="flex-1"
                          min="0"
                          step="0.01"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeEntry(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addEntry}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Bank Distribution
        </Button>

        {distributions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            No distributions planned yet. You can add them after creating the
            accounting.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
