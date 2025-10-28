import * as React from "react";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ui/theme-toggle";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ProductsPage } from "@/pages/products/ProductsPage";
import { TanksPage } from "@/pages/tanks/TanksPage";
import { NozzlesPage } from "@/pages/nozzles/NozzlesPage";
import { NozzleDetailPage } from "@/pages/nozzles/NozzleDetailPage";
import { SalesmenPage } from "@/pages/salesmen/SalesmenPage";
import { SuppliersPage } from "@/pages/suppliers/SuppliersPage";
import { SupplierDetailPage } from "@/pages/suppliers/SupplierDetailPage";
import { SupplierLedgerPage } from "@/pages/suppliers/SupplierLedgerPage";
import { CustomersPage } from "@/pages/customers/CustomersPage";
import { CustomerDetailPage } from "@/pages/customers/CustomerDetailPage";
import { CustomerLedgerPage } from "@/pages/customers/CustomerLedgerPage";
import { CustomerLedgerReportPage } from "@/pages/customers/CustomerLedgerReportPage";
import { PurchasesPage } from "@/pages/purchases/PurchasesPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { FuelPurchasesPage } from "./pages/fuel-purchases/FuelPurchasesPage";
import { BankAccountsPage } from "./pages/bank-accounts/BankAccountsPage";
import { BankAccountLedgerPage } from "./pages/bank-accounts/BankAccountLedgerPage";
import { BankAccountLedgerReportPage } from "./pages/bank-accounts/BankAccountLedgerReportPage";
import { BillsPage } from "./pages/bills/BillsPage";
import { BillDetailPage } from "./pages/bills/BillDetailPage";
import { BillsDetailsPage } from "./pages/bills/BillsDetailsPage";
import { TankLedgerPage } from "./pages/tanks/TankLedgerPage";
import { ProductsReportPage } from "@/pages/ProductsReportPage";
import { CustomersReportPage } from "@/pages/customers/CustomersReportPage";
import { SuppliersReportPage } from "@/pages/suppliers/SuppliersReportPage";
import { SupplierLedgerReportPage } from "@/pages/suppliers/SupplierLedgerReportPage";
import { LoginPage } from "@/pages/LoginPage";
import Reports from "./pages/Reports";
import BankAccountReportPage from "./pages/reports/BankAccountReportPage";
import TankLevelReportPage from "./pages/reports/TankLevelReportPage";
import SupplierDebtReportPage from "./pages/reports/SupplierDebtReportPage";
import CustomerCreditReportPage from "./pages/reports/CustomerCreditReportPage";
import { ExpenseHeadsPage } from "./pages/expense-heads/ExpenseHeadsPage";
import { ExpensesPage } from "./pages/expenses/ExpensesPage";
import ChangePasswordPage from "./pages/settings/ChangePasswordPage";
import { AuthProvider } from "@/hooks/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute, PublicRoute } from "@/components/ProtectedRoute";
import { Toaster } from "sonner";
import { SalesmanActiveShiftPage } from "@/pages/shifts/SalesmanActiveShiftPage";
import { ShiftBillsPage } from "@/pages/shifts/ShiftBillsPage";
import { ShiftPaymentsPage } from "@/pages/shifts/ShiftPaymentsPage";
import { ShiftAccountingPage } from "@/pages/shifts/ShiftAccountingPage";
import { ShiftDetailsPage } from "@/pages/shifts/ShiftDetailsPage";
import { ShiftListPage } from "@/pages/shifts/ShiftListPage";

const allRoutes = [
  {
    path: "/",
    element: <DashboardPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/",
    element: <SalesmanActiveShiftPage />,
    requiredRoles: ["SALESMAN"],
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/reports",
    element: <Reports />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/reports/bank-account",
    element: <BankAccountReportPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/reports/tank-levels",
    element: <TankLevelReportPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/reports/supplier-debt",
    element: <SupplierDebtReportPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/reports/customer-credit",
    element: <CustomerCreditReportPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/products",
    element: <ProductsPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/products/report",
    element: <ProductsReportPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/tanks",
    element: <TanksPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/tanks/:id/ledger",
    element: <TankLedgerPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/nozzles",
    element: <NozzlesPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/nozzles/:id",
    element: <NozzleDetailPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/suppliers",
    element: <SuppliersPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/suppliers/:id",
    element: <SupplierDetailPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/suppliers/:id/ledger",
    element: <SupplierLedgerPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/suppliers/:id/ledger/report",
    element: <SupplierLedgerReportPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/suppliers/report",
    element: <SuppliersReportPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/customers",
    element: <CustomersPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/customers/:id",
    element: <CustomerDetailPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/customers/:id/ledger",
    element: <CustomerLedgerPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/customers/:id/ledger/report",
    element: <CustomerLedgerReportPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/customers/report",
    element: <CustomersReportPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/purchases",
    element: <PurchasesPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/salesmen",
    element: <SalesmenPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/shifts",
    element: <ShiftListPage />,
    requiredRoles: ["ADMIN", "MANAGER", "SALESMAN"],
  },
  {
    path: "/fuel-purchases",
    element: <FuelPurchasesPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/expense-heads",
    element: <ExpenseHeadsPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/expenses",
    element: <ExpensesPage />,
    requiredRoles: ["ADMIN", "MANAGER", "SALESMAN"],
  },
  {
    path: "/bank-accounts",
    element: <BankAccountsPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/bank-accounts/:id/ledger",
    element: <BankAccountLedgerPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/bank-accounts/:id/ledger/report",
    element: <BankAccountLedgerReportPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/bills",
    element: <BillsPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/bills/:id",
    element: <BillDetailPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  {
    path: "/bills/bill-details",
    element: <BillsDetailsPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
  // New Shift Management Routes
  {
    path: "/my-shift",
    element: <SalesmanActiveShiftPage />,
    requiredRoles: ["SALESMAN"],
  },
  {
    path: "/shifts/:shiftId",
    element: <ShiftDetailsPage />,
    requiredRoles: ["ADMIN", "MANAGER", "SALESMAN"],
  },
  {
    path: "/shifts/:shiftId/bills",
    element: <ShiftBillsPage />,
    requiredRoles: ["ADMIN", "MANAGER", "SALESMAN"],
  },
  {
    path: "/shifts/:shiftId/payments",
    element: <ShiftPaymentsPage />,
    requiredRoles: ["ADMIN", "MANAGER", "SALESMAN"],
  },
  {
    path: "/shifts/:shiftId/accounting",
    element: <ShiftAccountingPage />,
    requiredRoles: ["ADMIN", "MANAGER", "SALESMAN"],
  },
  {
    path: "/settings/change-password",
    element: <ChangePasswordPage />,
    requiredRoles: ["ADMIN"],
  },
  {
    path: "*",
    element: <DashboardPage />,
    requiredRoles: ["ADMIN", "MANAGER"],
  },
];

const headerMap: Record<string, string> = {
  dashboard: "Dashboard",
  pumps: "Pumps",
  nozzles: "Nozzles",
  "nozzle-readings": "Nozzle Readings",
  tanks: "Tanks",
  products: "Products",
  suppliers: "Suppliers",
  customers: "Customers",
  purchases: "Purchases",
  "fuel-purchases": "Fuel Purchases",
  "expense-heads": "Expense Heads",
  expenses: "Expenses",
  salesmen: "Salesmen",
  shifts: "Shifts",
  "my-shift": "My Active Shift",
  "bank-accounts": "Bank Accounts",
  ledger: "Ledger",
  bills: "Bills",
  "bill-details": "Bill Details",
  settings: "Settings",
  report: "Report",
  payments: "Payments",
  accounting: "Accounting",
};

export function MainHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = (): Array<{
    label: string;
    path: string | null;
  }> => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs: Array<{ label: string; path: string | null }> = [
      { label: "Home", path: "/" },
    ];

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      // Handle dynamic routes (UUIDs)
      if (
        segment.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        )
      ) {
        // Determine more specific labels based on parent route
        let detailLabel = "Details";
        const parentSegment = pathSegments[index - 1];
        if (parentSegment === "customers") {
          detailLabel = "Customer Details";
        } else if (parentSegment === "nozzles") {
          detailLabel = "Nozzle Details";
        } else if (parentSegment === "bank-accounts") {
          detailLabel = "Bank Account Details";
        } else if (parentSegment === "tanks") {
          detailLabel = "Tank Details";
        } else if (parentSegment === "bills") {
          detailLabel = "Bill Details";
        } else if (parentSegment === "salesman-bills") {
          detailLabel = "Salesman Bill Details";
        } else if (parentSegment === "suppliers") {
          detailLabel = "Supplier Details";
        }

        breadcrumbs.push({
          label: detailLabel,
          path: isLast ? null : currentPath,
        });
      } else {
        // Use headerMap for known routes
        const routeKey = segment;
        let label =
          headerMap[routeKey] ||
          segment.charAt(0).toUpperCase() + segment.slice(1);

        // Special handling for salesman-shifts based on user role
        if (routeKey === "salesman-shifts") {
          if (user?.role === "SALESMAN") {
            label = "My Shifts";
          } else {
            label = "Salesman Shifts";
          }
        } else if (routeKey === "admin/salesman-shifts") {
          label = "All Salesman Shifts";
        }

        breadcrumbs.push({
          label,
          path: isLast ? null : currentPath,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-[var(--header-height)]">
      <div className="flex w-full items-center gap-1 py-2 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-2" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {crumb.path ? (
                    <BreadcrumbLink
                      onClick={() => navigate(crumb.path!)}
                      className="cursor-pointer"
                    >
                      {crumb.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="text-red-400 hover:text-red-500 focus:text-red-500"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

function AuthenticatedLayout({
  children,
  role,
  pumpName,
}: {
  children: React.ReactNode;
  role: string;
  pumpName?: string;
}) {
  return (
    <SidebarProvider>
      <div className="flex w-full h-screen overflow-hidden">
        <AppSidebar role={role} pumpName={pumpName} />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <MainHeader />
          <main className="flex-1 w-full md:p-8 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
      <Toaster></Toaster>
    </SidebarProvider>
  );
}

// New component to handle role-based routing
function RoleBasedApp({
  allRoutes,
}: {
  allRoutes: Array<{
    path: string;
    element: React.ReactElement;
    requiredRoles: string[];
  }>;
}) {
  const { user } = useAuth();
  const role = user?.role || "USER"; // Default to 'USER' if no role

  // Filter routes based on role
  const allowedRoutes = allRoutes.filter((route) =>
    route.requiredRoles.includes(role)
  );

  return (
    <AuthenticatedLayout role={role} pumpName={user?.pumpName}>
      <Routes>
        {allowedRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
    </AuthenticatedLayout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <RoleBasedApp allRoutes={allRoutes} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
