import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, Download, ArrowLeft } from "lucide-react";
import { useEmployeeLedgerStore } from "@/store/employee-ledger-store";
import { UserService } from "@/services/user-service";
import type { User } from "@/types";

export function EmployeeSalaryLedgerReport() {
  const { userId } = useParams<{ userId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const fromDate = searchParams.get("fromDate") || "";
  const toDate = searchParams.get("toDate") || "";

  const { ledgerData, summary, loading, computeLedgerData } =
    useEmployeeLedgerStore();

  const [employee, setEmployee] = useState<User | null>(null);
  const [loadingEmployee, setLoadingEmployee] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !fromDate || !toDate) return;

      try {
        setLoadingEmployee(true);
        const userData = await UserService.getById(userId);
        setEmployee(userData);

        await computeLedgerData({
          userId,
          fromDate,
          toDate,
        });
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoadingEmployee(false);
      }
    };

    fetchData();
  }, [userId, fromDate, toDate, computeLedgerData]);

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading || loadingEmployee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading report data...</span>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Employee Not Found</h2>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Print Controls - Hidden during print */}
      <div className="no-print fixed top-4 right-4 flex gap-2 z-50">
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handlePrint}>
          <Download className="h-4 w-4 mr-2" />
          Print / Save PDF
        </Button>
      </div>

      {/* Report Content */}
      <div className="max-w-[210mm] mx-auto p-8 bg-white">
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Employee Salary Ledger
          </h1>
          <p className="text-lg mt-2 text-gray-600">
            {employee.username} - {employee.role}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Period: {formatDate(fromDate)} to {formatDate(toDate)}
          </p>
        </div>

        {/* Employee Information */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h2 className="text-xl font-semibold mb-3">Employee Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Employee Name:</span>{" "}
              {employee.username}
            </div>
            <div>
              <span className="font-medium">Role:</span> {employee.role}
            </div>
            <div>
              <span className="font-medium">Employee ID:</span>{" "}
              {employee.id?.substring(0, 8)}...
            </div>
            <div>
              <span className="font-medium">Report Date:</span>{" "}
              {formatDate(new Date().toISOString())}
            </div>
          </div>
        </div>

        {/* Summary Before Range */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Opening Balance</h2>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-purple-50 rounded">
              <div className="font-medium text-gray-600">Opening Balance</div>
              <div className="text-lg font-bold text-purple-700">
                {formatCurrency(summary.openingBalance)}
              </div>
              {summary.openingBalanceDate && (
                <div className="text-xs text-gray-500 mt-1">
                  As of {formatDate(summary.openingBalanceDate)}
                </div>
              )}
            </div>
            <div className="p-3 bg-green-50 rounded">
              <div className="font-medium text-gray-600">Total Salaries</div>
              <div className="text-lg font-bold text-green-700">
                {formatCurrency(summary.totalSalariesBefore)}
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded">
              <div className="font-medium text-gray-600">Total Payments</div>
              <div className="text-lg font-bold text-red-700">
                {formatCurrency(summary.totalPaymentsBefore)}
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded">
              <div className="font-medium text-gray-600">Balance Before</div>
              <div className="text-lg font-bold text-blue-700">
                {formatCurrency(Math.abs(summary.balanceBefore))}
                {summary.balanceBefore < 0 && " (DR)"}
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Transaction History</h2>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">
                  Date & Time
                </th>
                <th className="border border-gray-300 p-2 text-left">
                  Description
                </th>
                <th className="border border-gray-300 p-2 text-right">
                  Credit (Salary)
                </th>
                <th className="border border-gray-300 p-2 text-right">
                  Debit (Payment)
                </th>
                <th className="border border-gray-300 p-2 text-right">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {ledgerData.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="border border-gray-300 p-4 text-center text-gray-500"
                  >
                    No transactions found
                  </td>
                </tr>
              ) : (
                ledgerData.map((entry, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2 whitespace-nowrap">
                      {formatDateTime(entry.date)}
                    </td>
                    <td className="border border-gray-300 p-2">
                      <div className="font-medium">{entry.action}</div>
                      <div className="text-xs text-gray-600">
                        {entry.description}
                      </div>
                    </td>
                    <td className="border border-gray-300 p-2 text-right font-semibold text-green-700">
                      {entry.type === "credit"
                        ? formatCurrency(entry.creditAmount)
                        : "-"}
                    </td>
                    <td className="border border-gray-300 p-2 text-right font-semibold text-red-700">
                      {entry.type === "debit"
                        ? formatCurrency(entry.debitAmount)
                        : "-"}
                    </td>
                    <td className="border border-gray-300 p-2 text-right font-bold">
                      {formatCurrency(Math.abs(entry.balance))}
                      {entry.balance < 0 && " (DR)"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Totals */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Balance Summary</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-green-50 rounded">
              <div className="font-medium text-gray-600">
                Total Salaries (Till Date)
              </div>
              <div className="text-lg font-bold text-green-700">
                {formatCurrency(summary.totalSalariesTillDate)}
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded">
              <div className="font-medium text-gray-600">
                Total Payments (Till Date)
              </div>
              <div className="text-lg font-bold text-red-700">
                {formatCurrency(summary.totalPaymentsTillDate)}
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded">
              <div className="font-medium text-gray-600">Current Balance</div>
              <div className="text-xl font-bold text-blue-800">
                {formatCurrency(Math.abs(summary.closingBalance))}
                {summary.closingBalance < 0 && " (DR)"}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {summary.closingBalance >= 0
                  ? "Amount to be paid"
                  : "Advance taken"}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500 text-center">
          <p>
            Generated on {new Date().toLocaleString("en-IN")} | Employee Salary
            Ledger Report
          </p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
