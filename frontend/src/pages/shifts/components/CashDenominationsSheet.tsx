import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

export interface DenominationCounts {
  notes500: number;
  notes200: number;
  notes100: number;
  notes50: number;
  notes20: number;
  notes10: number;
  coins5: number;
  coins2: number;
  coins1: number;
}

export const DENOMINATIONS = [
  { key: "notes500", label: "₹500", value: 500 },
  { key: "notes200", label: "₹200", value: 200 },
  { key: "notes100", label: "₹100", value: 100 },
  { key: "notes50", label: "₹50", value: 50 },
  { key: "notes20", label: "₹20", value: 20 },
  { key: "notes10", label: "₹10", value: 10 },
  { key: "coins5", label: "₹5", value: 5 },
  { key: "coins2", label: "₹2", value: 2 },
  { key: "coins1", label: "₹1", value: 1 },
] as const;

interface CashDenominationsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  denominations: DenominationCounts;
  onDenominationChange: (key: keyof DenominationCounts, value: string) => void;
  isEditable: boolean;
  isMobile: boolean;
}

export function CashDenominationsSheet({
  open,
  onOpenChange,
  denominations,
  onDenominationChange,
  isEditable,
  isMobile,
}: CashDenominationsSheetProps) {
  const calculateTotal = (): number => {
    return DENOMINATIONS.reduce((total, denom) => {
      const count = denominations[denom.key as keyof DenominationCounts];
      return total + count * denom.value;
    }, 0);
  };

  const handleIncrement = (key: keyof DenominationCounts) => {
    const currentValue = denominations[key];
    onDenominationChange(key, String(currentValue + 1));
  };

  const handleDecrement = (key: keyof DenominationCounts) => {
    const currentValue = denominations[key];
    if (currentValue > 0) {
      onDenominationChange(key, String(currentValue - 1));
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    currentIndex: number
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (currentIndex === DENOMINATIONS.length - 1) {
        onOpenChange(false);
      } else {
        const nextKey = DENOMINATIONS[currentIndex + 1].key;
        const nextInput = document.getElementById(nextKey) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={
          isMobile
            ? "w-full pb-10 overflow-y-auto"
            : "sm:max-w-lg pb-10 overflow-y-auto"
        }
      >
        <SheetHeader className="space-y-1 pb-3">
          <SheetTitle className="text-lg">Cash Denominations</SheetTitle>
          <SheetDescription className="text-xs">
            {isEditable ? "Enter" : "View"} the breakdown of cash by
            denomination{" "}
            {calculateTotal() !== 0 && (
              <span className="text-green-600 font-semibold">
                (Total: ₹{calculateTotal().toFixed(2)})
              </span>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-2">
          <div className="rounded-md border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-2 py-1.5 font-medium text-xs">
                    Denomination
                  </th>
                  <th className="text-center px-2 py-1.5 font-medium text-xs">
                    Count
                  </th>
                  <th className="text-right px-2 py-1.5 font-medium text-xs">
                    Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {DENOMINATIONS.map((denom, index) => (
                  <tr key={denom.key} className="border-t">
                    <td className="px-2 py-1.5 font-medium text-sm">
                      {denom.label}
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() =>
                            handleDecrement(
                              denom.key as keyof DenominationCounts
                            )
                          }
                          disabled={
                            !isEditable ||
                            denominations[
                              denom.key as keyof DenominationCounts
                            ] === 0
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          id={denom.key}
                          type="number"
                          min="0"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={
                            denominations[
                              denom.key as keyof DenominationCounts
                            ] === 0
                              ? ""
                              : denominations[
                                  denom.key as keyof DenominationCounts
                                ]
                          }
                          onChange={(e) =>
                            onDenominationChange(
                              denom.key as keyof DenominationCounts,
                              e.target.value
                            )
                          }
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          disabled={!isEditable}
                          className="min-w-10 text-center font-mono text-sm h-6 px-1"
                          placeholder="0"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() =>
                            handleIncrement(
                              denom.key as keyof DenominationCounts
                            )
                          }
                          disabled={!isEditable}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono text-sm">
                      ₹
                      {(
                        denominations[denom.key as keyof DenominationCounts] *
                        denom.value
                      ).toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t bg-muted/30 font-semibold">
                  <td className="px-2 py-1.5 text-sm" colSpan={2}>
                    Total Cash
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono text-base">
                    ₹{calculateTotal().toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {isEditable && (
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Done
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
