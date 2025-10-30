import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ArrowUpDown, CalendarIcon, TrendingUp } from "lucide-react";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import { productSalesUnitChangeLogService } from "@/services/product-sales-unit-change-log-service";
import type { ProductSalesUnitChangeLog } from "@/types/product-sales-unit-change-log";
import { toast } from "sonner";
import { getProductSalesUnitChangeColumns } from "./ProductSalesUnitChangeReportColumns";

// Helper functions for default dates
const getOneWeekAgo = () => subDays(new Date(), 7);
const getToday = () => new Date();

export default function ProductSalesUnitChangeReportPage() {
  const [changeLogs, setChangeLogs] = useState<ProductSalesUnitChangeLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ProductSalesUnitChangeLog[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  // Date filter states
  const [fromDate, setFromDate] = useState<Date | undefined>(getOneWeekAgo());
  const [toDate, setToDate] = useState<Date | undefined>(getToday());
  const [isFromDateOpen, setIsFromDateOpen] = useState(false);
  const [isToDateOpen, setIsToDateOpen] = useState(false);

  const [productType, setProductType] = useState<"ALL" | "FUEL" | "GENERAL">(
    "ALL"
  );

  const fetchReport = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both from and to dates");
      return;
    }

    setLoading(true);

    try {
      let data: ProductSalesUnitChangeLog[];

      // Format dates as YYYY-MM-DDTHH:mm:ss
      const startDateTime = `${format(fromDate, "yyyy-MM-dd")}T00:00:00`;
      const endDateTime = `${format(toDate, "yyyy-MM-dd")}T23:59:59`;

      console.log("🔍 Fetching change logs with params:", {
        fromDate: format(fromDate, "PPP"),
        toDate: format(toDate, "PPP"),
        startDateTime,
        endDateTime,
        productType,
      });

      if (productType === "FUEL") {
        data =
          await productSalesUnitChangeLogService.getFuelProductChangesByDateRange(
            startDateTime,
            endDateTime
          );
      } else {
        data = await productSalesUnitChangeLogService.getByDateRange(
          startDateTime,
          endDateTime
        );
      }

      console.log("📊 Raw data received:", data);
      console.log("📊 Data type:", typeof data, Array.isArray(data));

      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error("❌ Data is not an array:", data);
        throw new Error("Invalid data format received from server");
      }

      // Filter by product type if not ALL
      if (productType === "GENERAL") {
        data = data.filter((log) => log.productType === "GENERAL");
      }

      console.log("✅ Filtered data:", data);

      setChangeLogs(data);
      setFilteredLogs(data);
      toast.success(`Found ${data.length} change log(s)`);
    } catch (error) {
      console.error("❌ Error fetching change logs:", error);
      toast.error("Failed to fetch change logs");
      // Reset to empty arrays on error
      setChangeLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when dates or product type changes
  useEffect(() => {
    if (fromDate && toDate) {
      fetchReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate, productType]);

  const handleClearFilters = () => {
    setFromDate(getOneWeekAgo());
    setToDate(getToday());
    setProductType("ALL");
  };

  if (loading && changeLogs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading change logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">
          Product Sales Unit Change Report
        </h3>
        <p className="text-muted-foreground">
          Track changes to product sales units and prices over time
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            {/* From Date */}
            <div className="flex-1 min-w-[200px]">
              <Label className="mb-2 block">From Date</Label>
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
              <Label className="mb-2 block">To Date</Label>
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

            {/* Product Type */}
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="productType" className="mb-2 block">
                Product Type
              </Label>
              <Select
                value={productType}
                onValueChange={(value: "ALL" | "FUEL" | "GENERAL") =>
                  setProductType(value)
                }
              >
                <SelectTrigger id="productType">
                  <SelectValue placeholder="Select product type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Products</SelectItem>
                  <SelectItem value="FUEL">Fuel Only</SelectItem>
                  <SelectItem value="GENERAL">General Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reset Button */}
            <Button variant="outline" onClick={handleClearFilters}>
              Reset to Default
            </Button>
          </div>

          {/* Show filtered count */}
          {(fromDate || toDate) && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {Array.isArray(filteredLogs) ? filteredLogs.length : 0}{" "}
              records
              {fromDate && ` from ${format(fromDate, "PPP")}`}
              {toDate && ` to ${format(toDate, "PPP")}`}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {Array.isArray(filteredLogs) && filteredLogs.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Changes
              </CardTitle>
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Array.isArray(filteredLogs) ? filteredLogs.length : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Changes in selected period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Fuel Products
              </CardTitle>
              <Badge variant="outline">Fuel</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Array.isArray(filteredLogs)
                  ? filteredLogs.filter((log) => log.productType === "FUEL")
                      .length
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Fuel product changes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Price Changes
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Array.isArray(filteredLogs)
                  ? filteredLogs.filter(
                      (log) =>
                        log.oldSalesRate &&
                        log.newSalesRate &&
                        log.oldSalesRate !== log.newSalesRate
                    ).length
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Products with price changes
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Change History</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={getProductSalesUnitChangeColumns()}
            data={Array.isArray(filteredLogs) ? filteredLogs : []}
            searchKey="productName"
            searchPlaceholder="Search by product name..."
            pageSize={10}
            enableRowSelection={false}
            enableColumnVisibility={true}
            enablePagination={true}
            enableSorting={true}
            enableFiltering={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
