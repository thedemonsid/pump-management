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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import { Download, Search } from "lucide-react";
import { format } from "date-fns";
import { getStartOfMonth, getToday } from "@/lib/utils/date";
import { useBankAccountStore } from "@/store/bank-account-store";
import { useBankAccountLedgerStore } from "@/store/bank-account-ledger-store";
import { pdf } from "@react-pdf/renderer";
import { BankAccountPDF } from "@/components/pdf-reports";

export default function BankAccountReportPage() {
  const { bankAccounts, fetchBankAccounts } = useBankAccountStore();
  const { ledgerData, summary, loading, hasSearched, computeLedgerData } =
    useBankAccountLedgerStore();

  const [fromDate, setFromDate] = useState<Date | undefined>(getStartOfMonth());
  const [toDate, setToDate] = useState<Date | undefined>(getToday());
  const [selectedAccount, setSelectedAccount] = useState<string>("");

  useEffect(() => {
    if (bankAccounts.length === 0) {
      fetchBankAccounts();
    }
  }, [bankAccounts.length, fetchBankAccounts]);

  useEffect(() => {
    if (bankAccounts.length > 0 && !selectedAccount && bankAccounts[0].id) {
      setSelectedAccount(bankAccounts[0].id);
    }
  }, [bankAccounts, selectedAccount]);

  const selectedBankAccount = bankAccounts.find(
    (acc) => acc.id === selectedAccount
  );

  const fetchReport = () => {
    if (!selectedAccount || !selectedBankAccount || !fromDate || !toDate)
      return;

    computeLedgerData({
      bankAccountId: selectedAccount,
      fromDate: format(fromDate, "yyyy-MM-dd"),
      toDate: format(toDate, "yyyy-MM-dd"),
      openingBalance: selectedBankAccount.openingBalance || 0,
    });
  };

  const handleDownload = async () => {
    if (!selectedBankAccount || !fromDate || !toDate) return;

    try {
      const blob = await pdf(
        <BankAccountPDF
          accountName={selectedBankAccount.accountHolderName}
          accountNumber={selectedBankAccount.accountNumber}
          data={ledgerData}
          summary={summary}
          fromDate={format(fromDate, "yyyy-MM-dd")}
          toDate={format(toDate, "yyyy-MM-dd")}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bank-account-report-${
        selectedBankAccount.accountNumber
      }-${format(new Date(), "yyyy-MM-dd")}.pdf`;
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

  const formatDateString = (date: Date) => {
    return format(date, "dd/MM/yyyy");
  };

  const handleClearFilters = () => {
    setFromDate(getStartOfMonth());
    setToDate(getToday());
  };

  return (
    <div className="flex-1 space-y-6 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Bank Account Report
          </h2>
          <p className="text-muted-foreground">
            View account statements and transaction history
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl">
            {hasSearched && fromDate && toDate
              ? `Bank Account Report For Date Between ${formatDateString(
                  fromDate
                )} to ${formatDateString(toDate)}`
              : "APPLY FILTER"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <DateRangePicker
              fromDate={fromDate}
              toDate={toDate}
              onFromDateChange={setFromDate}
              onToDateChange={setToDate}
              fromLabel="From Date*"
              toLabel="To Date*"
              disabled={loading}
            />

            <div className="space-y-2">
              <Label htmlFor="account">Select Account*</Label>
              <Select
                value={selectedAccount}
                onValueChange={setSelectedAccount}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id || ""}>
                      {account.accountNumber} - {account.accountHolderName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <Button
              onClick={fetchReport}
              disabled={loading || !selectedAccount}
            >
              <Search className="mr-2 h-4 w-4" />
              {loading ? "Loading..." : "Get Report"}
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Reset to Default
            </Button>
            {hasSearched && (
              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            )}
          </div>

          {hasSearched && (fromDate || toDate) && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Showing {ledgerData.length} transactions
              {fromDate && ` from ${format(fromDate, "PPP")}`}
              {toDate && ` to ${format(toDate, "PPP")}`}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Table */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl">
              Account Statement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Opening Balance */}
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Opening Balance:</span>
                <span className="text-blue-600">
                  {formatCurrency(summary.balanceBefore)}
                </span>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="font-bold">Payment Type</TableHead>
                    <TableHead className="font-bold">Details</TableHead>
                    <TableHead className="font-bold text-right">
                      Credit
                    </TableHead>
                    <TableHead className="font-bold text-right">
                      Debit
                    </TableHead>
                    <TableHead className="font-bold text-right">
                      Balance
                    </TableHead>
                    <TableHead className="font-bold">Entry By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerData.map((entry, index) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                      <TableCell>
                        {format(new Date(entry.date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        {entry.transactionDetails?.paymentMethod || "N/A"}
                      </TableCell>
                      <TableCell className="max-w-md">
                        {entry.description}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {entry.credit > 0 ? formatCurrency(entry.credit) : "-"}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {entry.debit > 0 ? formatCurrency(entry.debit) : "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(entry.balance)}
                      </TableCell>
                      <TableCell>{entry.entryBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Summary */}
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex justify-end items-center text-lg font-bold">
                <span className="mr-8">
                  Total Credit:{" "}
                  <span className="text-green-600">
                    {formatCurrency(summary.totalCreditsInRange)}
                  </span>
                </span>
                <span className="mr-8">
                  Total Debit:{" "}
                  <span className="text-red-600">
                    {formatCurrency(summary.totalDebitsInRange)}
                  </span>
                </span>
                <span>
                  Closing Balance:{" "}
                  <span className="text-blue-600">
                    {formatCurrency(summary.closingBalance)}
                  </span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
