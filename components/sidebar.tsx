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
import { translations } from "@/lib/translations"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { isAuthenticated, logout, settings } = useApp()

  // Get translations based on user's language preference
  const language = settings?.language || "en"
  const t = (key: string) => {
    return translations[language]?.[key] || translations["en"][key] || key
  }

  const routes = [
    {
      label: t("dashboard"),
      icon: Home,
      href: "/",
      active: pathname === "/",
    },
    {
      label: t("healthData"),
      icon: Activity,
      href: "/health-data",
      active: pathname === "/health-data",
    },
    {
      label: t("appointments"),
      icon: Calendar,
      href: "/appointments",
      active: pathname === "/appointments",
    },
    {
      label: t("medications"),
      icon: Pill,
      href: "/medications",
      active: pathname === "/medications",
    },
    {
      label: t("documents"),
      icon: FileText,
      href: "/documents",
      active: pathname === "/documents",
    },
    {
      label: t("workouts"),
      icon: Dumbbell,
      href: "/workouts",
      active: pathname === "/workouts",
    },
    {
      label: t("waterIntake"),
      icon: Droplet,
      href: "/water-intake",
      active: pathname === "/water-intake",
    },
    {
      label: t("healthTips"),
      icon: Lightbulb,
      href: "/health-tips",
      active: pathname === "/health-tips",
    },
    {
      label: t("reports"),
      icon: Heart,
      href: "/reports",
      active: pathname === "/reports",
    },
    {
      label: t("profile"),
      icon: User,
      href: "/profile",
      active: pathname === "/profile",
    },
    {
      label: t("settings"),
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
          <h1 className="text-xl font-bold text-primary dark:text-white">{t("appName")}</h1>
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
          {t("logout")}
        </Button>
      </div>
    </div>
  )
}

