import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useNozzleStore } from '@/store/nozzle-store';
import { useNozzleShiftStore } from '@/store/nozzle-shift-store';
import { formatTimeToAMPM } from '@/lib/utils/time';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, CalendarIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { Nozzle } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreateNozzleShiftForm } from './CreateNozzleShiftForm';
import { UpdateNozzleShiftForm } from './UpdateNozzleShiftForm';

export function NozzleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { fetchNozzleById, loading: nozzleLoading } = useNozzleStore();
  const {
    nozzleShifts,
    loading: shiftLoading,
    error,
    fetchShiftsByNozzleId,
    fetchShiftsByDate,
  } = useNozzleShiftStore();

  const [nozzle, setNozzle] = useState<Nozzle | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchNozzleById(id)
        .then(setNozzle)
        .catch(() => setNozzle(null));
    }
  }, [id, fetchNozzleById]);

  useEffect(() => {
    if (id) {
      fetchShiftsByNozzleId(id);
    }
  }, [id, fetchShiftsByNozzleId]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setDatePopoverOpen(false);
    if (date && id) {
      const dateString = format(date, 'yyyy-MM-dd');
      fetchShiftsByDate(dateString);
    }
  };

  const handleViewAllShifts = () => {
    if (id) {
      fetchShiftsByNozzleId(id);
    }
    setSelectedDate(undefined);
  };

  const filteredShifts = selectedDate
    ? nozzleShifts.filter(
        (shift) => shift.shiftDate === format(selectedDate, 'yyyy-MM-dd')
      )
    : nozzleShifts;

  if (nozzleLoading && !nozzle) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading nozzle details...</span>
      </div>
    );
  }

  if (!nozzle) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nozzle not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">{nozzle.nozzleName}</h1>
        <p className="text-muted-foreground">
          {nozzle.companyName} • {nozzle.location || 'No location specified'}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Current Reading
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {nozzle.currentReading.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Associated Tank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {nozzle.tank?.tankName || 'No tank assigned'}
            </div>
            {nozzle.tank?.product && (
              <p className="text-sm text-muted-foreground">
                {nozzle.tank.product.productName}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Shifts Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredShifts.filter((shift) => !shift.closed).length}
            </div>
            <p className="text-sm text-muted-foreground">
              {filteredShifts.filter((shift) => shift.closed).length} closed
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Nozzle Shifts</CardTitle>
              <CardDescription>
                View and manage shift readings for this nozzle
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-[240px] justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate
                      ? format(selectedDate, 'PPP')
                      : 'Filter by date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {selectedDate && (
                <Button variant="ghost" onClick={handleViewAllShifts}>
                  View All
                </Button>
              )}
              <Dialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Shift
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Nozzle Shift</DialogTitle>
                    <DialogDescription>
                      Add a new shift reading for this nozzle.
                    </DialogDescription>
                  </DialogHeader>
                  <CreateNozzleShiftForm
                    preselectedNozzleId={id}
                    onSuccess={() => {
                      setCreateDialogOpen(false);
                      if (id) fetchShiftsByNozzleId(id);
                    }}
                    onCancel={() => setCreateDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-4">
              <p className="font-medium">Error loading shifts</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {shiftLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading shifts...</span>
            </div>
          ) : filteredShifts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {selectedDate
                  ? 'No shifts found for selected date'
                  : 'No shifts found for this nozzle'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Salesman</TableHead>
                    <TableHead>Opening Time</TableHead>
                    <TableHead>Closing Time</TableHead>
                    <TableHead>Opening Reading</TableHead>
                    <TableHead>Closing Reading</TableHead>
                    <TableHead>Fuel Price</TableHead>
                    <TableHead>Dispensed</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShifts.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell>
                        {format(new Date(shift.shiftDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {shift.salesman.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {shift.salesman.employeeId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatTimeToAMPM(shift.openingTime)}
                      </TableCell>
                      <TableCell>
                        {shift.closingTime ? (
                          formatTimeToAMPM(shift.closingTime)
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {shift.openingReading.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {shift.closingReading?.toLocaleString() || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>₹{shift.fuelPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        {shift.dispensedAmount?.toLocaleString() || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {shift.totalValue ? (
                          `₹${shift.totalValue.toFixed(2)}`
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={shift.closed ? 'secondary' : 'default'}>
                          {shift.closed ? 'Closed' : 'Open'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Update Nozzle Shift</DialogTitle>
                              <DialogDescription>
                                Update the shift reading details.
                              </DialogDescription>
                            </DialogHeader>
                            <UpdateNozzleShiftForm
                              shift={shift}
                              onSuccess={() => {
                                if (id) fetchShiftsByNozzleId(id);
                              }}
                              onCancel={() => {}}
                            />
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
