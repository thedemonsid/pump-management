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
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import { employeeLedgerColumns } from "./employee-ledger-columns";
import {
  Loader2,
  Wallet,
  Calendar,
  Search,
  FileText,
  ArrowLeft,
  Plus,
  User as UserIcon,
} from "lucide-react";
import { useEmployeeLedgerStore } from "@/store/employee-ledger-store";
import { UserService } from "@/services/user-service";
import { EmployeeSalaryConfigService } from "@/services/employee-salary-config-service";
import type { User, EmployeeSalaryConfig } from "@/types";
import { Badge } from "@/components/ui/badge";
import { getOneWeekAgo, getToday } from "@/lib/utils/date";
import { format } from "date-fns";

export function EmployeeSalaryLedgerPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const {
    ledgerData,
    summary,
    loading,
    hasSearched,
    computeLedgerData,
    reset,
  } = useEmployeeLedgerStore();

  const [fromDate, setFromDate] = useState<Date | undefined>(getOneWeekAgo());
  const [toDate, setToDate] = useState<Date | undefined>(getToday());
  const [employee, setEmployee] = useState<User | null>(null);
  const [salaryConfig, setSalaryConfig] = useState<EmployeeSalaryConfig | null>(
    null
  );
  const [loadingEmployee, setLoadingEmployee] = useState(true);

  // Reset ledger data when userId changes
  useEffect(() => {
    reset();
  }, [userId, reset]);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!userId) return;

      try {
        setLoadingEmployee(true);
        const userData = await UserService.getById(userId);
        setEmployee(userData);

        // Try to get active salary config
        try {
          const configs = await EmployeeSalaryConfigService.getByUserId(userId);
          const activeConfig = configs.find((c) => c.isActive);
          if (activeConfig) {
            setSalaryConfig(activeConfig);
            // Set fromDate to config's effectiveFrom
            if (activeConfig.effectiveFrom) {
              setFromDate(new Date(activeConfig.effectiveFrom));
            }
          }
        } catch (error) {
          console.error("Failed to fetch salary config:", error);
        }
      } catch (error) {
        console.error("Failed to fetch employee data:", error);
      } finally {
        setLoadingEmployee(false);
      }
    };

    fetchEmployeeData();
  }, [userId]);

  const handleFetchLedger = () => {
    if (!userId || !fromDate) return;
    computeLedgerData({
      userId,
      fromDate: fromDate.toISOString().split("T")[0],
      toDate:
        toDate?.toISOString().split("T")[0] ||
        getToday().toISOString().split("T")[0],
    });
  };

  const handleClearFilters = () => {
    setFromDate(getOneWeekAgo());
    setToDate(getToday());
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

  const getSalaryTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      DAILY: "Daily",
      WEEKLY: "Weekly",
      MONTHLY: "Monthly",
    };
    return labels[type] || type;
  };

  if (loadingEmployee) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">
            Loading employee details...
          </span>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Employee Not Found
          </h2>
          <p className="text-muted-foreground mt-2">
            The requested employee could not be found.
          </p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Employee Salary Ledger
              </h1>
            </div>
          </div>

          <Button
            onClick={() => navigate(`/employee-salary-payments/${userId}`)}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
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
              Showing ledger
              {fromDate && ` from ${format(fromDate, "PPP")}`}
              {toDate && ` to ${format(toDate, "PPP")}`}
            </div>
          )}

          <div className="mt-6 flex justify-center gap-4">
            <Button
              onClick={handleFetchLedger}
              disabled={loading || !fromDate}
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
            {hasSearched && (
              <Button
                onClick={() =>
                  navigate(
                    `/employee-salary-ledger/${userId}/report?fromDate=${
                      fromDate?.toISOString().split("T")[0]
                    }&toDate=${toDate?.toISOString().split("T")[0]}`
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
          {/* Employee Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Employee Information
              </CardTitle>
              <CardDescription>
                Current employee details and salary configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Employee Name
                  </p>
                  <p className="text-xl font-semibold text-foreground">
                    {employee.username}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Role
                  </p>
                  <Badge variant="outline" className="text-lg">
                    {employee.role}
                  </Badge>
                </div>
                {salaryConfig && (
                  <>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Salary Type
                      </p>
                      <p className="text-xl font-semibold text-foreground">
                        {getSalaryTypeLabel(salaryConfig.salaryType)}
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Basic Salary
                      </p>
                      <p className="text-xl font-semibold text-foreground">
                        {formatCurrency(salaryConfig.basicSalaryAmount)}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary Before Date Range */}
          <Card>
            <CardHeader>
              <CardTitle>Summary Before Selected Date Range</CardTitle>
              <CardDescription>
                Balance summary before{" "}
                {fromDate && formatDate(fromDate.toISOString().split("T")[0])}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 border rounded-lg bg-purple-50 dark:bg-purple-950">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Opening Balance
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(summary.openingBalance)}
                  </p>
                  {summary.openingBalanceDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      As of {formatDate(summary.openingBalanceDate)}
                    </p>
                  )}
                </div>
                <div className="text-center p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Total Salaries
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(summary.totalSalariesBefore)}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-red-50 dark:bg-red-950">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Total Payments
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(summary.totalPaymentsBefore)}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Balance Before
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      summary.balanceBefore >= 0
                        ? "text-blue-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(Math.abs(summary.balanceBefore))}
                    {summary.balanceBefore < 0 && (
                      <span className="text-sm ml-1">(DR)</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ledger Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Salary Transaction History
              </CardTitle>
              <CardDescription>
                Calculated salaries and payments for the selected date range
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ledgerData.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No transactions found for the selected date range.
                  </p>
                </div>
              ) : (
                <DataTable
                  columns={employeeLedgerColumns}
                  data={ledgerData}
                  searchKey="description"
                  searchPlaceholder="Search transactions..."
                  pageSize={10}
                  enableRowSelection={false}
                  enableColumnVisibility={true}
                  enablePagination={true}
                  enableSorting={true}
                  enableFiltering={true}
                />
              )}
            </CardContent>
          </Card>

          {/* Summary Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Balance Summary</CardTitle>
              <CardDescription>
                Complete balance overview including all transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Total Salaries (Till Date)
                  </p>
                  <p className="text-xl font-bold text-green-700">
                    {formatCurrency(summary.totalSalariesTillDate)}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Total Payments (Till Date)
                  </p>
                  <p className="text-xl font-bold text-red-700">
                    {formatCurrency(summary.totalPaymentsTillDate)}
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-primary/10">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Current Balance
                  </p>
                  <p
                    className={`text-xl font-bold ${
                      summary.closingBalance >= 0
                        ? "text-blue-700"
                        : "text-red-700"
                    }`}
                  >
                    {formatCurrency(Math.abs(summary.closingBalance))}
                    {summary.closingBalance < 0 && (
                      <span className="text-sm ml-1">(DR)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary.closingBalance >= 0
                      ? "Amount to be paid"
                      : "Advance taken"}
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
                  Ready to View Salary Ledger
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Select your desired date range above and click "Fetch Ledger
                  Details" to view the employee's salary transaction history and
                  balance summary.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
