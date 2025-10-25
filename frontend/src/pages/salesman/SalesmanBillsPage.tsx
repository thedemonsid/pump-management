import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSalesmanNozzleShiftStore } from "@/store/salesman-nozzle-shift-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Receipt, Eye, Plus, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactSelect, { type CSSObjectWithLabel } from "react-select";
import { format } from "date-fns";
import { SalesmanBillService } from "@/services/salesman-bill-service";
import { CustomerService } from "@/services/customer-service";
import { ProductService } from "@/services/product-service";
import { toast } from "sonner";
import type {
  SalesmanNozzleShiftResponse,
  SalesmanBillResponse,
  Customer,
  Product,
  CreateSalesmanBillRequest,
} from "@/types";

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
    fontSize: "16px",
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
    fontSize: "16px",
  }),
  menu: (provided: CSSObjectWithLabel) => ({
    ...provided,
    zIndex: 9999,
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
  }),
  menuPortal: (base: CSSObjectWithLabel) => ({ ...base, zIndex: 9999 }),
};

export function SalesmanBillsPage() {
  const { user } = useAuth();
  const { activeShifts, fetchActiveShifts } = useSalesmanNozzleShiftStore();

  const [isCreateBillDialogOpen, setIsCreateBillDialogOpen] = useState(false);
  const [isBillsDialogOpen, setIsBillsDialogOpen] = useState(false);
  const [selectedShiftForBill, setSelectedShiftForBill] =
    useState<SalesmanNozzleShiftResponse | null>(null);
  const [selectedShiftForView, setSelectedShiftForView] =
    useState<SalesmanNozzleShiftResponse | null>(null);
  const [shiftBills, setShiftBills] = useState<SalesmanBillResponse[]>([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [billForm, setBillForm] = useState({
    customerId: "",
    productId: "",
    quantity: "",
    vehicleNo: "",
    driverName: "",
  });

  useEffect(() => {
    if (user?.userId) {
      fetchActiveShifts(user.userId);
    }
  }, [user?.userId, fetchActiveShifts]);

  const handleCreateBill = async (shift: SalesmanNozzleShiftResponse) => {
    setSelectedShiftForBill(shift);
    setIsCreateBillDialogOpen(true);
    setLoadingCustomers(true);
    setLoadingProducts(true);
    try {
      const [customersData, productsData] = await Promise.all([
        CustomerService.getAll(),
        ProductService.getAll(),
      ]);
      setCustomers(customersData);
      setProducts(
        productsData.filter((product) => product.productType === "FUEL")
      );
    } catch {
      toast.error("Failed to load customers and products");
    } finally {
      setLoadingCustomers(false);
      setLoadingProducts(false);
    }
  };

  const handleSubmitBill = async () => {
    if (!selectedShiftForBill || !user?.pumpMasterId) return;

    try {
      const nextBillNo = await SalesmanBillService.getNextBillNo();
      const selectedProduct = products.find((p) => p.id === billForm.productId);
      if (!selectedProduct) {
        toast.error("Selected product not found");
        return;
      }

      const billData: CreateSalesmanBillRequest = {
        pumpMasterId: user.pumpMasterId,
        billNo: nextBillNo,
        billDate: new Date().toISOString().split("T")[0],
        customerId: billForm.customerId,
        productId: billForm.productId,
        salesmanNozzleShiftId: selectedShiftForBill.id,
        rateType: "EXCLUDING_GST",
        quantity: parseFloat(billForm.quantity),
        rate: selectedProduct.salesRate,
        vehicleNo: billForm.vehicleNo,
        driverName: billForm.driverName,
      };

      await SalesmanBillService.create(billData);
      toast.success("Bill created successfully");
      setIsCreateBillDialogOpen(false);
      setSelectedShiftForBill(null);
      setBillForm({
        customerId: "",
        productId: "",
        quantity: "",
        vehicleNo: "",
        driverName: "",
      });
      if (user?.userId) {
        fetchActiveShifts(user.userId);
      }
    } catch {
      toast.error("Failed to create bill");
    }
  };

  const handleViewBills = async (shift: SalesmanNozzleShiftResponse) => {
    setSelectedShiftForView(shift);
    setLoadingBills(true);
    setIsBillsDialogOpen(true);

    try {
      const bills = await SalesmanBillService.getByShift(shift.id!);
      setShiftBills(bills);
    } catch (error) {
      console.error("Failed to load bills for shift:", error);
      setShiftBills([]);
    } finally {
      setLoadingBills(false);
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    return format(new Date(dateTimeStr), "dd/MM/yyyy HH:mm");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatFuelQuantity = (quantity: number) => {
    return (
      new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }).format(quantity) + " L"
    );
  };

  if (user?.role !== "SALESMAN") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Access Denied
          </h2>
          <p className="text-muted-foreground mt-2">
            This page is only accessible to salesmen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Bills</h1>
        <p className="text-muted-foreground">
          Create and manage bills for your active shifts
        </p>
      </div>

      {activeShifts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Active Shifts</p>
              <p className="text-sm">
                You need to have an active shift to create bills
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeShifts.map((shift) => (
            <Card key={shift.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {shift.nozzleName || "Unknown Nozzle"}
                </CardTitle>
                <CardDescription>
                  Started: {formatDateTime(shift.startDateTime)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Product:</span>
                  <Badge variant="secondary">{shift.productName}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Opening Balance:
                  </span>
                  <span className="font-medium">
                    {formatFuelQuantity(shift.openingBalance)}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => handleCreateBill(shift)}
                    className="w-full"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Bill
                  </Button>
                  <Button
                    onClick={() => handleViewBills(shift)}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Bills
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Bill Dialog */}
      <Dialog
        open={isCreateBillDialogOpen}
        onOpenChange={setIsCreateBillDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Bill</DialogTitle>
            <DialogDescription>
              Create a credit bill for shift at{" "}
              {selectedShiftForBill?.nozzleName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="customer">Customer *</Label>
              <ReactSelect
                id="customer"
                options={customers.map((c) => ({
                  value: c.id!,
                  label: c.customerName,
                }))}
                value={
                  billForm.customerId
                    ? {
                        value: billForm.customerId,
                        label:
                          customers.find((c) => c.id === billForm.customerId)
                            ?.customerName || "",
                      }
                    : null
                }
                onChange={(option) =>
                  setBillForm({ ...billForm, customerId: option?.value || "" })
                }
                isLoading={loadingCustomers}
                placeholder="Select customer..."
                styles={selectStyles}
                menuPortalTarget={document.body}
              />
            </div>

            <div>
              <Label htmlFor="product">Product *</Label>
              <ReactSelect
                id="product"
                options={products.map((p) => ({
                  value: p.id!,
                  label: `${p.productName} (${formatCurrency(p.salesRate)}/L)`,
                }))}
                value={
                  billForm.productId
                    ? {
                        value: billForm.productId,
                        label:
                          products.find((p) => p.id === billForm.productId)
                            ?.productName || "",
                      }
                    : null
                }
                onChange={(option) =>
                  setBillForm({ ...billForm, productId: option?.value || "" })
                }
                isLoading={loadingProducts}
                placeholder="Select product..."
                styles={selectStyles}
                menuPortalTarget={document.body}
              />
            </div>

            <div>
              <Label htmlFor="quantity">Quantity (Liters) *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.001"
                value={billForm.quantity}
                onChange={(e) =>
                  setBillForm({ ...billForm, quantity: e.target.value })
                }
                placeholder="0.000"
              />
            </div>

            <div>
              <Label htmlFor="vehicleNo">Vehicle Number</Label>
              <Input
                id="vehicleNo"
                value={billForm.vehicleNo}
                onChange={(e) =>
                  setBillForm({ ...billForm, vehicleNo: e.target.value })
                }
                placeholder="Enter vehicle number"
              />
            </div>

            <div>
              <Label htmlFor="driverName">Driver Name</Label>
              <Input
                id="driverName"
                value={billForm.driverName}
                onChange={(e) =>
                  setBillForm({ ...billForm, driverName: e.target.value })
                }
                placeholder="Enter driver name"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateBillDialogOpen(false);
                setBillForm({
                  customerId: "",
                  productId: "",
                  quantity: "",
                  vehicleNo: "",
                  driverName: "",
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitBill}
              disabled={
                !billForm.customerId ||
                !billForm.productId ||
                !billForm.quantity
              }
            >
              <Receipt className="h-4 w-4 mr-2" />
              Create Bill
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Bills Dialog */}
      <Dialog open={isBillsDialogOpen} onOpenChange={setIsBillsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Bills for Shift - {selectedShiftForView?.nozzleName}
            </DialogTitle>
            <DialogDescription>
              Credit bills created during this shift
            </DialogDescription>
          </DialogHeader>

          {loadingBills ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : shiftBills.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bills created for this shift</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill No</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shiftBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">
                        {bill.billNo}
                      </TableCell>
                      <TableCell>{bill.customerName}</TableCell>
                      <TableCell>{bill.productName}</TableCell>
                      <TableCell className="text-right">
                        {formatFuelQuantity(bill.quantity)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(bill.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
