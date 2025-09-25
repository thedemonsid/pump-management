import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, Trash2 } from 'lucide-react';
import type { SalesmanNozzleShift } from '@/types';
import { formatCurrency } from '@/lib/utils/currency';

interface ShiftCardProps {
  shift: SalesmanNozzleShift;
  onEdit: (shift: SalesmanNozzleShift) => void;
  onDelete: (shiftId: string) => void;
}

export function ShiftCard({ shift, onEdit, onDelete }: ShiftCardProps) {
  const formatFuelQuantity = (quantity: number) => {
    return (
      new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }).format(quantity) + ' L'
    );
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant={shift.status === 'ACTIVE' ? 'default' : 'secondary'}>
            {shift.status}
          </Badge>
          <span className="font-medium">
            {shift.salesmanUsername || 'Unknown'}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(shift)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(shift.id!)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <label className="text-muted-foreground">Start</label>
          <p>{new Date(shift.startDateTime).toLocaleString()}</p>
        </div>
        {shift.endDateTime && (
          <div>
            <label className="text-muted-foreground">End</label>
            <p>{new Date(shift.endDateTime).toLocaleString()}</p>
          </div>
        )}
        <div>
          <label className="text-muted-foreground">Opening</label>
          <p>{formatFuelQuantity(shift.openingBalance)}</p>
        </div>
        {shift.closingBalance && (
          <div>
            <label className="text-muted-foreground">Closing</label>
            <p>{formatFuelQuantity(shift.closingBalance)}</p>
          </div>
        )}
      </div>

      {shift.totalAmount && (
        <>
          <Separator className="my-2" />
          <div className="flex justify-between text-sm">
            <span>Total Amount:</span>
            <span className="font-medium">
              {formatCurrency(shift.totalAmount)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
