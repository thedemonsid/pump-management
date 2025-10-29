import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShiftAccountingReportViewer } from "@/components/reports/ShiftAccountingReport";
import { SalesmanShiftAccountingService } from "@/services/salesman-shift-accounting-service";
import { NozzleAssignmentService } from "@/services/nozzle-assignment-service";
import { SalesmanBillPaymentService } from "@/services/salesman-bill-payment-service";
import { ExpenseService } from "@/services/expense-service";
import { useShiftStore } from "@/store/shifts/shift-store";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type {
  SalesmanShiftAccountingResponse,
  NozzleAssignmentResponse,
  SalesmanBillPaymentResponse,
  ExpenseResponse,
} from "@/types";

export function ShiftAccountingReportPage() {
  const { shiftId } = useParams<{ shiftId: string }>();
  const { currentShift, fetchShiftById } = useShiftStore();

  const [accounting, setAccounting] =
    useState<SalesmanShiftAccountingResponse | null>(null);
  const [nozzles, setNozzles] = useState<NozzleAssignmentResponse[]>([]);
  const [payments, setPayments] = useState<SalesmanBillPaymentResponse[]>([]);
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!shiftId) {
        setError("Shift ID is required");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Load shift and all related data
        const [accountingData, nozzlesData, paymentsData, expensesData] =
          await Promise.all([
            SalesmanShiftAccountingService.getByShiftId(shiftId),
            NozzleAssignmentService.getAssignmentsForShift(shiftId),
            SalesmanBillPaymentService.getByShiftId(shiftId),
            ExpenseService.getBySalesmanShiftId(shiftId),
          ]);

        setAccounting(accountingData);
        setNozzles(nozzlesData);
        setPayments(paymentsData);
        setExpenses(expensesData);

        // Fetch shift details
        await fetchShiftById(shiftId);
      } catch (err) {
        console.error("Failed to load shift accounting data:", err);
        setError("Failed to load shift accounting data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [shiftId, fetchShiftById]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-muted-foreground">
            Loading shift accounting data...
          </span>
        </div>
      </div>
    );
  }

  if (error || !accounting || !currentShift) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Shift accounting data not found"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <ShiftAccountingReportViewer
      shift={currentShift}
      accounting={accounting}
      nozzles={nozzles}
      payments={payments}
      expenses={expenses}
    />
  );
}
