import { type NextRequest, NextResponse } from "next/server"
import { getProfileById, getHealthDataForUser, getMedicationsForUser } from "@/lib/db-service"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get user profile, health data, and medications
    const profile = await getProfileById(userId)

    // If profile doesn't exist, return default tips instead of an error
    if (!profile) {
      return NextResponse.json([
        {
          id: "default1",
          title: "Stay Hydrated",
          description: "Drink at least 8 glasses of water daily for optimal health.",
          category: "General Health",
          priority: "medium",
        },
        {
          id: "default2",
          title: "Regular Exercise",
          description: "Aim for at least 30 minutes of moderate activity most days of the week.",
          category: "Fitness",
          priority: "high",
        },
        {
          id: "default3",
          title: "Balanced Diet",
          description: "Include a variety of fruits, vegetables, whole grains, and lean proteins in your meals.",
          category: "Nutrition",
          priority: "high",
        },
        {
          id: "default4",
          title: "Adequate Sleep",
          description: "Most adults need 7-9 hours of quality sleep each night for good health.",
          category: "Sleep",
          priority: "medium",
        },
        {
          id: "default5",
          title: "Stress Management",
          description: "Practice relaxation techniques like deep breathing, meditation, or yoga.",
          category: "Mental Health",
          priority: "medium",
        },
      ])
    }

    // Get health data and medications
    const healthData = await getHealthDataForUser(userId)
    const medications = await getMedicationsForUser(userId)

    // Generate personalized tips based on user data
    const personalizedTips = []

    // Age-based tips
    if (profile.age) {
      if (profile.age < 30) {
        personalizedTips.push({
          id: "age1",
          title: "Building Healthy Habits in Your 20s",
          description: "Establishing good health habits now can set you up for a lifetime of wellbeing.",
          category: "Age-Specific",
          priority: "high",
        })
      } else if (profile.age < 50) {
        personalizedTips.push({
          id: "age2",
          title: "Health Screenings in Your 30s and 40s",
          description: "Key health screenings you should consider at this stage of life.",
          category: "Age-Specific",
          priority: "high",
        })
      } else {
        personalizedTips.push({
          id: "age3",
          title: "Staying Active as You Age",
          description: "How to maintain mobility and strength in your 50s and beyond.",
          category: "Age-Specific",
          priority: "high",
        })
      }
    }

    // Blood pressure tips
    if (healthData.bloodPressure && healthData.bloodPressure.length > 0) {
      const latestBP = healthData.bloodPressure[healthData.bloodPressure.length - 1]
      if (latestBP.systolic > 130 || latestBP.diastolic > 80) {
        personalizedTips.push({
          id: "bp1",
          title: "Managing Your Blood Pressure",
          description: "Lifestyle changes and strategies to help lower your blood pressure naturally.",
          category: "Heart Health",
          priority: "high",
        })
      }
    }

    // Weight tips
    if (profile.height && profile.weight) {
      const heightInMeters = profile.height / 100
      const bmi = profile.weight / (heightInMeters * heightInMeters)

      if (bmi > 25) {
        personalizedTips.push({
          id: "weight1",
          title: "Healthy Weight Management Strategies",
          description: "Sustainable approaches to reaching and maintaining a healthy weight.",
          category: "Weight Management",
          priority: "medium",
        })
      }
    }

    // Medication tips
    if (medications.length > 0) {
      personalizedTips.push({
        id: "med1",
        title: "Medication Adherence Tips",
        description: "Strategies to help you remember to take your medications as prescribed.",
        category: "Medication Management",
        priority: "high",
      })
    }

    // General health tips
    personalizedTips.push({
      id: "gen1",
      title: "Staying Hydrated",
      description: "The importance of proper hydration for overall health and wellbeing.",
      category: "General Health",
      priority: "medium",
    })

    personalizedTips.push({
      id: "gen2",
      title: "Stress Management Techniques",
      description: "Simple practices to reduce stress and improve mental wellbeing.",
      category: "Mental Health",
      priority: "medium",
    })

    // Sort tips by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    personalizedTips.sort(
      (a, b) =>
        priorityOrder[a.priority as keyof typeof priorityOrder] -
        priorityOrder[b.priority as keyof typeof priorityOrder],
    )

    return NextResponse.json(personalizedTips)
  } catch (error) {
    console.error("Personalized health tips error:", error)
    // Return default tips instead of an error
    return NextResponse.json([
      {
        id: "default1",
        title: "Stay Hydrated",
        description: "Drink at least 8 glasses of water daily for optimal health.",
        category: "General Health",
        priority: "medium",
      },
      {
        id: "default2",
        title: "Regular Exercise",
        description: "Aim for at least 30 minutes of moderate activity most days of the week.",
        category: "Fitness",
        priority: "high",
      },
      {
        id: "default3",
        title: "Balanced Diet",
        description: "Include a variety of fruits, vegetables, whole grains, and lean proteins in your meals.",
        category: "Nutrition",
        priority: "high",
      },
    ])
  }
}

