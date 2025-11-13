import { Button } from "@/components/ui/button";
import { Edit, Download } from "lucide-react";
import { Link } from "react-router-dom";

interface AccountingHeaderProps {
  shiftId: string;
  hasAccounting: boolean;
  canEdit: boolean;
  isEditing: boolean;
  isAdminOrManager: boolean;
  onEdit: () => void;
}

export function AccountingHeader({
  shiftId,
  hasAccounting,
  canEdit,
  isEditing,
  isAdminOrManager,
  onEdit,
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
