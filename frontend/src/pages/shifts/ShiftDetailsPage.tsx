import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useShiftStore } from "@/store/shifts/shift-store";
import { useIsMobile } from "@/hooks/use-mobile";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NozzleAssignmentService } from "@/services/nozzle-assignment-service";
import { SalesmanBillService } from "@/services/salesman-bill-service";
import { SalesmanBillPaymentService } from "@/services/salesman-bill-payment-service";
import { SalesmanShiftAccountingService } from "@/services/salesman-shift-accounting-service";
import { ExpenseService } from "@/services/expense-service";
import { NozzleTestService } from "@/services/nozzle-test-service";
import { toast } from "sonner";
import {
  Loader2,
  AlertCircle,
  Fuel,
  FileText,
  Wallet,
  Calculator,
  Clock,
  User,
  IndianRupee,
  Edit,
  Lock,
  Receipt,
  Beaker,
} from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  NozzleAssignmentResponse,
  SalesmanBillResponse,
  SalesmanBillPaymentResponse,
  SalesmanShiftAccountingResponse,
  CloseNozzleRequest,
  ExpenseResponse,
  NozzleTestResponse,
} from "@/types";
import { RegisterNozzleTestSheet } from "@/components/shifts/RegisterNozzleTestSheet";
import { NozzleTestsList } from "@/components/shifts/NozzleTestsList";

export function ShiftDetailsPage() {
  const { shiftId } = useParams<{ shiftId: string }>();
  const navigate = useNavigate();
  const { currentShift, fetchShiftById, closeShift } = useShiftStore();
  const isMobile = useIsMobile();

  const [nozzleAssignments, setNozzleAssignments] = useState<
    NozzleAssignmentResponse[]
  >([]);
  const [bills, setBills] = useState<SalesmanBillResponse[]>([]);
  // Filter to show only credit bills
  const creditBills = bills.filter((bill) => bill.paymentType === "CREDIT");
  const [payments, setPayments] = useState<SalesmanBillPaymentResponse[]>([]);
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [accounting, setAccounting] =
    useState<SalesmanShiftAccountingResponse | null>(null);
  const [tests, setTests] = useState<NozzleTestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showRegisterTestSheet, setShowRegisterTestSheet] = useState(false);

  // Nozzle closing state
  const [selectedNozzle, setSelectedNozzle] =
    useState<NozzleAssignmentResponse | null>(null);
  const [closingBalance, setClosingBalance] = useState("");
  const [isClosingNozzle, setIsClosingNozzle] = useState(false);

  const handleCloseShift = async () => {
    if (!shiftId) return;

    setIsClosing(true);
    try {
      await closeShift(shiftId);
      toast.success("Shift closed successfully");
      setShowCloseDialog(false);
      navigate("/shifts");
    } catch (err) {
      toast.error("Failed to close shift");
      console.error(err);
    } finally {
      setIsClosing(false);
    }
  };

  const handleOpenCloseNozzleDialog = (nozzle: NozzleAssignmentResponse) => {
    setSelectedNozzle(nozzle);
    setClosingBalance(nozzle.openingBalance.toString());
    setShowCloseDialog(false); // Close shift dialog if open
  };

  const handleCloseNozzle = async () => {
    if (!shiftId || !selectedNozzle) return;

    const closingBalanceNum = parseFloat(closingBalance);
    if (isNaN(closingBalanceNum) || closingBalanceNum < 0) {
      toast.error("Please enter a valid closing balance");
      return;
    }

    setIsClosingNozzle(true);
    try {
      const request: CloseNozzleRequest = {
        closingBalance: closingBalanceNum,
      };

      await NozzleAssignmentService.closeNozzleAssignment(
        shiftId,
        selectedNozzle.id,
        request
      );

      toast.success("Nozzle closed successfully");

      // Refresh data
      const updatedNozzles =
        await NozzleAssignmentService.getAssignmentsForShift(shiftId);
      setNozzleAssignments(updatedNozzles);

      // Close dialog and reset
      setSelectedNozzle(null);
      setClosingBalance("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to close nozzle"
      );
      console.error(err);
    } finally {
      setIsClosingNozzle(false);
    }
  };

  const handleCancelCloseNozzle = () => {
    setSelectedNozzle(null);
    setClosingBalance("");
  };

  useEffect(() => {
    const loadData = async () => {
      if (!shiftId) return;

      setIsLoading(true);
      try {
        const [
          ,
          nozzlesData,
          billsData,
          paymentsData,
          expensesData,
          testsData,
        ] = await Promise.all([
          fetchShiftById(shiftId),
          NozzleAssignmentService.getAssignmentsForShift(shiftId),
          SalesmanBillService.getByShift(shiftId),
          SalesmanBillPaymentService.getByShiftId(shiftId),
          ExpenseService.getBySalesmanShiftId(shiftId),
          NozzleTestService.getTestsForShift(shiftId),
        ]);

        setNozzleAssignments(nozzlesData);
        setBills(billsData);
        setPayments(paymentsData);
        setExpenses(expensesData);
        setTests(testsData);

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
  const totalExpensesAmount = expenses.reduce(
    (sum, expense) => sum + expense.amount,
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
          <div>
            <h1 className="text-2xl font-bold">Shift Details</h1>
            <p className="text-sm text-muted-foreground">
              Complete shift information and transactions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={isShiftOpen ? "default" : "secondary"}
            className="text-lg px-4 py-2"
          >
            {currentShift.status}
          </Badge>
          {isShiftOpen && (
            <Button
              onClick={() => setShowCloseDialog(true)}
              variant="outline"
              className="gap-2"
            >
              <Lock className="h-4 w-4" />
              Close Shift
            </Button>
          )}
        </div>
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
              <p className="text-sm text-muted-foreground">Credit Bills</p>
              <p className="text-lg font-semibold">{creditBills.length}</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              {creditBills.length} credit bills
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalExpensesAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {expenses.length} expenses recorded
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="nozzles" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="nozzles">
            <Fuel className={`h-4 w-4 ${!isMobile && "mr-2"}`} />
            {!isMobile && "Nozzles"}
          </TabsTrigger>
          <TabsTrigger value="tests">
            <Beaker className={`h-4 w-4 ${!isMobile && "mr-2"}`} />
            {!isMobile && "Tests"}
          </TabsTrigger>
          <TabsTrigger value="bills">
            <FileText className={`h-4 w-4 ${!isMobile && "mr-2"}`} />
            {!isMobile && "Bills"}
          </TabsTrigger>
          <TabsTrigger value="payments">
            <Wallet className={`h-4 w-4 ${!isMobile && "mr-2"}`} />
            {!isMobile && "Payments"}
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <Receipt className={`h-4 w-4 ${!isMobile && "mr-2"}`} />
            {!isMobile && "Expenses"}
          </TabsTrigger>
          <TabsTrigger value="accounting">
            <Calculator className={`h-4 w-4 ${!isMobile && "mr-2"}`} />
            {!isMobile && "Accounting"}
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
                        <TableHead className="text-right">
                          Opening (L)
                        </TableHead>
                        <TableHead className="text-right">Closing</TableHead>
                        <TableHead className="text-right">Dispensed</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
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
                              ? `${nozzle.dispensedAmount.toFixed(2)}`
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
                          <TableCell className="text-right">
                            {nozzle.status === "OPEN" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleOpenCloseNozzleDialog(nozzle)
                                }
                                className="gap-2"
                              >
                                <Lock className="h-3 w-3" />
                                Close
                              </Button>
                            )}
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

        {/* Tests Tab */}
        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Nozzle Tests</CardTitle>
                  <CardDescription>
                    Test readings during this shift
                  </CardDescription>
                </div>
                {isShiftOpen && (
                  <Button
                    onClick={() => setShowRegisterTestSheet(true)}
                    size="sm"
                  >
                    <Beaker className="h-4 w-4 mr-2" />
                    Register Test
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>

          <NozzleTestsList
            shiftId={shiftId!}
            tests={tests}
            onTestDeleted={async () => {
              const testsData = await NozzleTestService.getTestsForShift(
                shiftId!
              );
              setTests(testsData);
              // Refresh nozzle assignments to update test counts
              const nozzlesData =
                await NozzleAssignmentService.getAssignmentsForShift(shiftId!);
              setNozzleAssignments(nozzlesData);
            }}
            isShiftOpen={isShiftOpen}
          />
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
              {creditBills.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No credit bills created during this shift
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
                      {creditBills.map((bill) => (
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

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Shift Expenses</CardTitle>
                  <CardDescription>
                    Expenses incurred during this shift
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/shifts/${shiftId}/expenses`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Manage Expenses
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No expenses recorded during this shift
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Expense Head</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>
                            {format(new Date(expense.expenseDate), "PP")}
                          </TableCell>
                          <TableCell className="font-medium">
                            {expense.expenseHeadName}
                          </TableCell>
                          <TableCell>
                            {expense.referenceNumber ? (
                              <Badge variant="outline">
                                {expense.referenceNumber}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">
                            ₹{expense.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {expense.remarks || "-"}
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

      {/* Close Shift Dialog */}
      <Sheet open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Close Shift</SheetTitle>
            <SheetDescription>
              Are you sure you want to close this shift?
            </SheetDescription>
          </SheetHeader>

          <div className="py-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-2">Before closing the shift:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Make sure all nozzles are closed</li>
                  <li>Verify all bills and payments are recorded</li>
                  <li>Check the accounting summary is accurate</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>

          <SheetFooter>
            <Button
              variant="outline"
              onClick={() => setShowCloseDialog(false)}
              disabled={isClosing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCloseShift}
              disabled={isClosing}
              className="gap-2"
            >
              {isClosing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Closing...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Close Shift
                </>
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Close Nozzle Dialog */}
      <Sheet
        open={!!selectedNozzle}
        onOpenChange={(open) => !open && handleCancelCloseNozzle()}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Close Nozzle Assignment</SheetTitle>
            <SheetDescription>
              Enter the closing balance for {selectedNozzle?.nozzleName}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Nozzle Info */}
            <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Nozzle:</span>
                <span className="font-medium">
                  {selectedNozzle?.nozzleName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Product:</span>
                <span className="font-medium">
                  {selectedNozzle?.productName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Opening Balance:
                </span>
                <span className="font-mono font-semibold">
                  {selectedNozzle?.openingBalance.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Closing Balance Input */}
            <div className="space-y-2">
              <Label htmlFor="closingBalance">
                Closing Balance <span className="text-red-500">*</span>
              </Label>
              <Input
                id="closingBalance"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter closing balance"
                value={closingBalance}
                onChange={(e) => setClosingBalance(e.target.value)}
                disabled={isClosingNozzle}
              />
              {closingBalance && selectedNozzle && (
                <div className="text-sm space-y-1">
                  <div className="flex justify-between items-center p-2 rounded bg-blue-50 dark:bg-blue-950">
                    <span className="text-muted-foreground">
                      Dispensed Amount:
                    </span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      ₹
                      {(
                        parseFloat(closingBalance) -
                        selectedNozzle.openingBalance
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Make sure to verify the closing balance from the nozzle meter
                before submitting.
              </AlertDescription>
            </Alert>
          </div>

          <SheetFooter>
            <Button
              variant="outline"
              onClick={handleCancelCloseNozzle}
              disabled={isClosingNozzle}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCloseNozzle}
              disabled={isClosingNozzle || !closingBalance}
              className="gap-2"
            >
              {isClosingNozzle ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Closing...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Close Nozzle
                </>
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Register Nozzle Test Sheet */}
      <RegisterNozzleTestSheet
        open={showRegisterTestSheet}
        onOpenChange={setShowRegisterTestSheet}
        shiftId={shiftId!}
        nozzles={nozzleAssignments}
        onSuccess={async () => {
          const testsData = await NozzleTestService.getTestsForShift(shiftId!);
          setTests(testsData);
          // Refresh nozzle assignments to update test counts
          const nozzlesData =
            await NozzleAssignmentService.getAssignmentsForShift(shiftId!);
          setNozzleAssignments(nozzlesData);
        }}
      />
    </div>
  );
}
