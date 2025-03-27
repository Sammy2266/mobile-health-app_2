"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsOfServicePage() {
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
              <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>AfiaTrack Terms of Service</CardTitle>
                <CardDescription>Last updated: March 27, 2025</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
                  <p>
                    By accessing or using the AfiaTrack mobile application (the "App"), you agree to be bound by these
                    Terms of Service. If you do not agree to these Terms, you may not access or use the App.
                  </p>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">2. Description of Service</h2>
                  <p>
                    AfiaTrack is a mobile health application that allows users to track and manage their health
                    information, including but not limited to appointments, medications, health metrics, and medical
                    documents.
                  </p>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">3. Account Registration</h2>
                  <p>
                    To use certain features of the App, you must register for an account. You agree to provide accurate,
                    current, and complete information during the registration process and to update such information to
                    keep it accurate, current, and complete.
                  </p>
                  <p>
                    You are responsible for safeguarding your password and for all activities that occur under your
                    account. You agree to notify us immediately of any unauthorized use of your account.
                  </p>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">4. User Responsibilities</h2>
                  <p>You agree that you will:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Use the App only for lawful purposes and in accordance with these Terms.</li>
                    <li>Not use the App in any way that could damage, disable, overburden, or impair the App.</li>
                    <li>
                      Not attempt to gain unauthorized access to any part of the App or any systems or networks
                      connected to the App.
                    </li>
                    <li>Not use the App to transmit any viruses, worms, or other malicious code.</li>
                    <li>Not use the App to harass, abuse, or harm another person.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">5. Health Information</h2>
                  <p>The App allows you to store and manage your health information. You acknowledge that:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>The App is not a substitute for professional medical advice, diagnosis, or treatment.</li>
                    <li>
                      You should always consult with a qualified healthcare provider before making any health-related
                      decisions.
                    </li>
                    <li>
                      The App is not intended to diagnose, treat, cure, or prevent any disease or health condition.
                    </li>
                    <li>
                      You are solely responsible for the accuracy and completeness of the health information you enter
                      into the App.
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">6. Intellectual Property</h2>
                  <p>
                    The App and its original content, features, and functionality are owned by AfiaTrack and are
                    protected by international copyright, trademark, patent, trade secret, and other intellectual
                    property or proprietary rights laws.
                  </p>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">7. Termination</h2>
                  <p>
                    We may terminate or suspend your account and access to the App immediately, without prior notice or
                    liability, for any reason, including without limitation if you breach these Terms.
                  </p>
                  <p>
                    Upon termination, your right to use the App will immediately cease. If you wish to terminate your
                    account, you may simply discontinue using the App or contact us to request account deletion.
                  </p>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">8. Limitation of Liability</h2>
                  <p>
                    In no event shall AfiaTrack, its directors, employees, partners, agents, suppliers, or affiliates be
                    liable for any indirect, incidental, special, consequential, or punitive damages, including without
                    limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your
                    access to or use of or inability to access or use the App.
                  </p>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">9. Disclaimer</h2>
                  <p>
                    The App is provided on an "AS IS" and "AS AVAILABLE" basis. AfiaTrack expressly disclaims all
                    warranties of any kind, whether express or implied, including but not limited to the implied
                    warranties of merchantability, fitness for a particular purpose, and non-infringement.
                  </p>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">10. Governing Law</h2>
                  <p>
                    These Terms shall be governed and construed in accordance with the laws of Kenya, without regard to
                    its conflict of law provisions.
                  </p>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">11. Changes to Terms</h2>
                  <p>
                    We reserve the right to modify or replace these Terms at any time. We will provide notice of any
                    changes by posting the new Terms on this page and updating the "Last updated" date. You are advised
                    to review these Terms periodically for any changes.
                  </p>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">12. Contact Us</h2>
                  <p>If you have any questions about these Terms, please contact us at:</p>
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

