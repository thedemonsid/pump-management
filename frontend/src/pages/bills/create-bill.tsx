import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { type SelectInstance } from 'react-select';
import { CustomerService } from '@/services/customer-service';
import { ProductService } from '@/services/product-service';
import { BankAccountService } from '@/services/bank-account-service';
import type { Customer } from '@/types/customer';
import type { Product } from '@/types/product';
import type { BankAccount } from '@/types/bank-account';
import { BillHeader } from '@/components/bills/BillHeader';
import { BillItemsTable } from '@/components/bills/BillItemsTable';
import { PaymentsTable } from '@/components/bills/PaymentsTable';
import { useBillStore } from '@/store/bill-store';
import type { CreateBillRequest } from '@/types';
import { DEFAULT_PUMP_INFO } from '@/types';

interface LocalBillItem {
  product: string;
  quantity: string;
  price: string;
  total: string;
  productId: string;
  discount: string;
  gst: string;
}

interface PaymentEntry {
  bankAccount: BankAccount;
  paymentMethod: string;
  amount: string;
}

const CreateBill = () => {
  const { createBill, loading, nextBillNo, getNextBillNo } = useBillStore();
  const [billItems, setBillItems] = useState<LocalBillItem[]>([]);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [billDate, setBillDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [gstIncluded, setGstIncluded] = useState<string>('');
  const [paymentType, setPaymentType] = useState<string>('');
  const [itemDiscount, setItemDiscount] = useState('0');
  const [itemGst, setItemGst] = useState('0');
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const bankAccountRef = useRef<SelectInstance<
    { value: BankAccount; label: string },
    false
  > | null>(null);
  const productSelectRef = useRef<SelectInstance<
    { value: Product; label: string },
    false
  > | null>(null);

  // React Select states
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBankAccount, setSelectedBankAccount] =
    useState<BankAccount | null>(null);

  // Fetch customers, products, and bank accounts on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [customerData, productData, bankAccountData] = await Promise.all([
          CustomerService.getAll(),
          ProductService.getAll(),
          BankAccountService.getAll(),
        ]);
        setCustomers(customerData);
        setProducts(productData);
        setBankAccounts(bankAccountData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    loadData();
  }, []);

  // Fetch next bill number on component mount
  useEffect(() => {
    const fetchNextBillNo = async () => {
      try {
        await getNextBillNo();
      } catch (error) {
        console.error('Failed to fetch next bill number:', error);
      }
    };
    fetchNextBillNo();
  }, [getNextBillNo]);

  // Calculate totals for passing to components
  const subtotal = billItems.reduce(
    (sum, item) => sum + parseFloat(item.total),
    0
  );
  const finalTotal = subtotal;

  // Handle bill creation
  const handleCreateBill = async () => {
    if (!selectedCustomer?.id || billItems.length === 0) {
      return;
    }

    const customerId = selectedCustomer.id;

    const billRequest: CreateBillRequest = {
      pumpMasterId: DEFAULT_PUMP_INFO.id!,
      billNo: nextBillNo || 1,
      billDate,
      customerId,
      paymentType: (paymentType?.toUpperCase() === 'CASH'
        ? 'CASH'
        : 'CREDIT') as 'CASH' | 'CREDIT',
      rateType: gstIncluded === 'including' ? 'INCLUDING_GST' : 'EXCLUDING_GST',
      billItems: billItems.map((item) => ({
        productId: item.productId,
        quantity: Math.round(parseFloat(item.quantity) * 100) / 100,
        rate: Math.round(parseFloat(item.price) * 100) / 100,
        gst: Math.round((parseFloat(item.gst) || 0) * 100) / 100,
        discount: Math.round((parseFloat(item.discount) || 0) * 100) / 100,
      })),
      payments: payments
        .filter((payment) => payment.bankAccount.id)
        .map((payment) => ({
          pumpMasterId: DEFAULT_PUMP_INFO.id!,
          billId: '', // Will be set after bill creation
          customerId,
          bankAccountId: payment.bankAccount.id!,
          amount: Math.round(parseFloat(payment.amount) * 100) / 100,
          paymentDate: new Date().toISOString(),
          paymentMethod: payment.paymentMethod as
            | 'CASH'
            | 'UPI'
            | 'RTGS'
            | 'NEFT'
            | 'IMPS'
            | 'CHEQUE',
          referenceNumber: `REF-${Date.now()}`, // Generate a reference
          notes: '',
        })),
    };

    try {
      await createBill(billRequest);
      // Reset form or navigate
      setBillItems([]);
      setPayments([]);
      setSelectedCustomer(null);
      setPaymentType('');
    } catch (error) {
      console.error('Failed to create bill:', error);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Bill Header */}
      <BillHeader
        billDate={billDate}
        setBillDate={setBillDate}
        customers={customers}
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
        paymentType={paymentType}
        setPaymentType={setPaymentType}
        gstIncluded={gstIncluded}
        setGstIncluded={setGstIncluded}
      />

      {/* Items Table */}
      <BillItemsTable
        billItems={billItems.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          discount: item.discount,
          gst: item.gst,
        }))}
        setBillItems={(
          items: {
            product: string;
            quantity: string;
            price: string;
            total: string;
          }[]
        ) => {
          const transformedItems = items.map((item) => ({
            ...item,
            productId: selectedProduct?.id || '',
            discount: '0',
            gst: '0',
          }));
          setBillItems(transformedItems);
        }}
        products={products}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        quantity={quantity}
        setQuantity={setQuantity}
        price={price}
        setPrice={setPrice}
        productSelectRef={productSelectRef}
        itemDiscount={itemDiscount}
        setItemDiscount={setItemDiscount}
        itemGst={itemGst}
        setItemGst={setItemGst}
        onAddItem={(item) => {
          setBillItems([...billItems, item]);
          setSelectedProduct(null);
          setQuantity('');
          setPrice('');
          setItemDiscount('0');
          setItemGst('0');
        }}
      />

      {/* Payments Table */}
      {billItems.length > 0 && (
        <PaymentsTable
          payments={payments}
          setPayments={setPayments}
          bankAccounts={bankAccounts}
          selectedBankAccount={selectedBankAccount}
          setSelectedBankAccount={setSelectedBankAccount}
          selectedPaymentMethod={selectedPaymentMethod}
          setSelectedPaymentMethod={setSelectedPaymentMethod}
          paymentAmount={paymentAmount}
          setPaymentAmount={setPaymentAmount}
          bankAccountRef={bankAccountRef}
          finalTotal={finalTotal}
        />
      )}

      {/* Save Button */}
      {billItems.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button
            className="px-8"
            onClick={handleCreateBill}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Bill'}
          </Button>
        </div>
      )}
    </div>
  );
};
export default CreateBill;
