"use client"

import type React from "react"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useApp } from "@/context/app-provider"
import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff } from "lucide-react"
import * as api from "@/lib/api-client"

export default function ProfilePage() {
  const { profile, updateProfile, initialized, currentUserId } = useApp()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("personal")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: profile.name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    age: profile.age || "",
    gender: profile.gender || "",
    height: profile.height || "",
    weight: profile.weight || "",
    bloodType: profile.bloodType || "",
    allergies: profile.allergies?.join(", ") || "",
    medications: profile.medications?.join(", ") || "",
    emergencyContactName: profile.emergencyContact?.name || "",
    emergencyContactRelationship: profile.emergencyContact?.relationship || "",
    emergencyContactPhone: profile.emergencyContact?.phone || "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  if (!initialized) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const updatedProfile = {
      ...profile,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      age: formData.age ? Number.parseInt(formData.age) : undefined,
      gender: formData.gender,
      height: formData.height ? Number.parseFloat(formData.height) : undefined,
      weight: formData.weight ? Number.parseFloat(formData.weight) : undefined,
      bloodType: formData.bloodType,
      allergies: formData.allergies ? formData.allergies.split(",").map((item) => item.trim()) : [],
      medications: formData.medications ? formData.medications.split(",").map((item) => item.trim()) : [],
      emergencyContact: {
        name: formData.emergencyContactName,
        relationship: formData.emergencyContactRelationship,
        phone: formData.emergencyContactPhone,
      },
    }

    updateProfile(updatedProfile)

    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    })
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Error",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Password Error",
        description: "New password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsChangingPassword(true)

    try {
      if (!currentUserId) {
        throw new Error("User not authenticated")
      }

      const response = await api.changePassword(currentUserId, passwordData.currentPassword, passwordData.newPassword)

      if (response.success) {
        toast({
          title: "Password Updated",
          description: "Your password has been changed successfully.",
        })

        // Reset password fields
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        toast({
          title: "Password Error",
          description: "Failed to update password. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Password change error:", error)
      toast({
        title: "Password Error",
        description: "Current password is incorrect or an error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const fields = [
      formData.name,
      formData.email,
      formData.phone,
      formData.age,
      formData.gender,
      formData.height,
      formData.weight,
      formData.bloodType,
      formData.allergies,
      formData.emergencyContactName,
      formData.emergencyContactRelationship,
      formData.emergencyContactPhone,
    ]

    const filledFields = fields.filter((field) => field && String(field).trim() !== "").length
    return Math.round((filledFields / fields.length) * 100)
  }

  const profileCompletion = calculateProfileCompletion()

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1">
          <aside className="hidden w-64 border-r bg-muted/40 md:block">
            <Sidebar />
          </aside>
          <main className="flex-1 p-4 md:p-6">
            <div className="flex flex-col gap-4 md:gap-8">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground">Manage your personal information and preferences</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="text-sm font-medium">Profile completion: {profileCompletion}%</div>
                  <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-health-green-500" style={{ width: `${profileCompletion}%` }}></div>
                  </div>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="personal">Personal Information</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="personal">
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card className="md:col-span-2">
                        <CardHeader>
                          <CardTitle>Personal Information</CardTitle>
                          <CardDescription>Update your personal details</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                          <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="age">Age</Label>
                            <Input id="age" name="age" type="number" value={formData.age} onChange={handleChange} />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="gender">Gender</Label>
                            <Select
                              value={formData.gender}
                              onValueChange={(value) => handleSelectChange("gender", value)}
                            >
                              <SelectTrigger id="gender">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Health Information</CardTitle>
                          <CardDescription>Your health details for better tracking</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                          <div className="grid gap-2">
                            <Label htmlFor="height">Height (cm)</Label>
                            <Input
                              id="height"
                              name="height"
                              type="number"
                              value={formData.height}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="weight">Weight (kg)</Label>
                            <Input
                              id="weight"
                              name="weight"
                              type="number"
                              value={formData.weight}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="bloodType">Blood Type</Label>
                            <Select
                              value={formData.bloodType}
                              onValueChange={(value) => handleSelectChange("bloodType", value)}
                            >
                              <SelectTrigger id="bloodType">
                                <SelectValue placeholder="Select blood type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A-">A-</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B-">B-</SelectItem>
                                <SelectItem value="AB+">AB+</SelectItem>
                                <SelectItem value="AB-">AB-</SelectItem>
                                <SelectItem value="O+">O+</SelectItem>
                                <SelectItem value="O-">O-</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="allergies">Allergies</Label>
                            <Textarea
                              id="allergies"
                              name="allergies"
                              placeholder="Separate with commas"
                              value={formData.allergies}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="medications">Current Medications</Label>
                            <Textarea
                              id="medications"
                              name="medications"
                              placeholder="Separate with commas"
                              value={formData.medications}
                              onChange={handleChange}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Emergency Contact</CardTitle>
                          <CardDescription>Person to contact in case of emergency</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                          <div className="grid gap-2">
                            <Label htmlFor="emergencyContactName">Contact Name</Label>
                            <Input
                              id="emergencyContactName"
                              name="emergencyContactName"
                              value={formData.emergencyContactName}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                            <Input
                              id="emergencyContactRelationship"
                              name="emergencyContactRelationship"
                              value={formData.emergencyContactRelationship}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="emergencyContactPhone">Phone Number</Label>
                            <Input
                              id="emergencyContactPhone"
                              name="emergencyContactPhone"
                              value={formData.emergencyContactPhone}
                              onChange={handleChange}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="md:col-span-2">
                        <CardFooter className="flex justify-between pt-6">
                          <Button variant="outline" type="button">
                            Cancel
                          </Button>
                          <Button type="submit">Save Changes</Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="security">
                  <form onSubmit={handlePasswordSubmit}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your account password</CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-6">
                        <div className="grid gap-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              name="currentPassword"
                              type={showCurrentPassword ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={handlePasswordChange}
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              <span className="sr-only">{showCurrentPassword ? "Hide password" : "Show password"}</span>
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              name="newPassword"
                              type={showNewPassword ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              required
                              minLength={8}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              <span className="sr-only">{showNewPassword ? "Hide password" : "Show password"}</span>
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button type="submit" disabled={isChangingPassword}>
                          {isChangingPassword ? "Updating..." : "Change Password"}
                        </Button>
                      </CardFooter>
                    </Card>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

