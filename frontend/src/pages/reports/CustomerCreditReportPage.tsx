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
import {
  Download,
  Search,
  Calendar as CalendarIcon,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useCustomerStore } from "@/store/customer-store";
import { useLedgerStore } from "@/store/ledger-store";
import { BillService } from "@/services/bill-service";
import { CustomerBillPaymentService } from "@/services/customer-bill-payment-service";

interface CustomerCredit {
  customerName: string;
  address: string;
  mobile: string;
  openingBalance: number;
  billAmount: number;
  paidAmount: number;
  creditAmount: number;
}

export default function CustomerCreditReportPage() {
  const navigate = useNavigate();
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
      // Fetch all bills and payments
      const [bills, payments] = await Promise.all([
        BillService.getAll(),
        CustomerBillPaymentService.getAll(),
      ]);

      // Use the store's computation method to get summaries for all customers
      const summaries = computeCustomerSummaries(customers, bills, payments);

      // Convert summaries to CustomerCredit format
      let credits: CustomerCredit[] = summaries.map((summary) => {
        const customer = customers.find((c) => c.id === summary.customerId);
        return {
          customerName: summary.customerName,
          address: customer?.address || "N/A",
          mobile: customer?.phoneNumber || "N/A",
          openingBalance: customer?.openingBalance || 0,
          billAmount: summary.totalBills,
          paidAmount: summary.totalPaid,
          creditAmount: summary.balance,
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

  const handleDownload = () => {
    console.log("Downloading customer credit report...");
  };

  const handleSendWhatsApp = (customer: CustomerCredit) => {
    const message = `Dear ${
      customer.customerName
    },\n\nYour account statement:\nOpening Balance: ₹${customer.openingBalance.toFixed(
      2
    )}\nBill Amount: ₹${customer.billAmount.toFixed(
      2
    )}\nPaid Amount: ₹${customer.paidAmount.toFixed(
      2
    )}\nOutstanding Credit: ₹${customer.creditAmount.toFixed(
      2
    )}\n\nThank you for your business!`;

    const phoneNumber = customer.mobile.replace(/[^0-9]/g, "");
    const whatsappUrl = `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
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
  const totalCreditAmount = customerCredits.reduce(
    (sum, c) => sum + c.creditAmount,
    0
  );

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate("/reports")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Button>
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
                <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
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
                <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
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
                      Credit Amount
                    </TableHead>
                    <TableHead className="font-bold text-center">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerCredits.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
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
                        <TableCell className="text-right font-semibold text-red-600">
                          {formatCurrency(customer.creditAmount)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendWhatsApp(customer)}
                            className="gap-2"
                          >
                            <MessageCircle className="h-4 w-4" />
                            Send WhatsApp Message
                          </Button>
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
                      <TableCell className="text-right text-red-600">
                        {formatCurrency(totalCreditAmount)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Summary Cards */}
            {customerCredits.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Total Customers
                  </p>
                  <p className="text-2xl font-bold">{customerCredits.length}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Total Opening Balance
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(totalOpeningBalance)}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Total Bill Amount
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totalBillAmount)}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalPaidAmount)}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Total Outstanding
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(totalCreditAmount)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
