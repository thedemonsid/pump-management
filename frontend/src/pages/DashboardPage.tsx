import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useProductStore } from "@/store/product-store";
import { useTankStore } from "@/store/tank-store";
import { useNozzleStore } from "@/store/nozzle-store";
import { useSalesmanStore } from "@/store/salesman-store";
import { useBankAccountStore } from "@/store/bank-account-store";
import { useCustomerStore } from "@/store/customer-store";
import { useSupplierStore } from "@/store/supplier-store";
import { useSalesmanShiftStore } from "@/store/salesman-shift-store";
import {
  Fuel,
  Database,
  Gauge,
  Users,
  Wallet,
  UserCircle,
  Building2,
  Clock,
} from "lucide-react";
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
  const {
    bankAccounts,
    loading: bankAccountsLoading,
    fetchBankAccounts,
  } = useBankAccountStore();
  const {
    customers,
    loading: customersLoading,
    fetchCustomers,
  } = useCustomerStore();
  const {
    suppliers,
    loading: suppliersLoading,
    fetchSuppliers,
  } = useSupplierStore();
  const {
    activeShifts,
    loading: activeShiftsLoading,
    fetchActiveShifts,
  } = useSalesmanShiftStore();

  useEffect(() => {
    // Fetch all data when component mounts
    fetchProducts();
    fetchTanks();
    fetchNozzles();
    fetchSalesmen();
    fetchBankAccounts();
    fetchCustomers();
    fetchSuppliers();
    fetchActiveShifts();
  }, [
    fetchProducts,
    fetchTanks,
    fetchNozzles,
    fetchSalesmen,
    fetchBankAccounts,
    fetchCustomers,
    fetchSuppliers,
    fetchActiveShifts,
  ]);

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

        <Link to="/bank-accounts">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Bank Accounts
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bankAccountsLoading ? "..." : bankAccounts.length}
              </div>
              <p className="text-xs text-muted-foreground">Managed accounts</p>
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

        <Link to="/customers">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <UserCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customersLoading ? "..." : customers.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Registered customers
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/suppliers">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {suppliersLoading ? "..." : suppliers.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Approved suppliers
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/shifts">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Shifts</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeShiftsLoading ? "..." : activeShifts.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently running shifts
              </p>
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
    </div>
  );
}
