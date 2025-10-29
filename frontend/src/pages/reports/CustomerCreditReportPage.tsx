import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useCustomerStore } from "@/store/customer-store";
import { useLedgerStore } from "@/store/ledger-store";
import { BillService } from "@/services/bill-service";
import { CustomerBillPaymentService } from "@/services/customer-bill-payment-service";
import { SalesmanBillService, SalesmanBillPaymentService } from "@/services";
import { pdf } from "@react-pdf/renderer";
import { CustomerCreditPDF } from "@/components/pdf-reports";

interface CustomerCredit {
  customerName: string;
  address: string;
  mobile: string;
  openingBalance: number;
  billAmount: number;
  paidAmount: number;
  salesmanBillAmount: number;
  salesmanPaidAmount: number;
  creditAmount: number;
}

export default function CustomerCreditReportPage() {
  const { customers, fetchCustomers } = useCustomerStore();
  const { computeCustomerSummaries } = useLedgerStore();
  const [isLoading, setIsLoading] = useState(false);

  const [fromDate, setFromDate] = useState<string>(
    format(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      "yyyy-MM-dd"
    )
  );
  const [toDate, setToDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [minCreditAmount, setMinCreditAmount] = useState<string>("");
  const [maxCreditAmount, setMaxCreditAmount] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);
  const [customerCredits, setCustomerCredits] = useState<CustomerCredit[]>([]);

  useEffect(() => {
    if (customers.length === 0) {
      fetchCustomers();
    }
  }, [customers.length, fetchCustomers]);

  const fetchReport = async () => {
    setIsLoading(true);
    setHasSearched(true);

    try {
      // Fetch all bills and payments (both regular and salesman)
      const [bills, payments, salesmanBills, salesmanPayments] =
        await Promise.all([
          BillService.getAll(),
          CustomerBillPaymentService.getAll(),
          SalesmanBillService.getAll(),
          SalesmanBillPaymentService.getAll(),
        ]);

      // Use the store's computation method to get summaries for all customers
      const summaries = computeCustomerSummaries(customers, bills, payments);

      // Convert summaries to CustomerCredit format and include salesman bills/payments
      let credits: CustomerCredit[] = summaries.map((summary) => {
        const customer = customers.find((c) => c.id === summary.customerId);

        // Calculate salesman bills for this customer
        const customerSalesmanBills = salesmanBills.filter(
          (bill) => bill.customerId === summary.customerId
        );
        const salesmanBillAmount = customerSalesmanBills.reduce(
          (sum, bill) => sum + bill.amount,
          0
        );

        // Calculate salesman payments for this customer
        const customerSalesmanPayments = salesmanPayments.filter(
          (payment) => payment.customerId === summary.customerId
        );
        const salesmanPaidAmount = customerSalesmanPayments.reduce(
          (sum, payment) => sum + payment.amount,
          0
        );

        return {
          customerName: summary.customerName,
          address: customer?.address || "N/A",
          mobile: customer?.phoneNumber || "N/A",
          openingBalance: customer?.openingBalance || 0,
          billAmount: summary.totalBills,
          paidAmount: summary.totalPaid,
          salesmanBillAmount,
          salesmanPaidAmount,
          creditAmount:
            summary.balance + salesmanBillAmount - salesmanPaidAmount,
        };
      });

      // Apply min/max filters
      if (minCreditAmount) {
        const min = parseFloat(minCreditAmount);
        credits = credits.filter((c) => c.creditAmount >= min);
      }
      if (maxCreditAmount) {
        const max = parseFloat(maxCreditAmount);
        credits = credits.filter((c) => c.creditAmount <= max);
      }

      // Sort by credit amount descending
      credits.sort((a, b) => b.creditAmount - a.creditAmount);

      setCustomerCredits(credits);
    } catch (error) {
      console.error("Error fetching customer credit report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await pdf(
        <CustomerCreditPDF
          data={customerCredits}
          fromDate={fromDate}
          toDate={toDate}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `customer-credit-report-${format(
        new Date(),
        "yyyy-MM-dd"
      )}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
    return formatted;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Calculate totals
  const totalOpeningBalance = customerCredits.reduce(
    (sum, c) => sum + c.openingBalance,
    0
  );
  const totalBillAmount = customerCredits.reduce(
    (sum, c) => sum + c.billAmount,
    0
  );
  const totalPaidAmount = customerCredits.reduce(
    (sum, c) => sum + c.paidAmount,
    0
  );
  const totalSalesmanBillAmount = customerCredits.reduce(
    (sum, c) => sum + c.salesmanBillAmount,
    0
  );
  const totalSalesmanPaidAmount = customerCredits.reduce(
    (sum, c) => sum + c.salesmanPaidAmount,
    0
  );
  const totalCreditAmount = customerCredits.reduce(
    (sum, c) => sum + c.creditAmount,
    0
  );

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Customer Credit Report
          </h2>
          <p className="text-muted-foreground">
            View outstanding credits and payment details for all customers
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl">
            {hasSearched
              ? `GET Customer Credit REPORT For Date Between ${formatDate(
                  fromDate
                )} to ${formatDate(toDate)}`
              : "APPLY FILTER"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="fromDate">From Date</Label>
              <div className="relative">
                <Input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toDate">To Date</Label>
              <div className="relative">
                <Input
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minCredit">Minimum Credit Amount</Label>
              <Input
                id="minCredit"
                type="number"
                placeholder="Enter minimum amount"
                value={minCreditAmount}
                onChange={(e) => setMinCreditAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxCredit">Maximum Credit Amount</Label>
              <Input
                id="maxCredit"
                type="number"
                placeholder="Enter maximum amount"
                value={maxCreditAmount}
                onChange={(e) => setMaxCreditAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={fetchReport} disabled={isLoading}>
              <Search className="mr-2 h-4 w-4" />
              {isLoading ? "Loading..." : "Get Report"}
            </Button>
            {hasSearched && (
              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Table */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl">
              Customer Credit Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold">Sr. No.</TableHead>
                    <TableHead className="font-bold">Customer Name</TableHead>
                    <TableHead className="font-bold">Mobile</TableHead>
                    <TableHead className="font-bold">Address</TableHead>
                    <TableHead className="font-bold text-right">
                      Opening Balance
                    </TableHead>
                    <TableHead className="font-bold text-right">
                      Bill Amount
                    </TableHead>
                    <TableHead className="font-bold text-right">
                      Paid Amount
                    </TableHead>
                    <TableHead className="font-bold text-right">
                      Salesman Bill
                    </TableHead>
                    <TableHead className="font-bold text-right">
                      Salesman Paid
                    </TableHead>
                    <TableHead className="font-bold text-right">
                      Credit Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerCredits.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No customers found with credit in the selected criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    customerCredits.map((customer, index) => (
                      <TableRow key={index} className="hover:bg-muted/50">
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">
                          {customer.customerName}
                        </TableCell>
                        <TableCell>{customer.mobile}</TableCell>
                        <TableCell>{customer.address}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(customer.openingBalance)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(customer.billAmount)}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {formatCurrency(customer.paidAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(customer.salesmanBillAmount)}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {formatCurrency(customer.salesmanPaidAmount)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          {formatCurrency(customer.creditAmount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {customerCredits.length > 0 && (
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell colSpan={4} className="text-right">
                        Total:
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(totalOpeningBalance)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(totalBillAmount)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(totalPaidAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(totalSalesmanBillAmount)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(totalSalesmanPaidAmount)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {formatCurrency(totalCreditAmount)}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
