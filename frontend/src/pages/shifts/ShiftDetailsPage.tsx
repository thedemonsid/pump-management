import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useShiftStore } from "@/store/shifts/shift-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NozzleAssignmentService } from "@/services/nozzle-assignment-service";
import { SalesmanBillService } from "@/services/salesman-bill-service";
import { SalesmanBillPaymentService } from "@/services/salesman-bill-payment-service";
import { SalesmanShiftAccountingService } from "@/services/salesman-shift-accounting-service";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  AlertCircle,
  Fuel,
  FileText,
  Wallet,
  Calculator,
  Clock,
  User,
  IndianRupee,
  Edit,
} from "lucide-react";
import { format } from "date-fns";
import type {
  NozzleAssignmentResponse,
  SalesmanBillResponse,
  SalesmanBillPaymentResponse,
  SalesmanShiftAccountingResponse,
} from "@/types";

export function ShiftDetailsPage() {
  const { shiftId } = useParams<{ shiftId: string }>();
  const navigate = useNavigate();
  const { currentShift, fetchShiftById } = useShiftStore();

  const [nozzleAssignments, setNozzleAssignments] = useState<
    NozzleAssignmentResponse[]
  >([]);
  const [bills, setBills] = useState<SalesmanBillResponse[]>([]);
  const [payments, setPayments] = useState<SalesmanBillPaymentResponse[]>([]);
  const [accounting, setAccounting] =
    useState<SalesmanShiftAccountingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!shiftId) return;

      setIsLoading(true);
      try {
        const [, nozzlesData, billsData, paymentsData] = await Promise.all([
          fetchShiftById(shiftId),
          NozzleAssignmentService.getAssignmentsForShift(shiftId),
          SalesmanBillService.getByShift(shiftId),
          SalesmanBillPaymentService.getByShiftId(shiftId),
        ]);

        setNozzleAssignments(nozzlesData);
        setBills(billsData);
        setPayments(paymentsData);

        // Try to fetch accounting (may not exist)
        try {
          const accountingData =
            await SalesmanShiftAccountingService.getByShiftId(shiftId);
          setAccounting(accountingData);
        } catch {
          // No accounting yet
          setAccounting(null);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!currentShift) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Shift not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isShiftOpen = currentShift.status === "OPEN";
  const totalBillsAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const totalPaymentsAmount = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
  const totalDispensed = nozzleAssignments.reduce(
    (sum, nozzle) => sum + (nozzle.dispensedAmount || 0),
    0
  );

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/shifts")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Shift Details</h1>
            <p className="text-sm text-muted-foreground">
              Complete shift information and transactions
            </p>
          </div>
        </div>
        <Badge
          variant={isShiftOpen ? "default" : "secondary"}
          className="text-lg px-4 py-2"
        >
          {currentShift.status}
        </Badge>
      </div>

      {/* Shift Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Shift Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Salesman</p>
              <p className="text-lg font-semibold">
                {currentShift.salesmanUsername}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Start Time</p>
              <p className="text-lg font-semibold">
                {format(new Date(currentShift.startDatetime), "PPp")}
              </p>
            </div>
            {currentShift.endDatetime && (
              <div>
                <p className="text-sm text-muted-foreground">End Time</p>
                <p className="text-lg font-semibold">
                  {format(new Date(currentShift.endDatetime), "PPp")}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Opening Cash</p>
              <p className="text-lg font-semibold">
                ₹{currentShift.openingCash.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nozzles Assigned</p>
              <p className="text-lg font-semibold">
                {nozzleAssignments.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Bills</p>
              <p className="text-lg font-semibold">{bills.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Payments</p>
              <p className="text-lg font-semibold">{payments.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="text-lg font-semibold flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {currentShift.endDatetime
                  ? `${Math.round(
                      (new Date(currentShift.endDatetime).getTime() -
                        new Date(currentShift.startDatetime).getTime()) /
                        (1000 * 60 * 60)
                    )}h`
                  : "Ongoing"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Dispensed
            </CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalDispensed.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From{" "}
              {nozzleAssignments.filter((n) => n.status === "CLOSED").length}{" "}
              closed nozzles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalBillsAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {bills.length} credit bills
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Payments
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalPaymentsAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {payments.length} payments received
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="nozzles" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="nozzles">
            <Fuel className="h-4 w-4 mr-2" />
            Nozzles
          </TabsTrigger>
          <TabsTrigger value="bills">
            <FileText className="h-4 w-4 mr-2" />
            Bills
          </TabsTrigger>
          <TabsTrigger value="payments">
            <Wallet className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="accounting">
            <Calculator className="h-4 w-4 mr-2" />
            Accounting
          </TabsTrigger>
        </TabsList>

        {/* Nozzles Tab */}
        <TabsContent value="nozzles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Nozzle Assignments</CardTitle>
                  <CardDescription>
                    Nozzles assigned to this shift
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/shifts/${shiftId}`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Manage Nozzles
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {nozzleAssignments.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No nozzles assigned to this shift
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nozzle</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Opening</TableHead>
                        <TableHead className="text-right">Closing</TableHead>
                        <TableHead className="text-right">Dispensed</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {nozzleAssignments.map((nozzle) => (
                        <TableRow key={nozzle.id}>
                          <TableCell className="font-medium">
                            {nozzle.nozzleName}
                          </TableCell>
                          <TableCell>{nozzle.productName}</TableCell>
                          <TableCell className="text-right font-mono">
                            {nozzle.openingBalance.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {nozzle.closingBalance?.toFixed(2) || "-"}
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">
                            {nozzle.dispensedAmount
                              ? `₹${nozzle.dispensedAmount.toFixed(2)}`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                nozzle.status === "OPEN"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {nozzle.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bills Tab */}
        <TabsContent value="bills" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Credit Bills</CardTitle>
                  <CardDescription>
                    Bills created during this shift
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/shifts/${shiftId}/bills`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Manage Bills
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {bills.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No bills created during this shift
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bills.map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell>
                            {format(new Date(bill.billDate), "PP")}
                          </TableCell>
                          <TableCell>{bill.customerName}</TableCell>
                          <TableCell>{bill.productName}</TableCell>
                          <TableCell className="text-right font-mono">
                            {bill.quantity.toFixed(2)}L
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            ₹{bill.rate.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">
                            ₹{bill.amount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payments Received</CardTitle>
                  <CardDescription>
                    Payments received during this shift
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/shifts/${shiftId}/payments`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Manage Payments
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No payments received during this shift
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {format(new Date(payment.paymentDate), "PP")}
                          </TableCell>
                          <TableCell>{payment.customerName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {payment.paymentMethod.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">
                            ₹{payment.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {payment.notes || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accounting Tab */}
        <TabsContent value="accounting" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Shift Accounting</CardTitle>
                  <CardDescription>
                    Cash reconciliation and accounting details
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/shifts/${shiftId}/accounting`)}
                >
                  {accounting ? (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      View/Edit Accounting
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4 mr-2" />
                      Create Accounting
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!accounting ? (
                <div className="text-center py-12">
                  <Calculator className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No accounting created for this shift yet
                  </p>
                  {currentShift.status === "CLOSED" && (
                    <Button
                      onClick={() => navigate(`/shifts/${shiftId}/accounting`)}
                    >
                      <Calculator className="mr-2 h-4 w-4" />
                      Create Accounting
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Accounting Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">
                        Fuel Sales
                      </p>
                      <p className="text-2xl font-bold flex items-center">
                        <IndianRupee className="h-5 w-5 mr-1" />
                        {accounting.fuelSales.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">
                        Customer Receipt
                      </p>
                      <p className="text-2xl font-bold flex items-center">
                        <IndianRupee className="h-5 w-5 mr-1" />
                        {accounting.customerReceipt.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">
                        System Received
                      </p>
                      <p className="text-2xl font-bold flex items-center">
                        <IndianRupee className="h-5 w-5 mr-1" />
                        {accounting.systemReceivedAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Methods */}
                  <div>
                    <h3 className="font-semibold mb-3">Payment Breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          UPI Received
                        </p>
                        <p className="text-lg font-semibold">
                          ₹{accounting.upiReceived.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Card Received
                        </p>
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
                        <p className="text-sm text-muted-foreground">
                          Expenses
                        </p>
                        <p className="text-lg font-semibold">
                          ₹{accounting.expenses.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Final Balance */}
                  <div>
                    <h3 className="font-semibold mb-3">Cash Reconciliation</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-1">
                          Cash in Hand
                        </p>
                        <p className="text-2xl font-bold">
                          ₹{accounting.cashInHand.toFixed(2)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-1">
                          Balance
                        </p>
                        <p
                          className={`text-2xl font-bold ${
                            accounting.balanceAmount === 0
                              ? "text-green-600"
                              : accounting.balanceAmount > 0
                              ? "text-blue-600"
                              : "text-red-600"
                          }`}
                        >
                          ₹{accounting.balanceAmount.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {accounting.balanceAmount === 0
                            ? "Balanced ✓"
                            : accounting.balanceAmount > 0
                            ? "Excess cash"
                            : "Cash shortage"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
