import { useEffect, useState } from "react";
import { useSalesmanStore } from "@/store/salesman-store";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Pencil, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { CreateSalesmanForm } from "./CreateSalesmanForm";
import { UpdateSalesmanForm } from "./UpdateSalesmanForm";
import type { Salesman } from "@/types";

export function SalesmenPage() {
  const { user } = useAuth();
  const { salesmen, loading, error, fetchSalesmen } = useSalesmanStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSalesman, setEditingSalesman] = useState<Salesman | null>(null);

  // Check if user has permission to manage salesmen
  const canManageSalesmen = user?.role === "ADMIN" || user?.role === "MANAGER";

  useEffect(() => {
    if (canManageSalesmen) {
      fetchSalesmen();
    }
  }, [fetchSalesmen, canManageSalesmen]);

  const handleEdit = (salesman: Salesman) => {
    setEditingSalesman(salesman);
  };

  const handleCloseEditDialog = () => {
    setEditingSalesman(null);
  };

  // Define columns for DataTable
  const columns: ColumnDef<Salesman>[] = [
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("username")}</div>
      ),
    },
    {
      accessorKey: "mobileNumber",
      header: "Mobile Number",
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.getValue("email") || "-",
    },
    {
      accessorKey: "aadharNumber",
      header: "Aadhar Number",
      cell: ({ row }) => row.getValue("aadharNumber") || "-",
    },
    {
      accessorKey: "panNumber",
      header: "PAN Number",
      cell: ({ row }) => row.getValue("panNumber") || "-",
    },
    {
      accessorKey: "enabled",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("enabled") ? "default" : "secondary"}>
          {row.getValue("enabled") ? "Enabled" : "Disabled"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (!canManageSalesmen) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Access Denied
          </h2>
          <p className="text-muted-foreground mt-2">
            You don't have permission to manage salesmen. Only ADMIN and MANAGER
            roles can access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading && salesmen.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading salesmen...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salesmen</h1>
          <p className="text-muted-foreground">
            Manage your pump station salesmen
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Salesman
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Salesman</DialogTitle>
              <DialogDescription>
                Create a new salesman for your pump station.
              </DialogDescription>
            </DialogHeader>
            <CreateSalesmanForm
              onSuccess={() => setIsCreateDialogOpen(false)}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          <p className="font-medium">Error loading salesmen</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Salesmen List</CardTitle>
          <CardDescription>
            A comprehensive list of all salesmen in your pump station.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {salesmen.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No salesmen found. Create your first salesman to get started.
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={salesmen}
              searchKey="username"
              searchPlaceholder="Search by username..."
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

      {/* Edit Salesman Dialog */}
      <Dialog
        open={!!editingSalesman}
        onOpenChange={(open) => !open && handleCloseEditDialog()}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Salesman</DialogTitle>
            <DialogDescription>
              Make changes to the salesman information.
            </DialogDescription>
          </DialogHeader>
          {editingSalesman && (
            <UpdateSalesmanForm
              salesman={editingSalesman}
              onSuccess={handleCloseEditDialog}
              onCancel={handleCloseEditDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
