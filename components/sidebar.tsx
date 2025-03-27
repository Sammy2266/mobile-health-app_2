"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import Link from "next/link"
// Import the BookOpen icon
import { BarChart3, Calendar, Clock, FileText, Heart, Home, Settings, User, HelpCircle, BookOpen } from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12 bg-[#1a2e22] text-white h-full", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4">
          <Button
            asChild
            variant={pathname === "/" ? "secondary" : "ghost"}
            size="sm"
            className="w-full justify-start text-white hover:text-white hover:bg-[#2a3e32]"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button
            asChild
            variant={pathname === "/appointments" ? "default" : "ghost"}
            size="sm"
            className={cn(
              "w-full justify-start mt-2 text-white hover:text-white hover:bg-[#2a3e32]",
              pathname === "/appointments" && "bg-health-green-500 hover:bg-health-green-600",
            )}
          >
            <Link href="/appointments">
              <Calendar className="mr-2 h-4 w-4" />
              Appointments
            </Link>
          </Button>
          <Button
            asChild
            variant={pathname === "/health-data" ? "default" : "ghost"}
            size="sm"
            className={cn(
              "w-full justify-start mt-2 text-white hover:text-white hover:bg-[#2a3e32]",
              pathname === "/health-data" && "bg-health-green-500 hover:bg-health-green-600",
            )}
          >
            <Link href="/health-data">
              <Heart className="mr-2 h-4 w-4" />
              Health Data
            </Link>
          </Button>
          <Button
            asChild
            variant={pathname === "/reports" ? "default" : "ghost"}
            size="sm"
            className={cn(
              "w-full justify-start mt-2 text-white hover:text-white hover:bg-[#2a3e32]",
              pathname === "/reports" && "bg-health-green-500 hover:bg-health-green-600",
            )}
          >
            <Link href="/reports">
              <BarChart3 className="mr-2 h-4 w-4" />
              Reports
            </Link>
          </Button>
          {/* Add the Health Tips button after the Reports button */}
          <Button
            asChild
            variant={pathname === "/health-tips" ? "default" : "ghost"}
            size="sm"
            className={cn(
              "w-full justify-start mt-2 text-white hover:text-white hover:bg-[#2a3e32]",
              pathname === "/health-tips" && "bg-health-green-500 hover:bg-health-green-600",
            )}
          >
            <Link href="/health-tips">
              <BookOpen className="mr-2 h-4 w-4" />
              Health Tips
            </Link>
          </Button>
          <Button
            asChild
            variant={pathname === "/medications" ? "default" : "ghost"}
            size="sm"
            className={cn(
              "w-full justify-start mt-2 text-white hover:text-white hover:bg-[#2a3e32]",
              pathname === "/medications" && "bg-health-green-500 hover:bg-health-green-600",
            )}
          >
            <Link href="/medications">
              <Clock className="mr-2 h-4 w-4" />
              Medications
            </Link>
          </Button>
          <Button
            asChild
            variant={pathname === "/documents" ? "default" : "ghost"}
            size="sm"
            className={cn(
              "w-full justify-start mt-2 text-white hover:text-white hover:bg-[#2a3e32]",
              pathname === "/documents" && "bg-health-green-500 hover:bg-health-green-600",
            )}
          >
            <Link href="/documents">
              <FileText className="mr-2 h-4 w-4" />
              Documents
            </Link>
          </Button>
        </div>
        <div className="px-4 pt-4">
          <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-gray-400">ACCOUNT</h2>
          <Button
            asChild
            variant={pathname === "/profile" ? "default" : "ghost"}
            size="sm"
            className={cn(
              "w-full justify-start text-white hover:text-white hover:bg-[#2a3e32]",
              pathname === "/profile" && "bg-health-green-500 hover:bg-health-green-600",
            )}
          >
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </Button>
          <Button
            asChild
            variant={pathname === "/settings" ? "default" : "ghost"}
            size="sm"
            className={cn(
              "w-full justify-start mt-2 text-white hover:text-white hover:bg-[#2a3e32]",
              pathname === "/settings" && "bg-health-green-500 hover:bg-health-green-600",
            )}
          >
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
          <Button
            asChild
            variant={pathname === "/faq" ? "default" : "ghost"}
            size="sm"
            className={cn(
              "w-full justify-start mt-2 text-white hover:text-white hover:bg-[#2a3e32]",
              pathname === "/faq" && "bg-health-green-500 hover:bg-health-green-600",
            )}
          >
            <Link href="/faq">
              <HelpCircle className="mr-2 h-4 w-4" />
              Help & FAQ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

