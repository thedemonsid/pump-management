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
import { Plus, Pencil, Trash2, Loader2, Phone, Mail, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import type { Supplier } from '@/types';
import { Link } from 'react-router-dom';

export function SuppliersPage() {
  const navigate = useNavigate();
  const { suppliers, loading, error, fetchSuppliers, removeSupplier } =
    useSupplierStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      setDeletingId(id);
      try {
        await removeSupplier(id);
      } catch (error) {
        console.error('Failed to delete supplier:', error);
      } finally {
        setDeletingId(null);
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Contact Number</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>GST Number</TableHead>
                  <TableHead>Opening Balance</TableHead>
                  <TableHead>Opening Balance Date</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">
                      {supplier.supplierName}
                    </TableCell>
                    <TableCell>{supplier.contactPersonName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {supplier.contactNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      {supplier.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {supplier.email}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {supplier.gstNumber}
                    </TableCell>
                    <TableCell className="font-mono">
                      {supplier.openingBalance !== undefined ? (
                        <span
                          className={
                            supplier.openingBalance < 0
                              ? 'text-red-600'
                              : 'text-green-600'
                          }
                        >
                          ₹{supplier.openingBalance.toLocaleString()}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {supplier.openingBalanceDate
                        ? new Date(
                            supplier.openingBalanceDate
                          ).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell
                      className="max-w-xs truncate"
                      title={supplier.address}
                    >
                      {supplier.address}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/suppliers/${supplier.id}`)}
                          title="View Supplier Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingSupplier(supplier)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(supplier.id!)}
                          disabled={deletingId === supplier.id}
                        >
                          {deletingId === supplier.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
