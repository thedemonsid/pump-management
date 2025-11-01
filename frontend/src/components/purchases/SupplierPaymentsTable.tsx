import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ReactSelect, {
  type SelectInstance,
  type CSSObjectWithLabel,
} from "react-select";
import type { BankAccount } from "@/types/bank-account";

interface PaymentEntry {
  bankAccount: BankAccount;
  paymentMethod: string;
  amount: string;
}

interface SupplierPaymentsTableProps {
  payments: PaymentEntry[];
  setPayments: (payments: PaymentEntry[]) => void;
  bankAccounts: BankAccount[];
  selectedBankAccount: BankAccount | null;
  setSelectedBankAccount: (account: BankAccount | null) => void;
  selectedPaymentMethod: string;
  setSelectedPaymentMethod: (method: string) => void;
  paymentAmount: string;
  setPaymentAmount: (amount: string) => void;
  bankAccountRef: React.RefObject<SelectInstance<
    { value: BankAccount; label: string },
    false
  > | null>;
  finalTotal: number;
}

export function SupplierPaymentsTable({
  payments,
  setPayments,
  bankAccounts,
  selectedBankAccount,
  setSelectedBankAccount,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  paymentAmount,
  setPaymentAmount,
  bankAccountRef,
  finalTotal,
}: SupplierPaymentsTableProps) {
  const totalPaid = payments.reduce(
    (sum, payment) => sum + parseFloat(payment.amount),
    0
  );
  const amountNotPaid = finalTotal - totalPaid;

  const addPayment = () => {
    if (selectedBankAccount && selectedPaymentMethod && paymentAmount) {
      const newPayment: PaymentEntry = {
        bankAccount: selectedBankAccount,
        paymentMethod: selectedPaymentMethod,
        amount: paymentAmount,
      };
      setPayments([...payments, newPayment]);
      setSelectedBankAccount(null);
      setSelectedPaymentMethod("");
      setPaymentAmount("");
      setTimeout(() => bankAccountRef.current?.inputRef?.focus(), 0);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      action();
    }
  };

  // Match BillItemsTable select styles
  const selectStyles = {
    control: (provided: CSSObjectWithLabel) => ({
      ...provided,
      minHeight: "36px",
      borderColor: "#e5e7eb",
      backgroundColor: "#ffffff",
      "&:hover": { borderColor: "#9ca3af" },
      boxShadow: "none",
      "&:focus-within": {
        borderColor: "#3b82f6",
        boxShadow: "0 0 0 1px #3b82f6",
      },
      fontSize: "16px",
      width: "220px", // fixed width for bank account select
      minWidth: "220px",
      maxWidth: "220px",
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
      fontSize: "16px",
      "&:hover": {
        backgroundColor: state.isSelected ? "#2563eb" : "#dbeafe",
      },
    }),
    menu: (provided: CSSObjectWithLabel) => ({
      ...provided,
      zIndex: 9999,
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
    }),
    menuPortal: (base: CSSObjectWithLabel) => ({ ...base, zIndex: 9999 }),
  };

  // Separate style for payment method select (narrower)
  const paymentMethodSelectStyles = {
    ...selectStyles,
    control: (provided: CSSObjectWithLabel) => ({
      ...selectStyles.control(provided),
      width: "150px",
      minWidth: "150px",
      maxWidth: "150px",
    }),
  };

  return (
    <div className="p-4 bg-muted/50 rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8">#</TableHead>
            <TableHead>Bank Account</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="w-48">Amount</TableHead>
            <TableHead className="w-20">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Add Payment Row */}
          <TableRow className="border-2 border-dashed border-green-200 bg-green-50/30">
            <TableCell className="text-center text-muted-foreground">
              +
            </TableCell>
            <TableCell>
              <ReactSelect
                ref={bankAccountRef}
                value={
                  selectedBankAccount
                    ? {
                        value: selectedBankAccount,
                        label: `${selectedBankAccount.accountHolderName} - ${selectedBankAccount.accountNumber}`,
                      }
                    : null
                }
                onChange={(option) =>
                  setSelectedBankAccount(option?.value || null)
                }
                options={bankAccounts.map((account) => ({
                  value: account,
                  label: `${account.accountHolderName} - ${account.accountNumber}`,
                }))}
                placeholder="Select Bank Account"
                className="text-base"
                styles={selectStyles}
                menuPortalTarget={document.body}
              />
            </TableCell>
            <TableCell>
              <ReactSelect
                value={
                  selectedPaymentMethod
                    ? {
                        value: selectedPaymentMethod,
                        label: selectedPaymentMethod,
                      }
                    : null
                }
                onChange={(option) =>
                  setSelectedPaymentMethod(option?.value || "")
                }
                options={[
                  { value: "CASH", label: "Cash" },
                  { value: "UPI", label: "UPI" },
                  { value: "RTGS", label: "RTGS" },
                  { value: "NEFT", label: "NEFT" },
                  { value: "IMPS", label: "IMPS" },
                  { value: "CHEQUE", label: "Cheque" },
                ]}
                placeholder="UPI/Cash/Card"
                className="text-base"
                styles={paymentMethodSelectStyles}
                menuPortalTarget={document.body}
                onKeyDown={(e) => handleKeyPress(e, addPayment)}
              />
            </TableCell>
            <TableCell>
              <Input
                placeholder="0.00"
                className="text-sm text-center h-8 bg-white border border-gray-200"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addPayment)}
              />
            </TableCell>
            <TableCell>
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={addPayment}
                disabled={
                  !selectedBankAccount ||
                  !selectedPaymentMethod ||
                  !paymentAmount
                }
              >
                Add
              </Button>
            </TableCell>
          </TableRow>

          {/* Payment Items */}
          {payments.map((payment, index) => (
            <TableRow key={index} className="hover:bg-slate-50">
              <TableCell className="text-center text-xs font-medium">
                {index + 1}
              </TableCell>
              <TableCell className="text-xs">
                {payment.bankAccount.accountHolderName} -{" "}
                {payment.bankAccount.accountNumber}
              </TableCell>
              <TableCell className="text-xs">{payment.paymentMethod}</TableCell>
              <TableCell className="text-center text-xs font-medium">
                ₹{parseFloat(payment.amount).toFixed(2)}
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 text-xs"
                  onClick={() =>
                    setPayments(payments.filter((_, i) => i !== index))
                  }
                >
                  Del
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {/* Totals Row */}
          {payments.length > 0 && (
            <>
              <TableRow className="bg-slate-100">
                <TableCell
                  colSpan={3}
                  className="text-right text-sm font-semibold"
                >
                  Total Paid:
                </TableCell>
                <TableCell className="text-center text-sm font-bold">
                  ₹{totalPaid.toFixed(2)}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow className="bg-orange-50">
                <TableCell
                  colSpan={3}
                  className="text-right text-sm font-semibold"
                >
                  Amount Not Paid:
                </TableCell>
                <TableCell
                  className={`text-center text-sm font-bold ${
                    amountNotPaid > 0 ? "text-orange-600" : "text-green-600"
                  }`}
                >
                  ₹{amountNotPaid.toFixed(2)}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
