import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./ledger-columns";
import { Separator } from "@/components/ui/separator";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import {
  Loader2,
  Building2,
  Calendar,
  CreditCard,
  Search,
  FileText,
} from "lucide-react";
import { useSupplierStore } from "@/store/supplier-store";
import { useSupplierLedgerStore } from "@/store/supplier-ledger-store";
import { getStartOfMonth, getToday } from "@/lib/utils/date";
import { format } from "date-fns";

export function SupplierLedgerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { suppliers, fetchSuppliers } = useSupplierStore();
  const { ledgerData, summary, loading, hasSearched, computeLedgerData } =
    useSupplierLedgerStore();

  const [fromDate, setFromDate] = useState<Date | undefined>(getStartOfMonth());
  const [toDate, setToDate] = useState<Date | undefined>(getToday());

  const supplier = suppliers.find((s) => s.id === id);

  useEffect(() => {
    if (suppliers.length === 0) {
      fetchSuppliers();
    }
  }, [suppliers.length, fetchSuppliers]);

  const handleFetchLedger = () => {
    if (!id || !fromDate || !toDate) return;
    computeLedgerData({
      supplierId: id,
      fromDate: fromDate.toISOString().split("T")[0],
      toDate: toDate.toISOString().split("T")[0],
      openingBalance: supplier?.openingBalance || 0,
    });
  };

  const handleClearFilters = () => {
    setFromDate(getStartOfMonth());
    setToDate(getToday());
  };

  if (!supplier) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">
            Loading supplier details...
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Use summary values directly from store (calculations are done in store)
  const totalPurchasesTillDate = summary.totalPurchasesTillDate;
  const totalPaymentTillDate = summary.totalPaymentTillDate;
  const totalDebtTillDate = summary.totalDebtTillDate;
  const totalPurchasesBetweenDates = summary.totalPurchasesBetweenDates;

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Supplier Ledger
            </h1>
            <p className="text-lg text-muted-foreground">
              {supplier.supplierName}
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
            <Button
              variant="outline"
              onClick={handleClearFilters}
              disabled={loading}
            >
              Reset to Default
            </Button>
          </div>

          {(fromDate || toDate) && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing ledger
              {fromDate && ` from ${format(fromDate, "PPP")}`}
              {toDate && ` to ${format(toDate, "PPP")}`}
            </div>
          )}

          <div className="mt-6 flex justify-center gap-4">
            <Button
              onClick={handleFetchLedger}
              disabled={loading || !fromDate || !toDate}
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
                    `/suppliers/${id}/ledger/report?fromDate=${
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
                    Total Purchase Amount
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(summary.totalPurchasesBefore)}
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
                    {summary.totalDebtBefore < 0 && " (Advance)"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                    {formatCurrency(supplier?.openingBalance || 0)}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Balance Date
                  </p>
                  <p className="text-xl font-semibold text-foreground">
                    {supplier?.openingBalanceDate
                      ? formatDate(supplier.openingBalanceDate)
                      : "Not specified"}
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

          {/* Ledger Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Ledger Entries
              </CardTitle>
              <CardDescription>
                Transaction history for the selected date range
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ledgerData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found for the selected date range.
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={ledgerData}
                  searchKey="invoiceNo"
                  searchPlaceholder="Filter by invoice number..."
                  pageSize={20}
                  enableSorting={true}
                  enableFiltering={true}
                  enablePagination={true}
                  enableColumnVisibility={true}
                />
              )}
            </CardContent>
          </Card>

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
                    Total Purchase Amount
                  </p>
                  <p className="text-xl font-bold text-blue-700">
                    {formatCurrency(totalPurchasesTillDate)}
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
                    {totalDebtTillDate < 0 ? "Advance Payment" : "Amount Due"}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Purchase in Range
                  </p>
                  <p className="text-xl font-bold text-orange-700">
                    {formatCurrency(totalPurchasesBetweenDates)}
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
                  Details" to view the supplier's transaction history and
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
