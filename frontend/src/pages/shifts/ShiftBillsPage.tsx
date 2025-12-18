import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useShiftStore } from "@/store/shifts/shift-store";
import api from "@/services/api";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImageUpload } from "@/components/ui/image-upload";
import { DatePicker } from "@/components/shared/DatePicker";
import ReactSelect from "react-select";
import { SalesmanBillService } from "@/services/salesman-bill-service";
import { CustomerService } from "@/services/customer-service";
import { ProductService } from "@/services/product-service";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  AlertCircle,
  Receipt,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { format } from "date-fns";
import type {
  SalesmanBillResponse,
  CreateSalesmanBillRequest,
  Customer,
  Product,
} from "@/types";

interface Option {
  value: string;
  label: string;
}

export function ShiftBillsPage() {
  const { shiftId } = useParams<{ shiftId: string }>();
  const { user } = useAuth();
  const { currentShift, fetchShiftById } = useShiftStore();

  const [bills, setBills] = useState<SalesmanBillResponse[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBill, setIsCreatingBill] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    title: string;
  } | null>(null);

  // Check if user is admin or manager
  const isAdminOrManager = user?.role === "ADMIN" || user?.role === "MANAGER";

  // Form state
  const [billingMode, setBillingMode] = useState<"BY_QUANTITY" | "BY_AMOUNT">(
    "BY_AMOUNT"
  );
  const [paymentType, setPaymentType] = useState<"CASH" | "CREDIT">("CASH");
  const [selectedCustomer, setSelectedCustomer] = useState<Option | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Option | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [requestedAmount, setRequestedAmount] = useState<string>("");
  const [rate, setRate] = useState<string>("");
  const [vehicleNo, setVehicleNo] = useState<string>("NA");
  const [driverName, setDriverName] = useState<string>("NA");

  // Date fields
  const [billDate, setBillDate] = useState<Date | undefined>(new Date());
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());

  // Cash payment fields
  const [cashPaymentMethod, setCashPaymentMethod] = useState<Option>({
    value: "CASH",
    label: "Cash",
  });
  const [cashReferenceNumber, setCashReferenceNumber] = useState<string>("NA");
  const [cashNotes, setCashNotes] = useState<string>("");

  const [meterImage, setMeterImage] = useState<File | null>(null);
  const [vehicleImage, setVehicleImage] = useState<File | null>(null);
  const [extraImage, setExtraImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!shiftId) return;

      setIsLoading(true);
      try {
        // Load shift, bills, customers, and products in parallel
        const [, billsData, customersData, productsData] = await Promise.all([
          fetchShiftById(shiftId),
          SalesmanBillService.getByShift(shiftId),
          CustomerService.getAll(),
          ProductService.getAll(),
        ]);

        setBills(billsData);
        setCustomers(customersData);
        setProducts(productsData);
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
    setBillingMode("BY_AMOUNT");
    setPaymentType("CASH");
    setSelectedCustomer(null);
    setSelectedProduct(null);
    setQuantity("");
    setRequestedAmount("");
    setRate("");
    setVehicleNo("NA");
    setDriverName("NA");
    setBillDate(new Date());
    setPaymentDate(new Date());
    setCashPaymentMethod({ value: "CASH", label: "Cash" });
    setCashReferenceNumber("NA");
    setCashNotes("");
    setMeterImage(null);
    setVehicleImage(null);
    setExtraImage(null);
    setError(null);
  };

  const handleProductChange = (option: Option | null) => {
    setSelectedProduct(option);
    if (option) {
      const product = products.find((p) => p.id === option.value);
      if (product?.salesRate) {
        setRate(product.salesRate.toString());
      }
    }
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!selectedCustomer) {
      setError("Please select a customer");
      return;
    }
    if (!selectedProduct) {
      setError("Please select a product");
      return;
    }

    // Validate based on billing mode
    if (billingMode === "BY_QUANTITY") {
      if (!quantity || parseFloat(quantity) <= 0) {
        setError("Please enter a valid quantity");
        return;
      }
    } else {
      if (!requestedAmount || parseFloat(requestedAmount) <= 0) {
        setError("Please enter a valid amount");
        return;
      }
    }

    if (!rate || parseFloat(rate) <= 0) {
      setError("Please enter a valid rate");
      return;
    }
    if (!vehicleNo || vehicleNo.trim() === "") {
      setError("Please enter a vehicle number");
      return;
    }
    if (!driverName || driverName.trim() === "") {
      setError("Please enter a driver name");
      return;
    }

    // Validate cash payment if payment type is CASH
    if (paymentType === "CASH") {
      if (!cashReferenceNumber || cashReferenceNumber.trim() === "") {
        setError("Please enter a reference number for cash payment");
        return;
      }
    }

    setIsCreatingBill(true);

    try {
      // Calculate bill amount
      const billAmount =
        billingMode === "BY_QUANTITY"
          ? parseFloat(quantity) * parseFloat(rate)
          : parseFloat(requestedAmount);

      const billData: CreateSalesmanBillRequest = {
        pumpMasterId: user?.pumpMasterId || "",
        salesmanShiftId: shiftId!,
        customerId: selectedCustomer.value,
        productId: selectedProduct.value,
        billNo: Date.now(), // Generate bill number (backend should handle this)
        billDate:
          billDate?.toISOString().split("T")[0] ||
          new Date().toISOString().split("T")[0],
        billingMode: billingMode,
        paymentType: paymentType,
        quantity:
          billingMode === "BY_QUANTITY" ? parseFloat(quantity) : undefined,
        requestedAmount:
          billingMode === "BY_AMOUNT" ? parseFloat(requestedAmount) : undefined,
        rate: parseFloat(rate),
        rateType: "INCLUDING_GST",
        vehicleNo: vehicleNo.trim(),
        driverName: driverName.trim(),
      };

      // Add cash payment details if payment type is CASH
      if (paymentType === "CASH") {
        billData.cashPayment = {
          amount: billAmount,
          paymentDate: paymentDate?.toISOString() || new Date().toISOString(),
          paymentMethod: cashPaymentMethod.value as
            | "CASH"
            | "UPI"
            | "RTGS"
            | "NEFT"
            | "IMPS"
            | "CHEQUE",
          referenceNumber: cashReferenceNumber.trim(),
          notes: cashNotes.trim() || undefined,
        };
      }

      await SalesmanBillService.create(billData, {
        meterImage: meterImage || undefined,
        vehicleImage: vehicleImage || undefined,
        extraImage: extraImage || undefined,
      });
      toast.success("Bill created successfully!");
      setIsSheetOpen(false);
      resetForm();
      // Reload data
      if (shiftId) {
        const billsData = await SalesmanBillService.getByShift(shiftId);
        setBills(billsData);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to create bill";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreatingBill(false);
    }
  };

  const handleDeleteBill = async (billId: string) => {
    if (!confirm("Are you sure you want to delete this bill?")) return;

    try {
      await SalesmanBillService.delete(billId);
      toast.success("Bill deleted successfully!");
      // Reload bills
      if (shiftId) {
        const billsData = await SalesmanBillService.getByShift(shiftId);
        setBills(billsData);
      }
    } catch (err) {
      toast.error("Failed to delete bill");
      console.error(err);
    }
  };

  const handleImageClick = async (imageId: string, title: string) => {
    try {
      const response = await api.get(`/api/v1/files/${imageId}`, {
        responseType: "blob",
      });
      const imageUrl = URL.createObjectURL(response.data);
      setSelectedImage({ url: imageUrl, title });
      setIsImageDialogOpen(true);
    } catch (err) {
      toast.error("Failed to load image");
      console.error(err);
    }
  };

  const customerOptions: Option[] = customers.map((c) => ({
    value: c.id!,
    label: `${c.customerName} - ${c.phoneNumber || "N/A"}`,
  }));

  // Filter products based on nozzles assigned to the shift
  const allowedProductNames = new Set(
    currentShift?.nozzleAssignments
      ?.filter((assignment) => assignment.productName)
      .map((assignment) => assignment.productName?.toLowerCase()) || []
  );

  const productOptions: Option[] = products
    .filter((p) => {
      // If no nozzle assignments, allow all products (backward compatibility)
      if (allowedProductNames.size === 0) return true;

      // Always allow GENERAL products
      if (p.productType === "GENERAL") return true;

      // For FUEL products, only show those assigned to the salesman's nozzles
      if (p.productType === "FUEL") {
        return allowedProductNames.has(p.productName.toLowerCase());
      }

      return false;
    })
    .map((p) => ({
      value: p.id!,
      label: p.productName,
    }));

  const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);

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
          <div>
            <h1 className="text-2xl font-bold">Shift Bills</h1>
            <p className="text-sm text-muted-foreground">
              Credit sales during this shift
            </p>
          </div>
        </div>
        {(isShiftOpen || isAdminOrManager) && (
          <Button onClick={() => setIsSheetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Bill
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
              <p className="text-muted-foreground">Total Bills</p>
              <p className="font-medium">{bills.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Amount</p>
              <p className="font-medium">₹{totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bills</CardTitle>
          <CardDescription>
            {bills.length === 0
              ? "No bills created yet"
              : `${bills.length} bill(s) created`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bills.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No bills created during this shift
              </p>
              {isShiftOpen && (
                <Button
                  onClick={() => setIsSheetOpen(true)}
                  className="mt-4"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Bill
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Qty (L)</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead className="text-center">Images</TableHead>
                    {(isShiftOpen || isAdminOrManager) && (
                      <TableHead className="text-center">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">
                        {bill.billNo}
                      </TableCell>
                      <TableCell>
                        {format(new Date(bill.billDate), "PP")}
                      </TableCell>
                      <TableCell>{bill.customerName}</TableCell>
                      <TableCell>{bill.productName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            bill.paymentType === "CASH"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {bill.paymentType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {bill.quantity.toFixed(3)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ₹{bill.rate.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        ₹{bill.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>{bill.vehicleNo || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          {bill.meterImageId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() =>
                                handleImageClick(
                                  bill.meterImageId!,
                                  "Meter Image"
                                )
                              }
                            >
                              <div className="relative group">
                                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                  <ImageIcon className="h-4 w-4 text-blue-600" />
                                </div>
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                  Meter
                                </span>
                              </div>
                            </Button>
                          )}
                          {bill.vehicleImageId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() =>
                                handleImageClick(
                                  bill.vehicleImageId!,
                                  "Vehicle Image"
                                )
                              }
                            >
                              <div className="relative group">
                                <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                                  <ImageIcon className="h-4 w-4 text-green-600" />
                                </div>
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                  Vehicle
                                </span>
                              </div>
                            </Button>
                          )}
                          {bill.extraImageId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() =>
                                handleImageClick(
                                  bill.extraImageId!,
                                  "Extra Image"
                                )
                              }
                            >
                              <div className="relative group">
                                <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                                  <ImageIcon className="h-4 w-4 text-purple-600" />
                                </div>
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                  Extra
                                </span>
                              </div>
                            </Button>
                          )}
                          {!bill.meterImageId &&
                            !bill.vehicleImageId &&
                            !bill.extraImageId && (
                              <span className="text-muted-foreground text-sm">
                                -
                              </span>
                            )}
                        </div>
                      </TableCell>
                      {(isShiftOpen || isAdminOrManager) && (
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteBill(bill.id)}
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

      {/* Create Bill Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>Create Credit Bill</SheetTitle>
            <SheetDescription>
              Issue a credit sale bill to a customer
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleCreateBill} className="mt-6 space-y-6">
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
                isDisabled={isCreatingBill}
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

            {/* Product */}
            <div className="space-y-2">
              <Label>
                Product <span className="text-red-500">*</span>
              </Label>
              <ReactSelect
                options={productOptions}
                value={selectedProduct}
                onChange={handleProductChange}
                placeholder="Select product..."
                isDisabled={isCreatingBill}
                className="text-base"
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "40px",
                    fontSize: "16px",
                  }),
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </div>

            {/* Bill Date */}
            <DatePicker
              date={billDate}
              onDateChange={setBillDate}
              label="Bill Date (Optional)"
              disabled={isCreatingBill}
              helperText="Defaults to today if not specified"
            />

            {/* Billing Mode Toggle */}
            <div className="space-y-3 pt-2 border-t">
              <Label className="text-base">
                Billing Mode <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={
                    billingMode === "BY_QUANTITY" ? "default" : "outline"
                  }
                  onClick={() => {
                    setBillingMode("BY_QUANTITY");
                    setRequestedAmount("");
                  }}
                  disabled={isCreatingBill}
                  className="flex-1"
                >
                  By Quantity (Liters)
                </Button>
                <Button
                  type="button"
                  variant={billingMode === "BY_AMOUNT" ? "default" : "outline"}
                  onClick={() => {
                    setBillingMode("BY_AMOUNT");
                    setQuantity("");
                  }}
                  disabled={isCreatingBill}
                  className="flex-1"
                >
                  By Amount (₹)
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {billingMode === "BY_QUANTITY"
                  ? "Customer requests specific liters (e.g., 10L, 30L)"
                  : "Customer requests fuel worth specific amount (e.g., ₹1000, ₹2000)"}
              </p>
            </div>

            {/* Payment Type Toggle */}
            <div className="space-y-3 pt-2 border-t">
              <Label className="text-base">
                Payment Type <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={paymentType === "CREDIT" ? "default" : "outline"}
                  onClick={() => setPaymentType("CREDIT")}
                  disabled={isCreatingBill}
                  className="flex-1"
                >
                  Credit
                </Button>
                <Button
                  type="button"
                  variant={paymentType === "CASH" ? "default" : "outline"}
                  onClick={() => setPaymentType("CASH")}
                  disabled={isCreatingBill}
                  className="flex-1"
                >
                  Cash
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {paymentType === "CREDIT"
                  ? "Bill will be recorded as credit - payment can be collected later"
                  : "Payment must be collected immediately with the bill"}
              </p>
            </div>

            {/* Rate */}
            <div className="space-y-2">
              <Label htmlFor="rate">
                Rate per Liter <span className="text-red-500">*</span>
              </Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={rate}
                readOnly
                disabled={isCreatingBill}
                className="text-base bg-muted"
              />
            </div>

            {/* Conditional Fields Based on Billing Mode */}
            {billingMode === "BY_QUANTITY" ? (
              <>
                {/* Quantity Input */}
                <div className="space-y-2">
                  <Label htmlFor="quantity">
                    Quantity (Liters) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    disabled={isCreatingBill}
                    className="text-base"
                  />
                </div>

                {/* Calculated Amount Display */}
                {quantity && rate && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Calculated Amount:</span>
                      <span className="text-2xl font-bold text-primary">
                        ₹{(parseFloat(quantity) * parseFloat(rate)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="requestedAmount">
                    Amount (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="requestedAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(e.target.value)}
                    disabled={isCreatingBill}
                    className="text-base"
                  />
                </div>

                {/* Calculated Quantity Display */}
                {requestedAmount && rate && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Calculated Quantity:</span>
                      <span className="text-2xl font-bold text-primary">
                        {(
                          parseFloat(requestedAmount) / parseFloat(rate)
                        ).toFixed(3)}{" "}
                        L
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Vehicle Number */}
            <div className="space-y-2">
              <Label htmlFor="vehicleNo">
                Vehicle Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="vehicleNo"
                type="text"
                placeholder="NA"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                disabled={isCreatingBill}
                className="text-base"
                required
              />
            </div>

            {/* Driver Name */}
            <div className="space-y-2">
              <Label htmlFor="driverName">
                Driver Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="driverName"
                type="text"
                placeholder="NA"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                disabled={isCreatingBill}
                className="text-base"
                required
              />
            </div>

            {/* Cash Payment Details - Only show when payment type is CASH */}
            {paymentType === "CASH" && (
              <div className="space-y-4 pt-4 border-t border-primary/20 bg-primary/5 p-4 rounded-lg">
                <div>
                  <h3 className="text-sm font-semibold text-primary">
                    Cash Payment Details
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Payment will be recorded with the bill
                  </p>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label>
                    Payment Method <span className="text-red-500">*</span>
                  </Label>
                  <ReactSelect
                    options={[
                      { value: "CASH", label: "Cash" },
                      { value: "UPI", label: "UPI" },
                      { value: "RTGS", label: "RTGS" },
                      { value: "NEFT", label: "NEFT" },
                      { value: "IMPS", label: "IMPS" },
                      { value: "CHEQUE", label: "Cheque" },
                    ]}
                    value={cashPaymentMethod}
                    onChange={(option) =>
                      setCashPaymentMethod(
                        option || { value: "CASH", label: "Cash" }
                      )
                    }
                    isDisabled={isCreatingBill}
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
                  <Label htmlFor="cashReferenceNumber">
                    Reference Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cashReferenceNumber"
                    type="text"
                    placeholder="Transaction ID, Receipt No., etc."
                    value={cashReferenceNumber}
                    onChange={(e) => setCashReferenceNumber(e.target.value)}
                    disabled={isCreatingBill}
                    className="text-base"
                    required
                  />
                </div>

                {/* Payment Date */}
                <DatePicker
                  date={paymentDate}
                  onDateChange={setPaymentDate}
                  label="Payment Date (Optional)"
                  disabled={isCreatingBill}
                  helperText="Defaults to today if not specified"
                />

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="cashNotes">Notes</Label>
                  <Input
                    id="cashNotes"
                    type="text"
                    placeholder="Optional payment notes..."
                    value={cashNotes}
                    onChange={(e) => setCashNotes(e.target.value)}
                    disabled={isCreatingBill}
                    className="text-base"
                  />
                </div>

                {/* Payment Amount Display */}
                {((billingMode === "BY_QUANTITY" && quantity && rate) ||
                  (billingMode === "BY_AMOUNT" && requestedAmount)) && (
                  <div className="p-3 rounded-md bg-green-50 border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-900">
                        Payment Amount:
                      </span>
                      <span className="text-lg font-bold text-green-700">
                        ₹
                        {billingMode === "BY_QUANTITY"
                          ? (parseFloat(quantity) * parseFloat(rate)).toFixed(2)
                          : parseFloat(requestedAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Image Uploads */}
            <div className="space-y-4 pt-4 border-t">
              <div>
                <h3 className="text-sm font-medium">Images (Optional)</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload meter reading, vehicle, and other supporting images
                </p>
              </div>

              {/* Meter Image */}
              <ImageUpload
                id="meterImage"
                label="Meter Image"
                onChange={(file) => setMeterImage(file)}
                disabled={isCreatingBill}
              />

              {/* Vehicle Image */}
              <ImageUpload
                id="vehicleImage"
                label="Vehicle Image"
                onChange={(file) => setVehicleImage(file)}
                disabled={isCreatingBill}
              />

              {/* Extra Image */}
              <ImageUpload
                id="extraImage"
                label="Extra Image"
                onChange={(file) => setExtraImage(file)}
                disabled={isCreatingBill}
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
                disabled={isCreatingBill}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreatingBill}
                className="flex-1"
              >
                {isCreatingBill ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Bill"
                )}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Image Preview Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.title || "Image"}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            {selectedImage?.url && (
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                onLoad={() => {
                  // Cleanup the blob URL after image is loaded
                  if (selectedImage.url.startsWith("blob:")) {
                    // Keep it for viewing, cleanup will happen on dialog close
                  }
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
