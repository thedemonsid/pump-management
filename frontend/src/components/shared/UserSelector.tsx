import { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SalesmanService } from "@/services/salesman-service";
import { ManagerService } from "@/services/manager-service";
import type { Salesman, Manager } from "@/types";

interface UserOption {
  id: string;
  username: string;
  role: "SALESMAN" | "MANAGER";
  mobileNumber: string;
}

interface UserSelectorProps {
  value?: string;
  onChange: (userId: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function UserSelector({
  value,
  onChange,
  placeholder = "Select user...",
  disabled = false,
}: UserSelectorProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const [salesmen, managers] = await Promise.all([
          SalesmanService.getAll(),
          ManagerService.getAll(),
        ]);

        const salesmenOptions: UserOption[] = salesmen.map((s: Salesman) => ({
          id: s.id!,
          username: s.username,
          role: "SALESMAN" as const,
          mobileNumber: s.mobileNumber,
        }));

        const managerOptions: UserOption[] = managers.map((m: Manager) => ({
          id: m.id!,
          username: m.username,
          role: "MANAGER" as const,
          mobileNumber: m.mobileNumber,
        }));

        setUsers([...salesmenOptions, ...managerOptions]);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const selectedUser = users.find((user) => user.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled || loading}
        >
          {loading ? (
            <span>Loading users...</span>
          ) : selectedUser ? (
            <span>
              {selectedUser.username}{" "}
              <span className="text-muted-foreground text-xs">
                ({selectedUser.role})
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search user..." />
          <CommandList>
            <CommandEmpty>No user found.</CommandEmpty>
            <CommandGroup heading="Managers">
              {users
                .filter((user) => user.role === "MANAGER")
                .map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.username}
                    onSelect={() => {
                      onChange(user.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === user.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{user.username}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.mobileNumber}
                      </span>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
            <CommandGroup heading="Salesmen">
              {users
                .filter((user) => user.role === "SALESMAN")
                .map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.username}
                    onSelect={() => {
                      onChange(user.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === user.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{user.username}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.mobileNumber}
                      </span>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
