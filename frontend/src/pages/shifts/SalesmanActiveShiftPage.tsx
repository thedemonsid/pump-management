import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2, Plus, Clock, DollarSign, Receipt } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { StartShiftForm } from "./components/StartShiftForm";
import { NozzleAssignmentsTable } from "./components/NozzleAssignmentsTable";
import { ShiftActionsCard } from "./components/ShiftActionsCard";
import { useNavigate } from "react-router-dom";
import { ExpenseService } from "@/services/expense-service";
import { SalesmanBillService } from "@/services/salesman-bill-service";
import { SalesmanBillPaymentService } from "@/services/salesman-bill-payment-service";
import { SalesmanShiftService } from "@/services/salesman-shift-service";
import type { ShiftResponse } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowRight } from "lucide-react";

/**
 * SalesmanActiveShiftPage - Main workspace for salesmen
 * Shows current active shift or allows starting a new one
 */
export function SalesmanActiveShiftPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { activeShift, isLoading, fetchActiveShift } = useShiftStore();
  const [isStartShiftOpen, setIsStartShiftOpen] = useState(false);

  // Statistics state
  const [stats, setStats] = useState({
    expensesCount: 0,
    expensesTotal: 0,
    billsCount: 0,
    billsTotal: 0,
    paymentsCount: 0,
    paymentsTotal: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // Track the last closed shift needing accounting
  const [shiftNeedingAccounting, setShiftNeedingAccounting] =
    useState<ShiftResponse | null>(null);
  const [loadingPendingShift, setLoadingPendingShift] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      fetchActiveShift(user.userId);
    }
  }, [user?.userId, fetchActiveShift]);

  // Fetch shifts needing accounting when there's no active shift
  useEffect(() => {
    const fetchPendingAccounting = async () => {
      if (!user?.userId) return;

      setLoadingPendingShift(true);
      try {
        const shiftsNeedingAccounting =
          await SalesmanShiftService.getShiftsNeedingAccounting(user.userId);

        if (shiftsNeedingAccounting.length > 0) {
          // Get the most recent one (they're already sorted by endDatetime DESC)
          setShiftNeedingAccounting(shiftsNeedingAccounting[0]);
        } else {
          setShiftNeedingAccounting(null);
        }
      } catch (error) {
        console.error("Failed to fetch shifts needing accounting:", error);
        setShiftNeedingAccounting(null);
      } finally {
        setLoadingPendingShift(false);
      }
    };

    // Only fetch when there's no active shift
    if (!isLoading && !activeShift && user?.userId) {
      fetchPendingAccounting();
    } else {
      // Clear if there's an active shift
      setShiftNeedingAccounting(null);
    }
  }, [user?.userId, activeShift, isLoading]);

  // Fetch shift statistics when activeShift changes
  useEffect(() => {
    const fetchStats = async () => {
      if (!activeShift?.id) return;

      setStatsLoading(true);
      try {
        const [expenses, bills, payments] = await Promise.all([
          ExpenseService.getBySalesmanShiftId(activeShift.id),
          SalesmanBillService.getByShift(activeShift.id),
          SalesmanBillPaymentService.getByShiftId(activeShift.id),
        ]);

        setStats({
          expensesCount: expenses.length,
          expensesTotal: expenses.reduce((sum, e) => sum + e.amount, 0),
          billsCount: bills.length,
          billsTotal: bills.reduce((sum, b) => sum + b.amount, 0),
          paymentsCount: payments.length,
          paymentsTotal: payments.reduce((sum, p) => sum + p.amount, 0),
        });
      } catch (error) {
        console.error("Failed to fetch shift statistics:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [activeShift?.id]);

  const handleShiftStarted = () => {
    setIsStartShiftOpen(false);
    if (user?.userId) {
      fetchActiveShift(user.userId);
    }
    toast.success("Shift started successfully!");
  };

  const handleRefresh = async () => {
    if (user?.userId) {
      await fetchActiveShift(user.userId);
      // Stats will be refreshed by the useEffect watching activeShift
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // No active shift - show start shift option
  if (!activeShift) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4 space-y-6">
        {/* Accounting Reminder - Show if there's a closed shift needing accounting */}
        {shiftNeedingAccounting && !loadingPendingShift && (
          <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <AlertTitle className="text-orange-800 dark:text-orange-400 font-semibold">
              Accounting Pending
            </AlertTitle>
            <AlertDescription className="text-orange-700 dark:text-orange-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <span>
                  Your previous shift (ended on{" "}
                  {format(new Date(shiftNeedingAccounting.endDatetime!), "PPp")}
                  ) needs accounting. Please complete it to finalize your
                  records.
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate(`/shifts/${shiftNeedingAccounting.id}/accounting`)
                  }
                  className="shrink-0 border-orange-600 text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-950/40"
                >
                  Complete Accounting
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-dashed">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">No Active Shift</CardTitle>
              <CardDescription className="mt-2">
                You don't have an active shift. Start a new shift to begin
                working.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button size="lg" onClick={() => setIsStartShiftOpen(true)}>
              <Plus className="mr-2 h-5 w-5" />
              Start New Shift
            </Button>
          </CardContent>
        </Card>

        {/* Start Shift Sheet */}
        <Sheet open={isStartShiftOpen} onOpenChange={setIsStartShiftOpen}>
          <SheetContent
            side="right"
            className="w-full sm:max-w-2xl overflow-y-auto"
          >
            <SheetHeader>
              <SheetTitle>Start New Shift</SheetTitle>
              <SheetDescription>
                Select nozzles and enter opening cash to start your shift. Date
                and time will be recorded automatically.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <StartShiftForm
                salesmanId={user?.userId || ""}
                onSuccess={handleShiftStarted}
                onCancel={() => setIsStartShiftOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Active shift exists - show shift workspace
  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Shift Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">Active Shift</CardTitle>
                <Badge variant="default" className="bg-green-600">
                  OPEN
                </Badge>
              </div>
              <CardDescription>
                Started at {format(new Date(activeShift.startDatetime), "PPp")}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Opening Cash</p>
                <p className="text-lg font-semibold">
                  ₹{activeShift.openingCash.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-lg font-semibold">
                  {Math.floor(
                    (Date.now() -
                      new Date(activeShift.startDatetime).getTime()) /
                      (1000 * 60 * 60)
                  )}{" "}
                  hours
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-orange-500/10">
                <span className="text-lg font-bold text-orange-600">N</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nozzles</p>
                <p className="text-lg font-semibold">
                  {activeShift.nozzleCount || 0} assigned
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nozzle Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Nozzle Assignments</CardTitle>
          <CardDescription>
            Manage your assigned nozzles. Close them when you're done.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NozzleAssignmentsTable
            shiftId={activeShift.id}
            onNozzleClosed={handleRefresh}
          />
        </CardContent>
      </Card>

      {/* Shift Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Shift Statistics</CardTitle>
          <CardDescription>
            Overview of bills, payments, and expenses during this shift
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Bills */}
              <div
                className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors"
                onClick={() => navigate(`/shifts/${activeShift.id}/bills`)}
              >
                <div className="p-2 rounded-full bg-blue-500/10">
                  <Receipt className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Credit Bills</p>
                  <p className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                    ₹{stats.billsTotal.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.billsCount}{" "}
                    {stats.billsCount === 1 ? "bill" : "bills"}
                  </p>
                </div>
              </div>

              {/* Payments */}
              <div
                className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 cursor-pointer hover:bg-green-100 dark:hover:bg-green-950/30 transition-colors"
                onClick={() => navigate(`/shifts/${activeShift.id}/payments`)}
              >
                <div className="p-2 rounded-full bg-green-500/10">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Payments</p>
                  <p className="text-lg font-semibold text-green-700 dark:text-green-400">
                    ₹{stats.paymentsTotal.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.paymentsCount}{" "}
                    {stats.paymentsCount === 1 ? "payment" : "payments"}
                  </p>
                </div>
              </div>

              {/* Expenses */}
              <div
                className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 cursor-pointer hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors"
                onClick={() => navigate(`/shifts/${activeShift.id}/expenses`)}
              >
                <div className="p-2 rounded-full bg-red-500/10">
                  <Receipt className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Expenses</p>
                  <p className="text-lg font-semibold text-red-700 dark:text-red-400">
                    ₹{stats.expensesTotal.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.expensesCount}{" "}
                    {stats.expensesCount === 1 ? "expense" : "expenses"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <ShiftActionsCard
        shiftId={activeShift.id}
        onActionComplete={handleRefresh}
        onViewDetails={() => navigate(`/shifts/${activeShift.id}`)}
      />
    </div>
  );
}
