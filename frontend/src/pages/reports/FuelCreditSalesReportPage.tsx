import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Download, FileText, Loader2, CalendarIcon } from "lucide-react";
import { format, subDays } from "date-fns";
import { SalesmanBillService } from "@/services/salesman-bill-service";
import type { SalesmanBillResponse } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const getTwoDaysAgo = () => subDays(new Date(), 2);
const getToday = () => new Date();

export default function FuelCreditSalesReportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [fromDate, setFromDate] = useState<Date | undefined>(getTwoDaysAgo());
  const [toDate, setToDate] = useState<Date | undefined>(getToday());
  const [isFromDateOpen, setIsFromDateOpen] = useState(false);
  const [isToDateOpen, setIsToDateOpen] = useState(false);
  const [bills, setBills] = useState<SalesmanBillResponse[]>([]);

  const fetchReport = useCallback(async () => {
    if (!fromDate || !toDate) {
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

      const data = await SalesmanBillService.getByDateRange(
        fromDateStr,
        toDateStr
      );
      setBills(data);
      if (data.length > 0) {
        toast.success(`Found ${data.length} credit sales bills`);
      }
    } catch (error) {
      console.error("Error fetching fuel credit sales report:", error);
      toast.error("Failed to fetch credit sales report");
      setBills([]);
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate]);

  // Fetch data when dates change
  useEffect(() => {
    if (fromDate && toDate) {
      fetchReport();
    }
  }, [fromDate, toDate, fetchReport]);

  const handleClearFilters = () => {
    setFromDate(getTwoDaysAgo());
    setToDate(getToday());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Calculate totals
  const totalQuantity = bills.reduce((sum, bill) => sum + bill.quantity, 0);
  const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);

  // Calculate product-wise summary
  const productSummary = bills.reduce((acc, bill) => {
    const productName = bill.productName || "Unknown";
    if (!acc[productName]) {
      acc[productName] = {
        quantity: 0,
        amount: 0,
        count: 0,
      };
    }
    acc[productName].quantity += bill.quantity;
    acc[productName].amount += bill.amount;
    acc[productName].count += 1;
    return acc;
  }, {} as Record<string, { quantity: number; amount: number; count: number }>);

  const columns: ColumnDef<SalesmanBillResponse>[] = [
    {
      accessorKey: "billNo",
      header: "Bill No",
      cell: ({ row }) => (
        <div className="font-medium">#{row.getValue("billNo")}</div>
      ),
    },
    {
      accessorKey: "billDate",
      header: "Bill Date",
      cell: ({ row }) => formatDate(row.getValue("billDate")),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("customerName")}</div>
      ),
    },
    {
      accessorKey: "productName",
      header: "Product",
      cell: ({ row }) => row.getValue("productName") || "-",
    },
    {
      accessorKey: "quantity",
      header: "Quantity (L)",
      cell: ({ row }) => (
        <div className="text-right">
          {(row.getValue("quantity") as number).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "rate",
      header: "Rate/L",
      cell: ({ row }) => (
        <div className="text-right">{formatCurrency(row.getValue("rate"))}</div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="text-right font-semibold">
          {formatCurrency(row.getValue("amount"))}
        </div>
      ),
    },
    {
      accessorKey: "vehicleNo",
      header: "Vehicle No",
      cell: ({ row }) => row.getValue("vehicleNo") || "-",
    },
    {
      accessorKey: "driverName",
      header: "Driver",
      cell: ({ row }) => row.getValue("driverName") || "-",
    },
  ];

  const handleDownloadCSV = () => {
    if (bills.length === 0) {
      toast.error("No data to download");
      return;
    }

    // Create CSV content
    const headers = [
      "Bill No",
      "Bill Date",
      "Customer",
      "Product",
      "Quantity (L)",
      "Rate/L",
      "Amount",
      "Vehicle No",
      "Driver",
    ];

    const rows = bills.map((bill) => [
      bill.billNo,
      formatDate(bill.billDate),
      bill.customerName || "",
      bill.productName || "",
      bill.quantity.toFixed(2),
      bill.rate.toFixed(2),
      bill.amount.toFixed(2),
      bill.vehicleNo || "",
      bill.driverName || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const fromDateStr = fromDate ? format(fromDate, "yyyy-MM-dd") : "";
    const toDateStr = toDate ? format(toDate, "yyyy-MM-dd") : "";
    link.download = `fuel-credit-sales-report-${fromDateStr}-to-${toDateStr}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded successfully");
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Fuel Credit Sales Report
          </h2>
          <p className="text-muted-foreground">
            View credit sales bills by date range
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Filter by Date Range
          </CardTitle>
          <CardDescription>
            Select a date range to view credit sales bills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            {/* From Date */}
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
                  <Calendar
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

            {/* To Date */}
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
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={(date) => {
                      setToDate(date);
                      setIsToDateOpen(false);
                    }}
                    disabled={(date) => {
                      if (date > new Date()) return true;
                      if (fromDate && date < fromDate) return true;
                      return false;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button variant="outline" onClick={handleClearFilters}>
              Reset to Default
            </Button>

            {bills.length > 0 && (
              <Button
                onClick={handleDownloadCSV}
                variant="outline"
                disabled={isLoading}
              >
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
            )}
          </div>

          {(fromDate || toDate) && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {bills.length} records
              {fromDate && ` from ${format(fromDate, "PPP")}`}
              {toDate && ` to ${format(toDate, "PPP")}`}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {!isLoading && bills.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bills.length}</div>
              <p className="text-xs text-muted-foreground">
                Credit sales recorded
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Quantity
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalQuantity.toFixed(2)} L
              </div>
              <p className="text-xs text-muted-foreground">
                Fuel dispensed on credit
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Amount
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total credit sales value
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results */}
      {!isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Credit Sales Bills</CardTitle>
          </CardHeader>
          <CardContent>
            {bills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bills found</h3>
                <p className="text-sm text-muted-foreground">
                  No credit sales bills found for the selected date range
                </p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={bills}
                searchKey="customerName"
                searchPlaceholder="Search by customer..."
                pageSize={20}
                enablePagination={true}
                enableSorting={true}
                enableFiltering={true}
                enableColumnVisibility={true}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Product-wise Summary */}
      {!isLoading &&
        bills.length > 0 &&
        Object.keys(productSummary).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Product-wise Sales Summary
              </CardTitle>
              <CardDescription>Breakdown of sales by product</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(productSummary).map(
                  ([productName, summary]) => (
                    <Card key={productName}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">
                          {productName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Quantity:
                          </span>
                          <span className="font-semibold">
                            {summary.quantity.toFixed(2)} L
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Amount:
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(summary.amount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Bills:
                          </span>
                          <span className="font-semibold">{summary.count}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-sm text-muted-foreground">
                            Avg Rate:
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(summary.amount / summary.quantity)}
                            /L
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
            <h3 className="text-lg font-semibold mb-2">Loading...</h3>
            <p className="text-sm text-muted-foreground">
              Fetching credit sales bills
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
