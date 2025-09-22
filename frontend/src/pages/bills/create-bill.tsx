import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useRef } from 'react';

interface BillItem {
  product: string;
  quantity: string;
  price: string;
  total: string;
}

interface PaymentEntry {
  bankAccount: string;
  paymentMethod: string;
  amount: string;
}

const CreateBill = () => {
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [gstIncluded, setGstIncluded] = useState<string>('');
  const [paymentType, setPaymentType] = useState<string>('');
  const [fixedDiscount, setFixedDiscount] = useState('');
  const [gstPercent, setGstPercent] = useState('');
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const productInputRef = useRef<HTMLInputElement>(null);
  const bankAccountRef = useRef<HTMLInputElement>(null);

  const total =
    quantity && price
      ? (parseFloat(quantity) * parseFloat(price)).toFixed(2)
      : '0.00';

  const subtotal = billItems.reduce(
    (sum, item) => sum + parseFloat(item.total),
    0
  );
  const discountAmount = parseFloat(fixedDiscount) || 0;
  const discountedSubtotal = subtotal - discountAmount; // GST calculation based on inclusion setting
  let gstAmount = 0;
  let finalTotal = discountedSubtotal;

  if (gstIncluded === 'excluding') {
    gstAmount = discountedSubtotal * (parseFloat(gstPercent) / 100 || 0);
    finalTotal = discountedSubtotal + gstAmount;
  } else if (gstIncluded === 'including') {
    // If GST is included in prices, GST amount is already in the subtotal
    gstAmount =
      discountedSubtotal -
      discountedSubtotal / (1 + (parseFloat(gstPercent) / 100 || 0));
    finalTotal = discountedSubtotal; // GST already included
  }

  // Calculate payment summary
  const totalPaid = payments.reduce(
    (sum, payment) => sum + parseFloat(payment.amount),
    0
  );
  const amountNotPaid = finalTotal - totalPaid;

  const addItem = () => {
    if (product && quantity && price) {
      const newItem: BillItem = {
        product,
        quantity,
        price,
        total,
      };
      setBillItems([...billItems, newItem]);
      // Reset inputs
      setProduct('');
      setQuantity('');
      setPrice('');
      // Focus back to product input
      setTimeout(() => {
        productInputRef.current?.focus();
      }, 0);
    }
  };

  const addPayment = () => {
    if (selectedBankAccount && selectedPaymentMethod && paymentAmount) {
      const newPayment: PaymentEntry = {
        bankAccount: selectedBankAccount,
        paymentMethod: selectedPaymentMethod,
        amount: paymentAmount,
      };
      setPayments([...payments, newPayment]);
      // Reset inputs
      setSelectedBankAccount('');
      setSelectedPaymentMethod('');
      setPaymentAmount('');
      // Focus back to bank account select
      setTimeout(() => {
        bankAccountRef.current?.focus();
      }, 0);
    }
  };

  return (
    <div>
      <Table className="w-full border-collapse border border-gray-300">
        <TableCaption>Create Bills Faster than your tally.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="border border-gray-300 p-1 w-16">#</TableHead>
            <TableHead className="border border-gray-300 p-1">
              <Input
                placeholder="Bill No"
                className="h-8"
                value="NA"
                readOnly
              />
            </TableHead>
            <TableHead className="border border-gray-300 p-1">
              <div className="flex gap-1">
                <Input placeholder="Date" className="h-8 flex-1" />
                <Select value={paymentType} onValueChange={setPaymentType}>
                  <SelectTrigger className="h-8 flex-1">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">CASH</SelectItem>
                    <SelectItem value="credit">CREDIT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TableHead>
            <TableHead className="border border-gray-300 p-1">
              <Input placeholder="Customer" className="h-8" />
            </TableHead>
            <TableHead className="border border-gray-300 p-1">
              <Select value={gstIncluded} onValueChange={setGstIncluded}>
                <SelectTrigger className="h-8 w-full">
                  <SelectValue placeholder="GST Inclusion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="including">Including GST</SelectItem>
                  <SelectItem value="excluding">Excluding GST</SelectItem>
                </SelectContent>
              </Select>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="border border-gray-300 p-1 text-center font-medium">
              -
            </TableCell>
            <TableCell className="border border-gray-300 p-1">
              <Input
                placeholder="Product"
                className="h-8"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                ref={productInputRef}
              />
            </TableCell>
            <TableCell className="border border-gray-300 p-1">
              <div className="flex gap-1">
                <Input
                  placeholder="Quantity"
                  className="h-8 flex-1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                <Input
                  placeholder="Price"
                  className="h-8 flex-1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </TableCell>
            <TableCell className="border border-gray-300 p-1">
              <Input
                placeholder="Total"
                className="h-8"
                value={total}
                readOnly
              />
            </TableCell>
            <TableCell className="border border-gray-300 p-1">
              <Button className="h-8 w-full" onClick={addItem}>
                Add
              </Button>
            </TableCell>
          </TableRow>
          {billItems.length > 0 && (
            <TableRow className="bg-muted font-semibold text-sm">
              <TableCell className="border border-gray-300 p-2 text-center bg-muted/50">
                #
              </TableCell>
              <TableCell className="border border-gray-300 p-2 text-center bg-muted/50">
                Product
              </TableCell>
              <TableCell className="border border-gray-300 p-2 text-center bg-muted/50">
                <div className="flex gap-1">
                  <span className="flex-1">Qty</span>
                  <span className="flex-1">Price</span>
                </div>
              </TableCell>
              <TableCell className="border border-gray-300 p-2 text-center bg-muted/50">
                Total
              </TableCell>
              <TableCell className="border border-gray-300 p-2 text-center bg-muted/50">
                Action
              </TableCell>
            </TableRow>
          )}
          {billItems.map((item, index) => (
            <TableRow key={index} className="bg-accent">
              <TableCell className="border border-gray-300 p-1 text-center font-medium">
                {index + 1}
              </TableCell>
              <TableCell className="border border-gray-300 p-1">
                {item.product}
              </TableCell>
              <TableCell className="border border-gray-300 p-1">
                <div className="flex gap-1">
                  <span className="flex-1 text-center">{item.quantity}</span>
                  <span className="flex-1 text-center">{item.price}</span>
                </div>
              </TableCell>
              <TableCell className="border border-gray-300 p-1">
                {item.total}
              </TableCell>
              <TableCell className="border border-gray-300 p-1">
                <Button
                  className="h-8 w-full bg-destructive hover:bg-destructive/90"
                  onClick={() =>
                    setBillItems(billItems.filter((_, i) => i !== index))
                  }
                >
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {billItems.length > 0 && (
            <>
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell
                  colSpan={3}
                  className="border border-gray-300 p-2 text-right"
                >
                  Subtotal:
                </TableCell>
                <TableCell
                  colSpan={2}
                  className="border border-gray-300 p-2 text-center"
                >
                  ₹{subtotal.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell
                  colSpan={2}
                  className="border border-gray-300 p-2 text-right"
                >
                  Discount (₹):
                </TableCell>
                <TableCell className="border border-gray-300 p-1">
                  <Input
                    type="number"
                    placeholder="0"
                    className="h-8 text-center"
                    value={fixedDiscount}
                    onChange={(e) => setFixedDiscount(e.target.value)}
                  />
                </TableCell>
                <TableCell
                  colSpan={2}
                  className="border border-gray-300 p-2 text-center"
                >
                  -₹{discountAmount.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell
                  colSpan={2}
                  className="border border-gray-300 p-2 text-right"
                >
                  GST (%):
                </TableCell>
                <TableCell className="border border-gray-300 p-1">
                  <Input
                    type="number"
                    placeholder="18"
                    className="h-8 text-center"
                    value={gstPercent}
                    onChange={(e) => setGstPercent(e.target.value)}
                  />
                </TableCell>
                <TableCell
                  colSpan={2}
                  className="border border-gray-300 p-2 text-center"
                >
                  {gstIncluded === 'excluding'
                    ? `+₹${gstAmount.toFixed(2)}`
                    : gstIncluded === 'including'
                    ? `Included (₹${gstAmount.toFixed(2)})`
                    : 'Select GST inclusion'}
                </TableCell>
              </TableRow>
              <TableRow className="font-bold text-lg">
                <TableCell
                  colSpan={3}
                  className="border border-gray-300 p-3 text-right"
                >
                  Final Total:
                </TableCell>
                <TableCell
                  colSpan={2}
                  className="border border-gray-300 p-3 text-center"
                >
                  ₹{finalTotal.toFixed(2)}
                </TableCell>
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>

      {/* Payment Section */}
      <div className="mt-6">
        <Table className="w-full border-collapse border border-gray-300">
          <TableCaption>💳 Payment Details</TableCaption>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="border border-gray-300 p-2 text-center bg-muted/50">
                #
              </TableHead>
              <TableHead className="border border-gray-300 p-2 text-center bg-muted/50">
                Bank Account
              </TableHead>
              <TableHead className="border border-gray-300 p-2 text-center bg-muted/50">
                Payment Method
              </TableHead>
              <TableHead className="border border-gray-300 p-2 text-center bg-muted/50">
                Amount
              </TableHead>
              <TableHead className="border border-gray-300 p-2 text-center bg-muted/50">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Payment Input Row */}
            <TableRow>
              <TableCell className="border border-gray-300 p-1 text-center font-medium">
                -
              </TableCell>
              <TableCell className="border border-gray-300 p-1">
                <Input
                  placeholder="Bank Account"
                  className="h-8"
                  value={selectedBankAccount}
                  onChange={(e) => setSelectedBankAccount(e.target.value)}
                  ref={bankAccountRef}
                />
              </TableCell>
              <TableCell className="border border-gray-300 p-1">
                <Input
                  placeholder="Payment Method"
                  className="h-8"
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                />
              </TableCell>
              <TableCell className="border border-gray-300 p-1">
                <Input
                  type="number"
                  placeholder="Amount"
                  className="h-8 text-center"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </TableCell>
              <TableCell className="border border-gray-300 p-1">
                <Button className="h-8 w-full" onClick={addPayment}>
                  Add
                </Button>
              </TableCell>
            </TableRow>

            {/* Added Payments */}
            {payments.map((payment, index) => (
              <TableRow key={index} className="bg-secondary/20">
                <TableCell className="border border-gray-300 p-1 text-center font-medium">
                  {index + 1}
                </TableCell>
                <TableCell className="border border-gray-300 p-1 text-center">
                  <span className="px-2 py-1 bg-accent text-accent-foreground rounded text-sm font-medium">
                    {payment.bankAccount.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell className="border border-gray-300 p-1 text-center">
                  <span className="px-2 py-1 bg-accent text-accent-foreground rounded text-sm font-medium">
                    {payment.paymentMethod.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell className="border border-gray-300 p-1 text-center font-semibold">
                  ₹{payment.amount}
                </TableCell>
                <TableCell className="border border-gray-300 p-1">
                  <Button
                    className="h-8 w-full bg-destructive hover:bg-destructive/90"
                    onClick={() =>
                      setPayments(payments.filter((_, i) => i !== index))
                    }
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Final Summary */}
      <div className="mt-6">
        <Table className="w-full border-collapse border border-gray-300">
          <TableBody>
            <TableRow className="bg-muted/50">
              <TableCell
                colSpan={2}
                className="border border-gray-300 p-4 text-right text-lg font-semibold"
              >
                Bill Amount:
              </TableCell>
              <TableCell className="border border-gray-300 p-4 text-center text-xl font-bold text-primary">
                ₹{finalTotal.toFixed(2)}
              </TableCell>
            </TableRow>
            <TableRow className="bg-muted/50">
              <TableCell
                colSpan={2}
                className="border border-gray-300 p-4 text-right text-lg font-semibold"
              >
                Total Paid:
              </TableCell>
              <TableCell className="border border-gray-300 p-4 text-center text-xl font-bold text-secondary">
                ₹{totalPaid.toFixed(2)}
              </TableCell>
            </TableRow>
            <TableRow className="bg-muted/50">
              <TableCell
                colSpan={2}
                className="border border-gray-300 p-4 text-right text-lg font-semibold"
              >
                Amount Not Paid:
              </TableCell>
              <TableCell
                className={`border border-gray-300 p-4 text-center text-xl font-bold ${
                  amountNotPaid > 0
                    ? 'text-destructive'
                    : amountNotPaid < 0
                    ? 'text-destructive'
                    : 'text-secondary'
                }`}
              >
                ₹{Math.abs(amountNotPaid).toFixed(2)}
                {amountNotPaid > 0 && (
                  <div className="text-sm text-destructive">(Outstanding)</div>
                )}
                {amountNotPaid < 0 && (
                  <div className="text-sm text-destructive">(Overpaid)</div>
                )}
                {amountNotPaid === 0 && (
                  <div className="text-sm text-secondary">(Fully Paid)</div>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                colSpan={3}
                className="border border-gray-300 p-4 text-center"
              >
                <Button className="px-8 py-3 text-lg font-bold text-secondary-foreground">
                  💾 Save Bill
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CreateBill;
