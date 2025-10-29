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
import { Download, Search, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useSupplierStore } from "@/store/supplier-store";
import { useSupplierLedgerStore } from "@/store/supplier-ledger-store";
import { PurchaseService } from "@/services/purchase-service";
import { FuelPurchaseService } from "@/services/fuel-purchase-service";
import { SupplierPaymentService } from "@/services/supplier-payment-service";
import { pdf } from "@react-pdf/renderer";
import { SupplierDebtPDF } from "@/components/pdf-reports";

interface SupplierDebt {
  supplierName: string;
  address: string;
  openingBalance: number;
  purchaseAmount: number;
  paidAmount: number;
  debtAmount: number;
}

export default function SupplierDebtReportPage() {
  const navigate = useNavigate();
  const { suppliers, fetchSuppliers } = useSupplierStore();
  const { computeSupplierSummaries } = useSupplierLedgerStore();
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
  const [minDebtAmount, setMinDebtAmount] = useState<string>("");
  const [maxDebtAmount, setMaxDebtAmount] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);
  const [supplierDebts, setSupplierDebts] = useState<SupplierDebt[]>([]);

  useEffect(() => {
    if (suppliers.length === 0) {
      fetchSuppliers();
    }
  }, [suppliers.length, fetchSuppliers]);

  const fetchReport = async () => {
    setIsLoading(true);
    setHasSearched(true);

    try {
      // Fetch all purchases, fuel purchases, and payments
      const [purchases, fuelPurchases, payments] = await Promise.all([
        PurchaseService.getAll(),
        FuelPurchaseService.getAll(),
        SupplierPaymentService.getAll(),
      ]);

      // Use the store's computation method to get summaries for all suppliers
      const summaries = computeSupplierSummaries(
        suppliers,
        purchases,
        fuelPurchases,
        payments
      );

      // Convert summaries to SupplierDebt format
      let debts: SupplierDebt[] = summaries.map((summary) => {
        const supplier = suppliers.find((s) => s.id === summary.supplierId);
        return {
          supplierName: summary.supplierName,
          address: supplier?.address || "N/A",
          openingBalance: supplier?.openingBalance || 0,
          purchaseAmount: summary.totalPurchases,
          paidAmount: summary.totalPaid,
          debtAmount: summary.balance,
        };
      });

      // Apply min/max filters
      if (minDebtAmount) {
        const min = parseFloat(minDebtAmount);
        debts = debts.filter((d) => d.debtAmount >= min);
      }
      if (maxDebtAmount) {
        const max = parseFloat(maxDebtAmount);
        debts = debts.filter((d) => d.debtAmount <= max);
      }

      // Sort by debt amount descending
      debts.sort((a, b) => b.debtAmount - a.debtAmount);

      setSupplierDebts(debts);
    } catch (error) {
      console.error("Error fetching supplier debt report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      // Need to add mobile field to match PDF interface
      const supplierDebtsWithMobile = supplierDebts.map((debt) => ({
        ...debt,
        mobile:
          suppliers.find((s) => s.supplierName === debt.supplierName)
            ?.contactNumber || "N/A",
      }));

      const blob = await pdf(
        <SupplierDebtPDF
          data={supplierDebtsWithMobile}
          fromDate={fromDate}
          toDate={toDate}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `supplier-debt-report-${format(
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
  const totalOpeningBalance = supplierDebts.reduce(
    (sum, s) => sum + s.openingBalance,
    0
  );
  const totalPurchaseAmount = supplierDebts.reduce(
    (sum, s) => sum + s.purchaseAmount,
    0
  );
  const totalPaidAmount = supplierDebts.reduce(
    (sum, s) => sum + s.paidAmount,
    0
  );
  const totalDebtAmount = supplierDebts.reduce(
    (sum, s) => sum + s.debtAmount,
    0
  );

  return (
    <div className="flex-1 space-y-6">
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
            Supplier Debt Report
          </h2>
          <p className="text-muted-foreground">
            View outstanding debts and payment details for all suppliers
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl">
            {hasSearched
              ? `GET Supplier Debt REPORT For Date Between ${formatDate(
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
              <Label htmlFor="minDebt">Minimum Debt Amount</Label>
              <Input
                id="minDebt"
                type="number"
                placeholder="Enter minimum amount"
                value={minDebtAmount}
                onChange={(e) => setMinDebtAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxDebt">Maximum Debt Amount</Label>
              <Input
                id="maxDebt"
                type="number"
                placeholder="Enter maximum amount"
                value={maxDebtAmount}
                onChange={(e) => setMaxDebtAmount(e.target.value)}
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
              Supplier Debt Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold">Sr. No.</TableHead>
                    <TableHead className="font-bold">Supplier Name</TableHead>
                    <TableHead className="font-bold">Address</TableHead>
                    <TableHead className="font-bold text-right">
                      Opening Balance
                    </TableHead>
                    <TableHead className="font-bold text-right">
                      Purchase Amount
                    </TableHead>
                    <TableHead className="font-bold text-right">
                      Paid Amount
                    </TableHead>
                    <TableHead className="font-bold text-right">
                      Debt Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplierDebts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No suppliers found with debt in the selected criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    supplierDebts.map((supplier, index) => (
                      <TableRow key={index} className="hover:bg-muted/50">
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">
                          {supplier.supplierName}
                        </TableCell>
                        <TableCell>{supplier.address}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(supplier.openingBalance)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(supplier.purchaseAmount)}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {formatCurrency(supplier.paidAmount)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          {formatCurrency(supplier.debtAmount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {supplierDebts.length > 0 && (
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell colSpan={3} className="text-right">
                        Total:
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(totalOpeningBalance)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(totalPurchaseAmount)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(totalPaidAmount)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {formatCurrency(totalDebtAmount)}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Summary Cards */}
            {supplierDebts.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Total Suppliers
                  </p>
                  <p className="text-2xl font-bold">{supplierDebts.length}</p>
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
                    Total Purchase
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totalPurchaseAmount)}
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
                    {formatCurrency(totalDebtAmount)}
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
