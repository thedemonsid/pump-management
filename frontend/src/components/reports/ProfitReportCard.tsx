import { useState } from "react";
import { format } from "date-fns";
import { ProfitReportService } from "@/services/profit-report-service";
import type { ProfitReport } from "@/types/profit-report";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Fuel,
  Receipt,
  Calendar,
  BarChart3,
  RefreshCw,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Profit Report Component for Pump Admin
 *
 * Displays fuel profit analysis for day, month, and year periods.
 * Reports are fetched on-demand via buttons, not automatically.
 */
export function ProfitReportCard() {
  const [loading, setLoading] = useState<{
    day: boolean;
    month: boolean;
    year: boolean;
    custom: boolean;
  }>({
    day: false,
    month: false,
    year: false,
    custom: false,
  });

  const [reports, setReports] = useState<{
    day: ProfitReport | null;
    month: ProfitReport | null;
    year: ProfitReport | null;
    custom: ProfitReport | null;
  }>({
    day: null,
    month: null,
    year: null,
    custom: null,
  });

  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();

  const fetchDayProfit = async () => {
    setLoading((prev) => ({ ...prev, day: true }));
    try {
      const data = await ProfitReportService.getTodayProfit();
      setReports((prev) => ({ ...prev, day: data }));
      toast.success("Today's profit report loaded successfully");
    } catch (error) {
      console.error("Error fetching today's profit:", error);
      toast.error("Failed to load today's profit report");
    } finally {
      setLoading((prev) => ({ ...prev, day: false }));
    }
  };

  const fetchMonthProfit = async () => {
    setLoading((prev) => ({ ...prev, month: true }));
    try {
      const data = await ProfitReportService.getMonthProfit();
      setReports((prev) => ({ ...prev, month: data }));
      toast.success("This month's profit report loaded successfully");
    } catch (error) {
      console.error("Error fetching month profit:", error);
      toast.error("Failed to load month profit report");
    } finally {
      setLoading((prev) => ({ ...prev, month: false }));
    }
  };

  const fetchYearProfit = async () => {
    setLoading((prev) => ({ ...prev, year: true }));
    try {
      const data = await ProfitReportService.getYearProfit();
      setReports((prev) => ({ ...prev, year: data }));
      toast.success("This year's profit report loaded successfully");
    } catch (error) {
      console.error("Error fetching year profit:", error);
      toast.error("Failed to load year profit report");
    } finally {
      setLoading((prev) => ({ ...prev, year: false }));
    }
  };

  const fetchCustomDateProfit = async () => {
    if (!customStartDate || !customEndDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (customStartDate > customEndDate) {
      toast.error("Start date must be before or equal to end date");
      return;
    }

    setLoading((prev) => ({ ...prev, custom: true }));
    try {
      const startDateStr = format(customStartDate, "yyyy-MM-dd");
      const endDateStr = format(customEndDate, "yyyy-MM-dd");
      const data = await ProfitReportService.getProfitByDateRange(
        startDateStr,
        endDateStr
      );
      setReports((prev) => ({ ...prev, custom: data }));
      toast.success("Custom date profit report loaded successfully");
    } catch (error) {
      console.error("Error fetching custom date profit:", error);
      toast.error("Failed to load custom date profit report");
    } finally {
      setLoading((prev) => ({ ...prev, custom: false }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const renderProfitSummary = (
    report: ProfitReport | null,
    period: string,
    loading: boolean
  ) => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-2">
            Loading {period} profit report...
          </p>
        </div>
      );
    }

    if (!report) {
      return (
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Click the button above to load {period} profit report
          </p>
        </div>
      );
    }

    const { fuelProfitBreakdown, fuelMetrics, productWiseProfit } = report;
    const isProfitable = fuelProfitBreakdown.netProfit >= 0;

    return (
      <div className="space-y-6">
        {/* Main Profit Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Fuel Sales Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-green-600" />
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(fuelProfitBreakdown.fuelSalesRevenue)}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From {fuelMetrics.fuelBillsCount} bills
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-red-600" />
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(
                    fuelProfitBreakdown.fuelPurchasesCost +
                      fuelProfitBreakdown.operatingExpenses
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Purchases + Expenses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {isProfitable ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <div
                  className={`text-2xl font-bold ${
                    isProfitable ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(fuelProfitBreakdown.netProfit)}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Margin: {fuelProfitBreakdown.profitMargin.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Fuel Purchases
              </span>
              <span className="text-sm font-medium">
                {formatCurrency(fuelProfitBreakdown.fuelPurchasesCost)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Operating Expenses
              </span>
              <span className="text-sm font-medium">
                {formatCurrency(fuelProfitBreakdown.operatingExpenses)}
              </span>
            </div>
            <div className="border-t pt-3 flex items-center justify-between">
              <span className="text-sm font-semibold">Gross Profit</span>
              <span
                className={`text-sm font-semibold ${
                  fuelProfitBreakdown.grossProfit >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatCurrency(fuelProfitBreakdown.grossProfit)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Fuel Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              Fuel Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Fuel Sold</p>
                <p className="text-lg font-semibold">
                  {formatNumber(fuelMetrics.totalFuelSold)} L
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Total Fuel Purchased
                </p>
                <p className="text-lg font-semibold">
                  {formatNumber(fuelMetrics.totalFuelPurchased)} L
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Avg. Selling Price
                </p>
                <p className="text-lg font-semibold">
                  {formatCurrency(fuelMetrics.averageSellingPrice)}/L
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Avg. Purchase Price
                </p>
                <p className="text-lg font-semibold">
                  {formatCurrency(fuelMetrics.averagePurchasePrice)}/L
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product-wise Profit */}
        {productWiseProfit.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Product-wise Profit Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productWiseProfit.map((product) => (
                  <div
                    key={product.productId}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{product.productName}</h4>
                      <span
                        className={`font-bold ${
                          product.profit >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(product.profit)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Sales Revenue</p>
                        <p className="font-medium">
                          {formatCurrency(product.salesRevenue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Purchase Cost</p>
                        <p className="font-medium">
                          {formatCurrency(product.purchaseCost)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Quantity Sold</p>
                        <p className="font-medium">
                          {formatNumber(product.quantitySold)} L
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          Quantity Purchased
                        </p>
                        <p className="font-medium">
                          {formatNumber(product.quantityPurchased)} L
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Day Profit */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Profit Report
              </CardTitle>
              <CardDescription>
                View fuel sales profit for today
              </CardDescription>
            </div>
            <Button onClick={fetchDayProfit} disabled={loading.day} size="sm">
              {loading.day ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                "Load Report"
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {renderProfitSummary(reports.day, "today's", loading.day)}
        </CardContent>
      </Card>

      {/* Month Profit */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                This Month's Profit Report
              </CardTitle>
              <CardDescription>
                View fuel sales profit for current month
              </CardDescription>
            </div>
            <Button
              onClick={fetchMonthProfit}
              disabled={loading.month}
              size="sm"
            >
              {loading.month ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                "Load Report"
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {renderProfitSummary(reports.month, "this month's", loading.month)}
        </CardContent>
      </Card>

      {/* Year Profit */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                This Year's Profit Report
              </CardTitle>
              <CardDescription>
                View fuel sales profit for current year
              </CardDescription>
            </div>
            <Button onClick={fetchYearProfit} disabled={loading.year} size="sm">
              {loading.year ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                "Load Report"
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {renderProfitSummary(reports.year, "this year's", loading.year)}
        </CardContent>
      </Card>

      {/* Custom Date Range Profit */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Custom Date Range Profit Report
              </CardTitle>
              <CardDescription>
                View fuel sales profit for a specific date range
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Date Pickers */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !customStartDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {customStartDate ? (
                        format(customStartDate, "PPP")
                      ) : (
                        <span>Pick start date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={customStartDate}
                      onSelect={setCustomStartDate}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !customEndDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {customEndDate ? (
                        format(customEndDate, "PPP")
                      ) : (
                        <span>Pick end date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={customEndDate}
                      onSelect={setCustomEndDate}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                onClick={fetchCustomDateProfit}
                disabled={loading.custom}
                className="sm:mb-0"
              >
                {loading.custom ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <BarChart3 className="h-4 w-4 mr-2" />
                )}
                Load Report
              </Button>
            </div>

            {/* Report Display */}
            <div className="pt-4 border-t">
              {renderProfitSummary(
                reports.custom,
                "custom date range",
                loading.custom
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
