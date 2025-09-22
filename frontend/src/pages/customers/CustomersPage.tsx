import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerStore } from '@/store/customer-store';
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
import { CreateCustomerForm } from './CreateCustomerForm';
import { UpdateCustomerForm } from './UpdateCustomerForm';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import type { Customer } from '@/types';
import { Link } from 'react-router-dom';

export function CustomersPage() {
  const navigate = useNavigate();
  const { customers, loading, error, fetchCustomers, removeCustomer } =
    useCustomerStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await removeCustomer(id);
      } catch (error) {
        console.error('Failed to delete customer:', error);
      }
    }
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading customers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage fuel customers and their information
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div>
            <Link to="/customers/report">
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
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create New Customer</DialogTitle>
                <DialogDescription>
                  Add a new fuel customer to the system
                </DialogDescription>
              </DialogHeader>
              <CreateCustomerForm
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
          <CardTitle>Customer List</CardTitle>
          <CardDescription>
            A list of all fuel customers in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No customers found. Create your first customer to get started.
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={customers}
              searchKey="customerName"
              searchPlaceholder="Filter customers..."
              meta={{
                onView: (customer: Customer) =>
                  navigate(`/customers/${customer.id}`),
                onEdit: (customer: Customer) => setEditingCustomer(customer),
                onDelete: (id: string) => handleDelete(id),
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={editingCustomer !== null}
        onOpenChange={() => setEditingCustomer(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update customer information</DialogDescription>
          </DialogHeader>
          {editingCustomer && (
            <UpdateCustomerForm
              customer={editingCustomer}
              onSuccess={() => setEditingCustomer(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
