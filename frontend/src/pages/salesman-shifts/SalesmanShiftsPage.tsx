import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSalesmanNozzleShiftStore } from "@/store/salesman-nozzle-shift-store";
import { useSalesmanBillPaymentStore } from "@/store/salesman-bill-payment-store";
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

export function SalesmanShiftsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    shifts,
    activeShifts,
    loading,
    error,
    fetchShifts,
    createShift,
    closeShift,
    fetchActiveShifts,
  } = useSalesmanNozzleShiftStore();

  const {
    shiftPayments,
    loading: loadingPayments,
    fetchPaymentsByShiftId,
  } = useSalesmanBillPaymentStore();

  // Date filtering - single date that will be converted to from/to for backend
  const [selectedDate, setSelectedDate] = useState(() =>
    format(new Date(), "yyyy-MM-dd")
  );

  // Convert selected date to Indian timezone and create from/to dates
  const getIndianDateRange = useCallback((dateStr: string) => {
    // For the backend, we send the same date for both fromDate and toDate
    // The backend will handle the date range (start of day to end of day) in IST
    // Since we're using a single date picker, both from and to will be the same date
    const fromDate = dateStr;
    const toDate = dateStr;

    return { fromDate, toDate };
  }, []);

  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [nozzles, setNozzles] = useState<Nozzle[]>([]);
  const [loadingNozzles, setLoadingNozzles] = useState(false);
  const [salesmen, setSalesmen] = useState<Salesman[]>([]);
  const [loadingSalesmen, setLoadingSalesmen] = useState(false);

  // Bills dialog state
  const [isBillsDialogOpen, setIsBillsDialogOpen] = useState(false);
  const [selectedShiftForBills, setSelectedShiftForBills] =
    useState<SalesmanNozzleShiftResponse | null>(null);
  const [shiftBills, setShiftBills] = useState<SalesmanBillResponse[]>([]);
  const [loadingBills, setLoadingBills] = useState(false);

  // Form states
  const [startForm, setStartForm] = useState({
    nozzleId: "",
    openingBalance: "",
  });

  const [closeForm, setCloseForm] = useState({
    closingBalance: 0,
    nextSalesmanId: "",
  });

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

  // View Payments dialog state
  const [isViewPaymentsDialogOpen, setIsViewPaymentsDialogOpen] =
    useState(false);
  const [selectedShiftForViewPayments, setSelectedShiftForViewPayments] =
    useState<SalesmanNozzleShiftResponse | null>(null);

  // Load nozzles and salesmen for selection
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

    if (user?.role === "SALESMAN" && user?.userId) {
      loadNozzles();
      loadSalesmen();
      fetchActiveShifts(user.userId);
    } else if (user?.role === "ADMIN") {
      loadNozzles();
      loadSalesmen();
      // For admin, fetch all active shifts or handle differently
      fetchActiveShifts();
    }
  }, [user?.role, user?.userId, fetchActiveShifts]);

  // Load shifts with date filter
  useEffect(() => {
    if (user?.role === "SALESMAN" && user?.userId) {
      const { fromDate, toDate } = getIndianDateRange(selectedDate);
      fetchShifts({ fromDate, toDate, salesmanId: user.userId });
    } else if (user?.role === "ADMIN") {
      const { fromDate, toDate } = getIndianDateRange(selectedDate);
      fetchShifts({ fromDate, toDate }); // Admin sees all shifts
    }
  }, [fetchShifts, selectedDate, user?.role, user?.userId, getIndianDateRange]);

  const handleStartShift = async () => {
    if (!user?.userId || !startForm.nozzleId || !startForm.openingBalance)
      return;

    try {
      await createShift({
        salesmanId: user.userId,
        nozzleId: startForm.nozzleId,
        openingBalance: parseFloat(startForm.openingBalance),
      });

      setIsStartDialogOpen(false);
      setStartForm({
        nozzleId: "",
        openingBalance: "",
      });
    } catch {
      // Error is handled in the store
    }
  };

  const handleCloseShift = async (shiftId: string) => {
    try {
      await closeShift(shiftId, closeForm);
      toast.success("Shift closed successfully");
      setIsCloseDialogOpen(false);
      setSelectedShiftId(null);
      setCloseForm({ closingBalance: 0, nextSalesmanId: "" });
      // Refresh shifts
      if (user?.role === "SALESMAN" && user?.userId) {
        const { fromDate, toDate } = getIndianDateRange(selectedDate);
        fetchShifts({ fromDate, toDate, salesmanId: user.userId });
        fetchActiveShifts(user.userId);
      } else if (user?.role === "ADMIN") {
        const { fromDate, toDate } = getIndianDateRange(selectedDate);
        fetchShifts({ fromDate, toDate });
        fetchActiveShifts();
      }
    } catch {
      toast.error("Failed to close shift");
    }
  };

  // Bill creation functions
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
        billDate: new Date().toISOString().split("T")[0], // Today's date
        customerId: billForm.customerId,
        productId: billForm.productId,
        salesmanNozzleShiftId: selectedShiftForBill.id,
        rateType: "EXCLUDING_GST", // Default to excluding GST
        quantity: parseFloat(billForm.quantity),
        rate: selectedProduct.salesRate, // Use product's sales rate
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
      // Refresh shifts to show updated bill count
      if (user?.role === "SALESMAN" && user?.userId) {
        const { fromDate, toDate } = getIndianDateRange(selectedDate);
        fetchShifts({ fromDate, toDate, salesmanId: user.userId });
        fetchActiveShifts(user.userId);
      } else if (user?.role === "ADMIN") {
        const { fromDate, toDate } = getIndianDateRange(selectedDate);
        fetchShifts({ fromDate, toDate });
        fetchActiveShifts();
      }
    } catch {
      toast.error("Failed to create bill");
    }
  };

  // Load nozzles and salesmen for selection

  const handleViewBills = async (shift: SalesmanNozzleShiftResponse) => {
    setSelectedShiftForBills(shift);
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

  // View Payments function
  const handleViewPayments = async (shift: SalesmanNozzleShiftResponse) => {
    setSelectedShiftForViewPayments(shift);
    setIsViewPaymentsDialogOpen(true);

    try {
      await fetchPaymentsByShiftId(shift.id!);
    } catch (error) {
      console.error("Failed to load payments for shift:", error);
    }
  };

  // Payment functions
  const handleRecordPayment = (shift: SalesmanNozzleShiftResponse) => {
    setSelectedShiftForPayment(shift);
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentDialogOpen(false);
    setSelectedShiftForPayment(null);
    // Refresh shifts
    const { fromDate, toDate } = getIndianDateRange(selectedDate);
    if (user?.role === "SALESMAN" && user?.userId) {
      fetchShifts({ fromDate, toDate, salesmanId: user.userId });
      fetchActiveShifts(user.userId);
    } else if (user?.role === "ADMIN") {
      fetchShifts({ fromDate, toDate });
      fetchActiveShifts();
    }
  };

  // Accounting function - navigate to dedicated accounting page
  const handleCreateAccounting = (shift: SalesmanNozzleShiftResponse) => {
    // Navigate to the accounting table page for salesmen
    navigate(`/salesman/shifts/${shift.id}/accounting`);
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

  const calculateTotalAmount = (shift: {
    totalAmount?: number;
    closingBalance?: number;
    openingBalance: number;
    productPrice?: number;
  }) => {
    if (shift.totalAmount !== undefined) {
      return shift.totalAmount;
    }
    if (shift.closingBalance && shift.openingBalance) {
      const dispensed = shift.closingBalance - shift.openingBalance;
      // Use productPrice if available, otherwise default to ₹100 per liter
      const pricePerLiter = shift.productPrice || 100;
      return dispensed * pricePerLiter;
    }
    return 0;
  };

  if (user?.role !== "SALESMAN" && user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Access Denied
          </h2>
          <p className="text-muted-foreground mt-2">
            This page is only accessible to salesmen and administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Mobile-first header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {user?.role === "ADMIN" ? "All Salesman Shifts" : "My Shifts"}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {user?.role === "ADMIN"
              ? "Manage all salesman nozzle shifts and track fuel dispensing"
              : "Manage your nozzle shifts and track fuel dispensing"}
          </p>
        </div>

        {/* Action buttons - stack on mobile */}
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          {user?.role === "SALESMAN" && (
            <Dialog
              open={isStartDialogOpen}
              onOpenChange={setIsStartDialogOpen}
            >
              <Button
                className="w-full sm:w-auto"
                onClick={() => setIsStartDialogOpen(true)}
              >
                <Play className="mr-2 h-4 w-4" />
                Start Shift
              </Button>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Start New Shift</DialogTitle>
                  <DialogDescription>
                    Begin a new shift by selecting a nozzle and entering opening
                    balance
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nozzle">Nozzle</Label>
                    <ReactSelect
                      value={
                        startForm.nozzleId
                          ? nozzles.find((n) => n.id === startForm.nozzleId)
                            ? {
                                value: startForm.nozzleId,
                                label: `${
                                  nozzles.find(
                                    (n) => n.id === startForm.nozzleId
                                  )!.nozzleName
                                } - ${
                                  nozzles.find(
                                    (n) => n.id === startForm.nozzleId
                                  )!.productName || "No Product"
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
                        label: `${n.nozzleName} - ${
                          n.productName || "No Product"
                        }`,
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
                  <div className="grid gap-2">
                    <Label htmlFor="opening-balance">
                      Opening Fuel Balance (L)
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
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsStartDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleStartShift} disabled={loading}>
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Start Shift
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Active shifts cards - mobile optimized */}
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
                    <Dialog
                      open={isCloseDialogOpen && selectedShiftId === shift.id}
                      onOpenChange={(open) => {
                        setIsCloseDialogOpen(open);
                        setSelectedShiftId(open ? shift.id! : null);
                      }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsCloseDialogOpen(true);
                          setSelectedShiftId(shift.id!);
                        }}
                      >
                        <Square className="mr-1 h-3 w-3" />
                        End Shift
                      </Button>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>End Current Shift</DialogTitle>
                          <DialogDescription>
                            Close your active shift on nozzle {shift.nozzleName}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="closing-balance">
                              Closing Fuel Balance (L)
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
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => handleViewBills(shift)}
                    >
                      <Eye className="h-5 w-5 mb-1" />
                      <span>View Bills</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => handleViewPayments(shift)}
                    >
                      <CreditCard className="h-5 w-5 mb-1" />
                      <span>View Payments</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => handleCreateBill(shift)}
                    >
                      <Receipt className="h-5 w-5 mb-1" />
                      <span>Create Bills</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => handleRecordPayment(shift)}
                    >
                      <CreditCard className="h-5 w-5 mb-1" />
                      <span>Create Payments</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Shifts table - mobile responsive */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Shift History</CardTitle>
              <CardDescription>
                Your completed shifts for the selected date
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <Label
                  htmlFor="selected-date"
                  className="text-sm font-medium mb-1"
                >
                  Select Date
                </Label>
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
                    <TableHead className="min-w-[120px]">Nozzle</TableHead>
                    <TableHead className="min-w-[140px]">Start Time</TableHead>
                    <TableHead className="min-w-[140px]">End Time</TableHead>
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
                        <div className="flex flex-col">
                          <span>{shift.nozzleName}</span>
                          <span className="text-xs text-muted-foreground">
                            {shift.productName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDateTime(shift.startDateTime)}
                      </TableCell>
                      <TableCell>
                        {shift.endDateTime
                          ? formatDateTime(shift.endDateTime)
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
                              shift.status === "ACTIVE"
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
                        <div className="flex space-x-2">
                          {shift.status === "CLOSED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCreateAccounting(shift)}
                            >
                              <Receipt className="mr-1 h-3 w-3" />
                              {shift.isAccountingDone
                                ? "View Accounting"
                                : "Create Accounting"}
                            </Button>
                          )}
                          {shift.status === "ACTIVE" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCloseShift(shift.id)}
                            >
                              <Square className="mr-1 h-3 w-3" />
                              Close
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
              Credit bills created during this shift
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
          {selectedShiftForPayment && (
            <CreateShiftPaymentForm
              salesmanNozzleShiftId={selectedShiftForPayment.id}
              pumpMasterId={user?.pumpMasterId || ""}
              onSuccess={handlePaymentSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Payments Dialog */}
      <Dialog
        open={isViewPaymentsDialogOpen}
        onOpenChange={setIsViewPaymentsDialogOpen}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Payments for Shift - {selectedShiftForViewPayments?.nozzleName}
            </DialogTitle>
            <DialogDescription>
              All payments recorded during this shift
              {selectedShiftForViewPayments && (
                <span className="block mt-1">
                  {formatDateTime(selectedShiftForViewPayments.startDateTime)}
                  {selectedShiftForViewPayments.endDateTime &&
                    ` - ${formatDateTime(
                      selectedShiftForViewPayments.endDateTime
                    )}`}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {loadingPayments ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading payments...</span>
            </div>
          ) : shiftPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payments found for this shift.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {shiftPayments.length} Payment
                  {shiftPayments.length !== 1 ? "s" : ""}
                </h3>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(
                      shiftPayments.reduce(
                        (sum, payment) => sum + payment.amount,
                        0
                      )
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {shiftPayments.map((payment) => (
                  <Card key={payment.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">
                            {payment.referenceNumber}
                          </span>
                          <Badge variant="outline">
                            {payment.paymentMethod}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Customer: {payment.customerName}</p>
                          <p>
                            Date:{" "}
                            {format(
                              new Date(payment.paymentDate),
                              "dd/MM/yyyy"
                            )}
                          </p>
                          <p>Amount: {formatCurrency(payment.amount)}</p>
                          {payment.notes && <p>Notes: {payment.notes}</p>}
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
