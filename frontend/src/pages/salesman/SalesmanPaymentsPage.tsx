import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSalesmanNozzleShiftStore } from "@/store/salesman-nozzle-shift-store";
import { useSalesmanBillPaymentStore } from "@/store/salesman-bill-payment-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, CreditCard, Eye, Plus, Receipt } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import { CreateShiftPaymentForm } from "@/pages/salesman-shifts/CreateShiftPaymentForm";
import type { SalesmanNozzleShiftResponse } from "@/types";

export function SalesmanPaymentsPage() {
  const { user } = useAuth();
  const { activeShifts, fetchActiveShifts } = useSalesmanNozzleShiftStore();
  const {
    shiftPayments,
    loading: loadingPayments,
    fetchPaymentsByShiftId,
  } = useSalesmanBillPaymentStore();

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isViewPaymentsDialogOpen, setIsViewPaymentsDialogOpen] =
    useState(false);
  const [selectedShiftForPayment, setSelectedShiftForPayment] =
    useState<SalesmanNozzleShiftResponse | null>(null);
  const [selectedShiftForView, setSelectedShiftForView] =
    useState<SalesmanNozzleShiftResponse | null>(null);

  useEffect(() => {
    if (user?.userId) {
      fetchActiveShifts(user.userId);
    }
  }, [user?.userId, fetchActiveShifts]);

  const handleRecordPayment = (shift: SalesmanNozzleShiftResponse) => {
    setSelectedShiftForPayment(shift);
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentDialogOpen(false);
    setSelectedShiftForPayment(null);
    if (user?.userId) {
      fetchActiveShifts(user.userId);
    }
  };

  const handleViewPayments = async (shift: SalesmanNozzleShiftResponse) => {
    setSelectedShiftForView(shift);
    setIsViewPaymentsDialogOpen(true);

    try {
      await fetchPaymentsByShiftId(shift.id!);
    } catch (error) {
      console.error("Failed to load payments for shift:", error);
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    return format(new Date(dateTimeStr), "dd/MM/yyyy HH:mm");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatFuelQuantity = (quantity: number) => {
    return (
      new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }).format(quantity) + " L"
    );
  };

  if (user?.role !== "SALESMAN") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Access Denied
          </h2>
          <p className="text-muted-foreground mt-2">
            This page is only accessible to salesmen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Payments</h1>
        <p className="text-muted-foreground">
          Record and view payments for your active shifts
        </p>
      </div>

      {activeShifts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Active Shifts</p>
              <p className="text-sm">
                You need to have an active shift to record payments
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeShifts.map((shift) => (
            <Card key={shift.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {shift.nozzleName || "Unknown Nozzle"}
                </CardTitle>
                <CardDescription>
                  Started: {formatDateTime(shift.startDateTime)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Product:</span>
                  <Badge variant="secondary">{shift.productName}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Opening Balance:
                  </span>
                  <span className="font-medium">
                    {formatFuelQuantity(shift.openingBalance)}
                  </span>
                </div>
                {shift.customerReceipt !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Payments Received:
                    </span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(shift.customerReceipt)}
                    </span>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => handleRecordPayment(shift)}
                    className="w-full"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                  <Button
                    onClick={() => handleViewPayments(shift)}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Payments
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Record Payment Sheet */}
      <Sheet open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Record Payment</SheetTitle>
            <SheetDescription>
              {selectedShiftForPayment?.nozzleName}
            </SheetDescription>
          </SheetHeader>
          {selectedShiftForPayment && (
            <CreateShiftPaymentForm
              salesmanNozzleShiftId={selectedShiftForPayment.id}
              pumpMasterId={user?.pumpMasterId || ""}
              onSuccess={handlePaymentSuccess}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* View Payments Dialog */}
      <Dialog
        open={isViewPaymentsDialogOpen}
        onOpenChange={setIsViewPaymentsDialogOpen}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Payments for Shift - {selectedShiftForView?.nozzleName}
            </DialogTitle>
            <DialogDescription>
              All payments recorded during this shift
            </DialogDescription>
          </DialogHeader>

          {loadingPayments ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : shiftPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payments recorded for this shift</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shiftPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {format(new Date(payment.paymentDate), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>{payment.customerName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.paymentMethod}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {payment.referenceNumber}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-semibold">Total Payments:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(
                    shiftPayments.reduce((sum, p) => sum + p.amount, 0)
                  )}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
