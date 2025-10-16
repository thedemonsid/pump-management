import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Fuel,
  Receipt,
  DollarSign,
  Users,
  CreditCard,
  Droplet,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Building2,
  Calendar,
} from "lucide-react";
import reportService from "@/services/report-service";

interface Analytics {
  totalCredit: number;
  totalDebit: number;
  netAmount: number;
  billsGenerated: number;
  moneyReceived: number;
  moneyPaid: number;
  fuelDispensed: number;
  customersWithCredit: number;
  suppliersWithDebit: number;
  topCustomer: { name: string; amount: number } | null;
  topSupplier: { name: string; amount: number } | null;
}

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [todayAnalytics, setTodayAnalytics] = useState<Analytics | null>(null);
  const [monthAnalytics, setMonthAnalytics] = useState<Analytics | null>(null);
  const [yearAnalytics, setYearAnalytics] = useState<Analytics | null>(null);
  const [activeTab, setActiveTab] = useState("today");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [today, month, year] = await Promise.all([
        reportService.getTodayAnalytics(),
        reportService.getMonthAnalytics(),
        reportService.getYearAnalytics(),
      ]);

      setTodayAnalytics(today);
      setMonthAnalytics(month);
      setYearAnalytics(year);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const getCurrentAnalytics = () => {
    switch (activeTab) {
      case "today":
        return todayAnalytics;
      case "month":
        return monthAnalytics;
      case "year":
        return yearAnalytics;
      default:
        return todayAnalytics;
    }
  };

  const analytics = getCurrentAnalytics();

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Reports & Analytics
          </h2>
          <p className="text-muted-foreground">
            Comprehensive business insights and financial reports
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="today"
        className="space-y-4"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="year">This Year</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-green-200 dark:border-green-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Credit Given
                </CardTitle>
                <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(analytics?.totalCredit || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      To {analytics?.customersWithCredit || 0} customers
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Debit Taken
                </CardTitle>
                <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(analytics?.totalDebit || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      From {analytics?.suppliersWithDebit || 0} suppliers
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Money Received
                </CardTitle>
                <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(analytics?.moneyReceived || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Payment collections
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Money Paid
                </CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(analytics?.moneyPaid || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supplier payments
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-orange-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Bills Generated
                </CardTitle>
                <Receipt className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {formatNumber(analytics?.billsGenerated || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total invoices
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-cyan-200 dark:border-cyan-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Fuel Dispensed
                </CardTitle>
                <Droplet className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                      {formatNumber(analytics?.fuelDispensed || 0)} L
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total volume
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-teal-200 dark:border-teal-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Net Position
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <>
                    <div
                      className={`text-2xl font-bold ${
                        (analytics?.netAmount || 0) >= 0
                          ? "text-teal-600 dark:text-teal-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatCurrency(Math.abs(analytics?.netAmount || 0))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(analytics?.netAmount || 0) >= 0 ? "Profit" : "Loss"}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-yellow-200 dark:border-yellow-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Period</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {activeTab === "today"
                    ? "Today"
                    : activeTab === "month"
                    ? "This Month"
                    : "This Year"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Current period
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Customer (Credit)</CardTitle>
                <CardDescription>
                  Customer with highest outstanding balance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-16 w-full" />
                ) : analytics?.topCustomer ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold">
                          {analytics.topCustomer.name}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(analytics.topCustomer.amount)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No data available
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Supplier (Debit)</CardTitle>
                <CardDescription>
                  Supplier with highest outstanding balance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-16 w-full" />
                ) : analytics?.topSupplier ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Fuel className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold">
                          {analytics.topSupplier.name}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-red-600">
                        {formatCurrency(analytics.topSupplier.amount)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No data available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Special Report Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">
              Detailed Reports
            </h3>
            <p className="text-muted-foreground">
              Click on any card to view detailed reports
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ReportCard
            title="Supplier Debt Report"
            description="View outstanding debts and payment details for all suppliers"
            icon={<Users className="h-8 w-8" />}
            color="bg-blue-500"
            path="/reports/supplier-debt"
          />
          <ReportCard
            title="Customer Credit Report"
            description="Track customer credit balances and outstanding amounts"
            icon={<CreditCard className="h-8 w-8" />}
            color="bg-green-500"
            path="/reports/customer-credit"
          />
          <ReportCard
            title="Day-wise Collection Report"
            description="Daily billing and collection summary with credit details"
            icon={<Calendar className="h-8 w-8" />}
            color="bg-purple-500"
            path="/reports/collection"
          />
          <ReportCard
            title="Bank Account Report"
            description="View bank account statements and transaction history"
            icon={<Building2 className="h-8 w-8" />}
            color="bg-orange-500"
            path="/reports/bank-account"
          />
          <ReportCard
            title="Tank Level Report"
            description="Monitor fuel tank levels and inventory status"
            icon={<Droplet className="h-8 w-8" />}
            color="bg-cyan-500"
            path="/reports/tank-levels"
          />
          <ReportCard
            title="Sales Report"
            description="Comprehensive sales analysis and billing reports"
            icon={<FileText className="h-8 w-8" />}
            color="bg-red-500"
            path="/reports/sales"
          />
        </div>
      </div>
    </div>
  );
}

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
}

function ReportCard({
  title,
  description,
  icon,
  color,
  path,
}: ReportCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-primary"
      onClick={() => navigate(path)}
    >
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
