import { useEffect, useState } from 'react';
import { useShiftStore } from '@/store/shift-store';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ShiftForm } from './ShiftForm';
import type { Shift } from '@/types';
import { formatTimeToAMPM } from '@/lib/utils/index';
export function ShiftsPage() {
  const { shifts, loading, error, fetchShifts, removeShift } = useShiftStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);
  console.log(shifts);
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this shift?')) {
      setDeletingId(id);
      try {
        await removeShift(id);
      } catch (error) {
        console.error('Failed to delete shift:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleEdit = (shift: Shift) => {
    setEditingShift(shift);
  };

  const handleCloseEditDialog = () => {
    setEditingShift(null);
  };
  if (loading && shifts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading shifts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shifts</h1>
          <p className="text-muted-foreground">
            Manage your pump station work shifts
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Shift
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Shift</DialogTitle>
              <DialogDescription>
                Create a new work shift for your pump station.
              </DialogDescription>
            </DialogHeader>
            <ShiftForm
              onSuccess={() => setIsCreateDialogOpen(false)}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          <p className="font-medium">Error loading shifts</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Shifts List</CardTitle>
          <CardDescription>
            A comprehensive list of all work shifts in your pump station.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shifts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No shifts found</p>
              <p className="text-sm text-muted-foreground">
                Get started by adding your first shift
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shift Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shifts.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell className="font-medium">
                        {shift.name}
                      </TableCell>
                      <TableCell>{shift.description}</TableCell>
                      <TableCell>{formatTimeToAMPM(shift.startTime)}</TableCell>
                      <TableCell>{formatTimeToAMPM(shift.endTime)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={shift.isActive ? 'default' : 'secondary'}
                        >
                          {shift.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(shift)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(shift.id!)}
                            disabled={deletingId === shift.id}
                          >
                            {deletingId === shift.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingShift} onOpenChange={handleCloseEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Shift</DialogTitle>
            <DialogDescription>
              Make changes to the shift information.
            </DialogDescription>
          </DialogHeader>
          {editingShift && (
            <ShiftForm
              shift={editingShift}
              onSuccess={handleCloseEditDialog}
              onCancel={handleCloseEditDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
