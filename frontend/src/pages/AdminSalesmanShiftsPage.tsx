import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSalesmanNozzleShiftStore } from "@/store/salesman-nozzle-shift-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  Fuel,
  Eye,
  Receipt,
  User,
  Square,
  Play,
  CreditCard,
} from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactSelect, { type CSSObjectWithLabel } from "react-select";
import { format } from "date-fns";
import { SalesmanBillService } from "@/services/salesman-bill-service";
import { NozzleService } from "@/services/nozzle-service";
import { SalesmanService } from "@/services/salesman-service";
import { CustomerService } from "@/services/customer-service";
import { ProductService } from "@/services/product-service";
import { CreateShiftPaymentForm } from "@/pages/salesman-shifts/CreateShiftPaymentForm";
import { toast } from "sonner";
import type {
  SalesmanNozzleShiftResponse,
  SalesmanBillResponse,
  Nozzle,
  Salesman,
  Customer,
  Product,
  CreateSalesmanBillRequest,
} from "@/types";

// ReactSelect styling to match create-bill
const selectStyles = {
  control: (provided: CSSObjectWithLabel) => ({
    ...provided,
    minHeight: "36px",
    borderColor: "#e5e7eb", // gray-200
    backgroundColor: "#ffffff", // white
    "&:hover": {
      borderColor: "#9ca3af", // gray-400
    },
    boxShadow: "none",
    "&:focus-within": {
      borderColor: "#3b82f6", // blue-500
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
      ? "#3b82f6" // blue-500
      : state.isFocused
      ? "#dbeafe" // blue-100
      : "#ffffff", // white
    color: state.isSelected ? "#ffffff" : "#111827", // white : gray-900
    "&:hover": {
      backgroundColor: state.isSelected ? "#2563eb" : "#dbeafe", // blue-600 : blue-100
    },
    fontSize: "16px",
  }),
  menu: (provided: CSSObjectWithLabel) => ({
    ...provided,
    zIndex: 9999,
    backgroundColor: "#ffffff", // white
    border: "1px solid #e5e7eb", // gray-200
  }),
  menuPortal: (base: CSSObjectWithLabel) => ({ ...base, zIndex: 9999 }),
};

export function AdminSalesmanShiftsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    shifts,
    activeShifts,
    loading,
    error,
    fetchShifts,
    fetchActiveShifts,
    createShift,
    closeShift,
  } = useSalesmanNozzleShiftStore();

  // Date filtering - single date that will be converted to from/to for backend
  const [selectedDate, setSelectedDate] = useState(() =>
    format(new Date(), "yyyy-MM-dd")
  );

  // Convert selected date to Indian timezone and create from/to dates
  const getIndianDateRange = (dateStr: string) => {
    // For the backend, we send the same date for both fromDate and toDate
    // The backend will handle the date range (start of day to end of day) in IST
    // Since we're using a single date picker, both from and to will be the same date
    const fromDate = dateStr;
    const toDate = dateStr;

    return { fromDate, toDate };
  };

  // Nozzles and salesmen for shift management
  const [nozzles, setNozzles] = useState<Nozzle[]>([]);
  const [loadingNozzles, setLoadingNozzles] = useState(false);
  const [salesmen, setSalesmen] = useState<Salesman[]>([]);
  const [loadingSalesmen, setLoadingSalesmen] = useState(false);

  // Start shift form state (no dialog needed)
  const [startForm, setStartForm] = useState({
    salesmanId: "",
    nozzleId: "",
    openingBalance: "",
  });

  // Close shift dialog state
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [closeForm, setCloseForm] = useState({
    closingBalance: 0,
    nextSalesmanId: "",
  });

  // Bills dialog state
  const [isBillsDialogOpen, setIsBillsDialogOpen] = useState(false);
  const [selectedShiftForBills, setSelectedShiftForBills] =
    useState<SalesmanNozzleShiftResponse | null>(null);
  const [shiftBills, setShiftBills] = useState<SalesmanBillResponse[]>([]);
  const [loadingBills, setLoadingBills] = useState(false);

  // Bill creation state
  const [isCreateBillDialogOpen, setIsCreateBillDialogOpen] = useState(false);
  const [selectedShiftForBill, setSelectedShiftForBill] =
    useState<SalesmanNozzleShiftResponse | null>(null);
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

  // Payment dialog state
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedShiftForPayment, setSelectedShiftForPayment] =
    useState<SalesmanNozzleShiftResponse | null>(null);

  // Load nozzles and salesmen for shift management
  useEffect(() => {
    const loadNozzles = async () => {
      try {
        setLoadingNozzles(true);
        const nozzleData = await NozzleService.getAllForPump();
        setNozzles(nozzleData);
      } catch (error) {
        console.error("Failed to load nozzles:", error);
      } finally {
        setLoadingNozzles(false);
      }
    };

    const loadSalesmen = async () => {
      try {
        setLoadingSalesmen(true);
        const salesmanData = await SalesmanService.getAll();
        setSalesmen(salesmanData);
      } catch (error) {
        console.error("Failed to load salesmen:", error);
      } finally {
        setLoadingSalesmen(false);
      }
    };

    if (user?.role === "ADMIN" || user?.role === "MANAGER") {
      loadNozzles();
      loadSalesmen();
      fetchActiveShifts();
    }
  }, [user?.role, fetchActiveShifts]);

  // Load shifts with date filter for admin (all shifts)
  useEffect(() => {
    if (user?.role === "ADMIN" || user?.role === "MANAGER") {
      const { fromDate, toDate } = getIndianDateRange(selectedDate);
      fetchShifts({ fromDate, toDate });
    }
  }, [fetchShifts, selectedDate, user?.role]);

  // Handler for starting a new shift
  const handleStartShift = async () => {
    if (
      !startForm.salesmanId ||
      !startForm.nozzleId ||
      !startForm.openingBalance
    )
      return;

    try {
      await createShift({
        salesmanId: startForm.salesmanId,
        nozzleId: startForm.nozzleId,
        openingBalance: parseFloat(startForm.openingBalance),
      });
      toast.success("Shift started successfully");
      // Reset form
      setStartForm({
        salesmanId: "",
        nozzleId: "",
        openingBalance: "",
      });
      // Refresh shifts
      const { fromDate, toDate } = getIndianDateRange(selectedDate);
      fetchShifts({ fromDate, toDate });
      fetchActiveShifts();
    } catch (error) {
      console.error("Failed to start shift:", error);
      toast.error("Failed to start shift");
    }
  };

  // Handler for closing a shift
  const handleCloseShift = async (shiftId: string) => {
    try {
      await closeShift(shiftId, closeForm);
      toast.success("Shift closed successfully");
      setIsCloseDialogOpen(false);
      setSelectedShiftId(null);
      setCloseForm({ closingBalance: 0, nextSalesmanId: "" });
      // Refresh shifts
      const { fromDate, toDate } = getIndianDateRange(selectedDate);
      fetchShifts({ fromDate, toDate });
      fetchActiveShifts();
    } catch (error) {
      console.error("Failed to close shift:", error);
      toast.error("Failed to close shift");
    }
  };

  // Handler for creating a bill
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
    } catch (error) {
      console.error("Failed to load customers and products:", error);
      toast.error("Failed to load customers and products");
    } finally {
      setLoadingCustomers(false);
      setLoadingProducts(false);
    }
  };

  // Handler for submitting a bill
  const handleSubmitBill = async () => {
    if (!selectedShiftForBill || !user?.pumpMasterId) return;

    try {
      // Get next bill number
      const nextBillNo = await SalesmanBillService.getNextBillNo();

      // Get selected product for rate
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
        salesmanShiftId: selectedShiftForBill.id,
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
      // Refresh shifts
      const { fromDate, toDate } = getIndianDateRange(selectedDate);
      fetchShifts({ fromDate, toDate });
      fetchActiveShifts();
    } catch (error) {
      console.error("Failed to create bill:", error);
      toast.error("Failed to create bill");
    }
  };

  // Handler for recording payment
  const handleRecordPayment = (shift: SalesmanNozzleShiftResponse) => {
    setSelectedShiftForPayment(shift);
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentDialogOpen(false);
    setSelectedShiftForPayment(null);
    // Refresh shifts
    const { fromDate, toDate } = getIndianDateRange(selectedDate);
    fetchShifts({ fromDate, toDate });
    fetchActiveShifts();
  };

  const handleViewBills = async (shift: SalesmanNozzleShiftResponse) => {
    try {
      setLoadingBills(true);
      setSelectedShiftForBills(shift);
      const bills = await SalesmanBillService.getByShift(shift.id!);
      setShiftBills(bills);
      setIsBillsDialogOpen(true);
    } catch (error) {
      console.error("Failed to load bills:", error);
      toast.error("Failed to load bills");
    } finally {
      setLoadingBills(false);
    }
  };

  const handleCreateAccounting = (shift: SalesmanNozzleShiftResponse) => {
    // Navigate to the new accounting table page
    navigate(`/admin/salesman-shifts/${shift.id}/accounting`);
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm");
  };

  const formatTime = (dateString: string) => {
    // Backend sends IST dates, format in 12-hour AM/PM format
    return format(new Date(dateString), "hh:mm a");
  };

  const formatFuelQuantity = (quantity: number) => {
    return `${quantity.toFixed(3)} L`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const calculateTotalAmount = (shift: SalesmanNozzleShiftResponse) => {
    if (shift.totalAmount !== undefined) return shift.totalAmount;

    // Calculate based on dispensed amount and rate
    if (shift.closingBalance !== undefined) {
      const dispensed =
        shift.dispensedAmount || shift.closingBalance - shift.openingBalance;
      // This is a simplified calculation - in real app, you'd need the product rate
      return dispensed * 100; // Placeholder rate
    }
    return 0;
  };

  if (user?.role !== "ADMIN" && user?.role !== "MANAGER") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Access Denied
          </h2>
          <p className="text-muted-foreground mt-2">
            This page is only accessible to administrators and managers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          All Salesman Shifts
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage all salesman nozzle shifts and track fuel dispensing across all
          salesmen
        </p>
      </div>

      {/* Start New Shift Form - Always Visible Compact Form */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Start New Shift</CardTitle>
            <CardDescription>
              Select salesman and nozzle to begin a new shift
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="salesman" className="text-sm font-medium">
                  Salesman *
                </Label>
                <ReactSelect
                  value={
                    startForm.salesmanId
                      ? salesmen.find((s) => s.id === startForm.salesmanId)
                        ? {
                            value: startForm.salesmanId,
                            label: salesmen.find(
                              (s) => s.id === startForm.salesmanId
                            )!.username,
                          }
                        : null
                      : null
                  }
                  onChange={(option) =>
                    setStartForm({
                      ...startForm,
                      salesmanId: option?.value || "",
                    })
                  }
                  options={salesmen.map((s) => ({
                    value: s.id!,
                    label: s.username,
                  }))}
                  placeholder="Select a salesman"
                  styles={selectStyles}
                  menuPortalTarget={document.body}
                  isLoading={loadingSalesmen}
                  noOptionsMessage={() =>
                    loadingSalesmen
                      ? "Loading salesmen..."
                      : "No salesmen available"
                  }
                  isClearable
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nozzle" className="text-sm font-medium">
                  Nozzle *
                </Label>
                <ReactSelect
                  value={
                    startForm.nozzleId
                      ? nozzles.find((n) => n.id === startForm.nozzleId)
                        ? {
                            value: startForm.nozzleId,
                            label: `${
                              nozzles.find((n) => n.id === startForm.nozzleId)!
                                .nozzleName
                            } - ${
                              nozzles.find((n) => n.id === startForm.nozzleId)!
                                .productName || "No Product"
                            }`,
                          }
                        : null
                      : null
                  }
                  onChange={(option) =>
                    setStartForm({
                      ...startForm,
                      nozzleId: option?.value || "",
                    })
                  }
                  options={nozzles.map((n) => ({
                    value: n.id!,
                    label: `${n.nozzleName} - ${n.productName || "No Product"}`,
                  }))}
                  placeholder="Select a nozzle"
                  styles={selectStyles}
                  menuPortalTarget={document.body}
                  isLoading={loadingNozzles}
                  noOptionsMessage={() =>
                    loadingNozzles
                      ? "Loading nozzles..."
                      : "No nozzles available"
                  }
                  isClearable
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="opening-balance"
                  className="text-sm font-medium"
                >
                  Opening Fuel Balance (L) *
                </Label>
                <Input
                  id="opening-balance"
                  type="number"
                  step="0.001"
                  placeholder="0.000"
                  value={startForm.openingBalance}
                  onChange={(e) =>
                    setStartForm({
                      ...startForm,
                      openingBalance: e.target.value,
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                onClick={handleStartShift}
                disabled={loading}
                className="px-8"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Play className="mr-2 h-4 w-4" />
                Start Shift
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active shifts cards */}
      {activeShifts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Fuel className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold">
              Active Shifts ({activeShifts.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeShifts.map((shift) => (
              <Card
                key={shift.id}
                className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{shift.nozzleName}</span>
                    <div className="flex flex-wrap gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreateBill(shift)}
                      >
                        <Receipt className="mr-1 h-3 w-3" />
                        Bill
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewBills(shift)}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRecordPayment(shift)}
                      >
                        <CreditCard className="mr-1 h-3 w-3" />
                        Pay
                      </Button>
                      <Dialog
                        open={isCloseDialogOpen && selectedShiftId === shift.id}
                        onOpenChange={(open) => {
                          setIsCloseDialogOpen(open);
                          setSelectedShiftId(open ? shift.id! : null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Square className="mr-1 h-3 w-3" />
                            End
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>End Shift</DialogTitle>
                            <DialogDescription>
                              Close active shift on nozzle {shift.nozzleName}{" "}
                              for {shift.salesmanUsername}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="closing-balance">
                                Closing Fuel Balance (L) *
                              </Label>
                              <Input
                                id="closing-balance"
                                type="number"
                                step="0.001"
                                placeholder="0.000"
                                value={closeForm.closingBalance}
                                onChange={(e) =>
                                  setCloseForm({
                                    ...closeForm,
                                    closingBalance:
                                      parseFloat(e.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="next-salesman">
                                Next Salesman (Optional)
                              </Label>
                              <ReactSelect
                                value={
                                  closeForm.nextSalesmanId
                                    ? salesmen.find(
                                        (s) => s.id === closeForm.nextSalesmanId
                                      )
                                      ? {
                                          value: closeForm.nextSalesmanId,
                                          label: salesmen.find(
                                            (s) =>
                                              s.id === closeForm.nextSalesmanId
                                          )!.username,
                                        }
                                      : null
                                    : null
                                }
                                onChange={(option) =>
                                  setCloseForm({
                                    ...closeForm,
                                    nextSalesmanId: option?.value || "",
                                  })
                                }
                                options={salesmen.map((s) => ({
                                  value: s.id!,
                                  label: s.username,
                                }))}
                                placeholder="Select next salesman (optional)"
                                styles={selectStyles}
                                menuPortalTarget={document.body}
                                isLoading={loadingSalesmen}
                                noOptionsMessage={() =>
                                  loadingSalesmen
                                    ? "Loading salesmen..."
                                    : "No salesmen available"
                                }
                                isClearable
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => setIsCloseDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleCloseShift(shift.id!)}
                              disabled={loading}
                            >
                              {loading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              End Shift
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">
                        Salesman:
                      </span>
                      <p className="font-semibold">{shift.salesmanUsername}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">
                        Product:
                      </span>
                      <p className="font-semibold">{shift.productName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">
                        Started:
                      </span>
                      <p className="font-semibold">
                        {formatDateTime(shift.startDateTime)}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">
                        Opening Fuel:
                      </span>
                      <p className="font-semibold">
                        {formatFuelQuantity(shift.openingBalance)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Shifts table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Salesman Shift History</CardTitle>
              <CardDescription>
                All completed shifts for the selected date across all salesmen
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <Input
                  id="selected-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-[180px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-4">
              <p className="font-medium">Error loading shifts</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {loading && shifts.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading shifts...</span>
            </div>
          ) : shifts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Fuel className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No shifts found for the selected date range.</p>
              <p className="text-sm mt-1">Try adjusting your date filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Salesman</TableHead>
                    <TableHead className="min-w-[120px]">Nozzle</TableHead>
                    <TableHead className="min-w-[100px]">Start Time</TableHead>
                    <TableHead className="min-w-[100px]">End Time</TableHead>
                    <TableHead className="min-w-[100px]">
                      Opening Fuel
                    </TableHead>
                    <TableHead className="min-w-[100px]">
                      Closing Fuel
                    </TableHead>
                    <TableHead className="min-w-[100px]">Dispensed</TableHead>
                    <TableHead className="min-w-[100px]">
                      Total Amount
                    </TableHead>
                    <TableHead className="min-w-[80px]">Bills</TableHead>
                    <TableHead className="min-w-[80px]">Status</TableHead>
                    <TableHead className="min-w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shifts.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{shift.salesmanUsername || "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{shift.nozzleName}</span>
                          <span className="text-xs text-muted-foreground">
                            {shift.productName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatTime(shift.startDateTime)}</TableCell>
                      <TableCell>
                        {shift.endDateTime
                          ? formatTime(shift.endDateTime)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {formatFuelQuantity(shift.openingBalance)}
                      </TableCell>
                      <TableCell>
                        {shift.closingBalance
                          ? formatFuelQuantity(shift.closingBalance)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {shift.closingBalance
                          ? formatFuelQuantity(
                              shift.dispensedAmount ||
                                shift.closingBalance - shift.openingBalance
                            )
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {shift.totalAmount !== undefined
                          ? formatCurrency(shift.totalAmount)
                          : shift.closingBalance
                          ? formatCurrency(calculateTotalAmount(shift))
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewBills(shift)}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Bills
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <Badge
                            variant={
                              shift.status === "ACTIVE" ||
                              shift.status === "OPEN"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {shift.status}
                          </Badge>
                          {shift.status === "CLOSED" &&
                            shift.isAccountingDone && (
                              <Badge variant="outline" className="text-xs">
                                ✓ Accounted
                              </Badge>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {/* Bill Creation - Available for all shifts */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCreateBill(shift)}
                          >
                            <Receipt className="mr-1 h-3 w-3" />
                            Bill
                          </Button>

                          {/* Payment Recording - Available for all shifts */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRecordPayment(shift)}
                          >
                            <CreditCard className="mr-1 h-3 w-3" />
                            Payment
                          </Button>

                          {/* Close Shift - Only for active/open shifts */}
                          {(shift.status === "ACTIVE" ||
                            shift.status === "OPEN") && (
                            <Dialog
                              open={
                                isCloseDialogOpen &&
                                selectedShiftId === shift.id
                              }
                              onOpenChange={(open) => {
                                setIsCloseDialogOpen(open);
                                setSelectedShiftId(open ? shift.id! : null);
                                if (!open) {
                                  setCloseForm({
                                    closingBalance: 0,
                                    nextSalesmanId: "",
                                  });
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Square className="mr-1 h-3 w-3" />
                                  Close
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Close Shift</DialogTitle>
                                  <DialogDescription>
                                    Close shift on nozzle {shift.nozzleName} for{" "}
                                    {shift.salesmanUsername}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="closing-balance-table">
                                      Closing Fuel Balance (L) *
                                    </Label>
                                    <Input
                                      id="closing-balance-table"
                                      type="number"
                                      step="0.001"
                                      placeholder="0.000"
                                      value={closeForm.closingBalance}
                                      onChange={(e) =>
                                        setCloseForm({
                                          ...closeForm,
                                          closingBalance:
                                            parseFloat(e.target.value) || 0,
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="next-salesman-table">
                                      Next Salesman (Optional)
                                    </Label>
                                    <ReactSelect
                                      value={
                                        closeForm.nextSalesmanId
                                          ? salesmen.find(
                                              (s) =>
                                                s.id ===
                                                closeForm.nextSalesmanId
                                            )
                                            ? {
                                                value: closeForm.nextSalesmanId,
                                                label: salesmen.find(
                                                  (s) =>
                                                    s.id ===
                                                    closeForm.nextSalesmanId
                                                )!.username,
                                              }
                                            : null
                                          : null
                                      }
                                      onChange={(option) =>
                                        setCloseForm({
                                          ...closeForm,
                                          nextSalesmanId: option?.value || "",
                                        })
                                      }
                                      options={salesmen.map((s) => ({
                                        value: s.id!,
                                        label: s.username,
                                      }))}
                                      placeholder="Select next salesman (optional)"
                                      styles={selectStyles}
                                      menuPortalTarget={document.body}
                                      isLoading={loadingSalesmen}
                                      noOptionsMessage={() =>
                                        loadingSalesmen
                                          ? "Loading salesmen..."
                                          : "No salesmen available"
                                      }
                                      isClearable
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setIsCloseDialogOpen(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => handleCloseShift(shift.id!)}
                                    disabled={loading}
                                  >
                                    {loading && (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Close Shift
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}

                          {/* Accounting - Only for closed shifts */}
                          {shift.status === "CLOSED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCreateAccounting(shift)}
                            >
                              <Receipt className="mr-1 h-3 w-3" />
                              {shift.isAccountingDone
                                ? "Edit Accounting"
                                : "Create Accounting"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bills Dialog */}
      <Dialog open={isBillsDialogOpen} onOpenChange={setIsBillsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Bills for Shift - {selectedShiftForBills?.nozzleName}
            </DialogTitle>
            <DialogDescription>
              Credit bills created during this shift by{" "}
              {selectedShiftForBills?.salesmanUsername}
              {selectedShiftForBills && (
                <span className="block mt-1">
                  {formatDateTime(selectedShiftForBills.startDateTime)}
                  {selectedShiftForBills.endDateTime &&
                    ` - ${formatDateTime(selectedShiftForBills.endDateTime)}`}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {loadingBills ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading bills...</span>
            </div>
          ) : shiftBills.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Fuel className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bills found for this shift.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {shiftBills.length} Bill{shiftBills.length !== 1 ? "s" : ""}
                </h3>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(
                      shiftBills.reduce((sum, bill) => sum + bill.amount, 0)
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {shiftBills.map((bill) => (
                  <Card key={bill.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">
                            Bill #{bill.billNo}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>
                            Customer: {bill.customerName}
                            {bill.vehicleNo && ` | Vehicle: ${bill.vehicleNo}`}
                          </p>
                          <p>Product: {bill.productName}</p>
                          <p>
                            Quantity: {bill.quantity} L | Rate:{" "}
                            {formatCurrency(bill.rate)}/L
                          </p>
                          <p>Total: {formatCurrency(bill.amount)}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for shift starting at{" "}
              {selectedShiftForPayment &&
                format(
                  new Date(selectedShiftForPayment.startDateTime),
                  "dd/MM/yyyy HH:mm"
                )}
            </DialogDescription>
          </DialogHeader>
          {selectedShiftForPayment && user?.pumpMasterId && (
            <CreateShiftPaymentForm
              salesmanShiftId={selectedShiftForPayment.id}
              pumpMasterId={user.pumpMasterId}
              onSuccess={handlePaymentSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Bill Dialog */}
      <Dialog
        open={isCreateBillDialogOpen}
        onOpenChange={setIsCreateBillDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Bill</DialogTitle>
            <DialogDescription>
              Create a new bill for shift starting at{" "}
              {selectedShiftForBill &&
                format(
                  new Date(selectedShiftForBill.startDateTime),
                  "dd/MM/yyyy HH:mm"
                )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="customer">Customer *</Label>
              <ReactSelect
                value={
                  billForm.customerId
                    ? customers.find((c) => c.id === billForm.customerId)
                      ? {
                          value: billForm.customerId,
                          label: customers.find(
                            (c) => c.id === billForm.customerId
                          )!.customerName,
                        }
                      : null
                    : null
                }
                onChange={(option) =>
                  setBillForm({ ...billForm, customerId: option?.value || "" })
                }
                options={customers
                  .filter((customer) => customer.id)
                  .map((c) => ({
                    value: c.id!,
                    label: c.customerName,
                  }))}
                placeholder="Select customer"
                styles={selectStyles}
                menuPortalTarget={document.body}
                isLoading={loadingCustomers}
                isClearable
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="product">Product *</Label>
              <ReactSelect
                value={
                  billForm.productId
                    ? products.find((p) => p.id === billForm.productId)
                      ? {
                          value: billForm.productId,
                          label: `${
                            products.find((p) => p.id === billForm.productId)!
                              .productName
                          } - ${formatCurrency(
                            products.find((p) => p.id === billForm.productId)!
                              .salesRate
                          )}/L`,
                        }
                      : null
                    : null
                }
                onChange={(option) =>
                  setBillForm({ ...billForm, productId: option?.value || "" })
                }
                options={products
                  .filter((product) => product.id)
                  .map((p) => ({
                    value: p.id!,
                    label: `${p.productName} - ${formatCurrency(
                      p.salesRate
                    )}/L`,
                  }))}
                placeholder="Select product"
                styles={selectStyles}
                menuPortalTarget={document.body}
                isLoading={loadingProducts}
                isClearable
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity (Liters) *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.001"
                placeholder="0.000"
                value={billForm.quantity}
                onChange={(e) =>
                  setBillForm({ ...billForm, quantity: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="vehicle">Vehicle Number</Label>
              <Input
                id="vehicle"
                placeholder="Enter vehicle number"
                value={billForm.vehicleNo}
                onChange={(e) =>
                  setBillForm({ ...billForm, vehicleNo: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="driver">Driver Name</Label>
              <Input
                id="driver"
                placeholder="Enter driver name"
                value={billForm.driverName}
                onChange={(e) =>
                  setBillForm({ ...billForm, driverName: e.target.value })
                }
              />
            </div>

            {/* Display calculated amount */}
            {billForm.productId && billForm.quantity && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Amount:</span>
                  <span className="font-bold">
                    {(() => {
                      const product = products.find(
                        (p) => p.id === billForm.productId
                      );
                      const quantity = parseFloat(billForm.quantity) || 0;
                      const rate = product?.salesRate || 0;
                      return formatCurrency(quantity * rate);
                    })()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground mt-1">
                  <span>Rate:</span>
                  <span>
                    {(() => {
                      const product = products.find(
                        (p) => p.id === billForm.productId
                      );
                      return product
                        ? formatCurrency(product.salesRate) + "/L"
                        : "-";
                    })()}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateBillDialogOpen(false);
                setSelectedShiftForBill(null);
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
              Create Bill
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
