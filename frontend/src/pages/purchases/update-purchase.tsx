import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import type { UpdatePurchase as UpdatePurchaseType } from "@/types/purchase";
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

const UpdatePurchase = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPurchaseById, editPurchase, loading } = usePurchaseStore();

  // State for purchase header
  const [purchaseDate, setPurchaseDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [gstIncluded, setGstIncluded] = useState<string>("");
  const [paymentType, setPaymentType] = useState<string>("");
  const [goodsReceivedBy, setGoodsReceivedBy] = useState("");

  // State for purchase items and payments
  const [purchaseItems, setPurchaseItems] = useState<LocalPurchaseItem[]>([]);
  const [payments, setPayments] = useState<PaymentEntry[]>([]);

  // React Select states
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankAccount, setSelectedBankAccount] =
    useState<BankAccount | null>(null);

  // Purchase item form states
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [itemTaxPercentage, setItemTaxPercentage] = useState("");

  // Payment form states
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState("");

  // Refs for react-select
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productSelectRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bankAccountRef = useRef<any>(null);

  // Fetch purchase data and related data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        const [supplierData, productData, bankAccountData, purchaseData] =
          await Promise.all([
            SupplierService.getAll(),
            ProductService.getAll(),
            BankAccountService.getAll(),
            getPurchaseById(id),
          ]);

        setSuppliers(supplierData);
        setProducts(productData);
        setBankAccounts(bankAccountData);

        if (purchaseData) {
          // Set purchase header data
          setPurchaseDate(purchaseData.purchaseDate);
          setInvoiceNumber(purchaseData.invoiceNumber);
          setPaymentType(
            purchaseData.paymentType === "CASH" ? "cash" : "credit"
          );
          setGstIncluded(
            purchaseData.rateType === "INCLUDING_GST"
              ? "including"
              : "excluding"
          );
          setGoodsReceivedBy(purchaseData.goodsReceivedBy || "");

          // Find and set the selected supplier
          const supplier = supplierData.find(
            (s) => s.id === purchaseData.supplierId
          );
          setSelectedSupplier(supplier || null);

          // Convert purchase items to local format
          const localItems: LocalPurchaseItem[] =
            purchaseData.purchaseItems.map((item) => ({
              product: item.productName || "",
              quantity: item.quantity.toString(),
              price: item.purchaseRate.toString(),
              total: item.amount.toString(),
              productId: item.productId,
              taxPercentage: item.taxPercentage.toString(),
              purchaseUnit: item.purchaseUnit,
              addToStock:
                item.addToStock !== undefined ? item.addToStock : true,
            }));
          setPurchaseItems(localItems);

          // Store payments info - try to match with full bank account data
          if (purchaseData.supplierPayments) {
            const paymentEntries: PaymentEntry[] =
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              purchaseData.supplierPayments.map((payment: any) => {
                const bankAccount = bankAccountData.find(
                  (ba) => ba.id === payment.bankAccountId
                );
                return {
                  bankAccount:
                    bankAccount ||
                    ({
                      id: payment.bankAccountId,
                      accountHolderName: payment.bankAccountName || "N/A",
                      accountNumber: "",
                      ifscCode: "",
                      bank: "",
                      branch: "",
                      pumpMasterId: "",
                      openingBalance: 0,
                      openingBalanceDate: "",
                    } as BankAccount),
                  paymentMethod: payment.paymentMethod,
                  amount: payment.amount.toString(),
                };
              });
            setPayments(paymentEntries);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    loadData();
  }, [id, getPurchaseById]);

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

  // Handle purchase update
  const handleUpdatePurchase = async () => {
    if (!id) {
      return;
    }

    // Validate required fields
    if (!selectedSupplier) {
      alert("Please select a supplier");
      return;
    }

    if (purchaseItems.length === 0) {
      alert("Please add at least one purchase item");
      return;
    }

    if (paymentType === "cash" && payments.length === 0) {
      alert("Please add at least one payment for CASH payment type");
      return;
    }

    // Validate total payment matches net amount for CASH
    if (paymentType === "cash") {
      const totalPayments = payments.reduce(
        (sum, p) => sum + parseFloat(p.amount),
        0
      );
      const netAmount = totals.netAmount;
      if (Math.abs(totalPayments - netAmount) > 0.01) {
        alert(
          `For CASH payment, total payments (₹${totalPayments.toFixed(
            2
          )}) must match the net amount (₹${netAmount.toFixed(2)})`
        );
        return;
      }
    }

    // Build purchase request with all items and payments (at this point supplier is guaranteed to exist)
    const purchaseRequest: UpdatePurchaseType = {
      purchaseDate,
      invoiceNumber,
      supplierId: selectedSupplier.id!,
      paymentType: (paymentType.toUpperCase() === "CASH"
        ? "CASH"
        : "CREDIT") as "CASH" | "CREDIT",
      rateType: (gstIncluded === "including"
        ? "INCLUDING_GST"
        : "EXCLUDING_GST") as "INCLUDING_GST" | "EXCLUDING_GST",
      goodsReceivedBy: goodsReceivedBy || undefined,
    };

    // Only include purchaseItems if there are any with valid data
    if (purchaseItems.length > 0) {
      purchaseRequest.purchaseItems = purchaseItems
        .filter(
          (item) =>
            item.productId &&
            !isNaN(parseFloat(item.quantity)) &&
            !isNaN(parseFloat(item.price))
        )
        .map((item) => ({
          productId: item.productId,
          quantity: parseFloat(item.quantity),
          purchaseRate: parseFloat(item.price),
          purchaseUnit: item.purchaseUnit,
          taxPercentage: parseFloat(item.taxPercentage) || 0,
          addToStock: item.addToStock,
        }));
    }

    // Only include payments if there are any with valid bank accounts
    if (payments.length > 0) {
      purchaseRequest.payments = payments
        .filter((payment) => payment.bankAccount.id) // Only include payments with valid bank account IDs
        .map((payment) => ({
          pumpMasterId: DEFAULT_PUMP_INFO.id!,
          supplierId: selectedSupplier.id!,
          bankAccountId: payment.bankAccount.id!,
          paymentMethod: payment.paymentMethod.toUpperCase() as
            | "CASH"
            | "UPI"
            | "RTGS"
            | "NEFT"
            | "IMPS"
            | "CHEQUE",
          amount: parseFloat(payment.amount),
          // Backend expects LocalDateTime format (ISO 8601 with time)
          paymentDate: `${purchaseDate}T${new Date()
            .toTimeString()
            .substring(0, 8)}`,
          referenceNumber:
            payment.paymentMethod.toUpperCase() === "CASH"
              ? "CASH-PAYMENT"
              : `${payment.paymentMethod.toUpperCase()}-${Date.now()}`,
        }));
    }

    console.log(
      "Sending purchase update request:",
      JSON.stringify(purchaseRequest, null, 2)
    );

    try {
      await editPurchase(id, purchaseRequest);
      navigate("/purchases");
    } catch (error) {
      console.error("Failed to update purchase:", error);
      // Show detailed error to user
      if (error && typeof error === "object" && "response" in error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = (error as any).response;
        if (response?.data?.message) {
          alert(`Failed to update purchase: ${response.data.message}`);
        } else {
          alert(
            `Failed to update purchase: ${JSON.stringify(
              response?.data || error
            )}`
          );
        }
      } else {
        alert(`Failed to update purchase: ${error}`);
      }
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Update Purchase</h2>
        <Button variant="outline" onClick={() => navigate("/purchases")}>
          Back to Purchases
        </Button>
      </div>

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

      {/* Add Item Table */}
      <PurchaseItemsTable
        products={products}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        quantity={quantity}
        setQuantity={setQuantity}
        price={price}
        setPrice={setPrice}
        itemTaxPercentage={itemTaxPercentage}
        setItemTaxPercentage={setItemTaxPercentage}
        productSelectRef={productSelectRef}
        onAddItem={(item) => {
          setPurchaseItems([...purchaseItems, item]);
        }}
      />

      {/* Items List */}
      {purchaseItems.length > 0 && (
        <PurchaseItemsList
          purchaseItems={purchaseItems}
          setPurchaseItems={setPurchaseItems}
          gstIncluded={gstIncluded}
          paymentType={paymentType}
          totals={totals}
        />
      )}

      {/* Supplier Payments Table */}
      {paymentType === "cash" && (
        <SupplierPaymentsTable
          bankAccounts={bankAccounts}
          selectedBankAccount={selectedBankAccount}
          setSelectedBankAccount={setSelectedBankAccount}
          selectedPaymentMethod={paymentMethod}
          setSelectedPaymentMethod={setPaymentMethod}
          paymentAmount={paymentAmount}
          setPaymentAmount={setPaymentAmount}
          payments={payments}
          setPayments={setPayments}
          bankAccountRef={bankAccountRef}
          finalTotal={totals.netAmount}
        />
      )}

      {/* Save Button */}
      <div className="flex justify-center gap-4 pt-4">
        <Button
          variant="outline"
          onClick={() => navigate("/purchases")}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          className="px-8"
          onClick={handleUpdatePurchase}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Purchase"}
        </Button>
      </div>
    </div>
  );
};

export default UpdatePurchase;
