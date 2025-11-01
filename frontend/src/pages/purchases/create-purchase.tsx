import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { type SelectInstance } from "react-select";
import { SupplierService } from "@/services/supplier-service";
import { ProductService } from "@/services/product-service";
import { BankAccountService } from "@/services/bank-account-service";
import type { Supplier } from "@/types/supplier";
import type { Product } from "@/types/product";
import type { BankAccount } from "@/types/bank-account";
import { PurchaseHeader } from "@/components/purchases/PurchaseHeader";
import { PurchaseItemsTable } from "@/components/purchases/PurchaseItemsTable";
import { PurchaseItemsList } from "@/components/purchases/PurchaseItemsList";
import { SupplierPaymentsTable } from "@/components/purchases/SupplierPaymentsTable";
import { usePurchaseStore } from "@/store/purchase-store";
import type { CreatePurchase as CreatePurchaseType } from "@/types/purchase";
import { DEFAULT_PUMP_INFO } from "@/types";

interface LocalPurchaseItem {
  product: string;
  quantity: string;
  price: string;
  total: string;
  productId: string;
  taxPercentage: string;
  purchaseUnit: string;
  addToStock: boolean;
}

interface PaymentEntry {
  bankAccount: BankAccount;
  paymentMethod: string;
  amount: string;
}

const CreatePurchase = () => {
  const { createPurchase, loading } = usePurchaseStore();
  const [purchaseItems, setPurchaseItems] = useState<LocalPurchaseItem[]>([]);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [gstIncluded, setGstIncluded] = useState<string>("");
  const [paymentType, setPaymentType] = useState<string>("");
  const [goodsReceivedBy, setGoodsReceivedBy] = useState("");
  const [itemTaxPercentage, setItemTaxPercentage] = useState("0");
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const bankAccountRef = useRef<SelectInstance<
    { value: BankAccount; label: string },
    false
  > | null>(null);
  const productSelectRef = useRef<SelectInstance<
    { value: Product; label: string },
    false
  > | null>(null);

  // React Select states
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBankAccount, setSelectedBankAccount] =
    useState<BankAccount | null>(null);

  // Fetch suppliers, products, and bank accounts on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [supplierData, productData, bankAccountData] = await Promise.all([
          SupplierService.getAll(),
          ProductService.getAll(),
          BankAccountService.getAll(),
        ]);
        setSuppliers(supplierData);
        setProducts(productData);
        setBankAccounts(bankAccountData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    loadData();
  }, []);

  // Calculate totals for passing to components
  const subtotal = purchaseItems.reduce(
    (sum, item) => sum + parseFloat(item.total),
    0
  );

  // Calculate tax and net amount for EXCLUDING GST
  const calculateTotalsWithTax = () => {
    if (gstIncluded === "excluding") {
      // For excluding GST, calculate tax on top of subtotal
      const totalTax = purchaseItems.reduce((sum, item) => {
        const itemAmount = parseFloat(item.total);
        const taxPercentage = parseFloat(item.taxPercentage || "0");
        const taxAmount = (itemAmount * taxPercentage) / 100;
        return sum + taxAmount;
      }, 0);
      return {
        subtotal,
        tax: totalTax,
        netAmount: subtotal + totalTax,
      };
    } else {
      // For including GST, the total is already the net amount
      return {
        subtotal,
        tax: 0,
        netAmount: subtotal,
      };
    }
  };

  const totals = calculateTotalsWithTax();
  const finalTotal = totals.netAmount;

  // Handle purchase creation
  const handleCreatePurchase = async () => {
    if (!selectedSupplier?.id || purchaseItems.length === 0) {
      return;
    }

    // Validation: CASH payment type requires payments to match total
    if (paymentType?.toUpperCase() === "CASH") {
      const totalPaid = payments.reduce(
        (sum, payment) => sum + parseFloat(payment.amount),
        0
      );
      if (Math.abs(totalPaid - finalTotal) > 0.01) {
        alert(
          "For CASH payment type, total payments must match the purchase total"
        );
        return;
      }
    }

    const supplierId = selectedSupplier.id;

    const purchaseRequest: CreatePurchaseType = {
      pumpMasterId: DEFAULT_PUMP_INFO.id!,
      supplierId,
      invoiceNumber,
      purchaseDate,
      paymentType: (paymentType?.toUpperCase() === "CASH"
        ? "CASH"
        : "CREDIT") as "CASH" | "CREDIT",
      rateType: gstIncluded === "including" ? "INCLUDING_GST" : "EXCLUDING_GST",
      goodsReceivedBy,
      purchaseItems: purchaseItems.map((item) => ({
        productId: item.productId,
        quantity: Math.round(parseFloat(item.quantity) * 100) / 100,
        purchaseUnit: item.purchaseUnit,
        purchaseRate: Math.round(parseFloat(item.price) * 100) / 100,
        taxPercentage:
          Math.round((parseFloat(item.taxPercentage) || 0) * 100) / 100,
        addToStock: item.addToStock,
      })),
      payments: payments
        .filter((payment) => payment.bankAccount.id)
        .map((payment) => ({
          pumpMasterId: DEFAULT_PUMP_INFO.id!,
          supplierId,
          bankAccountId: payment.bankAccount.id!,
          amount: Math.round(parseFloat(payment.amount) * 100) / 100,
          paymentDate: new Date().toISOString(),
          paymentMethod: payment.paymentMethod as
            | "CASH"
            | "UPI"
            | "RTGS"
            | "NEFT"
            | "IMPS"
            | "CHEQUE",
          referenceNumber: `REF-${Date.now()}`,
          notes: "",
        })),
    };

    try {
      await createPurchase(purchaseRequest);
      // Reset form
      setPurchaseItems([]);
      setPayments([]);
      setSelectedSupplier(null);
      setPaymentType("");
      setInvoiceNumber("");
      setGoodsReceivedBy("");
    } catch (error) {
      console.error("Failed to create purchase:", error);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Purchase Header */}
      <PurchaseHeader
        purchaseDate={purchaseDate}
        setPurchaseDate={setPurchaseDate}
        suppliers={suppliers}
        selectedSupplier={selectedSupplier}
        setSelectedSupplier={setSelectedSupplier}
        invoiceNumber={invoiceNumber}
        setInvoiceNumber={setInvoiceNumber}
        paymentType={paymentType}
        setPaymentType={setPaymentType}
        gstIncluded={gstIncluded}
        setGstIncluded={setGstIncluded}
        goodsReceivedBy={goodsReceivedBy}
        setGoodsReceivedBy={setGoodsReceivedBy}
      />

      {/* Add Item Form */}
      <PurchaseItemsTable
        products={products}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        quantity={quantity}
        setQuantity={setQuantity}
        price={price}
        setPrice={setPrice}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        productSelectRef={productSelectRef as any}
        itemTaxPercentage={itemTaxPercentage}
        setItemTaxPercentage={setItemTaxPercentage}
        onAddItem={(item) => {
          setPurchaseItems([...purchaseItems, item]);
          setSelectedProduct(null);
          setQuantity("");
          setPrice("");
          setItemTaxPercentage("0");
        }}
      />

      {/* Items List */}
      <PurchaseItemsList
        purchaseItems={purchaseItems}
        setPurchaseItems={setPurchaseItems}
        gstIncluded={gstIncluded}
        paymentType={paymentType}
        totals={totals}
      />

      {/* Payments Table */}
      {purchaseItems.length > 0 && (
        <SupplierPaymentsTable
          payments={payments}
          setPayments={setPayments}
          bankAccounts={bankAccounts}
          selectedBankAccount={selectedBankAccount}
          setSelectedBankAccount={setSelectedBankAccount}
          selectedPaymentMethod={selectedPaymentMethod}
          setSelectedPaymentMethod={setSelectedPaymentMethod}
          paymentAmount={paymentAmount}
          setPaymentAmount={setPaymentAmount}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          bankAccountRef={bankAccountRef as any}
          finalTotal={finalTotal}
        />
      )}

      {/* Save Button */}
      {purchaseItems.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button
            className="px-8"
            onClick={handleCreatePurchase}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Purchase"}
          </Button>
        </div>
      )}
    </div>
  );
};

export { CreatePurchase };
