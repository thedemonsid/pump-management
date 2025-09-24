import * as React from 'react';
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { ThemeProvider } from '@/components/ui/theme-toggle';
import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { ProductsPage } from '@/pages/products/ProductsPage';
import { TanksPage } from '@/pages/tanks/TanksPage';
import { NozzlesPage } from '@/pages/nozzles/NozzlesPage';
import { SalesmenPage } from '@/pages/salesmen/SalesmenPage';
import { ShiftsPage } from '@/pages/shifts/ShiftsPage';
import { SuppliersPage } from '@/pages/suppliers/SuppliersPage';
import { SupplierDetailPage } from '@/pages/suppliers/SupplierDetailPage';
import { SupplierLedgerPage } from '@/pages/suppliers/SupplierLedgerPage';
import { CustomersPage } from '@/pages/customers/CustomersPage';
import { CustomerDetailPage } from '@/pages/customers/CustomerDetailPage';
import { CustomerLedgerPage } from '@/pages/customers/CustomerLedgerPage';
import { CustomerLedgerReportPage } from '@/pages/customers/CustomerLedgerReportPage';
import { PurchasesPage } from '@/pages/purchases/PurchasesPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { FuelPurchasesPage } from './pages/fuel-purchases/FuelPurchasesPage';
import { BankAccountsPage } from './pages/bank-accounts/BankAccountsPage';
import { BankAccountLedgerPage } from './pages/bank-accounts/BankAccountLedgerPage';
import { BankAccountLedgerReportPage } from './pages/bank-accounts/BankAccountLedgerReportPage';
import { BillsPage } from './pages/bills/BillsPage';
import { BillDetailPage } from './pages/bills/BillDetailPage';
import { BillsDetailsPage } from './pages/bills/BillsDetailsPage';
import { TankLedgerPage } from './pages/tanks/TankLedgerPage';
import { ProductsReportPage } from '@/pages/ProductsReportPage';
import { CustomersReportPage } from '@/pages/customers/CustomersReportPage';
import { SuppliersReportPage } from '@/pages/suppliers/SuppliersReportPage';
import { SupplierLedgerReportPage } from '@/pages/suppliers/SupplierLedgerReportPage';
import { LoginPage } from '@/pages/LoginPage';
import { AuthProvider } from '@/hooks/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute, PublicRoute } from '@/components/ProtectedRoute';
import { Toaster } from 'sonner';

const headerMap: Record<string, string> = {
  dashboard: 'Dashboard',
  pumps: 'Pumps',
  nozzles: 'Nozzles',
  'nozzle-readings': 'Nozzle Readings',
  tanks: 'Tanks',
  products: 'Products',
  suppliers: 'Suppliers',
  customers: 'Customers',
  purchases: 'Purchases',
  'fuel-purchases': 'Fuel Purchases',
  salesmen: 'Salesmen',
  shifts: 'Shifts',
  'bank-accounts': 'Bank Accounts',
  ledger: 'Ledger',
  bills: 'Bills',
  'bill-details': 'Bill Details',
  'salesman-bills': 'Salesman Bills',
  settings: 'Settings',
  report: 'Report',
};

export function MainHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = (): Array<{
    label: string;
    path: string | null;
  }> => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: Array<{ label: string; path: string | null }> = [
      { label: 'Home', path: '/' },
    ];

    let currentPath = '';
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
        let detailLabel = 'Details';
        const parentSegment = pathSegments[index - 1];
        if (parentSegment === 'customers') {
          detailLabel = 'Customer Details';
        } else if (parentSegment === 'nozzles') {
          detailLabel = 'Nozzle Details';
        } else if (parentSegment === 'bank-accounts') {
          detailLabel = 'Bank Account Details';
        } else if (parentSegment === 'tanks') {
          detailLabel = 'Tank Details';
        } else if (parentSegment === 'bills') {
          detailLabel = 'Bill Details';
        } else if (parentSegment === 'salesman-bills') {
          detailLabel = 'Salesman Bill Details';
        } else if (parentSegment === 'suppliers') {
          detailLabel = 'Supplier Details';
        }

        breadcrumbs.push({
          label: detailLabel,
          path: isLast ? null : currentPath,
        });
      } else {
        // Use headerMap for known routes
        const routeKey = segment;
        const label =
          headerMap[routeKey] ||
          segment.charAt(0).toUpperCase() + segment.slice(1);
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
              navigate('/login');
            }}
            className="hidden sm:flex text-red-400 hover:text-red-500 focus:text-red-500"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex w-full h-screen overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <MainHeader />
          <main className="flex-1 w-full p-8 overflow-y-auto">{children}</main>
        </SidebarInset>
      </div>
      <Toaster></Toaster>
    </SidebarProvider>
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
                  <AuthenticatedLayout>
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route
                        path="/products/report"
                        element={<ProductsReportPage />}
                      />
                      <Route path="/tanks" element={<TanksPage />} />
                      <Route
                        path="/tanks/:id/ledger"
                        element={<TankLedgerPage />}
                      />
                      <Route path="/nozzles" element={<NozzlesPage />} />
                      <Route path="/suppliers" element={<SuppliersPage />} />
                      <Route
                        path="/suppliers/:id"
                        element={<SupplierDetailPage />}
                      />
                      <Route
                        path="/suppliers/:id/ledger"
                        element={<SupplierLedgerPage />}
                      />
                      <Route
                        path="/suppliers/:id/ledger/report"
                        element={<SupplierLedgerReportPage />}
                      />
                      <Route
                        path="/suppliers/report"
                        element={<SuppliersReportPage />}
                      />
                      <Route path="/customers" element={<CustomersPage />} />
                      <Route
                        path="/customers/:id"
                        element={<CustomerDetailPage />}
                      />
                      <Route
                        path="/customers/:id/ledger"
                        element={<CustomerLedgerPage />}
                      />
                      <Route
                        path="/customers/:id/ledger/report"
                        element={<CustomerLedgerReportPage />}
                      />
                      <Route
                        path="/customers/report"
                        element={<CustomersReportPage />}
                      />
                      <Route path="/purchases" element={<PurchasesPage />} />
                      <Route path="/salesmen" element={<SalesmenPage />} />
                      <Route path="/shifts" element={<ShiftsPage />} />
                      <Route
                        path="/fuel-purchases"
                        element={<FuelPurchasesPage />}
                      />
                      <Route
                        path="/bank-accounts"
                        element={<BankAccountsPage />}
                      />
                      <Route
                        path="/bank-accounts/:id/ledger"
                        element={<BankAccountLedgerPage />}
                      />
                      <Route
                        path="/bank-accounts/:id/ledger/report"
                        element={<BankAccountLedgerReportPage />}
                      />
                      <Route path="/bills" element={<BillsPage />} />
                      <Route path="/bills/:id" element={<BillDetailPage />} />
                      <Route
                        path="/bills/bill-details"
                        element={<BillsDetailsPage />}
                      />
                      <Route path="*" element={<DashboardPage />} />
                    </Routes>
                  </AuthenticatedLayout>
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
