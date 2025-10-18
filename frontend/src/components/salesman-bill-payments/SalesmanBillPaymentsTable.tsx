import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2 } from "lucide-react";
import { formatDate } from "@/utils/bill-utils";
import type { SalesmanBillPaymentResponse } from "@/types";

interface SalesmanBillPaymentsTableProps {
  payments: SalesmanBillPaymentResponse[];
  onView: (payment: SalesmanBillPaymentResponse) => void;
  onDelete: (paymentId: string) => void;
}

const getPaymentMethodBadge = (method: string) => {
  const variants: Record<string, "default" | "secondary" | "outline"> = {
    CASH: "default",
    CHEQUE: "secondary",
    ONLINE: "outline",
  };

  return (
    <Badge variant={variants[method] || "default"} className="capitalize">
      {method.toLowerCase()}
    </Badge>
  );
};

export function SalesmanBillPaymentsTable({
  payments,
  onView,
  onDelete,
}: SalesmanBillPaymentsTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Salesman</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Bank Account</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="h-24 text-center text-muted-foreground"
              >
                No payments found.
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {formatDate(new Date(payment.paymentDate))}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(payment.paymentDate).toLocaleTimeString(
                        "en-IN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    {payment.customerName || payment.customerId}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {payment.salesmanName || payment.salesmanId}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(payment.amount)}
                  </span>
                </TableCell>
                <TableCell>
                  {getPaymentMethodBadge(payment.paymentMethod)}
                </TableCell>
                <TableCell>
                  <span className="text-sm font-mono">
                    {payment.referenceNumber}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {payment.bankAccountHolderName || payment.bankAccountId}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {payment.notes || "-"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(payment)}
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(payment.id)}
                      className="text-destructive hover:text-destructive"
                      title="Delete payment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
