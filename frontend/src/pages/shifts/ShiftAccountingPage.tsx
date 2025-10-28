import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useShiftStore } from "@/store/shifts/shift-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { SalesmanShiftAccountingService } from "@/services/salesman-shift-accounting-service";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  AlertCircle,
  Calculator,
  Save,
  Edit,
} from "lucide-react";
import { format } from "date-fns";
import type {
  SalesmanShiftAccountingResponse,
  CreateSalesmanShiftAccountingRequest,
  UpdateSalesmanShiftAccountingRequest,
} from "@/types";

interface DenominationCounts {
  notes2000: number;
  notes1000: number;
  notes500: number;
  notes200: number;
  notes100: number;
  notes50: number;
  notes20: number;
  notes10: number;
  coins5: number;
  coins2: number;
  coins1: number;
}

const DENOMINATIONS = [
  { key: "notes2000", label: "₹2000 Notes", value: 2000 },
  { key: "notes1000", label: "₹1000 Notes", value: 1000 },
  { key: "notes500", label: "₹500 Notes", value: 500 },
  { key: "notes200", label: "₹200 Notes", value: 200 },
  { key: "notes100", label: "₹100 Notes", value: 100 },
  { key: "notes50", label: "₹50 Notes", value: 50 },
  { key: "notes20", label: "₹20 Notes", value: 20 },
  { key: "notes10", label: "₹10 Notes", value: 10 },
  { key: "coins5", label: "₹5 Coins", value: 5 },
  { key: "coins2", label: "₹2 Coins", value: 2 },
  { key: "coins1", label: "₹1 Coins", value: 1 },
] as const;

export function ShiftAccountingPage() {
  const { shiftId } = useParams<{ shiftId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentShift, fetchShiftById } = useShiftStore();

  const [accounting, setAccounting] =
    useState<SalesmanShiftAccountingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [upiReceived, setUpiReceived] = useState<string>("0");
  const [cardReceived, setCardReceived] = useState<string>("0");
  const [expenses, setExpenses] = useState<string>("0");
  const [expenseReason, setExpenseReason] = useState<string>("");
  const [denominations, setDenominations] = useState<DenominationCounts>({
    notes2000: 0,
    notes1000: 0,
    notes500: 0,
    notes200: 0,
    notes100: 0,
    notes50: 0,
    notes20: 0,
    notes10: 0,
    coins5: 0,
    coins2: 0,
    coins1: 0,
  });

  const isAdminOrManager = user?.role === "ADMIN" || user?.role === "MANAGER";
  const canEdit =
    isAdminOrManager || (!accounting && currentShift?.status === "CLOSED");

  useEffect(() => {
    const loadData = async () => {
      if (!shiftId) return;

      setIsLoading(true);
      try {
        await fetchShiftById(shiftId);

        // Try to fetch existing accounting
        try {
          const accountingData =
            await SalesmanShiftAccountingService.getByShiftId(shiftId);
          setAccounting(accountingData);

          // Populate form with existing data
          setUpiReceived(accountingData.upiReceived.toString());
          setCardReceived(accountingData.cardReceived.toString());
          setExpenses(accountingData.expenses.toString());
          setExpenseReason(accountingData.expenseReason || "");
          setDenominations({
            notes2000: accountingData.notes2000,
            notes1000: accountingData.notes1000,
            notes500: accountingData.notes500,
            notes200: accountingData.notes200,
            notes100: accountingData.notes100,
            notes50: accountingData.notes50,
            notes20: accountingData.notes20,
            notes10: accountingData.notes10,
            coins5: accountingData.coins5,
            coins2: accountingData.coins2,
            coins1: accountingData.coins1,
          });
        } catch {
          // No accounting exists yet - this is fine
          console.log("No accounting found for shift");
        }
      } catch (err) {
        toast.error("Failed to load shift data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (shiftId) {
      loadData();
    }
  }, [shiftId, fetchShiftById]);

  const calculateCashFromDenominations = (): number => {
    return DENOMINATIONS.reduce((total, denom) => {
      const count = denominations[denom.key as keyof DenominationCounts];
      return total + count * denom.value;
    }, 0);
  };

  const actualCash = calculateCashFromDenominations();
  const expectedCash = accounting
    ? accounting.systemReceivedAmount -
      parseFloat(upiReceived) -
      parseFloat(cardReceived) -
      accounting.credit -
      parseFloat(expenses)
    : 0;
  const balance = actualCash - expectedCash;

  const handleDenominationChange = (
    key: keyof DenominationCounts,
    value: string
  ) => {
    const numValue = parseInt(value) || 0;
    setDenominations((prev) => ({
      ...prev,
      [key]: numValue,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!currentShift) {
      setError("Shift not found");
      return;
    }

    if (currentShift.status !== "CLOSED" && !accounting) {
      setError("Shift must be closed before creating accounting");
      return;
    }

    setIsSaving(true);

    try {
      const requestData = {
        upiReceived: parseFloat(upiReceived),
        cardReceived: parseFloat(cardReceived),
        expenses: parseFloat(expenses),
        expenseReason: expenseReason || undefined,
        ...denominations,
      };

      if (accounting) {
        // Update existing accounting
        const updated = await SalesmanShiftAccountingService.update(
          accounting.id,
          requestData as UpdateSalesmanShiftAccountingRequest
        );
        setAccounting(updated);
        toast.success("Accounting updated successfully!");
        setIsEditing(false);
      } else {
        // Create new accounting
        const created = await SalesmanShiftAccountingService.create(
          shiftId!,
          requestData as CreateSalesmanShiftAccountingRequest
        );
        setAccounting(created);
        toast.success("Accounting created successfully!");
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to save accounting";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!currentShift) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Shift not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isFormDisabled = !canEdit || (!isEditing && !!accounting) || isSaving;

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/shifts/${shiftId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Shift Accounting</h1>
            <p className="text-sm text-muted-foreground">
              Cash reconciliation and accounting
            </p>
          </div>
        </div>
        {accounting && canEdit && !isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Accounting
          </Button>
        )}
      </div>

      {/* Shift Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Shift Information</CardTitle>
            <Badge
              variant={currentShift.status === "OPEN" ? "default" : "secondary"}
            >
              {currentShift.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Salesman</p>
              <p className="font-medium">{currentShift.salesmanUsername}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Start Time</p>
              <p className="font-medium">
                {format(new Date(currentShift.startDatetime), "PPp")}
              </p>
            </div>
            {currentShift.endDatetime && (
              <div>
                <p className="text-muted-foreground">End Time</p>
                <p className="font-medium">
                  {format(new Date(currentShift.endDatetime), "PPp")}
                </p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Opening Cash</p>
              <p className="font-medium">
                ₹{currentShift.openingCash.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounting Summary (if exists) */}
      {accounting && !isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Accounting Summary</CardTitle>
            <CardDescription>
              Created on {format(new Date(accounting.createdAt), "PPp")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Fuel Sales</p>
                <p className="text-lg font-semibold">
                  ₹{accounting.fuelSales.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Customer Receipt
                </p>
                <p className="text-lg font-semibold">
                  ₹{accounting.customerReceipt.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">System Received</p>
                <p className="text-lg font-semibold">
                  ₹{accounting.systemReceivedAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">UPI Received</p>
                <p className="text-lg font-semibold">
                  ₹{accounting.upiReceived.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Card Received</p>
                <p className="text-lg font-semibold">
                  ₹{accounting.cardReceived.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Credit</p>
                <p className="text-lg font-semibold">
                  ₹{accounting.credit.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expenses</p>
                <p className="text-lg font-semibold">
                  ₹{accounting.expenses.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cash in Hand</p>
                <p className="text-lg font-semibold">
                  ₹{accounting.cashInHand.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p
                  className={`text-lg font-semibold ${
                    accounting.balanceAmount === 0
                      ? "text-green-600"
                      : accounting.balanceAmount > 0
                      ? "text-blue-600"
                      : "text-red-600"
                  }`}
                >
                  ₹{accounting.balanceAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accounting Form */}
      {(!accounting || isEditing) && (
        <form onSubmit={handleSave} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Digital Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Digital Payments</CardTitle>
              <CardDescription>
                UPI and Card payments received during shift
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="upiReceived">UPI Received</Label>
                <Input
                  id="upiReceived"
                  type="number"
                  step="0.01"
                  value={upiReceived}
                  onChange={(e) => setUpiReceived(e.target.value)}
                  disabled={isFormDisabled}
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardReceived">Card Received</Label>
                <Input
                  id="cardReceived"
                  type="number"
                  step="0.01"
                  value={cardReceived}
                  onChange={(e) => setCardReceived(e.target.value)}
                  disabled={isFormDisabled}
                  className="text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Expenses */}
          <Card>
            <CardHeader>
              <CardTitle>Expenses</CardTitle>
              <CardDescription>
                Expenses incurred during the shift
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expenses">Expense Amount</Label>
                <Input
                  id="expenses"
                  type="number"
                  step="0.01"
                  value={expenses}
                  onChange={(e) => setExpenses(e.target.value)}
                  disabled={isFormDisabled}
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenseReason">Expense Reason</Label>
                <Input
                  id="expenseReason"
                  type="text"
                  placeholder="e.g., Fuel purchase, Maintenance"
                  value={expenseReason}
                  onChange={(e) => setExpenseReason(e.target.value)}
                  disabled={isFormDisabled}
                  className="text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Cash Denominations */}
          <Card>
            <CardHeader>
              <CardTitle>Cash Denominations</CardTitle>
              <CardDescription>
                Count the cash in hand by denomination
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {DENOMINATIONS.map((denom) => (
                  <div key={denom.key} className="space-y-2">
                    <Label htmlFor={denom.key} className="text-sm">
                      {denom.label}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={denom.key}
                        type="number"
                        min="0"
                        value={
                          denominations[denom.key as keyof DenominationCounts]
                        }
                        onChange={(e) =>
                          handleDenominationChange(
                            denom.key as keyof DenominationCounts,
                            e.target.value
                          )
                        }
                        disabled={isFormDisabled}
                        className="text-base"
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        = ₹
                        {(
                          denominations[denom.key as keyof DenominationCounts] *
                          denom.value
                        ).toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              {/* Calculations */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-medium">Actual Cash (from count):</span>
                  <span className="font-mono font-semibold">
                    ₹{actualCash.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="font-medium">Expected Cash:</span>
                  <span className="font-mono font-semibold">
                    ₹{expectedCash.toFixed(2)}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-xl">
                  <span className="font-bold">
                    Balance (Actual - Expected):
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      balance === 0
                        ? "text-green-600"
                        : balance > 0
                        ? "text-blue-600"
                        : "text-red-600"
                    }`}
                  >
                    ₹{balance.toFixed(2)}
                  </span>
                </div>
                {balance !== 0 && (
                  <p className="text-sm text-muted-foreground">
                    {balance > 0
                      ? "Excess cash in hand"
                      : "Cash shortage detected"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {canEdit && (!accounting || isEditing) && (
            <div className="flex gap-3">
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form to accounting data
                    if (accounting) {
                      setUpiReceived(accounting.upiReceived.toString());
                      setCardReceived(accounting.cardReceived.toString());
                      setExpenses(accounting.expenses.toString());
                      setExpenseReason(accounting.expenseReason || "");
                      setDenominations({
                        notes2000: accounting.notes2000,
                        notes1000: accounting.notes1000,
                        notes500: accounting.notes500,
                        notes200: accounting.notes200,
                        notes100: accounting.notes100,
                        notes50: accounting.notes50,
                        notes20: accounting.notes20,
                        notes10: accounting.notes10,
                        coins5: accounting.coins5,
                        coins2: accounting.coins2,
                        coins1: accounting.coins1,
                      });
                    }
                  }}
                  disabled={isSaving}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSaving} className="flex-1">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {accounting ? (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Update Accounting
                      </>
                    ) : (
                      <>
                        <Calculator className="mr-2 h-4 w-4" />
                        Create Accounting
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
