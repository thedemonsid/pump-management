import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { NozzleService } from '@/services/nozzle-service';
import { SalesmanNozzleShiftService } from '@/services/salesman-nozzle-shift-service';
import type { Nozzle, SalesmanNozzleShift } from '@/types';
import { formatCurrency } from '@/lib/utils/currency';
import { toast } from 'sonner';

export function NozzleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [nozzle, setNozzle] = useState<Nozzle | null>(null);
  const [shifts, setShifts] = useState<SalesmanNozzleShift[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchNozzleAndShifts();
  }, [fetchNozzleAndShifts]);

  const formatFuelQuantity = (quantity: number) => {
    return (
      new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }).format(quantity) + ' L'
    );
  };

  const handleCreateShift = () => {
    // Navigate to create shift with pre-selected nozzle
    navigate('/shifts/create', { state: { nozzleId: id } });
  };

  const handleEditShift = (shiftId: string) => {
    navigate(`/shifts/${shiftId}/edit`);
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
                <div key={shift.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          shift.status === 'ACTIVE' ? 'default' : 'secondary'
                        }
                      >
                        {shift.status}
                      </Badge>
                      <span className="font-medium">
                        {shift.salesmanUsername || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditShift(shift.id!)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteShift(shift.id!)}
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
