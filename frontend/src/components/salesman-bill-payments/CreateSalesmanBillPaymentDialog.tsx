import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSalesmanBillPaymentStore } from "@/store/salesman-bill-payment-store";
import type {
  BankAccount,
  Customer,
  SalesmanNozzleShiftResponse,
  CreateSalesmanBillPaymentRequest,
} from "@/types";
import { PaymentMethod } from "@/types/customer-bill-payment";
import { Loader2 } from "lucide-react";

interface CreateSalesmanBillPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bankAccounts: BankAccount[];
  customers: Customer[];
  activeShifts: SalesmanNozzleShiftResponse[];
  pumpMasterId: string;
}

export function CreateSalesmanBillPaymentDialog({
  open,
  onOpenChange,
  bankAccounts,
  customers,
  activeShifts,
  pumpMasterId,
}: CreateSalesmanBillPaymentDialogProps) {
  const { createPayment, loading } = useSalesmanBillPaymentStore();

  const [formData, setFormData] = useState<CreateSalesmanBillPaymentRequest>({
    pumpMasterId,
    salesmanNozzleShiftId: "",
    customerId: "",
    bankAccountId: "",
    amount: 0,
    paymentDate: new Date().toISOString().slice(0, 16),
    paymentMethod: PaymentMethod.CASH,
    referenceNumber: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPayment(formData);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create payment:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      pumpMasterId,
      salesmanNozzleShiftId: "",
      customerId: "",
      bankAccountId: "",
      amount: 0,
      paymentDate: new Date().toISOString().slice(0, 16),
      paymentMethod: PaymentMethod.CASH,
      referenceNumber: "",
      notes: "",
    });
  };

  const handleChange = (
    field: keyof CreateSalesmanBillPaymentRequest,
    value: string | number | PaymentMethod
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Payment Record</DialogTitle>
          <DialogDescription>
            Record a new payment received by a salesman during their shift
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Salesman Shift */}
            <div className="space-y-2">
              <Label htmlFor="salesmanNozzleShiftId">
                Salesman Shift <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.salesmanNozzleShiftId}
                onValueChange={(value) =>
                  handleChange("salesmanNozzleShiftId", value)
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  {activeShifts.length === 0 ? (
                    <SelectItem value="no-shifts" disabled>
                      No active shifts available
                    </SelectItem>
                  ) : (
                    activeShifts.map((shift) => (
                      <SelectItem key={shift.id} value={shift.id}>
                        {shift.salesmanUsername} - {shift.nozzleName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Customer */}
            <div className="space-y-2">
              <Label htmlFor="customerId">
                Customer <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.customerId}
                onValueChange={(value) => handleChange("customerId", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.length === 0 ? (
                    <SelectItem value="no-customers" disabled>
                      No customers available
                    </SelectItem>
                  ) : (
                    customers.map((customer) => (
                      <SelectItem
                        key={customer.id || customer.customerName}
                        value={customer.id || ""}
                      >
                        {customer.customerName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Bank Account */}
            <div className="space-y-2">
              <Label htmlFor="bankAccountId">
                Bank Account <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.bankAccountId}
                onValueChange={(value) => handleChange("bankAccountId", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bank account" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.length === 0 ? (
                    <SelectItem value="no-accounts" disabled>
                      No bank accounts available
                    </SelectItem>
                  ) : (
                    bankAccounts.map((account) => (
                      <SelectItem
                        key={account.id || account.accountNumber}
                        value={account.id || ""}
                      >
                        {account.accountHolderName} - {account.accountNumber}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">
                Payment Method <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) =>
                  handleChange("paymentMethod", value as PaymentMethod)
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                  <SelectItem value={PaymentMethod.CHEQUE}>Cheque</SelectItem>
                  <SelectItem value={PaymentMethod.UPI}>UPI</SelectItem>
                  <SelectItem value={PaymentMethod.RTGS}>RTGS</SelectItem>
                  <SelectItem value={PaymentMethod.NEFT}>NEFT</SelectItem>
                  <SelectItem value={PaymentMethod.IMPS}>IMPS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) =>
                  handleChange("amount", parseFloat(e.target.value))
                }
                required
              />
            </div>

            {/* Payment Date */}
            <div className="space-y-2">
              <Label htmlFor="paymentDate">
                Payment Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="paymentDate"
                type="datetime-local"
                value={formData.paymentDate}
                onChange={(e) => handleChange("paymentDate", e.target.value)}
                required
              />
            </div>

            {/* Reference Number */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="referenceNumber">
                Reference Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="referenceNumber"
                type="text"
                value={formData.referenceNumber}
                onChange={(e) =>
                  handleChange("referenceNumber", e.target.value)
                }
                placeholder="Enter reference number"
                required
              />
            </div>

            {/* Notes */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Additional notes (optional)"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
