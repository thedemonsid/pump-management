import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { CreateSalaryConfigForm } from "./CreateSalaryConfigForm";
import { UpdateSalaryConfigForm } from "./UpdateSalaryConfigForm";
import { getEmployeeSalaryConfigColumns } from "./EmployeeSalaryConfigColumns";
import { EmployeeSalaryConfigService } from "@/services/employee-salary-config-service";
import type { EmployeeSalaryConfig } from "@/types/employee-salary";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function EmployeeSalaryConfigPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [configs, setConfigs] = useState<EmployeeSalaryConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] =
    useState<EmployeeSalaryConfig | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("active");

  // Check if user has permission to manage salary configs
  const canManageConfigs = user?.role === "ADMIN" || user?.role === "MANAGER";

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      let data: EmployeeSalaryConfig[];

      if (statusFilter === "all") {
        data = await EmployeeSalaryConfigService.getAll();
      } else {
        data = await EmployeeSalaryConfigService.getByStatus(
          statusFilter === "active"
        );
      }

      // Sort by effectiveFrom date (newest first)
      data.sort(
        (a, b) =>
          new Date(b.effectiveFrom).getTime() -
          new Date(a.effectiveFrom).getTime()
      );
      setConfigs(data);
    } catch (error) {
      console.error("Failed to fetch salary configs:", error);

      const err = error as {
        message?: string;
      };

      // The API interceptor throws a new Error with format: "statusCode: message"
      let errorMessage =
        "Failed to load salary configurations. Please try again.";

      if (err.message) {
        const match = err.message.match(/^\d+:\s*(.+)$/);
        if (match && match[1]) {
          errorMessage = match[1];
        } else {
          errorMessage = err.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManageConfigs) {
      fetchConfigs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, canManageConfigs]);

  const handleEdit = (config: EmployeeSalaryConfig) => {
    setEditingConfig(config);
  };

  const handleCloseEditDialog = () => {
    setEditingConfig(null);
  };

  const handleDeactivate = async (config: EmployeeSalaryConfig) => {
    try {
      await EmployeeSalaryConfigService.deactivate(config.id!);
      toast.success("Salary configuration deactivated successfully.");
      fetchConfigs();
    } catch (error) {
      console.error("Failed to deactivate config:", error);

      const err = error as {
        message?: string;
      };

      let errorMessage =
        "Failed to deactivate configuration. Please try again.";

      if (err.message) {
        const match = err.message.match(/^\d+:\s*(.+)$/);
        if (match && match[1]) {
          errorMessage = match[1];
        } else {
          errorMessage = err.message;
        }
      }

      toast.error(errorMessage);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getSalaryTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      DAILY: "Daily",
      WEEKLY: "Weekly",
      MONTHLY: "Monthly",
    };
    return labels[type] || type;
  };

  const handleViewSalaries = (config: EmployeeSalaryConfig) => {
    navigate(`/calculated-salaries/${config.id}/${config.userId}`);
  };

  const handleViewPayments = (config: EmployeeSalaryConfig) => {
    navigate(`/employee-salary-payments/${config.userId}`);
  };

  const columns = getEmployeeSalaryConfigColumns({
    onEdit: handleEdit,
    onDeactivate: handleDeactivate,
    onViewSalaries: handleViewSalaries,
    onViewPayments: handleViewPayments,
    formatCurrency,
    getSalaryTypeLabel,
  });

  if (!canManageConfigs) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Access Denied
          </h2>
          <p className="text-muted-foreground mt-2">
            You don't have permission to manage salary configurations. Only
            ADMIN and MANAGER roles can access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading && configs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading salary configurations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Employee Salary Configurations
          </h1>
          <p className="text-muted-foreground">
            Manage salary settings for employees (Salesmen & Managers)
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Salary Config
        </Button>
      </div>

      {/* Create Salary Config Sheet */}
      <CreateSalaryConfigForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          fetchConfigs();
        }}
      />

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter salary configurations by status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="w-[200px]">
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as "all" | "active" | "inactive")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Configurations</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Badge variant="outline">
              {configs.length} configuration{configs.length !== 1 ? "s" : ""}{" "}
              found
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Configurations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Configurations</CardTitle>
          <CardDescription>
            View and manage all employee salary configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {configs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No salary configurations found. Create one to get started.
              </p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={configs}
              searchKey="username"
              searchPlaceholder="Search by employee name..."
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

      {/* Edit Dialog */}
      <Dialog
        open={!!editingConfig}
        onOpenChange={() => handleCloseEditDialog()}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Salary Configuration</DialogTitle>
            <DialogDescription>
              Update the salary configuration details. You cannot change the
              employee.
            </DialogDescription>
          </DialogHeader>
          {editingConfig && (
            <UpdateSalaryConfigForm
              config={editingConfig}
              onSuccess={() => {
                handleCloseEditDialog();
                fetchConfigs();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
