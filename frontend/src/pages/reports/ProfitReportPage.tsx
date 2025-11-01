import { ProfitReportCard } from "@/components/reports/ProfitReportCard";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

/**
 * Profit Report Page
 *
 * Displays comprehensive fuel profit analysis for pump administrators.
 * This page is restricted to ADMIN users only.
 */
export function ProfitReportPage() {
  const { user } = useAuth();

  // Redirect non-admin users
  if (user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profit Reports</h1>
        <p className="text-muted-foreground">
          Comprehensive fuel sales profit analysis for{" "}
          {user?.pumpName || "your pump"}
        </p>
      </div>

      {/* Profit Report Component */}
      <ProfitReportCard />
    </div>
  );
}
