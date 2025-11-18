import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  fromDate: Date | undefined;
  toDate: Date | undefined;
  onFromDateChange: (date: Date | undefined) => void;
  onToDateChange: (date: Date | undefined) => void;
  fromLabel?: string;
  toLabel?: string;
  disabled?: boolean;
}

export function DateRangePicker({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  fromLabel = "From Date",
  toLabel = "To Date",
  disabled = false,
}: DateRangePickerProps) {
  const [isFromDateOpen, setIsFromDateOpen] = useState(false);
  const [isToDateOpen, setIsToDateOpen] = useState(false);

  return (
    <>
      {/* From Date */}
      <div className="flex-1 min-w-[200px]">
        <Label className="text-sm font-medium mb-2 block">{fromLabel}</Label>
        <Popover open={isFromDateOpen} onOpenChange={setIsFromDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full justify-start text-left font-normal",
                !fromDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {fromDate ? format(fromDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fromDate}
              onSelect={(date) => {
                onFromDateChange(date);
                setIsFromDateOpen(false);
              }}
              disabled={(date) => date > new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* To Date */}
      <div className="flex-1 min-w-[200px]">
        <Label className="text-sm font-medium mb-2 block">{toLabel}</Label>
        <Popover open={isToDateOpen} onOpenChange={setIsToDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full justify-start text-left font-normal",
                !toDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {toDate ? format(toDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={toDate}
              onSelect={(date) => {
                onToDateChange(date);
                setIsToDateOpen(false);
              }}
              disabled={(date) => {
                if (date > new Date()) return true;
                if (fromDate && date < fromDate) return true;
                return false;
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
