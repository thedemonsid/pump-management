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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReactSelect from "react-select";
import { SalesmanBillPaymentService } from "@/services/salesman-bill-payment-service";
import { CustomerService } from "@/services/customer-service";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  ArrowLeft,
  AlertCircle,
  Wallet,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import type {
  SalesmanBillPaymentResponse,
  Customer,
  PaymentMethod,
} from "@/types";
import { BankAccountService } from "@/services/bank-account-service";
import type { BankAccount } from "@/types";

interface Option {
  value: string;
  label: string;
}

export function ShiftPaymentsPage() {
  const { shiftId } = useParams<{ shiftId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentShift, fetchShiftById } = useShiftStore();

  const [payments, setPayments] = useState<SalesmanBillPaymentResponse[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Form state
  const [selectedCustomer, setSelectedCustomer] = useState<Option | null>(null);
  const [selectedBankAccount, setSelectedBankAccount] = useState<Option | null>(
    null
  );
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<Option | null>({
    value: "CASH",
    label: "Cash",
  });
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!shiftId) return;

      setIsLoading(true);
      try {
        const [, paymentsData, customersData, bankAccountsData] =
          await Promise.all([
            fetchShiftById(shiftId),
            SalesmanBillPaymentService.getByShiftId(shiftId),
            CustomerService.getAll(),
            BankAccountService.getAll(),
          ]);

        setPayments(paymentsData);
        setCustomers(customersData);
        setBankAccounts(bankAccountsData);
      } catch (err) {
        toast.error("Failed to load data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (shiftId) {
      loadData();
    }
  }, [shiftId, fetchShiftById]);

  const resetForm = () => {
    setSelectedCustomer(null);
    setSelectedBankAccount(null);
    setAmount("");
    setPaymentMethod({ value: "CASH", label: "Cash" });
    setReferenceNumber("");
    setNotes("");
    setError(null);
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!selectedCustomer) {
      setError("Please select a customer");
      return;
    }
    if (!selectedBankAccount) {
      setError("Please select a bank account");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (!paymentMethod) {
      setError("Please select a payment method");
      return;
    }

    setIsCreatingPayment(true);

    try {
      await SalesmanBillPaymentService.create({
        pumpMasterId: user?.pumpMasterId || "",
        salesmanShiftId: shiftId!,
        customerId: selectedCustomer.value,
        bankAccountId: selectedBankAccount.value,
        amount: parseFloat(amount),
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: paymentMethod.value as PaymentMethod,
        referenceNumber: referenceNumber || "",
        notes: notes || undefined,
      });

      toast.success("Payment recorded successfully!");
      setIsSheetOpen(false);
      resetForm();

      // Reload payments
      if (shiftId) {
        const paymentsData = await SalesmanBillPaymentService.getByShiftId(
          shiftId
        );
        setPayments(paymentsData);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to record payment";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;

    try {
      await SalesmanBillPaymentService.delete(paymentId);
      toast.success("Payment deleted successfully!");

      // Reload payments
      if (shiftId) {
        const paymentsData = await SalesmanBillPaymentService.getByShiftId(
          shiftId
        );
        setPayments(paymentsData);
      }
    } catch (err) {
      toast.error("Failed to delete payment");
      console.error(err);
    }
  };

  const customerOptions: Option[] = customers.map((c) => ({
    value: c.id!,
    label: `${c.customerName} - ${c.phoneNumber || "N/A"}`,
  }));

  const bankAccountOptions: Option[] = bankAccounts.map((ba) => ({
    value: ba.id!,
    label: ba.accountHolderName || ba.bank || "Unknown Account",
  }));

  const paymentMethodOptions: Option[] = [
    { value: "CASH", label: "Cash" },
    { value: "CARD", label: "Card" },
    { value: "UPI", label: "UPI" },
    { value: "BANK_TRANSFER", label: "Bank Transfer" },
    { value: "CHEQUE", label: "Cheque" },
  ];

  const totalPayments = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

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

  const isShiftOpen = currentShift.status === "OPEN";

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
            <h1 className="text-2xl font-bold">Shift Payments</h1>
            <p className="text-sm text-muted-foreground">
              Payments received during this shift
            </p>
          </div>
        </div>
        {isShiftOpen && (
          <Button onClick={() => setIsSheetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Receive Payment
          </Button>
        )}
      </div>

      {/* Shift Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Shift Information</CardTitle>
            <Badge variant={isShiftOpen ? "default" : "secondary"}>
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
            <div>
              <p className="text-muted-foreground">Total Payments</p>
              <p className="font-medium">{payments.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Amount</p>
              <p className="font-medium">₹{totalPayments.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
          <CardDescription>
            {payments.length === 0
              ? "No payments received yet"
              : `${payments.length} payment(s) received`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No payments received during this shift
              </p>
              {isShiftOpen && (
                <Button
                  onClick={() => setIsSheetOpen(true)}
                  className="mt-4"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Receive First Payment
                </Button>
              )}
            </div>
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
                    {isShiftOpen && (
                      <TableHead className="text-center">Actions</TableHead>
                    )}
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
                      {isShiftOpen && (
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePayment(payment.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receive Payment Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>Receive Payment</SheetTitle>
            <SheetDescription>
              Record a payment received from a customer
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleCreatePayment} className="mt-6 space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Customer */}
            <div className="space-y-2">
              <Label>
                Customer <span className="text-red-500">*</span>
              </Label>
              <ReactSelect
                options={customerOptions}
                value={selectedCustomer}
                onChange={setSelectedCustomer}
                placeholder="Select customer..."
                isDisabled={isCreatingPayment}
                className="text-base"
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "40px",
                    fontSize: "16px",
                  }),
                }}
              />
            </div>

            {/* Bank Account */}
            <div className="space-y-2">
              <Label>
                Bank Account <span className="text-red-500">*</span>
              </Label>
              <ReactSelect
                options={bankAccountOptions}
                value={selectedBankAccount}
                onChange={setSelectedBankAccount}
                placeholder="Select bank account..."
                isDisabled={isCreatingPayment}
                className="text-base"
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "40px",
                    fontSize: "16px",
                  }),
                }}
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isCreatingPayment}
                className="text-base"
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <ReactSelect
                options={paymentMethodOptions}
                value={paymentMethod}
                onChange={setPaymentMethod}
                placeholder="Select payment method..."
                isDisabled={isCreatingPayment}
                className="text-base"
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "40px",
                    fontSize: "16px",
                  }),
                }}
              />
            </div>

            {/* Reference Number */}
            <div className="space-y-2">
              <Label htmlFor="referenceNumber">Reference Number</Label>
              <Input
                id="referenceNumber"
                type="text"
                placeholder="Transaction ID, Cheque No., etc."
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                disabled={isCreatingPayment}
                className="text-base"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                type="text"
                placeholder="Optional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isCreatingPayment}
                className="text-base"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsSheetOpen(false);
                  resetForm();
                }}
                disabled={isCreatingPayment}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreatingPayment}
                className="flex-1"
              >
                {isCreatingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  "Receive Payment"
                )}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
