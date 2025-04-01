import { type NextRequest, NextResponse } from "next/server"

// Mock health tips data
const healthTips = [
  {
    id: "1",
    title: "Understanding Blood Pressure Readings",
    description: "Learn how to interpret your blood pressure numbers and what they mean for your health.",
    category: "Heart Health",
    date: "March 15, 2025",
    source: "Mayo Clinic",
    url: "https://www.mayoclinic.org/diseases-conditions/high-blood-pressure/in-depth/blood-pressure/art-20050982",
  },
  {
    id: "2",
    title: "The Importance of Regular Exercise",
    description: "Discover how just 30 minutes of daily exercise can significantly improve your overall health.",
    category: "Fitness",
    date: "March 10, 2025",
    source: "World Health Organization",
    url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity",
  },
  {
    id: "3",
    title: "Nutrition Basics: Building a Balanced Diet",
    description: "A comprehensive guide to understanding nutrition labels and creating balanced meals.",
    category: "Nutrition",
    date: "March 5, 2025",
    source: "Harvard Health",
    url: "https://www.health.harvard.edu/staying-healthy/the-right-plant-based-diet-for-you",
  },
  {
    id: "4",
    title: "Managing Diabetes: Daily Tips",
    description: "Practical advice for monitoring blood sugar and maintaining a healthy lifestyle with diabetes.",
    category: "Chronic Conditions",
    date: "February 28, 2025",
    source: "American Diabetes Association",
    url: "https://www.diabetes.org/healthy-living",
  },
  {
    id: "5",
    title: "Sleep Hygiene: Tips for Better Rest",
    description: "Improve your sleep quality with these evidence-based practices for better sleep hygiene.",
    category: "Sleep",
    date: "March 22, 2025",
    source: "Sleep Foundation",
    url: "https://www.sleepfoundation.org/sleep-hygiene",
  },
  {
    id: "6",
    title: "Understanding Preventive Healthcare",
    description: "Why regular check-ups and screenings are essential for maintaining good health.",
    category: "Preventive Care",
    date: "March 19, 2025",
    source: "CDC",
    url: "https://www.cdc.gov/prevention/index.html",
  },
  {
    id: "7",
    title: "Managing Chronic Pain Naturally",
    description: "Non-medication approaches to help manage and reduce chronic pain symptoms.",
    category: "Pain Management",
    date: "March 15, 2025",
    source: "National Center for Complementary and Integrative Health",
    url: "https://www.nccih.nih.gov/health/chronic-pain-in-depth",
  },
  {
    id: "8",
    title: "Boosting Your Immune System",
    description: "Natural ways to strengthen your body's defenses against illness.",
    category: "Immunity",
    date: "March 10, 2025",
    source: "Harvard Health",
    url: "https://www.health.harvard.edu/staying-healthy/how-to-boost-your-immune-system",
  },
  {
    id: "9",
    title: "Mental Health: Breaking the Stigma",
    description: "Understanding mental health conditions and the importance of seeking help.",
    category: "Mental Health",
    date: "March 5, 2025",
    source: "National Alliance on Mental Illness",
    url: "https://www.nami.org/About-Mental-Illness",
  },
  {
    id: "10",
    title: "Heart-Healthy Habits for Every Age",
    description: "Cardiovascular health tips that are beneficial at any stage of life.",
    category: "Heart Health",
    date: "February 28, 2025",
    source: "American Heart Association",
    url: "https://www.heart.org/en/healthy-living",
  },
]

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q") || ""

    // Filter health tips based on search query
    let results = healthTips

    if (query) {
      const lowerQuery = query.toLowerCase()
      results = healthTips.filter(
        (tip) =>
          tip.title.toLowerCase().includes(lowerQuery) ||
          tip.description.toLowerCase().includes(lowerQuery) ||
          tip.category.toLowerCase().includes(lowerQuery),
      )
    }

    // Simulate external API call for more comprehensive results
    // In a real app, this would call external health information APIs
    const externalResults = query
      ? [
          {
            id: "ext1",
            title: `${query} - Latest Research`,
            description: `Recent findings about ${query} and its impact on health.`,
            category: "Research",
            date: new Date().toISOString().split("T")[0],
            source: "PubMed",
            url: "https://pubmed.ncbi.nlm.nih.gov/",
          },
          {
            id: "ext2",
            title: `${query} Health Guidelines`,
            description: `Official health guidelines related to ${query}.`,
            category: "Guidelines",
            date: new Date().toISOString().split("T")[0],
            source: "WebMD",
            url: "https://www.webmd.com/",
          },
        ]
      : []

    // Combine internal and external results
    const combinedResults = [...results, ...externalResults]

    return NextResponse.json(combinedResults)
  } catch (error) {
    console.error("Health tips search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

