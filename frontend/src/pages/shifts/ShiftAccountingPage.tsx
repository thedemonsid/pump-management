import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useShiftStore } from "@/store/shifts/shift-store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SalesmanShiftAccountingService } from "@/services/salesman-shift-accounting-service";
import { NozzleAssignmentService } from "@/services/nozzle-assignment-service";
import { SalesmanBillService } from "@/services/salesman-bill-service";
import { SalesmanBillPaymentService } from "@/services/salesman-bill-payment-service";
import { ExpenseService } from "@/services/expense-service";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
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
import type { DenominationCounts } from "./components/CashDenominationsSheet";
import { DENOMINATIONS } from "./components/CashDenominationsSheet";
import { ShiftInfoCard } from "./components/ShiftInfoCard";
import { CashDenominationsSheet } from "./components/CashDenominationsSheet";
import { AccountingHeader } from "./components/AccountingHeader";
import { AccountingSummaryView } from "./components/AccountingSummaryView";
import { AccountingFormView } from "./components/AccountingFormView";
import { CashDistributionSection } from "./components/CashDistributionSection";

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
    // Only nozzle sales (FUEL products from nozzle readings)
    return nozzles.reduce((sum, nozzle) => sum + (nozzle.totalAmount || 0), 0);
  };

  const calculateCustomerReceipt = (): number => {
    if (accounting) return accounting.customerReceipt;
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const calculateCredit = (): number => {
    if (accounting) return accounting.credit;
    // Only credit bills (paymentType = CREDIT) are credit sales
    return bills
      .filter((bill) => bill.paymentType === "CREDIT")
      .reduce((sum, bill) => sum + bill.amount, 0);
  };

  const calculateExpenses = (): number => {
    if (accounting) return accounting.expenses;
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const calculateSystemReceivedAmount = (): number => {
    // System received = Fuel Sales (nozzles) + Customer Receipts (payments)
    // Bills are credit sales, NOT included in system received amount
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

  const handleDelete = async () => {
    if (!shiftId) return;

    setIsSaving(true);
    try {
      await SalesmanShiftAccountingService.delete(shiftId);
      setAccounting(null);
      setUpiReceived("0");
      setCardReceived("0");
      setFleetCardReceived("0");
      setDenominations({
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
      toast.success("Accounting deleted successfully!");
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to delete accounting";
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
      <AccountingHeader
        shiftId={shiftId!}
        hasAccounting={!!accounting}
        canEdit={canEdit}
        isEditing={isEditing}
        isAdminOrManager={isAdminOrManager}
        onEdit={() => setIsEditing(true)}
        onDelete={handleDelete}
      />

      {/* Shift Info */}
      <ShiftInfoCard shift={currentShift} />

      {/* Accounting Summary (if exists) */}
      {accounting && !isEditing && (
        <AccountingSummaryView
          accounting={accounting}
          nozzles={nozzles}
          bills={bills}
          onViewDenominations={() => setShowDenominationsSheet(true)}
        />
      )}

      {/* Cash Distribution Section - shown after accounting is done */}
      {accounting && !isEditing && (
        <CashDistributionSection
          shiftId={shiftId!}
          cashInHand={accounting.cashInHand}
          upiReceived={accounting.upiReceived}
          cardReceived={accounting.cardReceived}
          isAdminOrManager={isAdminOrManager}
        />
      )}

      {/* Accounting Form */}
      {(!accounting || isEditing) && (
        <AccountingFormView
          shift={currentShift}
          nozzles={nozzles}
          bills={bills}
          hasAccounting={!!accounting}
          isEditing={isEditing}
          isSaving={isSaving}
          error={error}
          upiReceived={upiReceived}
          cardReceived={cardReceived}
          fleetCardReceived={fleetCardReceived}
          credit={calculateCredit()}
          expenses={calculateExpenses()}
          fuelSales={calculateFuelSales()}
          customerReceipt={calculateCustomerReceipt()}
          systemReceivedAmount={calculateSystemReceivedAmount()}
          actualCash={actualCash}
          expectedCash={expectedCash}
          balance={balance}
          onUpiChange={setUpiReceived}
          onCardChange={setCardReceived}
          onFleetCardChange={setFleetCardReceived}
          onOpenDenominations={() => setShowDenominationsSheet(true)}
          onSubmit={handleSave}
          onCancel={() => {
            setIsEditing(false);
            if (accounting) {
              setUpiReceived(accounting.upiReceived.toString());
              setCardReceived(accounting.cardReceived.toString());
              setFleetCardReceived(accounting.fleetCardReceived.toString());
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
        />
      )}

      {/* Cash Denominations Sheet */}
      <CashDenominationsSheet
        open={showDenominationsSheet}
        onOpenChange={setShowDenominationsSheet}
        denominations={denominations}
        onDenominationChange={handleDenominationChange}
        isEditable={!isFormDisabled}
        isMobile={isMobile}
      />
    </div>
  );
}
