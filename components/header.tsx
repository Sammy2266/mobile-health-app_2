"use client"

import { useApp } from "@/context/app-provider"
import { ModeToggle } from "./mode-toggle"
import { Bell, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import Image from "next/image"
import { formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { NotificationSetup } from "./notification-setup"
import { translations } from "@/lib/translations"

export function Header() {
  const { currentDate, logout, settings } = useApp()
  const router = useRouter()
  const [showNotificationSetup, setShowNotificationSetup] = useState(false)

  // Get translations based on user's language preference
  const language = settings?.language || "en"
  const t = (key: string) => {
    return translations[language]?.[key] || translations["en"][key] || key
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 sm:max-w-xs">
            <Sidebar />
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="AfiaTrack Logo" width={32} height={32} className="mr-2" />
          <span className="hidden font-bold md:inline-block">{t("appName")}</span>
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="hidden md:block text-sm text-muted-foreground">{formatDate(currentDate)}</div>
          <Button variant="ghost" size="icon" onClick={() => setShowNotificationSetup(true)}>
            <Bell className="h-5 w-5" />
            <span className="sr-only">{t("notifications")}</span>
          </Button>
          <ModeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-4" />
            <span className="sr-only">{t("logout")}</span>
          </Button>
        </div>
      </div>

      <Dialog open={showNotificationSetup} onOpenChange={setShowNotificationSetup}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>{t("notifications")}</DialogTitle>
          <DialogDescription>{t("configureNotifications")}</DialogDescription>
          <NotificationSetup onClose={() => setShowNotificationSetup(false)} />
        </DialogContent>
      </Dialog>
    </header>
  )
}

