import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Loader2, Gauge } from "lucide-react";
import { DipReadingService } from "@/services";
import type { DipReading, Tank } from "@/types";
import { DipReadingForm } from "./DipReadingForm";
import { DataTable } from "@/components/ui/data-table";
import { getDipReadingColumns } from "./DipReadingColumns";
import { toast } from "sonner";

interface DipReadingSheetProps {
  tank: Tank | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DipReadingSheet({
  tank,
  open,
  onOpenChange,
}: DipReadingSheetProps) {
  const [readings, setReadings] = useState<DipReading[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReading, setEditingReading] = useState<DipReading | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Date range: last 30 days
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  };

  const fetchReadings = async () => {
    if (!tank?.id) return;

    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const data = await DipReadingService.getByTankId(tank.id, {
        startDate,
        endDate,
      });
      setReadings(data);
    } catch (error) {
      console.error("Failed to fetch dip readings:", error);
      toast.error("Failed to fetch dip readings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && tank) {
      fetchReadings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tank]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this dip reading?")) return;

    setDeletingId(id);
    try {
      await DipReadingService.delete(id);
      toast.success("Dip reading deleted successfully");
      fetchReadings();
    } catch (error) {
      console.error("Failed to delete dip reading:", error);
      toast.error("Failed to delete dip reading");
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingReading(null);
    fetchReadings();
  };

  const columns = getDipReadingColumns({
    onEdit: setEditingReading,
    onDelete: handleDelete,
    deletingId,
  });

  if (isFormOpen || editingReading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-[600px] w-full">
          <SheetHeader>
            <SheetTitle>
              {editingReading ? "Edit" : "Add"} Dip Reading
            </SheetTitle>
            <SheetDescription>
              {editingReading ? "Update" : "Record"} dip reading for{" "}
              {tank?.tankName}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <DipReadingForm
              tank={tank!}
              reading={editingReading}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingReading(null);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[700px] w-full">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-2xl">Dip Readings</SheetTitle>
              <SheetDescription className="mt-1">
                Tank: <span className="font-semibold">{tank?.tankName}</span> •
                Product:{" "}
                <span className="font-semibold">
                  {tank?.product?.productName}
                </span>
              </SheetDescription>
            </div>
            <Button onClick={() => setIsFormOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Reading
            </Button>
          </div>
        </SheetHeader>

        <Separator className="my-4" />

        {loading && readings.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading dip readings...</span>
            </div>
          </div>
        ) : readings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Gauge className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Dip Readings</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start recording dip readings to track fuel levels
            </p>
            <Button onClick={() => setIsFormOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add First Reading
            </Button>
          </div>
        ) : (
          <div className="mt-4">
            <DataTable
              columns={columns}
              data={readings}
              searchKey="remarks"
              searchPlaceholder="Search remarks..."
              pageSize={10}
              enableRowSelection={false}
              enableColumnVisibility={true}
              enablePagination={true}
              enableSorting={true}
              enableFiltering={true}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
