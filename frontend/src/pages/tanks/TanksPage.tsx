import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTankStore, formatOpeningLevelDate } from "@/store/tank-store";
import { useTankLedgerStore } from "@/store/tank-ledger-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateTankForm } from "./CreateTankForm";
import { UpdateTankForm } from "./UpdateTankForm";
import { DipReadingSheet } from "./DipReadingSheet";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import type { Tank } from "@/types";

export function TanksPage() {
  const navigate = useNavigate();
  const { tanks, loading, error, fetchTanks } = useTankStore();
  const { getCurrentLevel } = useTankLedgerStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTank, setEditingTank] = useState<Tank | null>(null);
  const [dipReadingTank, setDipReadingTank] = useState<Tank | null>(null);
  const [currentBalances, setCurrentBalances] = useState<
    Record<string, number>
  >({});
  const [balancesLoading, setBalancesLoading] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    fetchTanks();
  }, [fetchTanks]);

  const calculateCurrentBalances = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];

    const balances: Record<string, number> = {};
    const loadingStates: Record<string, boolean> = {};

    // Start loading for all tanks
    tanks.forEach((tank) => {
      loadingStates[tank.id!] = true;
    });
    setBalancesLoading(loadingStates);

    // Calculate balance for each tank using the optimized getCurrentLevel method
    await Promise.all(
      tanks.map(async (tank) => {
        if (!tank.id) return;

        try {
          // Use tank's opening level date or a fallback date
          const fromDate = tank.openingLevelDate
            ? formatOpeningLevelDate(tank.openingLevelDate) || today
            : today;

          // Use the optimized method to get only the current level
          const currentLevel = await getCurrentLevel({
            tankId: tank.id,
            fromDate,
            toDate: today,
          });

          balances[tank.id] = currentLevel;
        } catch (error) {
          console.error(
            `Failed to calculate balance for tank ${tank.id}:`,
            error
          );
          // Fallback to tank's current level or 0
          balances[tank.id] = tank.currentLevel || 0;
        } finally {
          loadingStates[tank.id] = false;
        }
      })
    );

    setCurrentBalances(balances);
    setBalancesLoading(loadingStates);
  }, [tanks, getCurrentLevel]);

  // Calculate current balances for all tanks
  useEffect(() => {
    if (tanks.length > 0) {
      calculateCurrentBalances();
    }
  }, [tanks, calculateCurrentBalances]);

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
            <DataTable
              columns={columns}
              data={tanks}
              searchKey="tankName"
              searchPlaceholder="Filter tanks..."
              meta={{
                onView: (tank: Tank) => navigate(`/tanks/${tank.id}/ledger`),
                onEdit: (tank: Tank) => setEditingTank(tank),
                onDipReading: (tank: Tank) => setDipReadingTank(tank),
                currentBalances,
                balancesLoading,
              }}
            />
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

      {/* Dip Reading Sheet */}
      <DipReadingSheet
        tank={dipReadingTank}
        open={dipReadingTank !== null}
        onOpenChange={(open) => !open && setDipReadingTank(null)}
      />
    </div>
  );
}
