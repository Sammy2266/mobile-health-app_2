"use client"

import type * as React from "react"
import { Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TimePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
  showIcon?: boolean
}

export function TimePicker({ className, showIcon = true, ...props }: TimePickerProps) {
  return (
    <div className="relative">
      {showIcon && <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />}
      <Input
        type="time"
        className={cn("pl-10 bg-[#1a2e22] border-health-green-700 text-white", className)}
        {...props}
      />
    </div>
  )
}

