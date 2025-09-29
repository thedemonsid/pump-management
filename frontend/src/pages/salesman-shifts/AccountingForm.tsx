import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Calculator, IndianRupee } from "lucide-react";
import type {
  SalesmanNozzleShiftResponse,
  CreateSalesmanShiftAccountingRequest,
  SalesmanShiftAccounting,
} from "@/types";

interface AccountingFormProps {
  shift: SalesmanNozzleShiftResponse;
  onSubmit: (data: CreateSalesmanShiftAccountingRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  existingAccounting?: SalesmanShiftAccounting | null;
  isReadOnly?: boolean;
}

export function AccountingForm({
  shift,
  onSubmit,
  onCancel,
  loading,
  existingAccounting,
  isReadOnly = false,
}: AccountingFormProps) {
  const [formData, setFormData] =
    useState<CreateSalesmanShiftAccountingRequest>(
      existingAccounting
        ? {
            upiReceived: existingAccounting.upiReceived,
            cardReceived: existingAccounting.cardReceived,
            expenses: existingAccounting.expenses,
            expenseReason: existingAccounting.expenseReason || "",
            notes2000: existingAccounting.notes2000,
            notes1000: existingAccounting.notes1000,
            notes500: existingAccounting.notes500,
            notes200: existingAccounting.notes200,
            notes100: existingAccounting.notes100,
            notes50: existingAccounting.notes50,
            notes20: existingAccounting.notes20,
            notes10: existingAccounting.notes10,
            coins5: existingAccounting.coins5,
            coins2: existingAccounting.coins2,
            coins1: existingAccounting.coins1,
          }
        : {
            upiReceived: 0,
            cardReceived: 0,
            expenses: 0,
            expenseReason: "",
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
          }
    );

  // Calculate cash in hand from denominations
  const calculateCashInHand = () => {
    return (
      formData.notes2000 * 2000 +
      formData.notes1000 * 1000 +
      formData.notes500 * 500 +
      formData.notes200 * 200 +
      formData.notes100 * 100 +
      formData.notes50 * 50 +
      formData.notes20 * 20 +
      formData.notes10 * 10 +
      formData.coins5 * 5 +
      formData.coins2 * 2 +
      formData.coins1 * 1
    );
  };

  // Calculate expected cash (use system received amount from backend if available)
  const expectedCash = existingAccounting
    ? existingAccounting.systemReceivedAmount
    : shift.totalAmount || 0;
  const cashInHand = calculateCashInHand();
  const totalReceived =
    formData.upiReceived + formData.cardReceived + cashInHand;
  const balanceAmount = totalReceived - expectedCash - formData.expenses;

  const handleInputChange = (
    field: keyof CreateSalesmanShiftAccountingRequest,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: typeof value === "string" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Shift Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {isReadOnly ? "Accounting Details" : "Shift Summary"}
          </CardTitle>
          <CardDescription>
            {isReadOnly
              ? "View accounting details for this shift"
              : "Review shift details before creating accounting"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Nozzle
              </Label>
              <p className="font-medium">{shift.nozzleName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Product
              </Label>
              <p className="font-medium">{shift.productName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Fuel Dispensed
              </Label>
              <p className="font-medium">
                {shift.dispensedAmount.toFixed(3)} L
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Total Amount
              </Label>
              <p className="font-medium">{formatCurrency(shift.totalAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>
              Enter amounts received through different payment methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="upiReceived">UPI Received</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="upiReceived"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.upiReceived}
                    onChange={(e) =>
                      handleInputChange("upiReceived", e.target.value)
                    }
                    className="pl-10"
                    placeholder="0.00"
                    disabled={isReadOnly}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardReceived">Card Received</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cardReceived"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cardReceived}
                    onChange={(e) =>
                      handleInputChange("cardReceived", e.target.value)
                    }
                    className="pl-10"
                    placeholder="0.00"
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>
              Enter any expenses incurred during the shift
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expenses">Expense Amount</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="expenses"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.expenses}
                    onChange={(e) =>
                      handleInputChange("expenses", e.target.value)
                    }
                    className="pl-10"
                    placeholder="0.00"
                    disabled={isReadOnly}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenseReason">Reason</Label>
                <Textarea
                  id="expenseReason"
                  value={formData.expenseReason}
                  onChange={(e) =>
                    handleInputChange("expenseReason", e.target.value)
                  }
                  placeholder="Enter expense reason..."
                  rows={2}
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cash Denominations */}
        <Card>
          <CardHeader>
            <CardTitle>Cash Denominations</CardTitle>
            <CardDescription>
              Count the physical cash notes and coins in hand
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="notes2000">₹2000 Notes</Label>
                <Input
                  id="notes2000"
                  type="number"
                  min="0"
                  value={formData.notes2000}
                  onChange={(e) =>
                    handleInputChange("notes2000", e.target.value)
                  }
                  placeholder="0"
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes1000">₹1000 Notes</Label>
                <Input
                  id="notes1000"
                  type="number"
                  min="0"
                  value={formData.notes1000}
                  onChange={(e) =>
                    handleInputChange("notes1000", e.target.value)
                  }
                  placeholder="0"
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes500">₹500 Notes</Label>
                <Input
                  id="notes500"
                  type="number"
                  min="0"
                  value={formData.notes500}
                  onChange={(e) =>
                    handleInputChange("notes500", e.target.value)
                  }
                  placeholder="0"
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes200">₹200 Notes</Label>
                <Input
                  id="notes200"
                  type="number"
                  min="0"
                  value={formData.notes200}
                  onChange={(e) =>
                    handleInputChange("notes200", e.target.value)
                  }
                  placeholder="0"
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes100">₹100 Notes</Label>
                <Input
                  id="notes100"
                  type="number"
                  min="0"
                  value={formData.notes100}
                  onChange={(e) =>
                    handleInputChange("notes100", e.target.value)
                  }
                  placeholder="0"
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes50">₹50 Notes</Label>
                <Input
                  id="notes50"
                  type="number"
                  min="0"
                  value={formData.notes50}
                  onChange={(e) => handleInputChange("notes50", e.target.value)}
                  placeholder="0"
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes20">₹20 Notes</Label>
                <Input
                  id="notes20"
                  type="number"
                  min="0"
                  value={formData.notes20}
                  onChange={(e) => handleInputChange("notes20", e.target.value)}
                  placeholder="0"
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes10">₹10 Notes</Label>
                <Input
                  id="notes10"
                  type="number"
                  min="0"
                  value={formData.notes10}
                  onChange={(e) => handleInputChange("notes10", e.target.value)}
                  placeholder="0"
                  disabled={isReadOnly}
                />
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coins5">₹5 Coins</Label>
                <Input
                  id="coins5"
                  type="number"
                  min="0"
                  value={formData.coins5}
                  onChange={(e) => handleInputChange("coins5", e.target.value)}
                  placeholder="0"
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coins2">₹2 Coins</Label>
                <Input
                  id="coins2"
                  type="number"
                  min="0"
                  value={formData.coins2}
                  onChange={(e) => handleInputChange("coins2", e.target.value)}
                  placeholder="0"
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coins1">₹1 Coins</Label>
                <Input
                  id="coins1"
                  type="number"
                  min="0"
                  value={formData.coins1}
                  onChange={(e) => handleInputChange("coins1", e.target.value)}
                  placeholder="0"
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Accounting Summary</CardTitle>
            <CardDescription>
              Calculated totals and balance verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Backend Calculated Values */}
            {existingAccounting && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">
                    Fuel Sales
                  </div>
                  <div className="font-semibold text-lg">
                    {formatCurrency(existingAccounting.fuelSales)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">
                    Customer Receipt
                  </div>
                  <div className="font-semibold text-lg">
                    {formatCurrency(existingAccounting.customerReceipt)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">
                    Credit Amount
                  </div>
                  <div className="font-semibold text-lg">
                    {formatCurrency(existingAccounting.credit)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">
                    System Received
                  </div>
                  <div className="font-semibold text-lg">
                    {formatCurrency(existingAccounting.systemReceivedAmount)}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Cash in Hand:
                  </span>
                  <span className="font-medium">
                    {formatCurrency(cashInHand)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    UPI Received:
                  </span>
                  <span className="font-medium">
                    {formatCurrency(formData.upiReceived)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Card Received:
                  </span>
                  <span className="font-medium">
                    {formatCurrency(formData.cardReceived)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Received:
                  </span>
                  <span className="font-medium">
                    {formatCurrency(totalReceived)}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Expected Amount:
                  </span>
                  <span className="font-medium">
                    {formatCurrency(expectedCash)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Expenses:
                  </span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(formData.expenses)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Balance Amount:</span>
                  <span
                    className={`font-bold ${
                      balanceAmount >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(balanceAmount)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {isReadOnly ? "Close" : "Cancel"}
          </Button>
          {!isReadOnly && (
            <Button type="submit" disabled={loading}>
              {existingAccounting ? "Update Accounting" : "Create Accounting"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
