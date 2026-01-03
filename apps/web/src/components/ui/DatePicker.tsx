"use client";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  // Parse the date string as a local date by appending the time component if it's missing
  const date = value
    ? new Date(value.includes("T") ? value : `${value}T00:00:00`)
    : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(day) => {
            if (!day) return;
            // Format the date in local YYYY-MM-DD instead of using toISOString (which is UTC)
            onChange(format(day, "yyyy-MM-dd"));
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
