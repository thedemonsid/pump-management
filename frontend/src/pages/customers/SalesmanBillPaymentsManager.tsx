import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSalesmanBillPaymentStore } from '@/store/salesman-bill-payment-store';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { UpdateSalesmanBillPaymentForm } from './UpdateSalesmanBillPaymentForm';
import type { SalesmanBillPaymentResponse } from '@/types';

interface SalesmanBillPaymentsManagerProps {
  customerId?: string;
}

export function SalesmanBillPaymentsManager({
  customerId: propCustomerId,
}: SalesmanBillPaymentsManagerProps = {}) {
  const { customerId: paramCustomerId } = useParams<{
    customerId: string;
  }>();
  const customerId = propCustomerId || paramCustomerId;
  const { user } = useAuth();
  const {
    customerPayments,
    loading,
    fetchPaymentsByCustomerId,
    removePayment,
  } = useSalesmanBillPaymentStore();

  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] =
    useState<SalesmanBillPaymentResponse | null>(null);

  useEffect(() => {
    if (customerId) {
      fetchPaymentsByCustomerId(customerId);
    }
  }, [customerId, fetchPaymentsByCustomerId]);

  const handleDeletePayment = async (paymentId: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this payment? This action cannot be undone.'
      )
    ) {
      try {
        await removePayment(paymentId);
      } catch {
        // Error is handled in the store
      }
    }
  };

  const handleUpdateSuccess = () => {
    setUpdateDialogOpen(false);
    setSelectedPayment(null);
    if (customerId) {
      fetchPaymentsByCustomerId(customerId);
    }
  };

  const canEditPayment = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const canDeletePayment = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  if (!customerId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Invalid customer ID</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Customer Payments
          </h2>
          <p className="text-muted-foreground">
            Manage payments received from customer
          </p>
        </div>

        {canEditPayment && (
          <Dialog
            open={updateDialogOpen && selectedPayment?.id === payment.id}
            onOpenChange={(open) => {
              setUpdateDialogOpen(open);
              if (!open) setSelectedPayment(null);
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPayment(payment)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Update Payment</DialogTitle>
              </DialogHeader>
              {selectedPayment && (
                <UpdateSalesmanBillPaymentForm
                  payment={selectedPayment}
                  onSuccess={handleUpdateSuccess}
                />
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : customerPayments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No payments found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{payment.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.paymentMethod}</Badge>
                    </TableCell>
                    <TableCell>{payment.referenceNumber || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {canEditPayment && (
                          <Dialog
                            open={
                              updateDialogOpen &&
                              selectedPayment?.id === payment.id
                            }
                            onOpenChange={(open) => {
                              setUpdateDialogOpen(open);
                              if (!open) setSelectedPayment(null);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedPayment(payment)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Update Payment</DialogTitle>
                              </DialogHeader>
                              {selectedPayment && (
                                <UpdateSalesmanBillPaymentForm
                                  payment={selectedPayment}
                                  onSuccess={handleUpdateSuccess}
                                />
                              )}
                            </DialogContent>
                          </Dialog>
                        )}

                        {canDeletePayment && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePayment(payment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
