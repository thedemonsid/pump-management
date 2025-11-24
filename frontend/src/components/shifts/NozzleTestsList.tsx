import { useState } from "react";
import { format } from "date-fns";
import { Trash2, Beaker } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { NozzleTestService } from "@/services/nozzle-test-service";
import type { NozzleTestResponse } from "@/types";
import { useAuth } from "@/hooks/useAuth";

interface NozzleTestsListProps {
  shiftId: string;
  tests: NozzleTestResponse[];
  onTestDeleted: () => void;
  isShiftOpen: boolean;
}

export function NozzleTestsList({
  shiftId,
  tests,
  onTestDeleted,
}: NozzleTestsListProps) {
  const { user } = useAuth();
  const [deleteTestId, setDeleteTestId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdminOrManager = user?.role === "ADMIN" || user?.role === "MANAGER";

  const handleDelete = async () => {
    if (!deleteTestId) return;

    setIsDeleting(true);
    try {
      await NozzleTestService.deleteTest(shiftId, deleteTestId);
      toast.success("Test deleted successfully");
      onTestDeleted();
      setDeleteTestId(null);
    } catch (error) {
      console.error("Error deleting test:", error);
      toast.error("Failed to delete test");
    } finally {
      setIsDeleting(false);
    }
  };

  const totalTestQuantity = tests.reduce(
    (sum, test) => sum + test.testQuantity,
    0
  );

  if (tests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            Nozzle Tests
          </CardTitle>
          <CardDescription>
            No nozzle tests registered for this shift
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="h-5 w-5" />
                Nozzle Tests
              </CardTitle>
              <CardDescription>
                {tests.length} test{tests.length !== 1 ? "s" : ""} recorded
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                Total Test Quantity
              </p>
              <p className="text-2xl font-bold">
                {totalTestQuantity.toFixed(3)}L
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Nozzle</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity (L)</TableHead>
                  <TableHead>Remarks</TableHead>
                  {isAdminOrManager && (
                    <TableHead className="w-20">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {format(new Date(test.testDatetime), "MMM dd, yyyy")}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(test.testDatetime), "hh:mm a")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{test.nozzleName}</Badge>
                    </TableCell>
                    <TableCell>{test.productName || "N/A"}</TableCell>
                    <TableCell className="text-right font-mono">
                      {test.testQuantity.toFixed(3)}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <span className="text-sm text-muted-foreground truncate block">
                        {test.remarks || "-"}
                      </span>
                    </TableCell>
                    {isAdminOrManager && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTestId(test.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTestId}
        onOpenChange={(open) => !open && setDeleteTestId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Nozzle Test?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              test record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
