import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SalesmanNozzleShiftService } from '@/services/salesman-nozzle-shift-service';
import type { Salesman, SalesmanNozzleShift } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const formatDateTimeForInput = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
};

interface AdminUpdateData {
  salesmanId: string;
  openingBalance: number;
  closingBalance?: number;
  startDateTime?: string;
  endDateTime?: string;
}

interface EditShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: SalesmanNozzleShift | null;
  salesmen: Salesman[];
  onSuccess: () => void;
}

export function EditShiftDialog({
  open,
  onOpenChange,
  shift,
  salesmen,
  onSuccess,
}: EditShiftDialogProps) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    salesmanId: '',
    openingBalance: '',
    closingBalance: '',
    startDateTime: '',
    endDateTime: '',
  });

  useEffect(() => {
    if (shift) {
      setForm({
        salesmanId: shift.salesmanId,
        openingBalance: shift.openingBalance.toString(),
        closingBalance: shift.closingBalance?.toString() || '',
        startDateTime: formatDateTimeForInput(shift.startDateTime),
        endDateTime: shift.endDateTime
          ? formatDateTimeForInput(shift.endDateTime)
          : '',
      });
    }
  }, [shift]);

  const handleSubmit = async () => {
    if (!shift || !form.salesmanId || !form.openingBalance) return;
    try {
      const updateData: AdminUpdateData = {
        salesmanId: form.salesmanId,
        openingBalance: parseFloat(form.openingBalance),
      };
      if (form.closingBalance) {
        updateData.closingBalance = parseFloat(form.closingBalance);
      }
      if (form.startDateTime) {
        updateData.startDateTime = new Date(form.startDateTime).toISOString();
      }
      if (form.endDateTime) {
        updateData.endDateTime = new Date(form.endDateTime).toISOString();
      }
      if (user?.role === 'ADMIN') {
        await SalesmanNozzleShiftService.adminUpdate(shift.id!, updateData);
      } else {
        toast.error('Only admins can update shifts');
        return;
      }
      toast.success('Shift updated successfully');
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error('Failed to update shift');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Shift</DialogTitle>
          <DialogDescription>Update the shift details.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-salesman">Salesman</Label>
            <Select
              value={form.salesmanId}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, salesmanId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select salesman" />
              </SelectTrigger>
              <SelectContent>
                {salesmen.map((salesman) => (
                  <SelectItem key={salesman.id!} value={salesman.id!}>
                    {salesman.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="edit-openingBalance">Opening Balance</Label>
            <Input
              id="edit-openingBalance"
              type="number"
              value={form.openingBalance}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  openingBalance: e.target.value,
                }))
              }
              placeholder="Enter opening balance"
            />
          </div>
          <div>
            <Label htmlFor="edit-closingBalance">Closing Balance</Label>
            <Input
              id="edit-closingBalance"
              type="number"
              value={form.closingBalance}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  closingBalance: e.target.value,
                }))
              }
              placeholder="Enter closing balance"
            />
          </div>
          <div>
            <Label htmlFor="edit-startDateTime">Start Date & Time</Label>
            <Input
              id="edit-startDateTime"
              type="datetime-local"
              value={form.startDateTime}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  startDateTime: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="edit-endDateTime">End Date & Time</Label>
            <Input
              id="edit-endDateTime"
              type="datetime-local"
              value={form.endDateTime}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  endDateTime: e.target.value,
                }))
              }
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Update Shift</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
