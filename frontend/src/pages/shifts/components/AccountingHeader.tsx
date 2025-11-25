import { Button } from "@/components/ui/button";
import { Edit, Download, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AccountingHeaderProps {
  shiftId: string;
  hasAccounting: boolean;
  canEdit: boolean;
  isEditing: boolean;
  isAdminOrManager: boolean;
  onEdit: () => void;
  onDelete?: () => void;
}

export function AccountingHeader({
  shiftId,
  hasAccounting,
  canEdit,
  isEditing,
  isAdminOrManager,
  onEdit,
  onDelete,
}: AccountingHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2 sm:px-0">
      <div className="flex gap-2">
        {hasAccounting && canEdit && !isEditing && (
          <>
            <Button onClick={onEdit} size="sm" className="hidden sm:flex">
              <Edit className="mr-2 h-4 w-4" />
              Edit Accounting
            </Button>
            <Button onClick={onEdit} size="icon" className="sm:hidden">
              <Edit className="h-4 w-4" />
            </Button>
          </>
        )}
        {hasAccounting && isAdminOrManager && !isEditing && onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="hidden sm:flex"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" className="sm:hidden">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Accounting?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the accounting record for this
                  shift. The shift will be marked as not accounted. This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      {hasAccounting && isAdminOrManager && !isEditing && (
        <>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="hidden sm:flex"
          >
            <Link to={`/shifts/${shiftId}/accounting/report`}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Link>
          </Button>
          <Button asChild size="icon" variant="outline" className="sm:hidden">
            <Link to={`/shifts/${shiftId}/accounting/report`}>
              <Download className="h-4 w-4" />
            </Link>
          </Button>
        </>
      )}
    </div>
  );
}
