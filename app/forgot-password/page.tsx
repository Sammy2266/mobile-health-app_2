"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { forgotPassword } from "@/lib/api-client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [method, setMethod] = useState<"email" | "phone">("email")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (method === "email") {
        if (!email) {
          toast({
            title: "Error",
            description: "Please enter your email address",
            variant: "destructive",
          })
          setLoading(false)
          return
        }
      } else {
        if (!phone) {
          toast({
            title: "Error",
            description: "Please enter your phone number",
            variant: "destructive",
          })
          setLoading(false)
          return
        }
      }

      const response = await forgotPassword(method, email, phone)

      // In a real app, the code would be sent via email or SMS
      // For demo purposes, we'll show it in a toast
      toast({
        title: "Verification Code Sent",
        description: `Your verification code is: ${response.code}`,
      })

      // Redirect to reset password page
      router.push(`/reset-password?userId=${response.userId}&method=${method}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-health-green-50 to-health-mint-50 dark:from-health-green-900 dark:to-health-mint-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <Image src="/images/logo.png" alt="AfiaTrack Logo" width={64} height={64} />
          </div>
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>Enter your email or phone number to reset your password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                variant={method === "email" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setMethod("email")}
              >
                Email
              </Button>
              <Button
                type="button"
                variant={method === "phone" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setMethod("phone")}
              >
                Phone
              </Button>
            </div>

            {method === "email" ? (
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Code"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" asChild>
            <Link href="/login" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

