import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { NozzleService } from '@/services/nozzle-service';
import { SalesmanNozzleShiftService } from '@/services/salesman-nozzle-shift-service';
import { SalesmanService } from '@/services/salesman-service';
import type { Nozzle, SalesmanNozzleShift, Salesman } from '@/types';
import { toast } from 'sonner';
import { CreateShiftDialog } from '@/components/nozzles/CreateShiftDialog';
import { EditShiftDialog } from '@/components/nozzles/EditShiftDialog';
import { ShiftCard } from '@/components/nozzles/ShiftCard';

export function NozzleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [nozzle, setNozzle] = useState<Nozzle | null>(null);
  const [shifts, setShifts] = useState<SalesmanNozzleShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] =
    useState<SalesmanNozzleShift | null>(null);
  const [salesmen, setSalesmen] = useState<Salesman[]>([]);

  const fetchNozzleAndShifts = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [nozzleData, shiftsData] = await Promise.all([
        NozzleService.getById(id),
        SalesmanNozzleShiftService.getByNozzleId(id),
      ]);
      setNozzle(nozzleData);
      setShifts(shiftsData);
      console.log('Fetched nozzle data:', nozzleData);
      console.log('Fetched shifts data:', shiftsData);
    } catch (error) {
      console.error('Failed to load nozzle details:', error);
      toast.error('Failed to load nozzle details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchSalesmen = useCallback(async () => {
    try {
      const data = await SalesmanService.getAll();
      setSalesmen(data);
    } catch {
      toast.error('Failed to load salesmen');
    }
  }, []);

  useEffect(() => {
    fetchNozzleAndShifts();
    fetchSalesmen();
  }, [fetchNozzleAndShifts, fetchSalesmen]);

  const formatFuelQuantity = (quantity: number) => {
    return (
      new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }).format(quantity) + ' L'
    );
  };

  const handleCreateShift = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditShift = (shift: SalesmanNozzleShift) => {
    setSelectedShift(shift);
    setIsEditDialogOpen(true);
  };

  const handleDeleteShift = async (shiftId: string) => {
    if (confirm('Are you sure you want to delete this shift?')) {
      try {
        await SalesmanNozzleShiftService.delete(shiftId);
        toast.success('Shift deleted successfully');
        fetchNozzleAndShifts();
      } catch {
        toast.error('Failed to delete shift');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!nozzle) {
    return <div className="flex justify-center p-8">Nozzle not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{nozzle.nozzleName}</h1>
          <p className="text-muted-foreground">Nozzle Management</p>
        </div>
      </div>

      {/* Nozzle Details */}
      <Card>
        <CardHeader>
          <CardTitle>Nozzle Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <p>{nozzle.nozzleName}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Badge variant="default">ACTIVE</Badge>
            </div>
            <div>
              <label className="text-sm font-medium">Tank</label>
              <p>{nozzle.tank?.tankName || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Product</label>
              <p>{nozzle.tank?.product?.productName || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Company</label>
              <p>{nozzle.companyName || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <p>{nozzle.location || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Current Reading</label>
              <p>{formatFuelQuantity(nozzle.currentReading)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shifts Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Shift History</CardTitle>
          <Button onClick={handleCreateShift}>
            <Plus className="h-4 w-4 mr-2" />
            Create Shift
          </Button>
        </CardHeader>
        <CardContent>
          {shifts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No shifts found for this nozzle
            </p>
          ) : (
            <div className="space-y-4">
              {shifts.map((shift) => (
                <ShiftCard
                  key={shift.id}
                  shift={shift}
                  onEdit={handleEditShift}
                  onDelete={handleDeleteShift}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateShiftDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        nozzleId={id!}
        salesmen={salesmen}
        onSuccess={fetchNozzleAndShifts}
      />

      <EditShiftDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        shift={selectedShift}
        salesmen={salesmen}
        onSuccess={fetchNozzleAndShifts}
      />
    </div>
  );
}
