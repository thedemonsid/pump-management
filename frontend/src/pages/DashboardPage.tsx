import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useProductStore } from "@/store/product-store";
import { useTankStore } from "@/store/tank-store";
import { useNozzleStore } from "@/store/nozzle-store";
import { useSalesmanStore } from "@/store/salesman-store";
import { Fuel, Database, Gauge, Users } from "lucide-react";
import { ProfitReportCard } from "@/components/reports/ProfitReportCard";

export function DashboardPage() {
  const { user } = useAuth();

  // Use Zustand stores
  const {
    products,
    loading: productsLoading,
    fetchProducts,
  } = useProductStore();
  const { tanks, loading: tanksLoading, fetchTanks } = useTankStore();
  const { nozzles, loading: nozzlesLoading, fetchNozzles } = useNozzleStore();
  const {
    salesmen,
    loading: salesmenLoading,
    fetchSalesmen,
  } = useSalesmanStore();

  useEffect(() => {
    // Fetch all data when component mounts
    fetchProducts();
    fetchTanks();
    fetchNozzles();
    fetchSalesmen();
  }, [fetchProducts, fetchTanks, fetchNozzles, fetchSalesmen]);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Fuel Pump Management System for{" "}
          {user?.pumpName || "your pump"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/products">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Fuel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {productsLoading ? "..." : products.length}
              </div>
              <p className="text-xs text-muted-foreground">Active fuel types</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/tanks">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tanks</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tanksLoading ? "..." : tanks.length}
              </div>
              <p className="text-xs text-muted-foreground">Storage tanks</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/nozzles">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nozzles</CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {nozzlesLoading ? "..." : nozzles.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Dispensing nozzles
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/salesmen">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salesmen</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {salesmenLoading ? "..." : salesmen.length}
              </div>
              <p className="text-xs text-muted-foreground">Active salesmen</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Profit Reports - Admin Only */}
      {user?.role === "ADMIN" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Profit Analysis
            </h2>
            <p className="text-muted-foreground">
              Fuel sales profit reports for day, month, and year
            </p>
          </div>
          <ProfitReportCard />
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest pump operations and readings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              No recent activity to display
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current pump system status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Pump Status</span>
              <span className="text-sm font-medium text-green-600">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database Connection</span>
              <span className="text-sm font-medium text-green-600">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Sync</span>
              <span className="text-sm font-medium text-muted-foreground">
                Just now
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
