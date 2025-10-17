import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type CSSObjectWithLabel } from "react-select";
import CreatableSelect from "react-select/creatable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Plus,
  AlertCircle,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import { SalesmanNozzleShiftService } from "@/services/salesman-nozzle-shift-service";
import { toast } from "sonner";
import type {
  SalesmanNozzleShiftResponse,
  CreateSalesmanShiftAccountingRequest,
  SalesmanShiftAccounting,
} from "@/types";

// ReactSelect styling
const selectStyles = {
  control: (provided: CSSObjectWithLabel) => ({
    ...provided,
    minHeight: "36px",
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    "&:hover": {
      borderColor: "#9ca3af",
    },
    boxShadow: "none",
    "&:focus-within": {
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 1px #3b82f6",
    },
    fontSize: "14px",
  }),
  option: (
    provided: CSSObjectWithLabel,
    state: { isSelected: boolean; isFocused: boolean }
  ) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#3b82f6"
      : state.isFocused
      ? "#dbeafe"
      : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#111827",
    "&:hover": {
      backgroundColor: state.isSelected ? "#2563eb" : "#dbeafe",
    },
    fontSize: "14px",
  }),
  menu: (provided: CSSObjectWithLabel) => ({
    ...provided,
    zIndex: 9999,
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
  }),
  menuPortal: (base: CSSObjectWithLabel) => ({ ...base, zIndex: 9999 }),
};

// Common amount options
const amountOptions = [
  { value: 0, label: "₹0" },
  { value: 100, label: "₹100" },
  { value: 200, label: "₹200" },
  { value: 500, label: "₹500" },
  { value: 1000, label: "₹1,000" },
  { value: 2000, label: "₹2,000" },
  { value: 5000, label: "₹5,000" },
  { value: 10000, label: "₹10,000" },
  { value: 20000, label: "₹20,000" },
  { value: 50000, label: "₹50,000" },
];

export function AccountingTablePage() {
  const navigate = useNavigate();
  const { shiftId } = useParams<{ shiftId: string }>();

  const [shift, setShift] = useState<SalesmanNozzleShiftResponse | null>(null);
  const [accounting, setAccounting] = useState<SalesmanShiftAccounting | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Cash dialog state
  const [isCashDialogOpen, setIsCashDialogOpen] = useState(false);
  const [cashForm, setCashForm] = useState({
    notes2000: 0,
    notes1000: 0,
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

  // Payment data
  const [creditPaymentReceived, setCreditPaymentReceived] = useState(0); // Payment received from customers who had credit (auto-calculated)
  const [phonePeReceived, setPhonePeReceived] = useState(0);
  const [cardReceived, setCardReceived] = useState(0);
  const [creditGiven, setCreditGiven] = useState(0); // Credit given to customers (auto-calculated)
  const [expenses, setExpenses] = useState(0);
  const [cashInHand, setCashInHand] = useState(0);

  useEffect(() => {
    if (shiftId) {
      loadShiftAndAccounting();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shiftId]);

  const loadShiftAndAccounting = async () => {
    try {
      setLoading(true);
      const shiftData = await SalesmanNozzleShiftService.getById(shiftId!);
      setShift(shiftData);

      // Load auto-calculated fields from shift data (if available)
      // These come from the backend accounting and are read-only
      setCreditPaymentReceived(shiftData.customerReceipt || 0);
      setCreditGiven(shiftData.credit || 0);

      // Try to load existing accounting if shift is closed and accounting exists
      if (shiftData.isAccountingDone) {
        try {
          const accountingData = await SalesmanNozzleShiftService.getAccounting(
            shiftId!
          );
          setAccounting(accountingData);

          // Update auto-calculated fields from accounting (in case they're different)
          setCreditPaymentReceived(accountingData.customerReceipt || 0);
          setCreditGiven(accountingData.credit || 0);

          setPhonePeReceived(accountingData.upiReceived);
          setCardReceived(accountingData.cardReceived);
          setExpenses(accountingData.expenses);
          setCashInHand(
            accountingData.notes2000 * 2000 +
              accountingData.notes1000 * 1000 +
              accountingData.notes500 * 500 +
              accountingData.notes200 * 200 +
              accountingData.notes100 * 100 +
              accountingData.notes50 * 50 +
              accountingData.notes20 * 20 +
              accountingData.notes10 * 10 +
              accountingData.coins5 * 5 +
              accountingData.coins2 * 2 +
              accountingData.coins1 * 1
          );
          setCashForm({
            notes2000: accountingData.notes2000,
            notes1000: accountingData.notes1000,
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
          // Accounting doesn't exist yet, that's okay
          console.log("No existing accounting found");
        }
      }
    } catch (error) {
      console.error("Error loading shift:", error);
      toast.error("Failed to load shift details");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const calculateCashFromDenominations = () => {
    return (
      cashForm.notes2000 * 2000 +
      cashForm.notes1000 * 1000 +
      cashForm.notes500 * 500 +
      cashForm.notes200 * 200 +
      cashForm.notes100 * 100 +
      cashForm.notes50 * 50 +
      cashForm.notes20 * 20 +
      cashForm.notes10 * 10 +
      cashForm.coins5 * 5 +
      cashForm.coins2 * 2 +
      cashForm.coins1 * 1
    );
  };

  const handleAddCash = () => {
    const calculatedCash = calculateCashFromDenominations();
    setCashInHand(calculatedCash);
    setIsCashDialogOpen(false);
    toast.success("Cash added successfully", {
      description: `Total cash: ${formatCurrency(calculatedCash)}`,
    });
  };

  const handleSubmitAccounting = async () => {
    if (!shift) return;

    try {
      setSubmitting(true);

      const accountingData: CreateSalesmanShiftAccountingRequest = {
        upiReceived: phonePeReceived,
        cardReceived: cardReceived,
        expenses,
        expenseReason: "",
        notes2000: cashForm.notes2000,
        notes1000: cashForm.notes1000,
        notes500: cashForm.notes500,
        notes200: cashForm.notes200,
        notes100: cashForm.notes100,
        notes50: cashForm.notes50,
        notes20: cashForm.notes20,
        notes10: cashForm.notes10,
        coins5: cashForm.coins5,
        coins2: cashForm.coins2,
        coins1: cashForm.coins1,
      };

      if (accounting) {
        await SalesmanNozzleShiftService.updateAccounting(
          shift.id!,
          accountingData
        );
        toast.success("Accounting updated successfully");
      } else {
        await SalesmanNozzleShiftService.createAccounting(
          shift.id!,
          accountingData
        );
        toast.success("Accounting created successfully");
      }

      navigate(-1);
    } catch (error) {
      console.error("Error submitting accounting:", error);
      toast.error("Failed to submit accounting");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculations
  const expectedCash = shift ? shift.totalAmount || 0 : 0;

  // Total receipts (what we received including credit payments)
  const totalReceipts =
    phonePeReceived + cardReceived + cashInHand + creditPaymentReceived;

  // Total amount (expected sale + credit payments received)
  const totalAmount = expectedCash + creditPaymentReceived;

  // Net receipt after expenses
  const netReceipt = totalReceipts - expenses;

  // Balance (difference between what we should have and what we got)
  const balanceAmount = netReceipt - expectedCash - creditGiven;

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              Loading shift details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!shift) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium">Shift not found</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 p-2 border-b bg-background">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate">
            {accounting ? "Edit Accounting" : "Create Accounting"}
          </h1>
          <p className="text-xs text-muted-foreground truncate">
            {shift.salesmanUsername} • {shift.nozzleName}
          </p>
        </div>
      </div>

      {/* Shift Summary */}
      <div className="p-2 border-b bg-muted/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Nozzle</p>
            <p className="font-medium">{shift.nozzleName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Product</p>
            <p className="font-medium">{shift.productName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Dispensed</p>
            <p className="font-medium">{shift.dispensedAmount.toFixed(2)} L</p>
          </div>
          <div>
            <p className="text-muted-foreground">Expected</p>
            <p className="font-medium text-primary">
              {formatCurrency(expectedCash)}
            </p>
          </div>
        </div>
      </div>

      {/* Accounting Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* MS Sale (Total Sale/Expected) */}
            <TableRow className="bg-blue-50">
              <TableCell className="font-bold py-2">MS Sale</TableCell>
              <TableCell className="text-right font-bold py-2">
                {formatCurrency(expectedCash)}
              </TableCell>
            </TableRow>

            {/* Receipt (Credit Payment Received) - Auto-calculated */}
            <TableRow>
              <TableCell className="font-medium py-2 text-muted-foreground">
                Receipt (Credit Payment)
              </TableCell>
              <TableCell className="text-right font-medium py-2 text-green-600">
                {formatCurrency(creditPaymentReceived)}
              </TableCell>
            </TableRow>

            {/* Total Amount (MS Sale + Receipt) */}
            <TableRow className="bg-purple-50">
              <TableCell className="font-bold py-2">Total Amt.</TableCell>
              <TableCell className="text-right font-bold py-2">
                {formatCurrency(totalAmount)}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={2} className="p-0">
                <Separator className="bg-gray-300" />
              </TableCell>
            </TableRow>

            {/* PhonePe */}
            <TableRow>
              <TableCell className="font-medium py-2">PhonePe</TableCell>
              <TableCell className="text-right py-2">
                <div className="max-w-[200px] ml-auto">
                  <CreatableSelect
                    value={
                      phonePeReceived
                        ? {
                            value: phonePeReceived,
                            label: `₹${phonePeReceived.toLocaleString(
                              "en-IN"
                            )}`,
                          }
                        : null
                    }
                    onChange={(option) => {
                      if (option) {
                        setPhonePeReceived(option.value);
                      } else {
                        setPhonePeReceived(0);
                      }
                    }}
                    onCreateOption={(inputValue) => {
                      const numValue = parseFloat(
                        inputValue.replace(/[^0-9.]/g, "")
                      );
                      if (!isNaN(numValue)) {
                        setPhonePeReceived(numValue);
                      }
                    }}
                    options={amountOptions}
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    placeholder="₹0"
                    isClearable
                    formatCreateLabel={(inputValue) => `Use ₹${inputValue}`}
                  />
                </div>
              </TableCell>
            </TableRow>

            {/* Card */}
            <TableRow>
              <TableCell className="font-medium py-2">Card</TableCell>
              <TableCell className="text-right py-2">
                <div className="max-w-[200px] ml-auto">
                  <CreatableSelect
                    value={
                      cardReceived
                        ? {
                            value: cardReceived,
                            label: `₹${cardReceived.toLocaleString("en-IN")}`,
                          }
                        : null
                    }
                    onChange={(option) => {
                      if (option) {
                        setCardReceived(option.value);
                      } else {
                        setCardReceived(0);
                      }
                    }}
                    onCreateOption={(inputValue) => {
                      const numValue = parseFloat(
                        inputValue.replace(/[^0-9.]/g, "")
                      );
                      if (!isNaN(numValue)) {
                        setCardReceived(numValue);
                      }
                    }}
                    options={amountOptions}
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    placeholder="₹0"
                    isClearable
                    formatCreateLabel={(inputValue) => `Use ₹${inputValue}`}
                  />
                </div>
              </TableCell>
            </TableRow>

            {/* H.P (Cash from denominations) */}
            <TableRow>
              <TableCell className="font-medium py-2">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  H.P. (Cash)
                </div>
              </TableCell>
              <TableCell className="text-right py-2">
                <div className="flex items-center gap-2 justify-end">
                  <span className="font-medium text-primary min-w-[80px] text-right text-sm">
                    {formatCurrency(cashInHand)}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setIsCashDialogOpen(true)}
                    className="h-9"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {cashInHand > 0 ? "Edit" : "Add"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>

            {/* Credit (Bills given to customers) - Auto-calculated */}
            <TableRow>
              <TableCell className="font-medium py-2 text-muted-foreground">
                Credit
              </TableCell>
              <TableCell className="text-right font-medium py-2 text-orange-600">
                {formatCurrency(creditGiven)}
              </TableCell>
            </TableRow>

            {/* Expenses */}
            <TableRow>
              <TableCell className="font-medium text-destructive py-2">
                Expence
              </TableCell>
              <TableCell className="text-right py-2">
                <div className="max-w-[200px] ml-auto">
                  <CreatableSelect
                    value={
                      expenses
                        ? {
                            value: expenses,
                            label: `₹${expenses.toLocaleString("en-IN")}`,
                          }
                        : null
                    }
                    onChange={(option) => {
                      if (option) {
                        setExpenses(option.value);
                      } else {
                        setExpenses(0);
                      }
                    }}
                    onCreateOption={(inputValue) => {
                      const numValue = parseFloat(
                        inputValue.replace(/[^0-9.]/g, "")
                      );
                      if (!isNaN(numValue)) {
                        setExpenses(numValue);
                      }
                    }}
                    options={amountOptions}
                    styles={{
                      ...selectStyles,
                      control: (provided: CSSObjectWithLabel) => ({
                        ...provided,
                        minHeight: "36px",
                        borderColor: "#f87171",
                        backgroundColor: "#ffffff",
                        "&:hover": {
                          borderColor: "#ef4444",
                        },
                        boxShadow: "none",
                        "&:focus-within": {
                          borderColor: "#ef4444",
                          boxShadow: "0 0 0 1px #ef4444",
                        },
                        fontSize: "14px",
                      }),
                    }}
                    menuPortalTarget={document.body}
                    placeholder="₹0"
                    isClearable
                    formatCreateLabel={(inputValue) => `Use ₹${inputValue}`}
                  />
                </div>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={2} className="p-0">
                <Separator className="bg-gray-400" />
              </TableCell>
            </TableRow>

            {/* Total Receipts (Sum of all payments received) */}
            <TableRow className="bg-yellow-50">
              <TableCell className="font-bold py-3">Total Receipts</TableCell>
              <TableCell className="text-right font-bold text-lg py-3">
                {formatCurrency(totalReceipts)}
              </TableCell>
            </TableRow>

            {/* Net Receipt */}
            <TableRow className="bg-green-50">
              <TableCell className="font-bold py-3">Net Receipt</TableCell>
              <TableCell className="text-right font-bold text-lg py-3">
                {formatCurrency(netReceipt)}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={2} className="p-0">
                <Separator className="bg-primary/40" />
              </TableCell>
            </TableRow>

            {/* Balance Amt */}
            <TableRow
              className={balanceAmount >= 0 ? "bg-green-100" : "bg-red-100"}
            >
              <TableCell className="font-bold text-base py-3">
                <div className="flex items-center gap-2">
                  {balanceAmount >= 0 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  Balance Amt.
                </div>
              </TableCell>
              <TableCell className="text-right py-3">
                <div className="flex flex-col items-end">
                  <span
                    className={`font-bold text-xl ${
                      balanceAmount >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(Math.abs(balanceAmount))}
                  </span>
                  <Badge
                    variant={balanceAmount >= 0 ? "default" : "destructive"}
                    className="text-xs mt-1"
                  >
                    {balanceAmount >= 0 ? "Excess" : "Shortage"}
                  </Badge>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 p-2 border-t bg-background">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex-1"
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmitAccounting}
          className="flex-1"
          disabled={submitting || totalReceipts === 0}
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {accounting ? "Update Accounting" : "Create Accounting"}
            </>
          )}
        </Button>
      </div>

      {/* Cash Denominations Dialog */}
      <Dialog open={isCashDialogOpen} onOpenChange={setIsCashDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cash Denominations</DialogTitle>
            <DialogDescription>
              Enter the count for each denomination
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Table with borders like the image */}
            <div className="border-2 border-black rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="border-r-2 border-black p-3 text-left font-semibold">
                      Denomination
                    </th>
                    <th className="border-r-2 border-black p-3 text-center font-semibold">
                      count
                    </th>
                    <th className="p-3 text-center font-semibold">amount</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      label: "₹2000",
                      value: 2000,
                      field: "notes2000" as const,
                    },
                    {
                      label: "₹1000",
                      value: 1000,
                      field: "notes1000" as const,
                    },
                    { label: "₹500", value: 500, field: "notes500" as const },
                    { label: "₹200", value: 200, field: "notes200" as const },
                    { label: "₹100", value: 100, field: "notes100" as const },
                    { label: "₹50", value: 50, field: "notes50" as const },
                    { label: "₹20", value: 20, field: "notes20" as const },
                    { label: "₹10", value: 10, field: "notes10" as const },
                    { label: "₹5", value: 5, field: "coins5" as const },
                    { label: "₹2", value: 2, field: "coins2" as const },
                    { label: "₹1", value: 1, field: "coins1" as const },
                  ].map(({ label, value, field }) => {
                    const count = cashForm[field];
                    const amount = count * value;
                    return (
                      <tr key={field} className="border-b border-gray-300">
                        <td className="border-r-2 border-black p-3 font-medium">
                          {label}
                        </td>
                        <td className="border-r-2 border-black p-3 text-center">
                          <Input
                            type="number"
                            min="0"
                            value={count === 0 ? "" : count}
                            onChange={(e) => {
                              const value = e.target.value;
                              setCashForm((prev) => ({
                                ...prev,
                                [field]:
                                  value === "" ? 0 : parseInt(value) || 0,
                              }));
                            }}
                            className="h-10 w-full text-center border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md"
                            placeholder="0"
                          />
                        </td>
                        <td className="p-3 text-center">
                          {count > 0 ? (
                            <span className="font-medium">
                              {formatCurrency(amount)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Total section like the image */}
            <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center justify-between">
                <span className="text-xl font-semibold">Total =</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(calculateCashFromDenominations())}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsCashDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleAddCash} className="flex-1">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Add Cash
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
