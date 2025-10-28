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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SalesmanShiftAccountingService } from "@/services/salesman-shift-accounting-service";
import { NozzleAssignmentService } from "@/services/nozzle-assignment-service";
import { SalesmanBillService } from "@/services/salesman-bill-service";
import { SalesmanBillPaymentService } from "@/services/salesman-bill-payment-service";
import { ExpenseService } from "@/services/expense-service";
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
  NozzleAssignmentResponse,
  SalesmanBillResponse,
  SalesmanBillPaymentResponse,
  ExpenseResponse,
} from "@/types";

interface DenominationCounts {
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
  { key: "notes500", label: "₹500", value: 500 },
  { key: "notes200", label: "₹200", value: 200 },
  { key: "notes100", label: "₹100", value: 100 },
  { key: "notes50", label: "₹50", value: 50 },
  { key: "notes20", label: "₹20", value: 20 },
  { key: "notes10", label: "₹10", value: 10 },
  { key: "coins5", label: "₹5", value: 5 },
  { key: "coins2", label: "₹2", value: 2 },
  { key: "coins1", label: "₹1", value: 1 },
] as const;

export function ShiftAccountingPage() {
  const { shiftId } = useParams<{ shiftId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentShift, fetchShiftById } = useShiftStore();

  const [accounting, setAccounting] =
    useState<SalesmanShiftAccountingResponse | null>(null);
  const [nozzles, setNozzles] = useState<NozzleAssignmentResponse[]>([]);
  const [bills, setBills] = useState<SalesmanBillResponse[]>([]);
  const [payments, setPayments] = useState<SalesmanBillPaymentResponse[]>([]);
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [upiReceived, setUpiReceived] = useState<string>("0");
  const [cardReceived, setCardReceived] = useState<string>("0");
  const [fleetCardReceived, setFleetCardReceived] = useState<string>("0");
  const [denominations, setDenominations] = useState<DenominationCounts>({
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
        // Load shift and all related data
        const [, nozzlesData, billsData, paymentsData, expensesData] =
          await Promise.all([
            fetchShiftById(shiftId),
            NozzleAssignmentService.getAssignmentsForShift(shiftId),
            SalesmanBillService.getByShift(shiftId),
            SalesmanBillPaymentService.getByShiftId(shiftId),
            ExpenseService.getBySalesmanShiftId(shiftId),
          ]);

        setNozzles(nozzlesData);
        setBills(billsData);
        setPayments(paymentsData);
        setExpenses(expensesData);

        // Try to fetch existing accounting
        try {
          const accountingData =
            await SalesmanShiftAccountingService.getByShiftId(shiftId);
          setAccounting(accountingData);

          // Populate form with existing data
          setUpiReceived(accountingData.upiReceived.toString());
          setCardReceived(accountingData.cardReceived.toString());
          setFleetCardReceived(accountingData.fleetCardReceived.toString());
          setDenominations({
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

  // Calculate live values from shift data
  const calculateFuelSales = (): number => {
    if (accounting) return accounting.fuelSales;
    return nozzles.reduce((sum, nozzle) => sum + (nozzle.totalAmount || 0), 0);
  };

  const calculateCustomerReceipt = (): number => {
    if (accounting) return accounting.customerReceipt;
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const calculateCredit = (): number => {
    if (accounting) return accounting.credit;
    return bills.reduce((sum, bill) => sum + bill.amount, 0);
  };

  const calculateExpenses = (): number => {
    if (accounting) return accounting.expenses;
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const calculateSystemReceivedAmount = (): number => {
    return calculateFuelSales() + calculateCustomerReceipt();
  };

  const actualCash = calculateCashFromDenominations();
  const expectedCash = accounting
    ? accounting.openingCash +
      accounting.systemReceivedAmount -
      parseFloat(upiReceived) -
      parseFloat(cardReceived) -
      parseFloat(fleetCardReceived) -
      accounting.credit -
      accounting.expenses
    : (currentShift?.openingCash || 0) +
      calculateSystemReceivedAmount() -
      parseFloat(upiReceived || "0") -
      parseFloat(cardReceived || "0") -
      parseFloat(fleetCardReceived || "0") -
      calculateCredit() -
      calculateExpenses();
  const balance = actualCash - expectedCash;

  const handleDenominationChange = (
    key: keyof DenominationCounts,
    value: string
  ) => {
    // Allow empty string, convert to 0 for internal state
    const numValue = value === "" ? 0 : parseInt(value) || 0;
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
        fleetCardReceived: parseFloat(fleetCardReceived),
        ...denominations,
      };

      if (accounting) {
        // Update existing accounting
        const updated = await SalesmanShiftAccountingService.update(
          shiftId!,
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
            <CardTitle className="text-2xl">
              🧾 Daily Fuel Sales & Reconciliation Sheet
            </CardTitle>
            <CardDescription>
              Created on {format(new Date(accounting.createdAt), "PPp")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Fuel Sales Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Fuel Sales Summary</h3>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Nozzle</th>
                      <th className="text-center p-3 font-medium">Product</th>
                      <th className="text-right p-3 font-medium">Litres</th>
                      <th className="text-right p-3 font-medium">Rate (₹)</th>
                      <th className="text-right p-3 font-medium">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nozzles.map((nozzle) => (
                      <tr key={nozzle.id} className="border-t">
                        <td className="p-3">{nozzle.nozzleName}</td>
                        <td className="p-3 text-center">
                          {nozzle.productName || "-"}
                        </td>
                        <td className="p-3 text-right font-mono">
                          {(nozzle.dispensedAmount || 0).toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-mono">
                          {(nozzle.productRate || 0).toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-mono">
                          {(nozzle.totalAmount || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t bg-muted/30">
                      <td className="p-3 font-semibold" colSpan={4}>
                        Total Fuel Sales
                      </td>
                      <td className="p-3 text-right font-mono font-semibold">
                        {accounting.fuelSales.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Non-Cash / Digital Sales */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Non-Cash / Digital Sales
              </h3>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">
                        Payment Type
                      </th>
                      <th className="text-right p-3 font-medium">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-3">UPI Sales</td>
                      <td className="p-3 text-right font-mono">
                        {accounting.upiReceived.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3">Card Sales</td>
                      <td className="p-3 text-right font-mono">
                        {accounting.cardReceived.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3">Fleet Card Sales</td>
                      <td className="p-3 text-right font-mono">
                        {accounting.fleetCardReceived.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3">Credit Sales (Credit Customers)</td>
                      <td className="p-3 text-right font-mono">
                        {accounting.credit.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-t bg-muted/30">
                      <td className="p-3 font-semibold">
                        Total Non-Cash Sales
                      </td>
                      <td className="p-3 text-right font-mono font-semibold">
                        {(
                          accounting.upiReceived +
                          accounting.cardReceived +
                          accounting.fleetCardReceived +
                          accounting.credit
                        ).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Receipts */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Receipts (Bill Payments Received)
              </h3>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Description</th>
                      <th className="text-right p-3 font-medium">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-3">Customer Receipt (Bill Payments)</td>
                      <td className="p-3 text-right font-mono">
                        {accounting.customerReceipt.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-t bg-muted/30">
                      <td className="p-3 font-semibold">Total Receipts</td>
                      <td className="p-3 text-right font-mono font-semibold">
                        {accounting.customerReceipt.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expenses */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Expenses</h3>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Description</th>
                      <th className="text-right p-3 font-medium">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-3">Total Expenses</td>
                      <td className="p-3 text-right font-mono">
                        {accounting.expenses.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-t bg-muted/30">
                      <td className="p-3 font-semibold">Total Expenses</td>
                      <td className="p-3 text-right font-mono font-semibold">
                        {accounting.expenses.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cash Denominations */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Cash Denominations</h3>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">
                        Denomination
                      </th>
                      <th className="text-center p-3 font-medium">Count</th>
                      <th className="text-right p-3 font-medium">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DENOMINATIONS.map((denom) => (
                      <tr key={denom.key} className="border-t">
                        <td className="p-3 font-medium">{denom.label}</td>
                        <td className="p-3 text-center font-mono">
                          {accounting[denom.key as keyof DenominationCounts]}
                        </td>
                        <td className="p-3 text-right font-mono">
                          {(
                            accounting[denom.key as keyof DenominationCounts] *
                            denom.value
                          ).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t bg-muted/30 font-semibold">
                      <td className="p-3" colSpan={2}>
                        Total Cash
                      </td>
                      <td className="p-3 text-right font-mono">
                        ₹{calculateCashFromDenominations().toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reconciliation Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Reconciliation Summary
              </h3>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Description</th>
                      <th className="text-right p-3 font-medium">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-3">Total Sales Expected</td>
                      <td className="p-3 text-right font-mono">
                        {accounting.systemReceivedAmount.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3">Less: Non-Cash Sales</td>
                      <td className="p-3 text-right font-mono text-red-600">
                        -
                        {(
                          accounting.upiReceived +
                          accounting.cardReceived +
                          accounting.fleetCardReceived +
                          accounting.credit
                        ).toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3">Less: Expenses</td>
                      <td className="p-3 text-right font-mono text-red-600">
                        -{accounting.expenses.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-t bg-blue-50 dark:bg-blue-950">
                      <td className="p-3 font-semibold">Net Cash Expected</td>
                      <td className="p-3 text-right font-mono font-semibold">
                        {(
                          accounting.systemReceivedAmount -
                          accounting.upiReceived -
                          accounting.cardReceived -
                          accounting.fleetCardReceived -
                          accounting.credit -
                          accounting.expenses
                        ).toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-t bg-green-50 dark:bg-green-950">
                      <td className="p-3 font-semibold">
                        Actual Cash (from count)
                      </td>
                      <td className="p-3 text-right font-mono font-semibold">
                        {accounting.cashInHand.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-t bg-muted">
                      <td className="p-3 font-bold text-lg">
                        Balance / Difference
                      </td>
                      <td className="p-3 text-right">
                        <span
                          className={`font-mono font-bold text-lg ${
                            accounting.balanceAmount === 0
                              ? "text-green-600"
                              : accounting.balanceAmount > 0
                              ? "text-blue-600"
                              : "text-red-600"
                          }`}
                        >
                          {accounting.balanceAmount >= 0 ? "+" : ""}
                          {accounting.balanceAmount.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {accounting.balanceAmount !== 0 && (
                <Alert
                  className="mt-4"
                  variant={
                    accounting.balanceAmount > 0 ? "default" : "destructive"
                  }
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {accounting.balanceAmount > 0
                      ? `Excess cash of ₹${accounting.balanceAmount.toFixed(
                          2
                        )} in hand`
                      : `Cash shortage of ₹${Math.abs(
                          accounting.balanceAmount
                        ).toFixed(2)} detected`}
                  </AlertDescription>
                </Alert>
              )}
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

          {/* Daily Fuel Sales & Reconciliation Sheet */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                🧾 Daily Fuel Sales & Reconciliation Sheet
              </CardTitle>
              <CardDescription>
                Complete accounting for {currentShift.salesmanUsername}'s shift
                on {format(new Date(currentShift.startDatetime), "PPP")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Fuel Sales Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Fuel Sales Summary
                </h3>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Nozzle</th>
                        <th className="text-center p-3 font-medium">Product</th>
                        <th className="text-right p-3 font-medium">Litres</th>
                        <th className="text-right p-3 font-medium">Rate (₹)</th>
                        <th className="text-right p-3 font-medium">
                          Amount (₹)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {nozzles.map((nozzle) => (
                        <tr key={nozzle.id} className="border-t">
                          <td className="p-3">{nozzle.nozzleName}</td>
                          <td className="p-3 text-center">
                            {nozzle.productName || "-"}
                          </td>
                          <td className="p-3 text-right font-mono">
                            {(nozzle.dispensedAmount || 0).toFixed(2)}
                          </td>
                          <td className="p-3 text-right font-mono">
                            {(nozzle.productRate || 0).toFixed(2)}
                          </td>
                          <td className="p-3 text-right font-mono">
                            {(nozzle.totalAmount || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t bg-muted/30">
                        <td className="p-3 font-semibold" colSpan={4}>
                          Total Fuel Sales
                        </td>
                        <td className="p-3 text-right font-mono font-semibold">
                          {calculateFuelSales().toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Non-Cash / Digital Sales */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Non-Cash / Digital Sales
                </h3>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">
                          Payment Type
                        </th>
                        <th className="text-right p-3 font-medium">
                          Amount (₹)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-3">UPI Sales</td>
                        <td className="p-3 text-right">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={upiReceived}
                            onChange={(e) => setUpiReceived(e.target.value)}
                            disabled={isFormDisabled}
                            className="text-right font-mono max-w-[200px] ml-auto"
                          />
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3">Card Sales</td>
                        <td className="p-3 text-right">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={cardReceived}
                            onChange={(e) => setCardReceived(e.target.value)}
                            disabled={isFormDisabled}
                            className="text-right font-mono max-w-[200px] ml-auto"
                          />
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3">Fleet Card Sales</td>
                        <td className="p-3 text-right">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={fleetCardReceived}
                            onChange={(e) =>
                              setFleetCardReceived(e.target.value)
                            }
                            disabled={isFormDisabled}
                            className="text-right font-mono max-w-[200px] ml-auto"
                          />
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3">Credit Sales (Credit Customers)</td>
                        <td className="p-3 text-right font-mono">
                          {calculateCredit().toFixed(2)}
                        </td>
                      </tr>
                      <tr className="border-t bg-muted/30">
                        <td className="p-3 font-semibold">
                          Total Non-Cash Sales
                        </td>
                        <td className="p-3 text-right font-mono font-semibold">
                          {(
                            parseFloat(upiReceived || "0") +
                            parseFloat(cardReceived || "0") +
                            parseFloat(fleetCardReceived || "0") +
                            calculateCredit()
                          ).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Receipts */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Receipts (Bill Payments Received)
                </h3>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Customer</th>
                        <th className="text-center p-3 font-medium">
                          Payment Mode
                        </th>
                        <th className="text-right p-3 font-medium">
                          Amount (₹)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id} className="border-t">
                          <td className="p-3">
                            {payment.customerName || "N/A"}
                          </td>
                          <td className="p-3 text-center">
                            {payment.paymentMethod || "Cash"}
                          </td>
                          <td className="p-3 text-right font-mono">
                            {payment.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {payments.length === 0 && (
                        <tr className="border-t">
                          <td
                            className="p-3 text-center text-muted-foreground"
                            colSpan={3}
                          >
                            No bill payments received
                          </td>
                        </tr>
                      )}
                      <tr className="border-t bg-muted/30">
                        <td className="p-3 font-semibold" colSpan={2}>
                          Total Receipts
                        </td>
                        <td className="p-3 text-right font-mono font-semibold">
                          {calculateCustomerReceipt().toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Expenses */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Expenses</h3>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">
                          Expense Head
                        </th>
                        <th className="text-left p-3 font-medium">Remarks</th>
                        <th className="text-right p-3 font-medium">
                          Amount (₹)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((expense) => (
                        <tr key={expense.id} className="border-t">
                          <td className="p-3">
                            {expense.expenseHeadName || "N/A"}
                          </td>
                          <td className="p-3 text-muted-foreground text-sm">
                            {expense.remarks || "-"}
                          </td>
                          <td className="p-3 text-right font-mono">
                            {expense.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {expenses.length === 0 && (
                        <tr className="border-t">
                          <td
                            className="p-3 text-center text-muted-foreground"
                            colSpan={3}
                          >
                            No expenses recorded
                          </td>
                        </tr>
                      )}
                      <tr className="border-t bg-muted/30">
                        <td className="p-3 font-semibold" colSpan={2}>
                          Total Expenses
                        </td>
                        <td className="p-3 text-right font-mono font-semibold">
                          {calculateExpenses().toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cash Denominations */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Cash Denominations
                </h3>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">
                          Denomination
                        </th>
                        <th className="text-center p-3 font-medium">Count</th>
                        <th className="text-right p-3 font-medium">
                          Amount (₹)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {DENOMINATIONS.map((denom) => (
                        <tr key={denom.key} className="border-t">
                          <td className="p-3 font-medium">{denom.label}</td>
                          <td className="p-3">
                            <Input
                              id={denom.key}
                              type="number"
                              min="0"
                              value={
                                denominations[
                                  denom.key as keyof DenominationCounts
                                ] === 0
                                  ? ""
                                  : denominations[
                                      denom.key as keyof DenominationCounts
                                    ]
                              }
                              onChange={(e) =>
                                handleDenominationChange(
                                  denom.key as keyof DenominationCounts,
                                  e.target.value
                                )
                              }
                              disabled={isFormDisabled}
                              className="text-center font-mono"
                              placeholder="0"
                            />
                          </td>
                          <td className="p-3 text-right font-mono">
                            {(
                              denominations[
                                denom.key as keyof DenominationCounts
                              ] * denom.value
                            ).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t bg-muted/30 font-semibold">
                        <td className="p-3" colSpan={2}>
                          Total Cash
                        </td>
                        <td className="p-3 text-right font-mono">
                          ₹{calculateCashFromDenominations().toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Reconciliation Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Reconciliation Summary
                </h3>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">
                          Description
                        </th>
                        <th className="text-right p-3 font-medium">
                          Amount (₹)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-3">Total Sales Expected</td>
                        <td className="p-3 text-right font-mono">
                          {calculateSystemReceivedAmount().toFixed(2)}
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3">Less: Non-Cash Sales</td>
                        <td className="p-3 text-right font-mono text-red-600">
                          -
                          {(
                            parseFloat(upiReceived || "0") +
                            parseFloat(cardReceived || "0") +
                            parseFloat(fleetCardReceived || "0") +
                            calculateCredit()
                          ).toFixed(2)}
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3">Less: Expenses</td>
                        <td className="p-3 text-right font-mono text-red-600">
                          -{calculateExpenses().toFixed(2)}
                        </td>
                      </tr>
                      <tr className="border-t bg-blue-50 dark:bg-blue-950">
                        <td className="p-3 font-semibold">Net Cash Expected</td>
                        <td className="p-3 text-right font-mono font-semibold">
                          {expectedCash.toFixed(2)}
                        </td>
                      </tr>
                      <tr className="border-t bg-green-50 dark:bg-green-950">
                        <td className="p-3 font-semibold">
                          Actual Cash (from count)
                        </td>
                        <td className="p-3 text-right font-mono font-semibold">
                          {actualCash.toFixed(2)}
                        </td>
                      </tr>
                      <tr className="border-t bg-muted">
                        <td className="p-3 font-bold text-lg">
                          Balance / Difference
                        </td>
                        <td className="p-3 text-right">
                          <span
                            className={`font-mono font-bold text-lg ${
                              balance === 0
                                ? "text-green-600"
                                : balance > 0
                                ? "text-blue-600"
                                : "text-red-600"
                            }`}
                          >
                            {balance >= 0 ? "+" : ""}
                            {balance.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {balance !== 0 && (
                  <Alert
                    className="mt-4"
                    variant={balance > 0 ? "default" : "destructive"}
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {balance > 0
                        ? `Excess cash of ₹${balance.toFixed(2)} in hand`
                        : `Cash shortage of ₹${Math.abs(balance).toFixed(
                            2
                          )} detected`}
                    </AlertDescription>
                  </Alert>
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
                      setFleetCardReceived(
                        accounting.fleetCardReceived.toString()
                      );
                      setDenominations({
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
