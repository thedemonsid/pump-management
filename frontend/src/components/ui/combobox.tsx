import { useState, forwardRef } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Primary Autocomplete Component using shadcn Command
interface AutocompleteInputProps {
  options: string[];
  placeholder?: string;
  onSelect?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  allowCustom?: boolean;
  value?: string;
  emptyMessage?: string;
  tabIndex?: number;
}

const AutocompleteInput = forwardRef<HTMLInputElement, AutocompleteInputProps>(
  (
    {
      options = [],
      placeholder = 'Search...',
      onSelect = () => {},
      className = '',
      disabled = false,
      allowCustom = false,
      value = '',
      emptyMessage = 'No results found.',
      tabIndex,
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value);

    const handleSelect = (selectedValue: string) => {
      const newValue = selectedValue === inputValue ? '' : selectedValue;
      setInputValue(newValue);
      onSelect(newValue);
      setOpen(false);
    };

    const handleInputChange = (value: string) => {
      setInputValue(value);
      if (!open) setOpen(true);
    };

    const clearSelection = () => {
      setInputValue('');
      onSelect('');
    };

    return (
      <div className={`relative ${className}`}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Input
                ref={ref}
                tabIndex={tabIndex}
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                disabled={disabled}
                className="pr-20"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
                {inputValue && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-transparent"
                    onClick={clearSelection}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-transparent"
                  onClick={() => setOpen(!open)}
                >
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${
                      open ? 'rotate-180' : ''
                    }`}
                  />
                </Button>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput
                placeholder={placeholder}
                value={inputValue}
                onValueChange={handleInputChange}
              />
              <CommandList>
                <CommandEmpty>
                  {allowCustom && inputValue.trim() ? (
                    <div className="p-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleSelect(inputValue)}
                      >
                        Create "{inputValue}"
                      </Button>
                    </div>
                  ) : (
                    emptyMessage
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option}
                      value={option}
                      onSelect={handleSelect}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          inputValue === option ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                      {option}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

AutocompleteInput.displayName = 'AutocompleteInput';

// Multi-select Autocomplete Component
interface MultiSelectAutocompleteProps {
  options: string[];
  placeholder?: string;
  onSelectionChange?: (selection: string[]) => void;
  className?: string;
  disabled?: boolean;
  maxSelected?: number;
}

const MultiSelectAutocomplete: React.FC<MultiSelectAutocompleteProps> = ({
  options = [],
  placeholder = 'Select items...',
  onSelectionChange = () => {},
  className = '',
  disabled = false,
  maxSelected,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  const handleSelect = (value: string) => {
    let newSelection: string[];
    if (selectedItems.includes(value)) {
      newSelection = selectedItems.filter((item) => item !== value);
    } else {
      if (maxSelected && selectedItems.length >= maxSelected) {
        return;
      }
      newSelection = [...selectedItems, value];
    }

    setSelectedItems(newSelection);
    onSelectionChange(newSelection);
    setInputValue('');
  };

  const removeItem = (value: string) => {
    const newSelection = selectedItems.filter((item) => item !== value);
    setSelectedItems(newSelection);
    onSelectionChange(newSelection);
  };

  const availableOptions = options.filter(
    (option) => !selectedItems.includes(option)
  );

  return (
    <div className={`space-y-2 ${className}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className="truncate">
              {selectedItems.length > 0
                ? `${selectedItems.length} selected`
                : placeholder}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              placeholder="Search options..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                {availableOptions.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={handleSelect}
                  >
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <Badge key={item} variant="secondary" className="pr-1">
              {item}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeItem(item)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

// Demo Component
const AutocompleteDemo = () => {
  const [singleValue, setSingleValue] = useState('');
  const [multiValue, setMultiValue] = useState<string[]>([]);

  const fruits = [
    'Apple',
    'Banana',
    'Cherry',
    'Date',
    'Elderberry',
    'Fig',
    'Grape',
    'Honeydew',
    'Kiwi',
    'Lemon',
    'Mango',
    'Orange',
    'Papaya',
    'Quince',
    'Raspberry',
    'Strawberry',
    'Tangerine',
    'Watermelon',
  ];

  const countries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Germany',
    'France',
    'Italy',
    'Spain',
    'Netherlands',
    'Australia',
    'Japan',
    'South Korea',
    'Brazil',
    'Mexico',
    'India',
    'China',
    'Russia',
  ];

  const colors = [
    'Red',
    'Blue',
    'Green',
    'Yellow',
    'Purple',
    'Orange',
    'Pink',
    'Brown',
    'Black',
    'White',
    'Gray',
    'Cyan',
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Shadcn Autocomplete Components
        </h1>
        <p className="text-muted-foreground">
          Professional autocomplete components built with shadcn/ui Command and
          Popover primitives.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        {/* Single Select Examples */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Single Select</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">Choose a Fruit</label>
            <AutocompleteInput
              options={fruits}
              placeholder="Search fruits..."
              value={singleValue}
              onSelect={setSingleValue}
            />
            {singleValue && (
              <p className="text-sm text-muted-foreground">
                Selected: <span className="font-medium">{singleValue}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Country (with custom creation)
            </label>
            <AutocompleteInput
              options={countries}
              placeholder="Search or create country..."
              allowCustom={true}
              onSelect={(value) => console.log('Country selected:', value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Disabled Input</label>
            <AutocompleteInput
              options={colors}
              placeholder="This input is disabled"
              disabled={true}
            />
          </div>
        </div>

        {/* Multi Select Examples */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Multi Select</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select Multiple Colors
            </label>
            <MultiSelectAutocomplete
              options={colors}
              placeholder="Choose colors..."
              onSelectionChange={setMultiValue}
            />
            {multiValue.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Selected {multiValue.length} item(s): {multiValue.join(', ')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Limited Selection (Max 3)
            </label>
            <MultiSelectAutocomplete
              options={fruits}
              placeholder="Choose up to 3 fruits..."
              maxSelected={3}
              onSelectionChange={(selection) =>
                console.log('Limited selection:', selection)
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Disabled Multi-Select</label>
            <MultiSelectAutocomplete
              options={countries}
              placeholder="This is disabled"
              disabled={true}
            />
          </div>
        </div>
      </div>

      {/* Features Card */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h3 className="font-semibold mb-4">✨ Features & Benefits</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-medium mb-2">Single Select Features:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Real-time search and filtering</li>
              <li>• Keyboard navigation support</li>
              <li>• Clear button functionality</li>
              <li>• Custom value creation</li>
              <li>• Fully accessible</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Multi Select Features:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Multiple item selection</li>
              <li>• Badge-based display</li>
              <li>• Individual item removal</li>
              <li>• Maximum selection limits</li>
              <li>• Responsive design</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="rounded-lg border bg-muted/50 p-6">
        <h3 className="font-semibold mb-3">🚀 Quick Start</h3>
        <p className="text-sm text-muted-foreground mb-4">
          These components use shadcn/ui primitives. Make sure you have the
          following components installed:
        </p>
        <div className="bg-background rounded border p-4 font-mono text-sm">
          <div>npx shadcn-ui@latest add command</div>
          <div>npx shadcn-ui@latest add popover</div>
          <div>npx shadcn-ui@latest add button</div>
          <div>npx shadcn-ui@latest add input</div>
          <div>npx shadcn-ui@latest add badge</div>
        </div>
      </div>
    </div>
  );
};

export { AutocompleteInput, MultiSelectAutocomplete, AutocompleteDemo };
