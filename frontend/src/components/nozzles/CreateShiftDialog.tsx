import { useState } from 'react';
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
import type { Salesman } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface CreateShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nozzleId: string;
  salesmen: Salesman[];
  onSuccess: () => void;
}

export function CreateShiftDialog({
  open,
  onOpenChange,
  nozzleId,
  salesmen,
  onSuccess,
}: CreateShiftDialogProps) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    salesmanId: '',
    openingBalance: '',
  });

  const handleSubmit = async () => {
    if (!form.salesmanId || !form.openingBalance) return;
    try {
      const shiftData = {
        salesmanId: form.salesmanId,
        nozzleId,
        openingBalance: parseFloat(form.openingBalance),
      };
      if (user?.role === 'ADMIN') {
        await SalesmanNozzleShiftService.adminCreate(shiftData);
      } else {
        await SalesmanNozzleShiftService.create(shiftData);
      }
      toast.success('Shift created successfully');
      onOpenChange(false);
      setForm({ salesmanId: '', openingBalance: '' });
      onSuccess();
    } catch {
      toast.error('Failed to create shift');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Shift</DialogTitle>
          <DialogDescription>
            Create a new shift for this nozzle.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="salesman">Salesman</Label>
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
            <Label htmlFor="openingBalance">Opening Balance</Label>
            <Input
              id="openingBalance"
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
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Shift</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
