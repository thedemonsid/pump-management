import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { ShiftResponse } from "@/types";

interface ShiftInfoCardProps {
  shift: ShiftResponse;
}

export function ShiftInfoCard({ shift }: ShiftInfoCardProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="p-3 sm:p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Shift Information</h2>
          <Badge variant={shift.status === "OPEN" ? "default" : "secondary"}>
            {shift.status}
          </Badge>
        </div>
      </div>
      <div className="p-3 sm:p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Salesman</p>
            <p className="font-medium">{shift.salesmanUsername}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Start Time</p>
            <p className="font-medium">
              {format(new Date(shift.startDatetime), "PPp")}
            </p>
          </div>
          {shift.endDatetime && (
            <div>
              <p className="text-muted-foreground">End Time</p>
              <p className="font-medium">
                {format(new Date(shift.endDatetime), "PPp")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
