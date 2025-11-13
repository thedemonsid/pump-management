import { ChevronRight } from "lucide-react";

interface CashSummaryRowProps {
  totalCash: number;
  onClick: () => void;
  isEditable: boolean;
}

export function CashSummaryRow({
  totalCash,
  onClick,
  isEditable,
}: CashSummaryRowProps) {
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-2 sm:p-3 font-medium text-xs sm:text-sm">
              Description
            </th>
            <th className="text-right p-2 sm:p-3 font-medium text-xs sm:text-sm">
              Amount (₹)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            className="border-t cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={onClick}
          >
            <td className="p-2 sm:p-3">
              <div className="flex items-center gap-2 font-medium text-xs sm:text-sm">
                Total Cash (Click to {isEditable ? "enter" : "view"} breakdown)
              </div>
            </td>
            <td className="p-2 sm:p-3 text-right">
              <div className="flex items-center justify-end gap-2 font-mono text-xs sm:text-sm">
                ₹{totalCash.toFixed(2)}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
