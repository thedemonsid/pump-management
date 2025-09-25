import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Receipt, Calendar, Package, Loader2 } from 'lucide-react';
import { useBillStore } from '@/store/bill-store';
import type { BillResponse } from '@/types';

export function BillDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { fetchBillById } = useBillStore();
  const [bill, setBill] = useState<BillResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchBillById(id)
        .then(setBill)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, fetchBillById]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading bill details...</span>
        </div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-600">{error || 'Bill not found'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bill Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Bill {bill.billNo}
              </CardTitle>
              <CardDescription>Bill details and items</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Bill Date</span>
              </div>
              <p className="font-medium">
                {new Date(bill.billDate).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            {bill.customerName && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>👤</span>
                  <span>Customer</span>
                </div>
                <p className="font-medium">{bill.customerName}</p>
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span></span>
                <span>Rate Type</span>
              </div>
              <Badge variant="outline">{bill.rateType}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bill Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Bill Items
          </CardTitle>
          <CardDescription>
            Products and quantities included in this bill
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bill.billItems.map((item, index) => (
              <div key={item.id || index}>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1 flex-1">
                    <h4 className="font-medium">
                      {item.productName || `Product ${item.productId}`}
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Qty: {item.quantity}</span>
                      {item.salesUnit && <span>Unit: {item.salesUnit}</span>}
                      <span>Rate: ₹{item.rate.toLocaleString('en-IN')}</span>
                      {item.hsnCode && <span>HSN: {item.hsnCode}</span>}
                      {item.discount > 0 && (
                        <span className="text-green-600">
                          Discount: ₹{item.discount.toLocaleString('en-IN')}
                        </span>
                      )}
                      <span>GST: {item.gst}%</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-semibold text-lg">
                      ₹{item.netAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
                {index < bill.billItems.length - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
          </div>

          {/* Amount Breakdown */}
          <Separator className="my-6" />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="font-medium">
                ₹{bill.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
            {bill.discountAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Discount</span>
                <span className="font-medium text-green-600">
                  -₹{bill.discountAmount.toLocaleString('en-IN')}
                </span>
              </div>
            )}
            {bill.taxAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tax</span>
                <span className="font-medium">
                  ₹{bill.taxAmount.toLocaleString('en-IN')}
                </span>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-semibold">Net Amount</span>
              <span className="text-xl font-bold text-primary">
                ₹{bill.netAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      {bill.createdAt && (
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>
                <p className="font-medium">
                  {new Date(bill.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              {bill.updatedAt && (
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <p className="font-medium">
                    {new Date(bill.updatedAt).toLocaleString('en-IN')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
