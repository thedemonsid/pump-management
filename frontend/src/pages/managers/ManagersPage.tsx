import { useEffect, useState } from "react";
import { useManagerStore } from "@/store/manager-store";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Pencil, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CreateManagerForm } from "./CreateManagerForm";
import { UpdateManagerForm } from "./UpdateManagerForm";
import type { Manager } from "@/types";

export function ManagersPage() {
  const { user } = useAuth();
  const { managers, loading, error, fetchManagers } = useManagerStore();

  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);

  // Check if user has permission to manage managers (ADMIN only)
  const canManageManagers = user?.role === "ADMIN";

  useEffect(() => {
    if (canManageManagers) {
      fetchManagers();
    }
  }, [fetchManagers, canManageManagers]);

  const handleEdit = (manager: Manager) => {
    setEditingManager(manager);
    setIsEditSheetOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingManager(null);
    setIsEditSheetOpen(false);
  };

  const handleSuccessEdit = () => {
    setEditingManager(null);
    setIsEditSheetOpen(false);
    fetchManagers();
  };

  const handleSuccessCreate = () => {
    setIsCreateSheetOpen(false);
    fetchManagers();
  };

  if (!canManageManagers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Access Denied
          </h2>
          <p className="text-muted-foreground mt-2">
            You don't have permission to manage managers. Only ADMIN role can
            access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading && managers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading managers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Managers</h1>
          <p className="text-muted-foreground">
            Manage your pump station managers
          </p>
        </div>
        <Button onClick={() => setIsCreateSheetOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Manager
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Managers List */}
      <Card>
        <CardHeader>
          <CardTitle>Managers List</CardTitle>
          <CardDescription>
            View and manage all managers in your pump station
          </CardDescription>
        </CardHeader>
        <CardContent>
          {managers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                No managers found. Create your first manager to get started.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Mobile Number</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Aadhar Number</TableHead>
                    <TableHead>PAN Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {managers.map((manager) => (
                    <TableRow key={manager.id}>
                      <TableCell className="font-medium">
                        {manager.username}
                      </TableCell>
                      <TableCell>{manager.mobileNumber}</TableCell>
                      <TableCell>
                        {manager.email || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {manager.aadharNumber || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {manager.panNumber || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {manager.enabled ? (
                          <Badge variant="default">Enabled</Badge>
                        ) : (
                          <Badge variant="secondary">Disabled</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(manager)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Manager Sheet */}
      <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
        <SheetContent className="sm:max-w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create New Manager</SheetTitle>
            <SheetDescription>
              Add a new manager to your pump station. Fill in all required
              fields.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <CreateManagerForm
              onSuccess={handleSuccessCreate}
              onCancel={() => setIsCreateSheetOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Manager Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="sm:max-w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Update Manager</SheetTitle>
            <SheetDescription>
              Update the manager details. Leave password empty to keep the
              current password.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {editingManager && (
              <UpdateManagerForm
                manager={editingManager}
                onSuccess={handleSuccessEdit}
                onCancel={handleCancelEdit}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
