import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Users,
  Calendar,
  CreditCard,
  Search,
  FileText,
} from "lucide-react";
import { useCustomerStore } from "@/store/customer-store";
import { useLedgerStore } from "@/store/ledger-store";
import { useProductStore } from "@/store/product-store";
import { DataTable } from "@/components/ui/data-table";
import { ledgerColumns } from "./ledger-columns";
import type { LedgerEntry, LedgerSummary } from "@/types/ledger";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import { getStartOfMonth, getToday } from "@/lib/utils/date";
import { format } from "date-fns";

export function CustomerLedgerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { customers, fetchCustomers } = useCustomerStore();
  const {
    ledgerData,
    summary,
    loading,
    hasSearched,
    computeLedgerData,
  }: {
    ledgerData: LedgerEntry[];
    summary: LedgerSummary;
    loading: boolean;
    hasSearched: boolean;
    computeLedgerData: (params: {
      customerId: string;
      fromDate: string;
      toDate: string;
      openingBalance: number;
      pumpMasterId?: string;
    }) => Promise<void>;
  } = useLedgerStore();
  const { products, fetchProducts } = useProductStore();

  const [fromDate, setFromDate] = useState<Date | undefined>(getStartOfMonth());
  const [toDate, setToDate] = useState<Date | undefined>(getToday());

  const customer = customers.find((c) => c.id === id);

  // Compute product sales from ledger data
  const productSales = useMemo(() => {
    const salesMap = new Map<
      string,
      { productName: string; quantity: number; unit: string }
    >();

    ledgerData.forEach((entry) => {
      if (entry.type === "bill" && entry.billDetails?.billItems) {
        entry.billDetails.billItems.forEach((item) => {
          const product = products.find((p) => p.id === item.productId);
          const key = item.productId;
          const existing = salesMap.get(key) || {
            productName: item.productName || product?.productName || "Unknown",
            quantity: 0,
            unit: product?.salesUnit || "",
          };
          existing.quantity += item.quantity;
          salesMap.set(key, existing);
        });
      }
    });

    return Array.from(salesMap.values()).filter((s) => s.quantity > 0);
  }, [ledgerData, products]);

  useEffect(() => {
    if (customers.length === 0) {
      fetchCustomers();
    }
  }, [customers.length, fetchCustomers]);

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  const handleFetchLedger = () => {
    if (!id || !fromDate || !toDate) return;
    computeLedgerData({
      customerId: id,
      fromDate: fromDate.toISOString().split("T")[0],
      toDate: toDate.toISOString().split("T")[0],
      openingBalance: customer?.openingBalance || 0,
      pumpMasterId: customer?.pumpMasterId,
    });
  };

  const handleClearFilters = () => {
    setFromDate(getStartOfMonth());
    setToDate(getToday());
  };

  if (!customer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">
            Loading customer details...
          </span>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // const formatDate = (dateString: string) => {
  //   return new Date(dateString).toLocaleDateString("en-IN", {
  //     year: "numeric",
  //     month: "2-digit",
  //     day: "2-digit",
  //   });
  // };

  // Use summary values directly from store (calculations are done in store)
  const totalBillsTillDate = summary.totalBillsTillDate;
  const totalPaymentTillDate = summary.totalPaymentTillDate;
  const totalDebtTillDate = summary.totalDebtTillDate;
  const totalBillsBetweenDates = summary.totalBillsBetweenDates;

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Customer Ledger
            </h1>
            <p className="text-lg text-muted-foreground">
              {customer.customerName}
            </p>
          </div>
        </div>
        <Separator />
      </div>

      {/* Date Range Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Date Range Filter
          </CardTitle>
          <CardDescription>
            Select the date range and click fetch to view ledger entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <DateRangePicker
              fromDate={fromDate}
              toDate={toDate}
              onFromDateChange={setFromDate}
              onToDateChange={setToDate}
              disabled={loading}
            />

            <Button variant="outline" onClick={handleClearFilters}>
              Reset to Default
            </Button>
          </div>

          {(fromDate || toDate) && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing ledger entries
              {fromDate && ` from ${format(fromDate, "PPP")}`}
              {toDate && ` to ${format(toDate, "PPP")}`}
            </div>
          )}

          <div className="mt-6 flex justify-center gap-4">
            <Button
              onClick={handleFetchLedger}
              disabled={loading}
              size="lg"
              className="min-w-[200px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching Data...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Fetch Ledger Details
                </>
              )}
            </Button>
            {hasSearched && fromDate && toDate && (
              <Button
                onClick={() =>
                  navigate(
                    `/customers/${id}/ledger/report?fromDate=${
                      fromDate.toISOString().split("T")[0]
                    }&toDate=${toDate.toISOString().split("T")[0]}`
                  )
                }
                variant="outline"
                size="lg"
                className="min-w-[150px]"
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Show content only after search */}
      {hasSearched && (
        <>
          {/* Opening Balance Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Opening balance and account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Opening Balance
                  </p>
                  <p className="text-xl font-semibold text-foreground">
                    {formatCurrency(customer?.openingBalance || 0)}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Credit Limit
                  </p>
                  <p className="text-xl font-semibold text-foreground">
                    {formatCurrency(customer?.creditLimit || 0)}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Updated By
                  </p>
                  <p className="text-xl font-semibold text-foreground">
                    System
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pre-Date Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary Before Selected Date Range</CardTitle>
              <CardDescription>
                Financial summary before{" "}
                {fromDate ? format(fromDate, "PPP") : "selected date"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg bg-muted/20">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Total Bill Amount
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(summary.totalBillsBefore)}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-muted/20">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Total Amount Paid
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(summary.totalPaidBefore)}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-muted/20">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Total Outstanding
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      summary.totalDebtBefore >= 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {formatCurrency(Math.abs(summary.totalDebtBefore))}
                    {summary.totalDebtBefore < 0 && " (Credit)"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ledger Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Ledger Entries
              </CardTitle>
              <CardDescription>
                Transaction history for the selected date range
                {fromDate &&
                  toDate &&
                  ` (${format(fromDate, "PPP")} to ${format(toDate, "PPP")})`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ledgerData.length > 0 ? (
                <DataTable
                  columns={ledgerColumns}
                  data={ledgerData}
                  enableSorting={true}
                  enableFiltering={true}
                  enablePagination={true}
                  enableColumnVisibility={false}
                  pageSize={10}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No ledger entries found for the selected date range
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Sales Summary */}
          {productSales.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Product Sales Summary
                </CardTitle>
                <CardDescription>
                  Products sold to customer in the selected date range
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productSales.map((sale, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{sale.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          Unit: {sale.unit}
                        </p>
                      </div>
                      <p className="text-lg font-bold">
                        {sale.quantity} {sale.unit}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>
                Complete financial overview including all transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Total Bill Amount
                  </p>
                  <p className="text-xl font-bold text-blue-700">
                    {formatCurrency(totalBillsTillDate)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Till Date
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg ">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Total Payment Done
                  </p>
                  <p className="text-xl font-bold text-green-700">
                    {formatCurrency(totalPaymentTillDate)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Till Date
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg ">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Outstanding Balance
                  </p>
                  <p
                    className={`text-xl font-bold ${
                      totalDebtTillDate >= 0 ? "text-red-700" : "text-green-700"
                    }`}
                  >
                    {formatCurrency(Math.abs(totalDebtTillDate))}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalDebtTillDate < 0 ? "Credit Balance" : "Amount Due"}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Bills in Range
                  </p>
                  <p className="text-xl font-bold text-orange-700">
                    {formatCurrency(totalBillsBetweenDates)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Selected Period
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Show message if no search performed yet */}
      {!hasSearched && !loading && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Ready to View Ledger Details
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Select your desired date range above and click "Fetch Ledger
                  Details" to view the customer's transaction history and
                  financial summary.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
