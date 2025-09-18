import * as React from "react";
import { addDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from "date-fns";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarClock } from "lucide-react";

interface DateRangePresetsProps {
  onSelect: (range: DateRange) => void;
}

export function DateRangePresets({ onSelect }: DateRangePresetsProps) {
  const today = new Date();
  
  const presets = [
    {
      name: "Today",
      range: {
        from: startOfDay(today),
        to: endOfDay(today),
      },
    },
    {
      name: "Yesterday",
      range: {
        from: startOfDay(subDays(today, 1)),
        to: endOfDay(subDays(today, 1)),
      },
    },
    {
      name: "Last 7 days",
      range: {
        from: startOfDay(subDays(today, 6)),
        to: endOfDay(today),
      },
    },
    {
      name: "Last 30 days",
      range: {
        from: startOfDay(subDays(today, 29)),
        to: endOfDay(today),
      },
    },
    {
      name: "This week",
      range: {
        from: startOfWeek(today, { weekStartsOn: 1 }),
        to: endOfWeek(today, { weekStartsOn: 1 }),
      },
    },
    {
      name: "Last week",
      range: {
        from: startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 }),
        to: endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 }),
      },
    },
    {
      name: "This month",
      range: {
        from: startOfMonth(today),
        to: endOfMonth(today),
      },
    },
    {
      name: "Last month",
      range: {
        from: startOfMonth(subMonths(today, 1)),
        to: endOfMonth(subMonths(today, 1)),
      },
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <CalendarClock className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {presets.map((preset) => (
          <DropdownMenuItem
            key={preset.name}
            onClick={() => onSelect(preset.range)}
          >
            {preset.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}