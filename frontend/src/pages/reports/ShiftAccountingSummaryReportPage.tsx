import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Download,
  Search,
  IndianRupee,
  Calendar as CalendarIcon,
  Loader2,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import { SalesmanShiftService } from "@/services/salesman-shift-service";
import { SalesmanShiftAccountingService } from "@/services/salesman-shift-accounting-service";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import {
  shiftAccountingColumns,
  type ShiftAccountingData,
} from "./ShiftAccountingSummaryColumns";

// Helper functions for default date range
const getOneWeekAgo = () => subDays(new Date(), 7);
const getToday = () => new Date();

export default function ShiftAccountingSummaryReportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [fromDate, setFromDate] = useState<Date | undefined>(getOneWeekAgo());
  const [toDate, setToDate] = useState<Date | undefined>(getToday());
  const [isFromDateOpen, setIsFromDateOpen] = useState(false);
  const [isToDateOpen, setIsToDateOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [shiftsData, setShiftsData] = useState<ShiftAccountingData[]>([]);

  // Auto-fetch on mount with default dates
  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReport = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both from and to dates");
      return;
    }

    if (fromDate > toDate) {
      toast.error("From date cannot be after to date");
      return;
    }

    setIsLoading(true);
    try {
      // Format dates as YYYY-MM-DD for API
      const fromDateStr = format(fromDate, "yyyy-MM-dd");
      const toDateStr = format(toDate, "yyyy-MM-dd");

      // Fetch all shifts in the date range
      const shifts = await SalesmanShiftService.getAll({
        fromDate: fromDateStr,
        toDate: toDateStr,
        status: "CLOSED", // Only get closed shifts
      });

      // Fetch accounting for each shift
      const shiftsWithAccounting = await Promise.all(
        shifts.map(async (shift) => {
          try {
            const accounting =
              await SalesmanShiftAccountingService.getByShiftId(shift.id);
            return { shift, accounting };
          } catch {
            // If no accounting found, return null
            return { shift, accounting: null };
          }
        })
      );

      setShiftsData(shiftsWithAccounting);
      setHasSearched(true);
    } catch (error) {
      console.error("Error fetching shift accounting report:", error);
      toast.error("Failed to fetch shift accounting report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFromDate(getOneWeekAgo());
    setToDate(getToday());
  };

  const calculateTotals = () => {
    return shiftsData.reduce(
      (totals, data) => {
        totals.openingCash += data.shift.openingCash || 0;
        if (data.accounting) {
          totals.fuelSales += data.accounting.fuelSales;
          totals.customerReceipt += data.accounting.customerReceipt;
          totals.systemReceived += data.accounting.systemReceivedAmount;
          totals.upiReceived += data.accounting.upiReceived;
          totals.cardReceived += data.accounting.cardReceived;
          totals.credit += data.accounting.credit;
          totals.expenses += data.accounting.expenses;
          totals.cashInHand += data.accounting.cashInHand;
          totals.balanceAmount += data.accounting.balanceAmount;
        }
        return totals;
      },
      {
        openingCash: 0,
        fuelSales: 0,
        customerReceipt: 0,
        systemReceived: 0,
        upiReceived: 0,
        cardReceived: 0,
        credit: 0,
        expenses: 0,
        cashInHand: 0,
        balanceAmount: 0,
      }
    );
  };

  const totals = calculateTotals();

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const getBalanceColor = (balance: number) => {
    if (balance === 0) return "text-green-600";
    if (balance > 0) return "text-blue-600";
    return "text-red-600";
  };

  const getBalanceText = (balance: number) => {
    if (balance === 0) return "Balanced";
    if (balance > 0) return "Excess";
    return "Shortage";
  };

  const handleExport = () => {
    if (shiftsData.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      // Prepare CSV headers
      const headers = [
        "Date",
        "Start Time",
        "End Time",
        "Salesman Name",
        "Salesman Username",
        "Duration (hours)",
        "Opening Cash",
        "Fuel Sales",
        "Customer Receipt",
        "System Received",
        "UPI",
        "Card",
        "Credit",
        "Expenses",
        "Cash in Hand",
        "Balance Amount",
        "Status",
      ];

      // Prepare CSV rows
      const rows = shiftsData.map((data) => {
        const { shift, accounting } = data;
        const duration = shift.endDatetime
          ? Math.round(
              (new Date(shift.endDatetime).getTime() -
                new Date(shift.startDatetime).getTime()) /
                (1000 * 60 * 60)
            )
          : 0;

        const startDate = new Date(shift.startDatetime);
        const endDate = shift.endDatetime ? new Date(shift.endDatetime) : null;

        return [
          format(startDate, "dd/MM/yyyy"),
          format(startDate, "hh:mm a"),
          endDate ? format(endDate, "hh:mm a") : "-",
          shift.salesmanFullName || shift.salesmanUsername,
          shift.salesmanUsername,
          duration.toString(),
          (shift.openingCash || 0).toFixed(2),
          accounting?.fuelSales?.toFixed(2) || "0.00",
          accounting?.customerReceipt?.toFixed(2) || "0.00",
          accounting?.systemReceivedAmount?.toFixed(2) || "0.00",
          accounting?.upiReceived?.toFixed(2) || "0.00",
          accounting?.cardReceived?.toFixed(2) || "0.00",
          accounting?.credit?.toFixed(2) || "0.00",
          accounting?.expenses?.toFixed(2) || "0.00",
          accounting?.cashInHand?.toFixed(2) || "0.00",
          accounting?.balanceAmount?.toFixed(2) || "0.00",
          accounting ? getBalanceText(accounting.balanceAmount) : "Pending",
        ];
      });

      // Add totals row
      rows.push([
        "TOTAL",
        "",
        "",
        "",
        "",
        "",
        totals.openingCash.toFixed(2),
        totals.fuelSales.toFixed(2),
        totals.customerReceipt.toFixed(2),
        totals.systemReceived.toFixed(2),
        totals.upiReceived.toFixed(2),
        totals.cardReceived.toFixed(2),
        totals.credit.toFixed(2),
        totals.expenses.toFixed(2),
        totals.cashInHand.toFixed(2),
        totals.balanceAmount.toFixed(2),
        getBalanceText(totals.balanceAmount),
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${cell.toString()}"`).join(",")
        ),
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      const filename = `shift-accounting-report-${
        fromDate ? format(fromDate, "yyyy-MM-dd") : "all"
      }-to-${toDate ? format(toDate, "yyyy-MM-dd") : "all"}.csv`;

      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Report exported successfully");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Shift Accounting Report
          </h1>
          <p className="text-muted-foreground">
            View accounting details for all shifts in a date range
          </p>
        </div>
      </div>

      {/* Filter Card */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by Date Range</CardTitle>
          <CardDescription>
            Select a date range to view shift accounting details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            {/* From Date Picker */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">
                From Date
              </label>
              <Popover open={isFromDateOpen} onOpenChange={setIsFromDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={fromDate}
                    onSelect={(date) => {
                      setFromDate(date);
                      setIsFromDateOpen(false);
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* To Date Picker */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">To Date</label>
              <Popover open={isToDateOpen} onOpenChange={setIsToDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={toDate}
                    onSelect={(date) => {
                      setToDate(date);
                      setIsToDateOpen(false);
                    }}
                    disabled={(date) => {
                      // Disable dates after today
                      if (date > new Date()) return true;
                      // Disable dates before fromDate if fromDate is set
                      if (fromDate && date < fromDate) return true;
                      return false;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Search Button */}
            <Button
              onClick={fetchReport}
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>

            {/* Reset Button */}
            <Button variant="outline" onClick={handleClearFilters}>
              Reset to Default
            </Button>
          </div>

          {/* Show record count when searched */}
          {hasSearched && (fromDate || toDate) && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {shiftsData.length} shift(s)
              {fromDate && ` from ${format(fromDate, "PPP")}`}
              {toDate && ` to ${format(toDate, "PPP")}`}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Shifts
                </CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{shiftsData.length}</div>
                <p className="text-xs text-muted-foreground">
                  {shiftsData.filter((d) => d.accounting).length} with
                  accounting
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Fuel Sales
                </CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totals.fuelSales)}
                </div>
                <p className="text-xs text-muted-foreground">
                  System received: {formatCurrency(totals.systemReceived)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Net Balance
                </CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${getBalanceColor(
                    totals.balanceAmount
                  )}`}
                >
                  {formatCurrency(totals.balanceAmount)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getBalanceText(totals.balanceAmount)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Shift Accounting Details</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={shiftsData.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {shiftsData.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No shifts found for the selected date range
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <DataTable
                    columns={shiftAccountingColumns}
                    data={shiftsData}
                    searchKey="shift.salesmanFullName"
                    searchPlaceholder="Search by salesman..."
                    pageSize={10}
                    enableRowSelection={false}
                    enableColumnVisibility={true}
                    enablePagination={true}
                    enableSorting={true}
                    enableFiltering={true}
                  />

                  {/* Totals Summary Card */}
                  {shiftsData.length > 0 && (
                    <Card className="bg-muted/50">
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Opening Cash
                            </p>
                            <p className="text-lg font-bold">
                              {formatCurrency(totals.openingCash)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Total Fuel Sales
                            </p>
                            <p className="text-lg font-bold">
                              {formatCurrency(totals.fuelSales)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Customer Receipt
                            </p>
                            <p className="text-lg font-bold">
                              {formatCurrency(totals.customerReceipt)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              System Received
                            </p>
                            <p className="text-lg font-bold">
                              {formatCurrency(totals.systemReceived)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              UPI
                            </p>
                            <p className="text-lg font-bold">
                              {formatCurrency(totals.upiReceived)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Card
                            </p>
                            <p className="text-lg font-bold">
                              {formatCurrency(totals.cardReceived)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Credit
                            </p>
                            <p className="text-lg font-bold">
                              {formatCurrency(totals.credit)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Expenses
                            </p>
                            <p className="text-lg font-bold">
                              {formatCurrency(totals.expenses)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Cash in Hand
                            </p>
                            <p className="text-lg font-bold">
                              {formatCurrency(totals.cashInHand)}
                            </p>
                          </div>
                          <div className="col-span-2 md:col-span-4 lg:col-span-2">
                            <p className="text-xs text-muted-foreground mb-1">
                              Balance Amount
                            </p>
                            <p
                              className={`text-xl font-bold ${getBalanceColor(
                                totals.balanceAmount
                              )}`}
                            >
                              {formatCurrency(totals.balanceAmount)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {getBalanceText(totals.balanceAmount)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
