"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-[hsl(var(--foreground))]",
        nav: "ml-[-20px] pt-2 absolute space-x-5 items-center p-1 bg-[hsl(var(--card-accent))] rounded-md",
        month_caption: "ml-18 font-semibold text-lg text-white mt-[2px]",
        nav_button: cn(
          buttonVariants({ variant: "default" }),
          "h-10 w-10 m-1 opacity-50 hover:opacity-100"
        ),
        table: "w-full border-collapse space-y-1",
        head_row: "flex w-full",
        head_cell:
          "text-[hsl(var(--foreground))] w-9 h-12 font-normal text-[0.8rem] flex items-center justify-center",
        row: "flex w-full mt-1",
        weekdays: "flex w-full mb-[-10px] mt-[-15px]",
        weekday: "w-9 h-12 font-normal text-[0.8rem] flex items-center justify-center",
        day: cn(
          buttonVariants({ variant: "default" }),
          "bg-[hsl(var(--card-accent))] hover:bg-[hsl(var(--nav-background))]/40 text-[hsl(var(--foreground))] h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        selected:
          "bg-[hsl(var(--nav-background))] text-[hsl(var(--nav-foreground))] hover:bg-[hsl(var(--card-accent))] hover:text-[hsl(var(--card-accent))] focus:bg-[hsl(var(--card-accent))] focus:text-[hsl(var(--card-accent))]",
        day_today: "bg-slate-100 dark:bg-slate-800 text-[hsl(var(--foreground))]",
        day_outside:
          "day-outside text-slate-500 dark:text-gray-400 opacity-50 aria-selected:bg-slate-100/50 dark:aria-selected:bg-slate-800/50 aria-selected:text-slate-500 dark:aria-selected:text-gray-400 aria-selected:opacity-30",
        day_disabled: "text-slate-500 dark:text-gray-400 opacity-50",
        day_range_middle:
          "aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800 aria-selected:text-slate-900 dark:aria-selected:text-white",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === 'left') {
            return <ChevronLeft className="h-4 w-4" />;
          }
          return <ChevronRight className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendário"

export { Calendar }
