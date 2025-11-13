import { Button } from "@/components/ui/button";
import { Loader2, Save, Calculator } from "lucide-react";

interface AccountingFormActionsProps {
  hasAccounting: boolean;
  isEditing: boolean;
  isSaving: boolean;
  onCancel: () => void;
}

export function AccountingFormActions({
  hasAccounting,
  isEditing,
  isSaving,
  onCancel,
}: AccountingFormActionsProps) {
  return (
    <div className="flex gap-3">
      {isEditing && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
          className="flex-1"
        >
          Cancel
        </Button>
      )}
      <Button type="submit" disabled={isSaving} className="flex-1">
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            {hasAccounting ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Accounting
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                Save Accounting
              </>
            )}
          </>
        )}
      </Button>
    </div>
  );
}
