"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-[#1a2e22] md:block">
          <Sidebar />
        </aside>
        <main className="flex-1 p-4 md:p-6">
          <div className="flex flex-col gap-4 md:gap-8">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>AfiaTrack Privacy Policy</CardTitle>
                <CardDescription>Last updated: March 27, 2025</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">1. Introduction</h2>
                  <p>
                    AfiaTrack ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy
                    explains how we collect, use, disclose, and safeguard your information when you use our mobile
                    health application AfiaTrack (the "App").
                  </p>
                  <p>
                    Please read this Privacy Policy carefully. By accessing or using the App, you acknowledge that you
                    have read, understood, and agree to be bound by all the terms outlined in this Privacy Policy.
                  </p>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">2. Information We Collect</h2>
                  <p>We may collect the following types of information:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      <strong>Personal Information:</strong> Name, email address, phone number, date of birth, gender,
                      and other demographic information.
                    </li>
                    <li>
                      <strong>Health Information:</strong> Medical history, medications, allergies, blood pressure
                      readings, heart rate, weight, sleep patterns, and other health metrics.
                    </li>
                    <li>
                      <strong>Account Information:</strong> Username, password, and security questions.
                    </li>
                    <li>
                      <strong>Device Information:</strong> Device type, operating system, unique device identifiers, and
                      mobile network information.
                    </li>
                    <li>
                      <strong>Usage Information:</strong> How you use the App, including features accessed, time spent,
                      and interactions.
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
                  <p>We may use the information we collect for various purposes, including to:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Provide, maintain, and improve the App and its features.</li>
                    <li>Create and manage your account.</li>
                    <li>Track and analyze your health data to provide insights and recommendations.</li>
                    <li>Send you notifications, reminders, and updates.</li>
                    <li>Respond to your comments, questions, and requests.</li>
                    <li>Develop new features and services.</li>
                    <li>Monitor and analyze usage patterns and trends.</li>
                    <li>Protect the security and integrity of the App.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">4. Sharing Your Information</h2>
                  <p>We may share your information in the following circumstances:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      <strong>With Healthcare Providers:</strong> If you choose to share your health data with
                      healthcare providers through the App.
                    </li>
                    <li>
                      <strong>With Service Providers:</strong> Third-party vendors who provide services on our behalf,
                      such as hosting, data analysis, and customer service.
                    </li>
                    <li>
                      <strong>For Legal Reasons:</strong> To comply with applicable laws, regulations, legal processes,
                      or governmental requests.
                    </li>
                    <li>
                      <strong>With Your Consent:</strong> In other ways described to you at the time of collection or
                      with your consent.
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">5. Data Security</h2>
                  <p>
                    We implement appropriate technical and organizational measures to protect the security of your
                    personal information. However, please be aware that no method of transmission over the internet or
                    electronic storage is 100% secure, and we cannot guarantee absolute security.
                  </p>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">6. Your Choices</h2>
                  <p>You have several choices regarding your information:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      <strong>Account Information:</strong> You can update your account information through the App's
                      settings.
                    </li>
                    <li>
                      <strong>Health Data:</strong> You can view, edit, or delete your health data within the App.
                    </li>
                    <li>
                      <strong>Notifications:</strong> You can manage your notification preferences in the App's
                      settings.
                    </li>
                    <li>
                      <strong>Data Sharing:</strong> You can control what data is shared with healthcare providers or
                      other third parties.
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">7. Children's Privacy</h2>
                  <p>
                    The App is not intended for children under the age of 13. We do not knowingly collect personal
                    information from children under 13. If you are a parent or guardian and believe your child has
                    provided us with personal information, please contact us.
                  </p>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">8. Changes to This Privacy Policy</h2>
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                    the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review
                    this Privacy Policy periodically for any changes.
                  </p>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">9. Contact Us</h2>
                  <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                  <p>Email: sammymuchai44@gmail.com</p>
                  <p>Phone: +254714552335</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

