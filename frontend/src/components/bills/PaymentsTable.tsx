import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ReactSelect, { type SelectInstance } from 'react-select';
import type { BankAccount } from '@/types/bank-account';

interface PaymentEntry {
  bankAccount: BankAccount;
  paymentMethod: string;
  amount: string;
}

interface PaymentsTableProps {
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

export const PaymentsTable = ({
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
}: PaymentsTableProps) => {
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
      setSelectedPaymentMethod('');
      setPaymentAmount('');
      setTimeout(() => bankAccountRef.current?.inputRef?.focus(), 0);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
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
          <TableCell className="text-center text-muted-foreground">+</TableCell>
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
              className="border-0 bg-transparent text-xs focus:bg-white"
              styles={{
                control: (provided) => ({
                  ...provided,
                  fontSize: '12px',
                  minHeight: '32px',
                  width: '200px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: 'white',
                  },
                  '&:focus-within': {
                    backgroundColor: 'white',
                  },
                }),
                option: (provided) => ({
                  ...provided,
                  fontSize: '12px',
                }),
                menu: (provided) => ({
                  ...provided,
                  zIndex: 9999,
                }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
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
                setSelectedPaymentMethod(option?.value || '')
              }
              options={[
                { value: 'UPI', label: 'UPI' },
                { value: 'Cash', label: 'Cash' },
                { value: 'Card', label: 'Card' },
                { value: 'Cheque', label: 'Cheque' },
                { value: 'Bank Transfer', label: 'Bank Transfer' },
              ]}
              placeholder="UPI/Cash/Card"
              className="border-0 bg-transparent text-xs focus:bg-white"
              styles={{
                control: (provided) => ({
                  ...provided,
                  fontSize: '12px',
                  minHeight: '32px',
                  width: '150px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: 'white',
                  },
                  '&:focus-within': {
                    backgroundColor: 'white',
                  },
                }),
                option: (provided) => ({
                  ...provided,
                  fontSize: '12px',
                }),
                menu: (provided) => ({
                  ...provided,
                  zIndex: 9999,
                }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
              menuPortalTarget={document.body}
            />
          </TableCell>
          <TableCell>
            <Input
              type="number"
              placeholder="0.00"
              className="border-0 bg-transparent text-sm text-center focus:bg-white h-8"
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
                !selectedBankAccount || !selectedPaymentMethod || !paymentAmount
              }
            >
              Add
            </Button>
          </TableCell>
        </TableRow>

        {/* Payment Entries */}
        {payments.map((payment, index) => (
          <TableRow key={index} className="hover:bg-slate-50">
            <TableCell className="text-center text-xs font-medium">
              {index + 1}
            </TableCell>
            <TableCell className="text-xs">
              {payment.bankAccount.accountHolderName} -{' '}
              {payment.bankAccount.accountNumber}
            </TableCell>
            <TableCell className="text-xs">{payment.paymentMethod}</TableCell>
            <TableCell className="text-center text-xs font-medium">
              ₹{payment.amount}
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

        {/* Payment Summary */}
        {payments.length > 0 && (
          <>
            <TableRow className="border-t-2 bg-slate-50">
              <TableCell colSpan={3} className="text-right text-xs font-medium">
                Total Paid:
              </TableCell>
              <TableCell className="text-center text-xs font-medium">
                ₹{totalPaid.toFixed(2)}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
            <TableRow className="bg-slate-50">
              <TableCell colSpan={3} className="text-right text-xs font-medium">
                Balance:
              </TableCell>
              <TableCell
                className={`text-center text-xs font-medium ${
                  amountNotPaid > 0
                    ? 'text-red-600'
                    : amountNotPaid < 0
                    ? 'text-orange-600'
                    : 'text-green-600'
                }`}
              >
                ₹{Math.abs(amountNotPaid).toFixed(2)}
                {amountNotPaid > 0 && ' (Due)'}
                {amountNotPaid < 0 && ' (Excess)'}
                {amountNotPaid === 0 && ' (Paid)'}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </>
        )}
      </TableBody>
    </Table>
  );
};
