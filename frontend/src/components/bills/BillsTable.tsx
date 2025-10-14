import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import {
  formatCurrency,
  formatFuelQuantity,
  formatDate,
} from "@/utils/bill-utils";
import type { SalesmanBillResponse } from "@/types";

interface BillsTableProps {
  bills: SalesmanBillResponse[];
  onEdit: (bill: SalesmanBillResponse) => void;
  onDelete: (billId: string) => void;
}

export function BillsTable({ bills, onEdit, onDelete }: BillsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bill No</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bills.map((bill) => (
            <TableRow key={bill.id}>
              <TableCell className="font-medium">#{bill.billNo}</TableCell>
              <TableCell>{formatDate(new Date(bill.billDate))}</TableCell>
              <TableCell>{bill.customerName}</TableCell>
              <TableCell>{bill.productName}</TableCell>
              <TableCell>{formatFuelQuantity(bill.quantity)}</TableCell>
              <TableCell>{formatCurrency(bill.rate)}</TableCell>
              <TableCell>{formatCurrency(bill.amount)}</TableCell>
              <TableCell>
                {bill.vehicleNo || "-"}
                {bill.driverName && (
                  <div className="text-xs text-muted-foreground">
                    {bill.driverName}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(bill)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(bill.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
