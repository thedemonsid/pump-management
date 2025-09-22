import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupplierStore } from '@/store/supplier-store';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreateSupplierForm } from './CreateSupplierForm';
import { UpdateSupplierForm } from './UpdateSupplierForm';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import type { Supplier } from '@/types';
import { Link } from 'react-router-dom';

export function SuppliersPage() {
  const navigate = useNavigate();
  const { suppliers, loading, error, fetchSuppliers, removeSupplier } =
    useSupplierStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      try {
        await removeSupplier(id);
      } catch (error) {
        console.error('Failed to delete supplier:', error);
      }
    }
  };

  if (loading && suppliers.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading suppliers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage fuel suppliers and their information
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div>
            <Link to="/suppliers/report">
              <Button variant="outline" className="mr-2">
                View Report
              </Button>
            </Link>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create New Supplier</DialogTitle>
                <DialogDescription>
                  Add a new fuel supplier to the system
                </DialogDescription>
              </DialogHeader>
              <CreateSupplierForm
                onSuccess={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Supplier List</CardTitle>
          <CardDescription>
            A list of all fuel suppliers in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {suppliers.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No suppliers found. Create your first supplier to get started.
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={suppliers}
              searchKey="supplierName"
              searchPlaceholder="Filter suppliers..."
              meta={{
                onView: (supplier: Supplier) =>
                  navigate(`/suppliers/${supplier.id}`),
                onEdit: (supplier: Supplier) => setEditingSupplier(supplier),
                onDelete: (id: string) => handleDelete(id),
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={editingSupplier !== null}
        onOpenChange={() => setEditingSupplier(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>Update supplier information</DialogDescription>
          </DialogHeader>
          {editingSupplier && (
            <UpdateSupplierForm
              supplier={editingSupplier}
              onSuccess={() => setEditingSupplier(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
