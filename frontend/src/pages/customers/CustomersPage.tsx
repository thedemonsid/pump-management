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
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Phone,
  MapPin,
  Eye,
} from 'lucide-react';
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
import { CreateCustomerForm } from './CreateCustomerForm';
import { UpdateCustomerForm } from './UpdateCustomerForm';
import type { Customer } from '@/types';
import { Link } from 'react-router-dom';

export function CustomersPage() {
  const navigate = useNavigate();
  const { customers, loading, error, fetchCustomers, removeCustomer } =
    useCustomerStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      setDeletingId(id);
      try {
        await removeCustomer(id);
      } catch (error) {
        console.error('Failed to delete customer:', error);
      } finally {
        setDeletingId(null);
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>GST Number</TableHead>
                  <TableHead>PAN Number</TableHead>
                  <TableHead>Credit Limit</TableHead>
                  <TableHead>Opening Balance</TableHead>
                  <TableHead>Opening Balance Date</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.customerName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {customer.phoneNumber}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {customer.gstNumber}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {customer.panNumber}
                    </TableCell>
                    <TableCell className="font-mono">
                      ₹{customer.creditLimit.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono">
                      {customer.openingBalance !== undefined ? (
                        <span
                          className={
                            customer.openingBalance > 0
                              ? 'text-red-600'
                              : 'text-green-600'
                          }
                        >
                          ₹{customer.openingBalance.toLocaleString()}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {customer.openingBalanceDate
                        ? new Date(
                            customer.openingBalanceDate
                          ).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell
                      className="max-w-xs truncate"
                      title={customer.address}
                    >
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{customer.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/customers/${customer.id}`)}
                          title="View Customer Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingCustomer(customer)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(customer.id!)}
                          disabled={deletingId === customer.id}
                        >
                          {deletingId === customer.id ? (
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
