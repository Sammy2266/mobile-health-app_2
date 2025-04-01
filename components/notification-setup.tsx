"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Volume2, VolumeX, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  areNotificationsEnabled,
  initNotificationSystem,
  isNotificationSystemInitialized,
  playNotificationSound,
  requestNotificationPermission,
  getActiveRemindersInfo,
} from "@/lib/notification-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function NotificationSetup() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [systemInitialized, setSystemInitialized] = useState(false)
  const [showDebugInfo, setShowDebugInfo] = useState(false)
  const [activeReminders, setActiveReminders] = useState<any[]>([])
  const { toast } = useToast()

  // Check notification status on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkStatus = async () => {
        setNotificationsEnabled(areNotificationsEnabled())
        setSystemInitialized(isNotificationSystemInitialized())

        // Initialize if not already initialized
        if (!isNotificationSystemInitialized()) {
          const initialized = await initNotificationSystem()
          setSystemInitialized(initialized)

          if (initialized) {
            console.log("Notification system initialized on component mount")
          }
        }
      }

      checkStatus()
    }
  }, [])

  // Update debug info when showing
  useEffect(() => {
    if (showDebugInfo) {
      setActiveReminders(getActiveRemindersInfo())
    }
  }, [showDebugInfo])

  const handleEnableNotifications = async () => {
    // First ensure the system is initialized
    if (!systemInitialized) {
      const initialized = await initNotificationSystem()
      setSystemInitialized(initialized)

      if (!initialized) {
        toast({
          title: "Initialization Failed",
          description: "Could not initialize the notification system.",
          variant: "destructive",
        })
        return
      }
    }

    // Then request permission
    const granted = await requestNotificationPermission()
    setNotificationsEnabled(granted)

    if (granted) {
      toast({
        title: "Notifications Enabled",
        description: "You will now receive medication reminders.",
      })
    } else {
      toast({
        title: "Notification Permission Denied",
        description: "Please enable notifications in your browser settings to receive medication reminders.",
        variant: "destructive",
      })
    }
  }

  const handleTestSound = async () => {
    // Ensure system is initialized
    if (!systemInitialized) {
      const initialized = await initNotificationSystem()
      setSystemInitialized(initialized)

      if (!initialized) {
        toast({
          title: "Initialization Failed",
          description: "Could not initialize the notification system.",
          variant: "destructive",
        })
        return
      }
    }

    const played = await playNotificationSound()

    if (!played) {
      toast({
        title: "Sound Test Failed",
        description: "Could not play the notification sound. This may be due to browser restrictions.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Sound Test Successful",
        description: "The notification sound played successfully.",
      })
    }
  }

  const refreshDebugInfo = () => {
    setActiveReminders(getActiveRemindersInfo())
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
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            For notifications to work properly, you need to keep your browser open. Click the notification to focus the
            app.
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Bell className={`h-5 w-5 ${notificationsEnabled ? "text-primary" : "text-muted-foreground"}`} />
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
            {systemInitialized ? (
              <Volume2 className="h-5 w-5 text-primary" />
            ) : (
              <VolumeX className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">Sound Alerts</p>
              <p className="text-sm text-muted-foreground">
                {systemInitialized ? "Sound alerts are enabled" : "Test sound alerts for medication reminders"}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleTestSound}>
            Test Sound
          </Button>
        </div>

        {/* Debug section - toggle with button */}
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => setShowDebugInfo(!showDebugInfo)} className="w-full">
            {showDebugInfo ? "Hide Debug Info" : "Show Debug Info"}
          </Button>

          {showDebugInfo && (
            <div className="mt-4 p-4 border rounded-lg bg-muted/50 space-y-2">
              <div className="flex justify-between">
                <h4 className="font-medium">Debug Information</h4>
                <Button variant="ghost" size="sm" onClick={refreshDebugInfo}>
                  Refresh
                </Button>
              </div>
              <p className="text-sm">System Initialized: {systemInitialized ? "Yes" : "No"}</p>
              <p className="text-sm">Notifications Enabled: {notificationsEnabled ? "Yes" : "No"}</p>
              <p className="text-sm">
                Notification Permission:{" "}
                {typeof window !== "undefined" && "Notification" in window ? Notification.permission : "Not supported"}
              </p>
              <p className="text-sm">Active Reminders: {activeReminders.length}</p>

              {activeReminders.length > 0 && (
                <div className="mt-2">
                  <h5 className="text-sm font-medium">Scheduled Reminders:</h5>
                  <div className="max-h-40 overflow-y-auto mt-1">
                    {activeReminders.map((reminder, index) => (
                      <div key={index} className="text-xs p-1 border-b">
                        <p>Medication ID: {reminder.medicationId}</p>
                        <p>Time: {reminder.time}</p>
                        <p>Next: {reminder.nextExecutionTime}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground flex flex-col items-start">
        <p>Note: Browser notifications may not work on all devices or when the browser is closed.</p>
        <p className="mt-1">For the best experience, keep this tab open in your browser.</p>
      </CardFooter>
    </Card>
  )
}

