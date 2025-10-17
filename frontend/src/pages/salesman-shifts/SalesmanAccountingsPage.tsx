import { useEffect, useState } from "react";
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
  Calendar,
  Loader2,
  Receipt,
  User,
  DollarSign,
  FileText,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { SalesmanService } from "@/services/salesman-service";
import { AccountingForm } from "@/pages/salesman-shifts/AccountingForm";
import { toast } from "sonner";
import type {
  SalesmanNozzleShiftResponse,
  CreateSalesmanShiftAccountingRequest,
  SalesmanShiftAccounting,
  Salesman,
} from "@/types";

export function SalesmanAccountingsPage() {
  const { user } = useAuth();
  const {
    shifts,
    loading,
    error,
    fetchShifts,
    updateAccounting,
    getAccounting,
  } = useSalesmanNozzleShiftStore();

  // Date filtering
  const [fromDate, setFromDate] = useState(() => {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    return format(firstDayOfMonth, "yyyy-MM-dd");
  });
  const [toDate, setToDate] = useState(() => format(new Date(), "yyyy-MM-dd"));

  // Salesman filtering
  const [salesmen, setSalesmen] = useState<Salesman[]>([]);
  const [loadingSalesmen, setLoadingSalesmen] = useState(false);
  const [selectedSalesmanId, setSelectedSalesmanId] = useState<string>("all");

  // Accounting dialog state
  const [isAccountingDialogOpen, setIsAccountingDialogOpen] = useState(false);
  const [selectedShiftForAccounting, setSelectedShiftForAccounting] =
    useState<SalesmanNozzleShiftResponse | null>(null);
  const [existingAccounting, setExistingAccounting] =
    useState<SalesmanShiftAccounting | null>(null);

  // Load salesmen for filtering
  useEffect(() => {
    const loadSalesmen = async () => {
      try {
        setLoadingSalesmen(true);
        const salesmanData = await SalesmanService.getAll();
        setSalesmen(salesmanData);
      } catch (error) {
        console.error("Failed to load salesmen:", error);
        toast.error("Failed to load salesmen");
      } finally {
        setLoadingSalesmen(false);
      }
    };

    if (user?.role === "ADMIN" || user?.role === "MANAGER") {
      loadSalesmen();
    }
  }, [user?.role]);

  // Load shifts with filters
  useEffect(() => {
    if (user?.role === "ADMIN" || user?.role === "MANAGER") {
      const filters: { fromDate: string; toDate: string; salesmanId?: string } =
        { fromDate, toDate };
      if (selectedSalesmanId !== "all") {
        filters.salesmanId = selectedSalesmanId;
      }
      fetchShifts(filters);
    }
  }, [fetchShifts, fromDate, toDate, selectedSalesmanId, user?.role]);

  // Filter only closed shifts with accounting
  const accountedShifts = shifts.filter(
    (shift) => shift.status === "CLOSED" && shift.isAccountingDone
  );

  const handleViewAccounting = async (shift: SalesmanNozzleShiftResponse) => {
    try {
      console.log("handleViewAccounting called with shift:", shift);
      console.log("Shift ID:", shift.id);

      if (!shift.id) {
        toast.error("Invalid shift ID");
        return;
      }

      console.log("Fetching accounting for shift ID:", shift.id);
      const accounting = await getAccounting(shift.id);
      console.log("Accounting received:", accounting);

      setSelectedShiftForAccounting(shift);
      setExistingAccounting(accounting);
      setIsAccountingDialogOpen(true);

      console.log("Dialog state should be open now");
    } catch (error) {
      console.error("Failed to fetch accounting:", error);
      toast.error("Failed to load accounting details");
    }
  };

  const handleAccountingSubmit = async (
    data: CreateSalesmanShiftAccountingRequest
  ) => {
    if (!selectedShiftForAccounting?.id) return;

    try {
      await updateAccounting(selectedShiftForAccounting.id, data);
      toast.success("Accounting updated successfully");
      setIsAccountingDialogOpen(false);
      setSelectedShiftForAccounting(null);
      setExistingAccounting(null);
      // Refresh shifts
      const filters: { fromDate: string; toDate: string; salesmanId?: string } =
        { fromDate, toDate };
      if (selectedSalesmanId !== "all") {
        filters.salesmanId = selectedSalesmanId;
      }
      fetchShifts(filters);
    } catch (error) {
      console.error("Failed to update accounting:", error);
      toast.error("Failed to update accounting");
    }
  };

  const handleAccountingCancel = () => {
    setIsAccountingDialogOpen(false);
    setSelectedShiftForAccounting(null);
    setExistingAccounting(null);
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatFuelQuantity = (quantity: number) => {
    return `${quantity.toFixed(3)} L`;
  };

  // Calculate summary statistics
  const totalFuelSales = accountedShifts.reduce(
    (sum, shift) => sum + (shift.totalAmount || 0),
    0
  );
  const totalShifts = accountedShifts.length;

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
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Shift Accountings
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            View and manage all shift accounting records with detailed financial
            information
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Receipt className="h-4 w-4 text-blue-600" />
                Total Shifts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalShifts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Accounted shifts in selected period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalFuelSales)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total fuel sales amount
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-purple-600" />
                Salesmen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(accountedShifts.map((s) => s.salesmanUsername)).size}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Active salesmen in period
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Filter Accountings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-date" className="text-sm font-medium">
                From Date
              </Label>
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-date" className="text-sm font-medium">
                To Date
              </Label>
              <Input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salesman-filter" className="text-sm font-medium">
                Salesman
              </Label>
              <Select
                value={selectedSalesmanId}
                onValueChange={setSelectedSalesmanId}
                disabled={loadingSalesmen}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Salesmen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Salesmen</SelectItem>
                  {salesmen.map((salesman) => (
                    <SelectItem key={salesman.id} value={salesman.id!}>
                      {salesman.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accountings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Accounting Records</CardTitle>
          <CardDescription>
            All shift accountings within the selected filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-4">
              <p className="font-medium">Error loading accountings</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {loading && accountedShifts.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading accountings...</span>
            </div>
          ) : accountedShifts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No accounting records found for the selected filters.</p>
              <p className="text-sm mt-1">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Salesman</TableHead>
                    <TableHead className="min-w-[120px]">Nozzle</TableHead>
                    <TableHead className="min-w-[140px]">Shift Date</TableHead>
                    <TableHead className="min-w-[100px]">Dispensed</TableHead>
                    <TableHead className="min-w-[120px]">Fuel Sales</TableHead>
                    <TableHead className="min-w-[120px]">
                      Cash in Hand
                    </TableHead>
                    <TableHead className="min-w-[100px]">Credit</TableHead>
                    <TableHead className="min-w-[100px]">Expenses</TableHead>
                    <TableHead className="min-w-[120px]">Balance</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountedShifts.map((shift) => (
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
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {formatDateTime(shift.startDateTime)}
                          </span>
                          {shift.endDateTime && (
                            <span className="text-xs text-muted-foreground">
                              to {formatDateTime(shift.endDateTime)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {shift.closingBalance
                          ? formatFuelQuantity(
                              shift.dispensedAmount ||
                                shift.closingBalance - shift.openingBalance
                            )
                          : "-"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {shift.totalAmount !== undefined
                          ? formatCurrency(shift.totalAmount)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {/* This would come from accounting details */}
                        <span className="text-muted-foreground">
                          View Details
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          View Details
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          View Details
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          View Details
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          ✓ Accounted
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewAccounting(shift)}
                          >
                            <Receipt className="mr-1 h-3 w-3" />
                            View Details
                          </Button>
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

      {/* Accounting Dialog */}
      <Dialog
        open={isAccountingDialogOpen}
        onOpenChange={setIsAccountingDialogOpen}
      >
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Accounting Details</DialogTitle>
            <DialogDescription>
              View and edit accounting details for shift by{" "}
              {selectedShiftForAccounting?.salesmanUsername}
            </DialogDescription>
          </DialogHeader>
          {selectedShiftForAccounting && (
            <AccountingForm
              shift={selectedShiftForAccounting}
              onSubmit={handleAccountingSubmit}
              onCancel={handleAccountingCancel}
              loading={loading}
              existingAccounting={existingAccounting}
              isReadOnly={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
