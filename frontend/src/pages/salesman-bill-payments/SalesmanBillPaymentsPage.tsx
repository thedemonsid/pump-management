import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSalesmanBillPaymentStore } from "@/store/salesman-bill-payment-store";
import { useBankAccountStore } from "@/store/bank-account-store";
import { useCustomerStore } from "@/store/customer-store";
import { useSalesmanNozzleShiftStore } from "@/store/salesman-nozzle-shift-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Receipt } from "lucide-react";
import { DateRangeFilter } from "@/components/bills/DateRangeFilter";
import { SalesmanBillPaymentsTable } from "@/components/salesman-bill-payments/SalesmanBillPaymentsTable";
import { CreateSalesmanBillPaymentDialog } from "@/components/salesman-bill-payments/CreateSalesmanBillPaymentDialog";
import {
  getDefaultStartDate,
  getTodayFormatted,
  formatDate,
} from "@/utils/bill-utils";
import type { SalesmanBillPaymentResponse } from "@/types";

export function SalesmanBillPaymentsPage() {
  const { user } = useAuth();

  // Date range state
  const [dateRange, setDateRange] = useState({
    startDate: getDefaultStartDate(),
    endDate: getTodayFormatted(),
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Store hooks
  const { payments, loading, error, fetchPayments, removePayment } =
    useSalesmanBillPaymentStore();

  const { bankAccounts, fetchBankAccounts } = useBankAccountStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const { activeShifts, fetchActiveShifts } = useSalesmanNozzleShiftStore();

  // Load data on mount
  useEffect(() => {
    fetchPayments();
    fetchBankAccounts();
    fetchCustomers();
    fetchActiveShifts();
  }, [fetchPayments, fetchBankAccounts, fetchCustomers, fetchActiveShifts]);

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;

    try {
      await removePayment(paymentId);
    } catch (error) {
      console.error("Failed to delete payment:", error);
    }
  };

  const handleViewPayment = (payment: SalesmanBillPaymentResponse) => {
    // TODO: Implement detail view if needed
    console.log("View payment:", payment);
  };

  // Filter payments by date range
  const filteredPayments = payments.filter((payment) => {
    const paymentDate = new Date(payment.paymentDate);
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    endDate.setHours(23, 59, 59, 999); // Include end of day
    return paymentDate >= startDate && paymentDate <= endDate;
  });

  if (user?.role !== "ADMIN" && user?.role !== "MANAGER") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Access Denied
          </h2>
          <p className="text-muted-foreground mt-2">
            This page is only accessible to administrators and managers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Salesman Bill Payments
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage payments received by salesmen during shifts
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Payment
        </Button>
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onStartDateChange={(date) =>
          setDateRange((prev) => ({ ...prev, startDate: date }))
        }
        onEndDateChange={(date) =>
          setDateRange((prev) => ({ ...prev, endDate: date }))
        }
        onApplyFilter={() => fetchPayments()}
        loading={loading}
      />

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
          <CardDescription>
            Showing payments from {formatDate(new Date(dateRange.startDate))} to{" "}
            {formatDate(new Date(dateRange.endDate))}
            {" • "}
            {filteredPayments.length} payment
            {filteredPayments.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-4">
              <p className="font-medium">Error loading payments</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading payments...</span>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payments found.</p>
              <p className="text-sm mt-1">
                Create your first payment record to get started.
              </p>
            </div>
          ) : (
            <SalesmanBillPaymentsTable
              payments={filteredPayments}
              onView={handleViewPayment}
              onDelete={handleDeletePayment}
            />
          )}
        </CardContent>
      </Card>

      {/* Create Payment Dialog */}
      <CreateSalesmanBillPaymentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        bankAccounts={bankAccounts}
        customers={customers}
        activeShifts={activeShifts}
        pumpMasterId={user?.pumpMasterId || ""}
      />
    </div>
  );
}
