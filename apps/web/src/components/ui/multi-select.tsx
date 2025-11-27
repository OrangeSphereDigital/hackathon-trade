import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  label,
}: MultiSelectProps) {
  
  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== value));
  };

  // Helper to get label from value
  const getLabel = (value: string) => {
    return options.find((opt) => opt.value === value)?.label || value;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
            className={cn(
            "flex h-auto min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            )}
        >
            <div className="flex flex-wrap gap-1">
                {selected.length > 0 ? (
                    selected.map((value) => (
                    <span
                        key={value}
                        className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    >
                        {getLabel(value)}
                        <button
                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                            handleRemove(value, e as any);
                            }
                        }}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        onPointerDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        onClick={(e) => handleRemove(value, e)}
                        >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
                    </span>
                    ))
                ) : (
                    <span className="text-muted-foreground">{placeholder}</span>
                )}
            </div>
            <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px] p-0" align="start">
        {label && (
            <>
                <DropdownMenuLabel>{label}</DropdownMenuLabel>
                <DropdownMenuSeparator />
            </>
        )}
        <div className="max-h-[300px] overflow-y-auto">
            {options.map((option) => (
            <DropdownMenuCheckboxItem
                key={option.value}
                checked={selected.includes(option.value)}
                onCheckedChange={() => handleSelect(option.value)}
                onSelect={(e) => e.preventDefault()}
            >
                {option.label}
            </DropdownMenuCheckboxItem>
            ))}
             {options.length === 0 && (
                <div className="p-2 text-sm text-muted-foreground text-center">
                    No options available
                </div>
            )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
