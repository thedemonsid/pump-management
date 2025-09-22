import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTankStore } from '@/store/tank-store';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, Pencil, Trash2, Loader2, FileText } from 'lucide-react';
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
import { CreateTankForm } from './CreateTankForm';
import { UpdateTankForm } from './UpdateTankForm';
import type { Tank } from '@/types';

export function TanksPage() {
  const navigate = useNavigate();
  const { tanks, loading, error, fetchTanks, removeTank } = useTankStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTank, setEditingTank] = useState<Tank | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTanks();
  }, [fetchTanks]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this tank?')) {
      setDeletingId(id);
      try {
        await removeTank(id);
      } catch (error) {
        console.error('Failed to delete tank:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatCapacity = (capacity: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      maximumFractionDigits: 2,
    }).format(capacity);
  };

  const calculateFillPercentage = (currentLevel: number, capacity: number) => {
    if (capacity <= 0) return 0;
    return (currentLevel / capacity) * 100;
  };

  const getFillPercentage = (tank: Tank) => {
    return (
      tank.fillPercentage ??
      (tank.currentLevel && tank.capacity
        ? calculateFillPercentage(tank.currentLevel, tank.capacity)
        : 0)
    );
  };

  const getIsLowLevel = (tank: Tank) => {
    return (
      tank.isLowLevel ??
      (tank.currentLevel && tank.lowLevelAlert
        ? tank.currentLevel <= tank.lowLevelAlert
        : false)
    );
  };

  if (loading && tanks.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading tanks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Tanks</h1>
          <p className="text-muted-foreground">
            Manage fuel storage tanks and their capacity
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Tank
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Tank</DialogTitle>
              <DialogDescription>
                Add a new fuel storage tank to the system
              </DialogDescription>
            </DialogHeader>
            <CreateTankForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tank List</CardTitle>
          <CardDescription>
            A list of all fuel storage tanks in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tanks.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No tanks found. Create your first tank to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tank Name</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Capacity (L)</TableHead>
                  <TableHead>Current Level (L)</TableHead>
                  <TableHead>Fill %</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tanks.map((tank) => (
                  <TableRow key={tank.id}>
                    <TableCell className="font-medium">
                      {tank.tankName}
                    </TableCell>
                    <TableCell>
                      {tank.product?.productName || 'No Product'}
                    </TableCell>
                    <TableCell>{formatCapacity(tank.capacity)} L</TableCell>
                    <TableCell>
                      {tank.currentLevel
                        ? formatCapacity(tank.currentLevel)
                        : '0'}{' '}
                      L
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const fillPercentage = getFillPercentage(tank);
                          if (fillPercentage > 0) {
                            return (
                              <>
                                <div className="w-12 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      fillPercentage >= 50
                                        ? 'bg-green-500'
                                        : fillPercentage >= 25
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                    }`}
                                    style={{
                                      width: `${Math.min(
                                        fillPercentage,
                                        100
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-sm">
                                  {fillPercentage.toFixed(1)}%
                                </span>
                              </>
                            );
                          } else {
                            return (
                              <span className="text-sm text-muted-foreground">
                                N/A
                              </span>
                            );
                          }
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getIsLowLevel(tank) ? (
                        <Badge variant="destructive">Low Level</Badge>
                      ) : (
                        <Badge variant="secondary">Normal</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/tanks/${tank.id}/ledger`)}
                          title="View Ledger"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingTank(tank)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(tank.id!)}
                          disabled={deletingId === tank.id}
                        >
                          {deletingId === tank.id ? (
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
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={editingTank !== null}
        onOpenChange={() => setEditingTank(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Tank</DialogTitle>
            <DialogDescription>Update tank information</DialogDescription>
          </DialogHeader>
          {editingTank && (
            <UpdateTankForm
              tank={editingTank}
              onSuccess={() => setEditingTank(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
