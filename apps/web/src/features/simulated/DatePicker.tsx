"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value: string | undefined
  onChange: (value: string) => void
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  const date = value ? new Date(value) : undefined

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? date.toLocaleDateString() : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(day) => {
            if (!day) return
            const iso = day.toISOString().slice(0, 10)
            onChange(iso)
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
