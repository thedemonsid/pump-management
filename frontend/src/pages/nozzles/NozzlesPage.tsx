import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNozzleStore } from '@/store/nozzle-store';
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
import { CreateNozzleForm } from './CreateNozzleForm';
import { UpdateNozzleForm } from './UpdateNozzleForm';
import type { Nozzle } from '@/types';

export function NozzlesPage() {
  const navigate = useNavigate();
  const { nozzles, loading, error, fetchNozzles, removeNozzle } =
    useNozzleStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNozzle, setEditingNozzle] = useState<Nozzle | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchNozzles();
  }, [fetchNozzles]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this nozzle?')) {
      setDeletingId(id);
      try {
        await removeNozzle(id);
      } catch (error) {
        console.error('Failed to delete nozzle:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleEdit = (nozzle: Nozzle) => {
    setEditingNozzle(nozzle);
  };

  const handleCloseEditDialog = () => {
    setEditingNozzle(null);
  };

  if (loading && nozzles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading nozzles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nozzles</h1>
          <p className="text-muted-foreground">
            Manage your pump station nozzles
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Nozzle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Nozzle</DialogTitle>
              <DialogDescription>
                Create a new nozzle for your pump station.
              </DialogDescription>
            </DialogHeader>
            <CreateNozzleForm
              onSuccess={() => setIsCreateDialogOpen(false)}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          <p className="font-medium">Error loading nozzles</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Nozzles List</CardTitle>
          <CardDescription>
            A comprehensive list of all nozzles in your pump station.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {nozzles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No nozzles found</p>
              <p className="text-sm text-muted-foreground">
                Get started by adding your first nozzle
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nozzle Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Associated Tank</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Current Reading</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nozzles.map((nozzle) => (
                    <TableRow key={nozzle.id}>
                      <TableCell className="font-medium">
                        {nozzle.nozzleName}
                      </TableCell>
                      <TableCell>{nozzle.companyName}</TableCell>
                      <TableCell>
                        {nozzle.tank ? (
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {nozzle.tank.tankName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {nozzle.tank.product?.productName || 'No Product'}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="secondary">No Tank</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {nozzle.location || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {nozzle.currentReading.toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/nozzles/${nozzle.id}`)}
                            title="Manage Shifts"
                          >
                            Manage Shifts
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(nozzle)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(nozzle.id!)}
                            disabled={deletingId === nozzle.id}
                          >
                            {deletingId === nozzle.id ? (
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
      <Dialog open={!!editingNozzle} onOpenChange={handleCloseEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Nozzle</DialogTitle>
            <DialogDescription>
              Make changes to the nozzle information.
            </DialogDescription>
          </DialogHeader>
          {editingNozzle && (
            <UpdateNozzleForm
              nozzle={editingNozzle}
              onSuccess={handleCloseEditDialog}
              onCancel={handleCloseEditDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
