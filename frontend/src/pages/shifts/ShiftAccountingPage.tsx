import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useShiftStore } from "@/store/shifts/shift-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SalesmanShiftAccountingService } from "@/services/salesman-shift-accounting-service";
import { NozzleAssignmentService } from "@/services/nozzle-assignment-service";
import { SalesmanBillService } from "@/services/salesman-bill-service";
import { SalesmanBillPaymentService } from "@/services/salesman-bill-payment-service";
import { ExpenseService } from "@/services/expense-service";
import { toast } from "sonner";
import {
  Loader2,
  AlertCircle,
  Calculator,
  Save,
  Edit,
  ChevronRight,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const { user } = useAuth();
  const { currentShift, fetchShiftById } = useShiftStore();
  const isMobile = useIsMobile();

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
  const [showDenominationsSheet, setShowDenominationsSheet] = useState(false);

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

  // Handle Enter key press to move to next input or close sheet
  const handleDenominationKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    currentIndex: number
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();

      // If this is the last input, close the sheet
      if (currentIndex === DENOMINATIONS.length - 1) {
        setShowDenominationsSheet(false);
      } else {
        // Focus next input
        const nextKey = DENOMINATIONS[currentIndex + 1].key;
        const nextInput = document.getElementById(nextKey) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
          // Select all text for easy replacement
          nextInput.select();
        }
      }
    }
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
    <div className="container mx-auto py-3 px-2 sm:py-6 sm:px-4 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between px-2 sm:px-0">
        <div className="flex gap-2">
          {accounting && canEdit && !isEditing && (
            <>
              <Button
                onClick={() => setIsEditing(true)}
                size="sm"
                className="hidden sm:flex"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Accounting
              </Button>
              <Button
                onClick={() => setIsEditing(true)}
                size="icon"
                className="sm:hidden"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        {accounting && isAdminOrManager && !isEditing && (
          <>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="hidden sm:flex"
            >
              <Link to={`/shifts/${shiftId}/accounting/report`}>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Link>
            </Button>
            <Button asChild size="icon" variant="outline" className="sm:hidden">
              <Link to={`/shifts/${shiftId}/accounting/report`}>
                <Download className="h-4 w-4" />
              </Link>
            </Button>
          </>
        )}
      </div>

      {/* Shift Info */}
      <div className="rounded-lg border bg-card">
        <div className="p-3 sm:p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Shift Information</h2>
            <Badge
              variant={currentShift.status === "OPEN" ? "default" : "secondary"}
            >
              {currentShift.status}
            </Badge>
          </div>
        </div>
        <div className="p-3 sm:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-sm">
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
          </div>
        </div>
      </div>

      {/* Accounting Summary (if exists) */}
      {accounting && !isEditing && (
        <div className="rounded-lg border bg-card">
          <div className="p-1 sm:p-6 border-b">
            <h2 className="text-lg sm:text-2xl font-semibold">
              🧾 Daily Fuel Sales & Reconciliation Sheet
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Created on {format(new Date(accounting.createdAt), "PPp")}
            </p>
          </div>
          <div className="p-1 sm:p-6 space-y-4 sm:space-y-6">
            {/* Fuel Sales Summary */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                Fuel Sales Summary
              </h3>
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full relative">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="sticky left-0 z-10 bg-muted/50 text-left p-2 sm:p-3 font-medium min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm">
                          Nozzle
                        </th>
                        <th className="text-center p-2 sm:p-3 font-medium min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm">
                          Product
                        </th>
                        <th className="text-right p-2 sm:p-3 font-medium min-w-[70px] sm:min-w-[100px] text-xs sm:text-sm">
                          Litres
                        </th>
                        <th className="text-right p-2 sm:p-3 font-medium min-w-[70px] sm:min-w-[100px] text-xs sm:text-sm">
                          Rate (₹)
                        </th>
                        <th className="sticky right-0 z-10 bg-muted/50 text-right p-2 sm:p-3 font-medium min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm">
                          Amount (₹)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {nozzles.map((nozzle) => (
                        <tr key={nozzle.id} className="border-t">
                          <td className="sticky left-0 z-10 bg-background p-2 sm:p-3 text-xs sm:text-sm">
                            {nozzle.nozzleName}
                          </td>
                          <td className="p-2 sm:p-3 text-center text-xs sm:text-sm">
                            {nozzle.productName || "-"}
                          </td>
                          <td className="p-2 sm:p-3 text-right font-mono text-xs sm:text-sm">
                            {(nozzle.dispensedAmount || 0).toFixed(2)}
                          </td>
                          <td className="p-2 sm:p-3 text-right font-mono text-xs sm:text-sm">
                            {(nozzle.productRate || 0).toFixed(2)}
                          </td>
                          <td className="sticky right-0 z-10 bg-background p-2 sm:p-3 text-right font-mono text-xs sm:text-sm">
                            ₹{(nozzle.totalAmount || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t bg-muted/30">
                        <td
                          className="sticky left-0 z-10 bg-muted/30 p-2 sm:p-3 font-semibold text-xs sm:text-sm"
                          colSpan={4}
                        >
                          Total Fuel Sales
                        </td>
                        <td className="sticky right-0 z-10 bg-muted/30 p-2 sm:p-3 text-right font-mono font-semibold text-xs sm:text-sm">
                          ₹{accounting.fuelSales.toFixed(2)}
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td
                          className="sticky left-0 z-10 bg-background p-2 sm:p-3 text-xs sm:text-sm"
                          colSpan={4}
                        >
                          Customer Receipts
                        </td>
                        <td className="sticky right-0 z-10 bg-background p-2 sm:p-3 text-right font-mono text-xs sm:text-sm text-green-600 dark:text-green-400">
                          ₹{accounting.customerReceipt.toFixed(2)}
                        </td>
                      </tr>
                      <tr className="border-t bg-blue-50 dark:bg-blue-950">
                        <td
                          className="sticky left-0 z-10 bg-blue-50 dark:bg-blue-950 p-2 sm:p-3 font-semibold text-xs sm:text-sm"
                          colSpan={4}
                        >
                          Total (Fuel Sales + Receipts)
                        </td>
                        <td className="sticky right-0 z-10 bg-blue-50 dark:bg-blue-950 p-2 sm:p-3 text-right font-mono font-semibold text-xs sm:text-sm">
                          ₹
                          {(
                            accounting.fuelSales + accounting.customerReceipt
                          ).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Non-Cash / Digital Sales */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                Non-Cash / Digital Sales
              </h3>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-2 sm:p-3 font-medium text-xs sm:text-sm">
                        Payment Type
                      </th>
                      <th className="text-right p-2 sm:p-3 font-medium text-xs sm:text-sm">
                        Amount (₹)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-2 sm:p-3 text-xs sm:text-sm">
                        UPI Sales
                      </td>
                      <td className="p-2 sm:p-3 text-right font-mono text-xs sm:text-sm">
                        ₹{accounting.upiReceived.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-2 sm:p-3 text-xs sm:text-sm">
                        Card Sales
                      </td>
                      <td className="p-2 sm:p-3 text-right font-mono text-xs sm:text-sm">
                        ₹{accounting.cardReceived.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-2 sm:p-3 text-xs sm:text-sm">
                        Fleet Card Sales
                      </td>
                      <td className="p-2 sm:p-3 text-right font-mono text-xs sm:text-sm">
                        ₹{accounting.fleetCardReceived.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-2 sm:p-3 text-xs sm:text-sm">
                        Credit Sales
                      </td>
                      <td className="p-2 sm:p-3 text-right font-mono text-xs sm:text-sm text-red-600 dark:text-red-400">
                        ₹{accounting.credit.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-2 sm:p-3 text-xs sm:text-sm">
                        Expenses
                      </td>
                      <td className="p-2 sm:p-3 text-right font-mono text-xs sm:text-sm text-red-600 dark:text-red-400">
                        ₹{accounting.expenses.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cash Denominations */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                Cash Denominations
              </h3>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-2 sm:p-3 font-medium text-xs sm:text-sm">
                        Description
                      </th>
                      <th className="text-right p-2 sm:p-3 font-medium text-xs sm:text-sm">
                        Amount (₹)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      className="border-t cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setShowDenominationsSheet(true)}
                    >
                      <td className="p-2 sm:p-3">
                        <div className="flex items-center gap-2 font-medium text-xs sm:text-sm">
                          Total Cash (Click to view breakdown)
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 text-right">
                        <div className="flex items-center justify-end gap-2 font-mono text-xs sm:text-sm">
                          ₹{calculateCashFromDenominations().toFixed(2)}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reconciliation Summary */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
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
                    <tr className="border-t bg-blue-50 dark:bg-blue-950">
                      <td className="p-3 font-semibold">Opening Cash</td>
                      <td className="p-3 text-right font-mono font-semibold">
                        {accounting.openingCash.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-3">Add: Total Sales Expected</td>
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
                    <tr className="border-t bg-amber-50 dark:bg-amber-950">
                      <td className="p-3 font-semibold">
                        Expected Cash in Hand
                      </td>
                      <td className="p-3 text-right font-mono font-semibold">
                        {(
                          accounting.openingCash +
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
          </div>
        </div>
      )}

      {/* Accounting Form */}
      {(!accounting || isEditing) && (
        <form onSubmit={handleSave} className="space-y-4 sm:space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Daily Fuel Sales & Reconciliation Sheet */}
          <div className="rounded-lg border bg-card">
            <div className="p-3 sm:p-6 border-b">
              <h2 className="text-lg sm:text-2xl font-semibold">
                🧾 Daily Fuel Sales & Reconciliation Sheet
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Complete accounting for {currentShift.salesmanUsername}'s shift
                on {format(new Date(currentShift.startDatetime), "PPP")}
              </p>
            </div>
            <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
              {/* Fuel Sales Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Fuel Sales Summary
                </h3>
                <div className="rounded-md border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full relative">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="sticky left-0 z-10 bg-muted/50 text-left p-3 font-medium min-w-[100px]">
                            Nozzle
                          </th>
                          <th className="text-center p-3 font-medium min-w-[100px]">
                            Product
                          </th>
                          <th className="text-right p-3 font-medium min-w-[100px]">
                            Litres
                          </th>
                          <th className="text-right p-3 font-medium min-w-[100px]">
                            Rate (₹)
                          </th>
                          <th className="sticky right-0 z-10 bg-muted/50 text-right p-3 font-medium min-w-[120px]">
                            Amount (₹)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {nozzles.map((nozzle) => (
                          <tr key={nozzle.id} className="border-t">
                            <td className="sticky left-0 z-10 bg-background p-3">
                              {nozzle.nozzleName}
                            </td>
                            <td className="p-3 text-center">
                              {nozzle.productName || "-"}
                            </td>
                            <td className="p-3 text-right font-mono">
                              {(nozzle.dispensedAmount || 0).toFixed(2)}
                            </td>
                            <td className="p-3 text-right font-mono">
                              {(nozzle.productRate || 0).toFixed(2)}
                            </td>
                            <td className="sticky right-0 z-10 bg-background p-3 text-right font-mono">
                              ₹{(nozzle.totalAmount || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t bg-muted/30">
                          <td
                            className="sticky left-0 z-10 bg-muted/30 p-3 font-semibold"
                            colSpan={4}
                          >
                            Total Fuel Sales
                          </td>
                          <td className="sticky right-0 z-10 bg-muted/30 p-3 text-right font-mono font-semibold">
                            ₹{calculateFuelSales().toFixed(2)}
                          </td>
                        </tr>
                        <tr className="border-t">
                          <td
                            className="sticky left-0 z-10 bg-background p-3"
                            colSpan={4}
                          >
                            Customer Receipts
                          </td>
                          <td className="sticky right-0 z-10 bg-background p-3 text-right font-mono text-green-600 dark:text-green-400">
                            ₹{calculateCustomerReceipt().toFixed(2)}
                          </td>
                        </tr>
                        <tr className="border-t bg-blue-50 dark:bg-blue-950">
                          <td
                            className="sticky left-0 z-10 bg-blue-50 dark:bg-blue-950 p-3 font-semibold"
                            colSpan={4}
                          >
                            Total (Fuel Sales + Receipts)
                          </td>
                          <td className="sticky right-0 z-10 bg-blue-50 dark:bg-blue-950 p-3 text-right font-mono font-semibold">
                            ₹
                            {(
                              calculateFuelSales() + calculateCustomerReceipt()
                            ).toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
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
                            value={upiReceived === "0" ? "" : upiReceived}
                            onChange={(e) => {
                              const value = e.target.value;
                              setUpiReceived(value === "" ? "0" : value);
                            }}
                            disabled={isFormDisabled}
                            placeholder="0.00"
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
                            value={cardReceived === "0" ? "" : cardReceived}
                            onChange={(e) => {
                              const value = e.target.value;
                              setCardReceived(value === "" ? "0" : value);
                            }}
                            disabled={isFormDisabled}
                            placeholder="0.00"
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
                            value={
                              fleetCardReceived === "0" ? "" : fleetCardReceived
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              setFleetCardReceived(value === "" ? "0" : value);
                            }}
                            disabled={isFormDisabled}
                            placeholder="0.00"
                            className="text-right font-mono max-w-[200px] ml-auto"
                          />
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3">Credit Sales</td>
                        <td className="p-3 text-right font-mono text-red-600 dark:text-red-400">
                          ₹{calculateCredit().toFixed(2)}
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3">Expenses</td>
                        <td className="p-3 text-right font-mono text-red-600 dark:text-red-400">
                          ₹{calculateExpenses().toFixed(2)}
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
                          Description
                        </th>
                        <th className="text-right p-3 font-medium">
                          Amount (₹)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        className="border-t cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() =>
                          !isFormDisabled && setShowDenominationsSheet(true)
                        }
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2 font-medium">
                            Total Cash (Click to{" "}
                            {isFormDisabled ? "view" : "enter"} breakdown)
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2 font-mono">
                            ₹{calculateCashFromDenominations().toFixed(2)}
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
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
                      <tr className="border-t bg-blue-50 dark:bg-blue-950">
                        <td className="p-3 font-semibold">Opening Cash</td>
                        <td className="p-3 text-right font-mono font-semibold">
                          {(currentShift?.openingCash || 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3">Add: Total Sales Expected</td>
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
                      <tr className="border-t bg-amber-50 dark:bg-amber-950">
                        <td className="p-3 font-semibold">
                          Expected Cash in Hand
                        </td>
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
            </div>
          </div>

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
                        Save Accounting
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      )}

      {/* Cash Denominations Sheet */}
      <Sheet
        open={showDenominationsSheet}
        onOpenChange={setShowDenominationsSheet}
      >
        <SheetContent
          side="right"
          className={isMobile ? "w-full" : "sm:max-w-lg"}
        >
          <SheetHeader>
            <SheetTitle>Cash Denominations</SheetTitle>
            <SheetDescription>
              {isFormDisabled ? "View" : "Enter"} the breakdown of cash by
              denomination
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Denomination</th>
                    <th className="text-center p-3 font-medium">Count</th>
                    <th className="text-right p-3 font-medium">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {DENOMINATIONS.map((denom, index) => (
                    <tr key={denom.key} className="border-t">
                      <td className="p-3 font-medium">{denom.label}</td>
                      <td className="p-3">
                        <Input
                          id={denom.key}
                          type="number"
                          min="0"
                          inputMode="numeric"
                          pattern="[0-9]*"
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
                          onKeyDown={(e) => handleDenominationKeyDown(e, index)}
                          disabled={isFormDisabled}
                          className="text-center font-mono"
                          placeholder="0"
                        />
                      </td>
                      <td className="p-3 text-right font-mono">
                        ₹
                        {(
                          denominations[denom.key as keyof DenominationCounts] *
                          denom.value
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t bg-muted/30 font-semibold">
                    <td className="p-3" colSpan={2}>
                      Total Cash
                    </td>
                    <td className="p-3 text-right font-mono text-lg">
                      ₹{calculateCashFromDenominations().toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {!isFormDisabled && (
              <Button
                onClick={() => setShowDenominationsSheet(false)}
                className="w-full"
              >
                Done
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
