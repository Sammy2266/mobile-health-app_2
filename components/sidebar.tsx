"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useApp } from "@/context/app-provider"
import { cn } from "@/lib/utils"
import {
  Activity,
  Calendar,
  FileText,
  Heart,
  Home,
  Pill,
  Settings,
  User,
  Droplet,
  Dumbbell,
  LogOut,
  Lightbulb,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ModeToggle } from "@/components/mode-toggle"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { isAuthenticated, logout } = useApp()

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/",
      active: pathname === "/",
    },
    {
      label: "Health Data",
      icon: Activity,
      href: "/health-data",
      active: pathname === "/health-data",
    },
    {
      label: "Appointments",
      icon: Calendar,
      href: "/appointments",
      active: pathname === "/appointments",
    },
    {
      label: "Medications",
      icon: Pill,
      href: "/medications",
      active: pathname === "/medications",
    },
    {
      label: "Documents",
      icon: FileText,
      href: "/documents",
      active: pathname === "/documents",
    },
    {
      label: "Workouts",
      icon: Dumbbell,
      href: "/workouts",
      active: pathname === "/workouts",
    },
    {
      label: "Water Intake",
      icon: Droplet,
      href: "/water-intake",
      active: pathname === "/water-intake",
    },
    {
      label: "Health Tips",
      icon: Lightbulb,
      href: "/health-tips",
      active: pathname === "/health-tips",
    },
    {
      label: "Reports",
      icon: Heart,
      href: "/reports",
      active: pathname === "/reports",
    },
    {
      label: "Profile",
      icon: User,
      href: "/profile",
      active: pathname === "/profile",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      active: pathname === "/settings",
    },
  ]

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className={cn("flex flex-col h-full bg-background dark:bg-background border-r", className)}>
      <div className="px-4 py-2 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img src="/images/logo.png" alt="Health Tracker" className="h-8 w-8 mr-2" />
          <h1 className="text-xl font-bold text-primary dark:text-white">Health Tracker</h1>
        </Link>
        <ModeToggle />
      </div>

      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center py-2 px-3 text-sm font-medium rounded-md transition-colors",
                route.active
                  ? "bg-primary/20 text-primary dark:bg-white/20 dark:text-white"
                  : "text-foreground hover:bg-muted dark:text-white dark:hover:bg-white/10",
              )}
            >
              <route.icon className="h-5 w-5 mr-3" />
              {route.label}
            </Link>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-auto px-3 py-4 border-t border-border dark:border-white/10">
        <Button
          variant="ghost"
          className="w-full justify-start text-foreground hover:bg-muted dark:text-white dark:hover:bg-white/10"
          onClick={logout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  )
}

