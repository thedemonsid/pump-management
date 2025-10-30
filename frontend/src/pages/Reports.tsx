import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  Users,
  CreditCard,
  Droplet,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export default function Reports() {
  return (
    <div className="flex-1 space-y-6">
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
            description="Daily money collection summary from all sources"
            icon={<Calendar className="h-8 w-8" />}
            color="bg-purple-500"
            path="/reports/daywise-collection"
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
            title="Expense Report"
            description="View and analyze expenses by head and date range"
            icon={<DollarSign className="h-8 w-8" />}
            color="bg-indigo-500"
            path="/expenses"
          />
          <ReportCard
            title="Product Unit & Price Changes"
            description="Track sales unit and price changes for all products"
            icon={<TrendingUp className="h-8 w-8" />}
            color="bg-yellow-500"
            path="/reports/product-changes"
          />
          <ReportCard
            title="Fuel Credit Sales Report"
            description="View all credit sales bills by date range with detailed breakdown"
            icon={<FileText className="h-8 w-8" />}
            color="bg-red-500"
            path="/reports/fuel-credit-sales"
          />
          <ReportCard
            title="Sales Report"
            description="Comprehensive sales analysis and billing reports"
            icon={<FileText className="h-8 w-8" />}
            color="bg-pink-500"
            path="/reports/sales"
            comingSoon
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
  comingSoon?: boolean;
}

function ReportCard({
  title,
  description,
  icon,
  color,
  path,
  comingSoon = false,
}: ReportCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className={`transition-all border-2 ${
        comingSoon
          ? "opacity-60 cursor-not-allowed"
          : "cursor-pointer hover:shadow-lg hover:scale-105 hover:border-primary"
      }`}
      onClick={() => !comingSoon && navigate(path)}
    >
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {title}
              {comingSoon && (
                <span className="text-xs font-normal bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded">
                  Coming Soon
                </span>
              )}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
