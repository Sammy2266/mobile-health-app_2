"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface CalendarProps {
  month?: number
  year?: number
  value?: Date
  onChange?: (date: Date) => void
  className?: string
  disabled?: (date: Date) => boolean
}

function Calendar({ month: initialMonth, year: initialYear, value, onChange, className, disabled }: CalendarProps) {
  const today = React.useMemo(() => new Date(), [])
  const [month, setMonth] = React.useState(initialMonth !== undefined ? initialMonth : today.getMonth())
  const [year, setYear] = React.useState(initialYear !== undefined ? initialYear : today.getFullYear())

  // Update month/year if props change
  React.useEffect(() => {
    if (initialMonth !== undefined) setMonth(initialMonth)
    if (initialYear !== undefined) setYear(initialYear)
  }, [initialMonth, initialYear])

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  // Get days from previous month to fill the first row
  const getPreviousMonthDays = (year: number, month: number) => {
    const firstDay = getFirstDayOfMonth(year, month)
    const daysInPreviousMonth = getDaysInMonth(year, month - 1)

    const days = []
    for (let i = 0; i < firstDay; i++) {
      days.unshift(daysInPreviousMonth - i)
    }
    return days
  }

  // Get days for current month
  const getCurrentMonthDays = (year: number, month: number) => {
    const daysInMonth = getDaysInMonth(year, month)
    return Array.from({ length: daysInMonth }, (_, i) => i + 1)
  }

  // Get days from next month to fill the last row
  const getNextMonthDays = (year: number, month: number) => {
    const firstDay = getFirstDayOfMonth(year, month)
    const daysInMonth = getDaysInMonth(year, month)
    const totalCells = 42 // 6 rows x 7 days
    const remainingCells = totalCells - (firstDay + daysInMonth)

    return Array.from({ length: remainingCells }, (_, i) => i + 1)
  }

  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  // Navigate to next month
  const goToNextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  // Check if a date is selected
  const isSelected = (day: number, isCurrentMonth: boolean) => {
    if (!value || !isCurrentMonth) return false
    return value.getDate() === day && value.getMonth() === month && value.getFullYear() === year
  }

  // Check if a date is today
  const isToday = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return false
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
  }

  // Handle date selection
  const handleDateClick = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth || !onChange) return

    const newDate = new Date(year, month, day)
    if (disabled && disabled(newDate)) return

    onChange(newDate)
  }

  // Get month name
  const getMonthName = (month: number) => {
    return new Date(2000, month, 1).toLocaleString("default", { month: "long" })
  }

  // Prepare calendar data
  const previousMonthDays = getPreviousMonthDays(year, month)
  const currentMonthDays = getCurrentMonthDays(year, month)
  const nextMonthDays = getNextMonthDays(year, month)

  // Create calendar grid
  const calendarDays = [
    ...previousMonthDays.map((day) => ({ day, isCurrentMonth: false, isPreviousMonth: true })),
    ...currentMonthDays.map((day) => ({ day, isCurrentMonth: true })),
    ...nextMonthDays.map((day) => ({ day, isCurrentMonth: false, isNextMonth: true })),
  ]

  // Split into weeks
  const weeks = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }

  return (
    <div className={cn("bg-[#1a2e22] rounded-lg p-4 w-full max-w-md mx-auto", className)}>
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPreviousMonth}
          className="text-white hover:bg-health-green-800"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold text-white">
          {getMonthName(month)} {year}
        </h2>
        <Button variant="ghost" size="icon" onClick={goToNextMonth} className="text-white hover:bg-health-green-800">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day names */}
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day, index) => (
          <div key={index} className="text-center text-sm font-medium text-health-green-300 py-2">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map(({ day, isCurrentMonth, isPreviousMonth, isNextMonth }, dayIndex) => (
              <button
                key={`${weekIndex}-${dayIndex}`}
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  isCurrentMonth ? "text-white" : "text-gray-500 opacity-40",
                  isSelected(day, isCurrentMonth) && "bg-health-green-500 text-white",
                  isToday(day, isCurrentMonth) && !isSelected(day, isCurrentMonth) && "border border-health-green-400",
                  !isSelected(day, isCurrentMonth) && "hover:bg-health-green-700",
                )}
                disabled={disabled ? disabled(new Date(year, month, day)) : false}
                onClick={() => handleDateClick(day, isCurrentMonth)}
              >
                {day}
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export { Calendar }

