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
import {
  Plus,
  Pencil,
  Loader2,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateSalaryConfigForm } from "./CreateSalaryConfigForm";
import { UpdateSalaryConfigForm } from "./UpdateSalaryConfigForm";
import { EmployeeSalaryConfigService } from "@/services/employee-salary-config-service";
import type { EmployeeSalaryConfig } from "@/types/employee-salary";
import { toast } from "sonner";
import { format } from "date-fns";

export function EmployeeSalaryConfigPage() {
  const { user } = useAuth();

  const [configs, setConfigs] = useState<EmployeeSalaryConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] =
    useState<EmployeeSalaryConfig | null>(null);
  const [deletingConfig, setDeletingConfig] =
    useState<EmployeeSalaryConfig | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

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

  const handleDelete = async () => {
    if (!deletingConfig) return;

    try {
      await EmployeeSalaryConfigService.delete(deletingConfig.id!);
      toast.success("Salary configuration deleted successfully.");
      fetchConfigs();
      setDeletingConfig(null);
    } catch (error) {
      console.error("Failed to delete config:", error);

      const err = error as {
        message?: string;
      };

      let errorMessage = "Failed to delete configuration. Please try again.";

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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Salary Type</TableHead>
                    <TableHead>Basic Amount</TableHead>
                    <TableHead>Effective From</TableHead>
                    <TableHead>Effective To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rates</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell className="font-medium">
                        {config.username || "Unknown User"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getSalaryTypeLabel(config.salaryType)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(config.basicSalaryAmount)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(config.effectiveFrom), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        {config.effectiveTo
                          ? format(new Date(config.effectiveTo), "dd MMM yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {config.isActive ? (
                          <Badge className="bg-green-500">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="mr-1 h-3 w-3" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div>
                            Half Day: {(config.halfDayRate * 100).toFixed(0)}%
                          </div>
                          <div>
                            Overtime: {(config.overtimeRate * 100).toFixed(0)}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(config)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {config.isActive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeactivate(config)}
                              title="Deactivate"
                            >
                              <XCircle className="h-4 w-4 text-orange-500" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingConfig(config)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingConfig}
        onOpenChange={() => setDeletingConfig(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the salary configuration for{" "}
              <strong>{deletingConfig?.username}</strong>. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
