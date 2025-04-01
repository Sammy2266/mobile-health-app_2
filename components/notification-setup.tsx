"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Volume2, VolumeX } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  areNotificationsEnabled,
  initAudioContext,
  playNotificationSound,
  requestNotificationPermission,
} from "@/lib/notification-service"

export function NotificationSetup() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [audioInitialized, setAudioInitialized] = useState(false)
  const { toast } = useToast()

  // Check notification status on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setNotificationsEnabled(areNotificationsEnabled())
    }
  }, [])

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission()
    setNotificationsEnabled(granted)

    if (granted) {
      toast({
        title: "Notifications Enabled",
        description: "You will now receive medication reminders even when the app is closed.",
      })
    } else {
      toast({
        title: "Notification Permission Denied",
        description: "Please enable notifications in your browser settings to receive medication reminders.",
        variant: "destructive",
      })
    }
  }

  const handleInitAudio = async () => {
    const initialized = await initAudioContext()
    setAudioInitialized(initialized)

    if (initialized) {
      toast({
        title: "Audio Initialized",
        description: "You will now hear sounds for medication reminders.",
      })
    } else {
      toast({
        title: "Audio Initialization Failed",
        description: "Your browser may not support audio notifications.",
        variant: "destructive",
      })
    }
  }

  const handleTestSound = () => {
    const played = playNotificationSound()

    if (!played) {
      toast({
        title: "Audio Not Initialized",
        description: "Please initialize audio first by clicking the 'Enable Sound' button.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Enable notifications to receive medication reminders even when the app is closed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Browser Notifications</p>
              <p className="text-sm text-muted-foreground">
                {notificationsEnabled
                  ? "Notifications are enabled"
                  : "Enable notifications to receive medication reminders"}
              </p>
            </div>
          </div>
          <Button
            variant={notificationsEnabled ? "outline" : "default"}
            onClick={handleEnableNotifications}
            disabled={notificationsEnabled}
          >
            {notificationsEnabled ? "Enabled" : "Enable Notifications"}
          </Button>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {audioInitialized ? (
              <Volume2 className="h-5 w-5 text-primary" />
            ) : (
              <VolumeX className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">Sound Alerts</p>
              <p className="text-sm text-muted-foreground">
                {audioInitialized ? "Sound alerts are enabled" : "Enable sound alerts for medication reminders"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={audioInitialized ? "outline" : "default"}
              onClick={handleInitAudio}
              disabled={audioInitialized}
            >
              {audioInitialized ? "Enabled" : "Enable Sound"}
            </Button>
            {audioInitialized && (
              <Button variant="outline" onClick={handleTestSound}>
                Test Sound
              </Button>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Note: For notifications to work properly, you may need to keep the app open in a browser tab.
      </CardFooter>
    </Card>
  )
}

