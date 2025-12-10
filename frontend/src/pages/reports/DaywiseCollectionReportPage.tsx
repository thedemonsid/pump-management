import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Search } from "lucide-react";
import { format } from "date-fns";
import { CustomerBillPaymentService } from "@/services/customer-bill-payment-service";
import { SalesmanBillPaymentService } from "@/services/salesman-bill-payment-service";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import { getOneWeekAgo, getToday } from "@/lib/utils/date";
import { pdf } from "@react-pdf/renderer";
import { DaywiseCollectionPDF } from "@/components/pdf-reports";
import type {
  CustomerBillPaymentResponse,
  SalesmanBillPaymentResponse,
} from "@/types";

interface CollectionData {
  customerPayments: CustomerBillPaymentResponse[];
  salesmanPayments: SalesmanBillPaymentResponse[];
  totalCustomerPayments: number;
  totalSalesmanPayments: number;
  grandTotal: number;
}

export default function DaywiseCollectionReportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [fromDate, setFromDate] = useState<Date | undefined>(getOneWeekAgo());
  const [toDate, setToDate] = useState<Date | undefined>(getToday());
  const [hasSearched, setHasSearched] = useState(false);
  const [collectionData, setCollectionData] = useState<CollectionData>({
    customerPayments: [],
    salesmanPayments: [],
    totalCustomerPayments: 0,
    totalSalesmanPayments: 0,
    grandTotal: 0,
  });

  const fetchReport = async () => {
    if (!fromDate || !toDate) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      // Format dates as YYYY-MM-DD for API
      const fromDateStr = format(fromDate, "yyyy-MM-dd");
      const toDateStr = format(toDate, "yyyy-MM-dd");

      // Fetch all payment data for the selected date range using optimized endpoints
      const [customerPayments, salesmanPayments] = await Promise.all([
        CustomerBillPaymentService.getByDateRange(fromDateStr, toDateStr),
        SalesmanBillPaymentService.getByDateRange(fromDateStr, toDateStr),
      ]);

      // Calculate totals
      const totalCustomerPayments = customerPayments.reduce(
        (sum: number, payment: CustomerBillPaymentResponse) =>
          sum + payment.amount,
        0
      );

      const totalSalesmanPayments = salesmanPayments.reduce(
        (sum: number, payment: SalesmanBillPaymentResponse) =>
          sum + payment.amount,
        0
      );

      const grandTotal = totalCustomerPayments + totalSalesmanPayments;

      setCollectionData({
        customerPayments,
        salesmanPayments,
        totalCustomerPayments,
        totalSalesmanPayments,
        grandTotal,
      });
    } catch (error) {
      console.error("Error fetching daywise collection report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!fromDate || !toDate) return;

    try {
      const fromDateStr = format(fromDate, "yyyy-MM-dd");
      const toDateStr = format(toDate, "yyyy-MM-dd");

      const blob = await pdf(
        <DaywiseCollectionPDF
          data={collectionData}
          selectedDate={fromDateStr}
          fromDate={fromDateStr}
          toDate={toDateStr}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `daywise-collection-report-${fromDateStr}-to-${toDateStr}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const handleClearFilters = () => {
    setFromDate(getOneWeekAgo());
    setToDate(getToday());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const timeStr = date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateStr} ${timeStr}`;
  };

  return (
    <div className="flex-1 space-y-6 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Daywise Collection Report
          </h2>
          <p className="text-muted-foreground">
            View all money collections for a specific date
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl">
            {hasSearched && fromDate && toDate
              ? `GET Daywise Collection REPORT For Date Between ${format(
                  fromDate,
                  "PPP"
                )} to ${format(toDate, "PPP")}`
              : "APPLY FILTER"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <DateRangePicker
              fromDate={fromDate}
              toDate={toDate}
              onFromDateChange={setFromDate}
              onToDateChange={setToDate}
              fromLabel="From Date"
              toLabel="To Date"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <Button
              onClick={fetchReport}
              disabled={!fromDate || !toDate || isLoading}
            >
              <Search className="mr-2 h-4 w-4" />
              {isLoading ? "Loading..." : "Get Report"}
            </Button>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              disabled={isLoading}
            >
              Reset to Default
            </Button>
            {hasSearched && (
              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            )}
          </div>

          {hasSearched && fromDate && toDate && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Showing{" "}
              {collectionData.customerPayments.length +
                collectionData.salesmanPayments.length}{" "}
              payments from {format(fromDate, "PPP")} to {format(toDate, "PPP")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Sections */}
      {hasSearched && (
        <>
          {/* All Payments Combined */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">All Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-bold">Sr. No.</TableHead>
                      <TableHead className="font-bold">Type</TableHead>
                      <TableHead className="font-bold">Date & Time</TableHead>
                      <TableHead className="font-bold">Customer Name</TableHead>
                      <TableHead className="font-bold">
                        Payment Method
                      </TableHead>
                      <TableHead className="font-bold">Reference</TableHead>
                      <TableHead className="font-bold text-right">
                        Amount
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {collectionData.customerPayments.length === 0 &&
                    collectionData.salesmanPayments.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No payments found for this date
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {/* Customer Payments */}
                        {collectionData.customerPayments.map(
                          (payment, index) => (
                            <TableRow
                              key={`customer-${payment.id}`}
                              className="hover:bg-muted/50"
                            >
                              <TableCell>{index + 1}</TableCell>
                              <TableCell className="font-medium text-blue-600">
                                Customer
                              </TableCell>
                              <TableCell>
                                {formatDateTime(payment.paymentDate)}
                              </TableCell>
                              <TableCell className="font-medium">
                                {payment.customerName}
                              </TableCell>
                              <TableCell>{payment.paymentMethod}</TableCell>
                              <TableCell>
                                {payment.referenceNumber || "N/A"}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-green-600">
                                {formatCurrency(payment.amount)}
                              </TableCell>
                            </TableRow>
                          )
                        )}

                        {/* Salesman Payments */}
                        {collectionData.salesmanPayments.map(
                          (payment, index) => (
                            <TableRow
                              key={`salesman-${payment.id}`}
                              className="hover:bg-muted/50"
                            >
                              <TableCell>
                                {collectionData.customerPayments.length +
                                  index +
                                  1}
                              </TableCell>
                              <TableCell className="font-medium text-purple-600">
                                Salesman
                              </TableCell>
                              <TableCell>
                                {formatDateTime(payment.paymentDate)}
                              </TableCell>
                              <TableCell className="font-medium">
                                {payment.customerName}
                              </TableCell>
                              <TableCell>{payment.paymentMethod}</TableCell>
                              <TableCell>
                                {payment.referenceNumber || "N/A"}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-green-600">
                                {formatCurrency(payment.amount)}
                              </TableCell>
                            </TableRow>
                          )
                        )}

                        {/* Total Row */}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell colSpan={6} className="text-right">
                            Total:
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            {formatCurrency(collectionData.grandTotal)}
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-center">
                Collection Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-bold">
                        Customer Payments
                      </TableHead>
                      <TableHead className="font-bold">
                        Salesman Payments
                      </TableHead>
                      <TableHead className="font-bold">Grand Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-bold text-lg text-green-600">
                        {formatCurrency(collectionData.totalCustomerPayments)}
                      </TableCell>
                      <TableCell className="font-bold text-lg text-green-600">
                        {formatCurrency(collectionData.totalSalesmanPayments)}
                      </TableCell>
                      <TableCell className="font-bold text-lg text-blue-600">
                        {formatCurrency(collectionData.grandTotal)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
