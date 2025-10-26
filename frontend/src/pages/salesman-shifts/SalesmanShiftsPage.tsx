import { useEffect, useState, useCallback } from "react";
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
import { Loader2, Fuel, Square, Play, CreditCard, Receipt } from "lucide-react";
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
import { NozzleService } from "@/services/nozzle-service";
import { SalesmanService } from "@/services/salesman-service";
import { toast } from "sonner";
import type { Nozzle, Salesman } from "@/types";

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

  // Date filtering - single date that will be converted to from/to for backend
  const [selectedDate, setSelectedDate] = useState(() =>
    format(new Date(), "yyyy-MM-dd")
  );

  // Convert selected date to Indian timezone and create from/to dates
  const getIndianDateRange = useCallback((dateStr: string) => {
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

  // Form states
  const [startForm, setStartForm] = useState({
    nozzleId: "",
    openingBalance: "",
  });

  const [closeForm, setCloseForm] = useState({
    closingBalance: 0,
    nextSalesmanId: "",
  });

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

  // Accounting function - navigate to dedicated accounting page
  const handleCreateAccounting = (shift: { id: string }) => {
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
                      min="0"
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
                              min="0"
                              step="0.001"
                              placeholder="0.000"
                              value={
                                closeForm.closingBalance === 0
                                  ? ""
                                  : closeForm.closingBalance
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                setCloseForm({
                                  ...closeForm,
                                  closingBalance:
                                    value === "" ? 0 : parseFloat(value) || 0,
                                });
                              }}
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
                      onClick={() => navigate("/salesman/bills")}
                    >
                      <Receipt className="h-5 w-5 mb-1" />
                      <span>My Bills</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => navigate("/salesman/payments")}
                    >
                      <CreditCard className="h-5 w-5 mb-1" />
                      <span>My Payments</span>
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
            <div className="flex justify-between items-center w-full">
              <div>
                <CardTitle>Shift History</CardTitle>
                <CardDescription>Manage The Shift History</CardDescription>
              </div>
              <Input
                id="selected-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-[180px]"
              />
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
    </div>
  );
}
