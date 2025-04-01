"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, BookOpen, Video, FileText, Clock, Heart, ArrowRight, X, Loader2 } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { useApp } from "@/context/app-provider"
import * as api from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

// Define types for our content
interface Article {
  id: string
  title: string
  description: string
  category: string
  date: string
  readTime: string
  image: string
  content?: string
  source?: string
  url?: string
}

interface VideoContent {
  id: string
  title: string
  description: string
  duration: string
  category: string
  date: string
  thumbnail: string
  videoUrl?: string
}

interface Blog {
  id: string
  title: string
  description: string
  author: string
  date: string
  readTime: string
  image: string
  content?: string
}

interface PersonalizedTip {
  id: string
  title: string
  description: string
  category: string
  priority: string
}

export default function HealthTipsPage() {
  const { currentUserId } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<VideoContent | null>(null)
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)
  const [personalizedTips, setPersonalizedTips] = useState<PersonalizedTip[]>([])
  const [showPersonalizedTips, setShowPersonalizedTips] = useState(false)
  const [isLoadingTips, setIsLoadingTips] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Article[]>([])

  // Filter content based on search query
  const filterContent = <T extends { title: string; description: string }>(content: T[]): T[] => {
    if (!searchQuery) return content
    return content.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  // Load personalized tips
  const loadPersonalizedTips = async () => {
    if (!currentUserId) {
      toast({
        title: "Not logged in",
        description: "Please log in to get personalized health tips.",
        variant: "destructive",
      })
      return
    }

    setIsLoadingTips(true)
    try {
      const tips = await api.getPersonalizedTips(currentUserId)
      setPersonalizedTips(tips)
      setShowPersonalizedTips(true)
    } catch (error) {
      console.error("Error loading personalized tips:", error)
      // Show a toast with the error message
      toast({
        title: "Couldn't load personalized tips",
        description: "Using general health recommendations instead.",
        variant: "destructive",
      })

      // Set default tips when API fails
      setPersonalizedTips([
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
      setShowPersonalizedTips(true)
    } finally {
      setIsLoadingTips(false)
    }
  }

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const results = await api.searchHealthTips(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error("Error searching health tips:", error)
    } finally {
      setIsSearching(false)
    }
  }

  // Handle search input
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Handle search on enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const articles: Article[] = [
    {
      id: "1",
      title: "Understanding Blood Pressure Readings",
      description: "Learn how to interpret your blood pressure numbers and what they mean for your health.",
      category: "Heart Health",
      date: "March 15, 2025",
      readTime: "5 min read",
      image:
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      content: `
      <h2>Understanding Blood Pressure Readings</h2>
      
      <p>Blood pressure is a vital sign that measures the force of blood pushing against the walls of your arteries as your heart pumps blood. It's an important indicator of your overall health.</p>
      
      <h3>What Do the Numbers Mean?</h3>
      
      <p>Blood pressure is recorded as two numbers:</p>
      
      <ul>
        <li><strong>Systolic pressure</strong> (the top number): This measures the pressure in your arteries when your heart beats.</li>
        <li><strong>Diastolic pressure</strong> (the bottom number): This measures the pressure in your arteries when your heart rests between beats.</li>
      </ul>
      
      <h3>Blood Pressure Categories</h3>
      
      <p>According to the American Heart Association, blood pressure readings fall into these categories:</p>
      
      <ul>
        <li><strong>Normal:</strong> Less than 120/80 mm Hg</li>
        <li><strong>Elevated:</strong> Systolic between 120-129 and diastolic less than 80</li>
        <li><strong>Hypertension Stage 1:</strong> Systolic between 130-139 or diastolic between 80-89</li>
        <li><strong>Hypertension Stage 2:</strong> Systolic at least 140 or diastolic at least 90</li>
        <li><strong>Hypertensive Crisis:</strong> Systolic over 180 and/or diastolic over 120</li>
      </ul>
      
      <h3>Monitoring Your Blood Pressure</h3>
      
      <p>Regular monitoring is essential, especially if you have high blood pressure or other risk factors for heart disease. Home monitoring can help you:</p>
      
      <ul>
        <li>Track your treatment's effectiveness</li>
        <li>Diagnose worsening high blood pressure</li>
        <li>Detect potential health problems</li>
      </ul>
      
      <p>Remember, a single high reading doesn't necessarily mean you have high blood pressure. Blood pressure naturally fluctuates throughout the day and can be affected by various factors including stress, physical activity, and even the time of day.</p>
      
      <p>Always consult with your healthcare provider to interpret your blood pressure readings and determine the best course of action for your health.</p>
    `,
      source: "American Heart Association",
      url: "https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings",
    },
    {
      id: "2",
      title: "The Importance of Regular Exercise",
      description: "Discover how just 30 minutes of daily exercise can significantly improve your overall health.",
      category: "Fitness",
      date: "March 10, 2025",
      readTime: "7 min read",
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      content: `
      <h2>The Importance of Regular Exercise</h2>
      
      <p>Regular physical activity is one of the most important things you can do for your health. Just 30 minutes of moderate exercise each day can have profound effects on your physical and mental wellbeing.</p>
      
      <h3>Physical Health Benefits</h3>
      
      <ul>
        <li><strong>Weight Management:</strong> Exercise helps prevent excess weight gain and helps maintain weight loss.</li>
        <li><strong>Reduced Health Risks:</strong> Regular activity can lower your risk of heart disease, stroke, type 2 diabetes, and some cancers.</li>
        <li><strong>Stronger Bones and Muscles:</strong> Weight-bearing exercise helps build and maintain bone density, while resistance training builds muscle strength.</li>
        <li><strong>Improved Cardiovascular Health:</strong> Exercise strengthens your heart and improves circulation.</li>
        <li><strong>Better Sleep:</strong> Regular physical activity can help you fall asleep faster and deepen your sleep.</li>
      </ul>
      
      <h3>Mental Health Benefits</h3>
      
      <ul>
        <li><strong>Reduced Stress:</strong> Exercise reduces levels of the body's stress hormones and stimulates production of endorphins.</li>
        <li><strong>Improved Mood:</strong> Physical activity stimulates brain chemicals that leave you feeling happier and more relaxed.</li>
        <li><strong>Increased Energy:</strong> Regular exercise improves muscle strength and boosts endurance.</li>
        <li><strong>Enhanced Cognitive Function:</strong> Exercise has been shown to improve thinking skills and memory.</li>
      </ul>
      
      <h3>Getting Started</h3>
      
      <p>If you're new to exercise, start slowly and gradually increase your activity level. Aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity each week, plus muscle-strengthening activities twice a week.</p>
      
      <p>Remember, any amount of physical activity is better than none. Even small amounts of physical activity are beneficial, and accumulated activity throughout the day adds up to provide health benefits.</p>
    `,
      source: "World Health Organization",
      url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity",
    },
    {
      id: "3",
      title: "Nutrition Basics: Building a Balanced Diet",
      description: "A comprehensive guide to understanding nutrition labels and creating balanced meals.",
      category: "Nutrition",
      date: "March 5, 2025",
      readTime: "8 min read",
      image:
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      content: `
      <h2>Nutrition Basics: Building a Balanced Diet</h2>
      
      <p>A balanced diet provides your body with the nutrients it needs to function correctly. Without balanced nutrition, your body is more prone to disease, infection, fatigue, and poor performance.</p>
      
      <h3>The Key Components of a Balanced Diet</h3>
      
      <ul>
        <li><strong>Proteins:</strong> Essential for building and repairing tissues. Sources include meat, fish, eggs, dairy, beans, and nuts.</li>
        <li><strong>Carbohydrates:</strong> Your body's main source of energy. Choose complex carbs like whole grains, fruits, and vegetables over simple carbs like sugar and white flour.</li>
        <li><strong>Fats:</strong> Necessary for energy, cell growth, and nutrient absorption. Focus on healthy fats from sources like avocados, nuts, seeds, and olive oil.</li>
        <li><strong>Vitamins and Minerals:</strong> Essential for various bodily functions. A diverse diet rich in fruits and vegetables provides most of what you need.</li>
        <li><strong>Water:</strong> Critical for nearly every bodily function. Aim for at least 8 glasses daily.</li>
      </ul>
      
      <h3>Understanding Nutrition Labels</h3>
      
      <p>Nutrition labels provide valuable information to help you make informed food choices:</p>
      
      <ul>
        <li><strong>Serving Size:</strong> All the information on the label is based on this amount.</li>
        <li><strong>Calories:</strong> Represents the energy provided by one serving.</li>
        <li><strong>Nutrients:</strong> Shows the amount of fat, cholesterol, sodium, carbohydrates, fiber, sugars, and protein.</li>
        <li><strong>% Daily Value:</strong> Indicates how much a nutrient in a serving contributes to a daily diet.</li>
      </ul>
      
      <h3>Building Balanced Meals</h3>
      
      <p>A simple way to ensure balanced meals is to use the plate method:</p>
      
      <ul>
        <li>Fill half your plate with fruits and vegetables</li>
        <li>Fill one quarter with lean protein</li>
        <li>Fill one quarter with whole grains or starchy vegetables</li>
        <li>Add a small amount of healthy fat</li>
      </ul>
      
      <p>Remember, balance, variety, and moderation are the keys to a healthy diet. No single food contains all the nutrients your body needs, so eating a wide variety of foods is essential for good health.</p>
    `,
      source: "Harvard Health",
      url: "https://www.health.harvard.edu/staying-healthy/the-right-plant-based-diet-for-you",
    },
    {
      id: "4",
      title: "Managing Diabetes: Daily Tips",
      description: "Practical advice for monitoring blood sugar and maintaining a healthy lifestyle with diabetes.",
      category: "Chronic Conditions",
      date: "February 28, 2025",
      readTime: "6 min read",
      image:
        "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      content: `
      <h2>Managing Diabetes: Daily Tips</h2>
      
      <p>Living with diabetes requires daily attention to your blood sugar levels, diet, exercise, and medication. With proper management, people with diabetes can lead healthy, active lives.</p>
      
      <h3>Monitoring Blood Sugar</h3>
      
      <ul>
        <li>Check your blood glucose levels as recommended by your healthcare provider</li>
        <li>Keep a log of your readings to identify patterns</li>
        <li>Learn how different foods, activities, and stress affect your levels</li>
        <li>Know your target range and when to seek medical attention</li>
      </ul>
      
      <h3>Healthy Eating</h3>
      
      <p>Nutrition plays a crucial role in managing diabetes:</p>
      
      <ul>
        <li>Focus on consistent carbohydrate intake at meals and snacks</li>
        <li>Choose high-fiber, slow-digesting carbohydrates like whole grains, beans, and vegetables</li>
        <li>Include lean proteins and healthy fats in your meals</li>
        <li>Limit added sugars, refined grains, and processed foods</li>
        <li>Practice portion control</li>
      </ul>
      
      <h3>Physical Activity</h3>
      
      <p>Regular exercise helps control blood sugar levels and improves insulin sensitivity:</p>
      
      <ul>
        <li>Aim for at least 150 minutes of moderate-intensity activity per week</li>
        <li>Include both aerobic exercise and strength training</li>
        <li>Check your blood sugar before, during, and after exercise</li>
        <li>Always carry a fast-acting carbohydrate in case of low blood sugar</li>
      </ul>
      
      <h3>Medication Management</h3>
      
      <ul>
        <li>Take medications as prescribed</li>
        <li>Understand how your medications work and their potential side effects</li>
        <li>Know how to adjust medications when sick or during special circumstances</li>
        <li>Keep a current list of all medications with you</li>
      </ul>
      
      <p>Remember, diabetes management is a team effort. Work closely with your healthcare providers, including your doctor, diabetes educator, and dietitian, to develop and adjust your management plan as needed.</p>
    `,
      source: "American Diabetes Association",
      url: "https://www.diabetes.org/healthy-living",
    },
  ]

  const videos: VideoContent[] = [
    {
      id: "1",
      title: "Simple Stretching Exercises for Office Workers",
      description: "Easy stretches you can do at your desk to prevent stiffness and improve circulation.",
      duration: "8:45",
      category: "Fitness",
      date: "March 20, 2025",
      thumbnail: "https://img.youtube.com/vi/t2jel6q1GRk/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/embed/t2jel6q1GRk",
    },
    {
      id: "2",
      title: "Meditation Techniques for Stress Relief",
      description: "Learn simple meditation practices to reduce stress and improve mental wellbeing.",
      duration: "12:30",
      category: "Mental Health",
      date: "March 18, 2025",
      thumbnail: "https://img.youtube.com/vi/H_uc-uQ3Nkc/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/embed/H_uc-uQ3Nkc",
    },
    {
      id: "3",
      title: "Cooking Healthy Meals on a Budget",
      description: "Nutritious and affordable meal ideas that are quick and easy to prepare.",
      duration: "15:20",
      category: "Nutrition",
      date: "March 12, 2025",
      thumbnail: "https://img.youtube.com/vi/5jc1NGlnYQk/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/embed/5jc1NGlnYQk",
    },
    {
      id: "4",
      title: "Understanding Your Medication",
      description: "Important information about common medications and how to take them correctly.",
      duration: "10:15",
      category: "Medication",
      date: "March 5, 2025",
      thumbnail: "https://img.youtube.com/vi/FJAExEGgqM8/maxresdefault.jpg",
      videoUrl: "https://www.youtube.com/embed/FJAExEGgqM8",
    },
  ]

  const blogs: Blog[] = [
    {
      id: "1",
      title: "Sleep Hygiene: Tips for Better Rest",
      description: "Improve your sleep quality with these evidence-based practices for better sleep hygiene.",
      author: "Dr. Sarah Njoroge",
      date: "March 22, 2025",
      readTime: "4 min read",
      image:
        "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2060&q=80",
      content: `
      <h2>Sleep Hygiene: Tips for Better Rest</h2>
      
      <p>Sleep is essential for physical health, mental wellbeing, and overall quality of life. Good sleep hygiene—the habits and practices that are conducive to sleeping well on a regular basis—can help improve the quality and quantity of your sleep.</p>
      
      <h3>Create a Consistent Sleep Schedule</h3>
      
      <p>One of the most important aspects of sleep hygiene is maintaining a regular sleep schedule:</p>
      
      <ul>
        <li>Go to bed and wake up at the same time every day, even on weekends</li>
        <li>Establish a bedtime that allows for 7-9 hours of sleep</li>
        <li>Avoid napping late in the day or for longer than 30 minutes</li>
      </ul>
      
      <h3>Optimize Your Sleep Environment</h3>
      
      <p>Your bedroom should be conducive to sleep:</p>
      
      <ul>
        <li>Keep your bedroom cool (around 65-68°F or 18-20°C)</li>
        <li>Ensure your room is dark and quiet</li>
        <li>Use comfortable bedding and pillows</li>
        <li>Reserve your bed for sleep and intimacy only</li>
      </ul>
      
      <h3>Develop a Relaxing Bedtime Routine</h3>
      
      <p>A consistent pre-sleep routine signals to your body that it's time to wind down:</p>
      
      <ul>
        <li>Begin relaxing activities 30-60 minutes before bedtime</li>
        <li>Consider reading, gentle stretching, or meditation</li>
        <li>Take a warm bath or shower</li>
        <li>Avoid screens (phones, tablets, computers) at least 30 minutes before bed</li>
      </ul>
      
      <h3>Watch What You Consume</h3>
      
      <ul>
        <li>Limit caffeine after noon</li>
        <li>Avoid large meals close to bedtime</li>
        <li>Limit alcohol, which can disrupt sleep quality</li>
        <li>Stay hydrated throughout the day, but reduce fluids close to bedtime</li>
      </ul>
      
      <h3>Manage Stress and Anxiety</h3>
      
      <p>Mental health significantly impacts sleep quality:</p>
      
      <ul>
        <li>Practice relaxation techniques like deep breathing or progressive muscle relaxation</li>
        <li>Keep a worry journal to write down concerns before bed</li>
        <li>Consider mindfulness meditation to calm a racing mind</li>
      </ul>
      
      <p>If you continue to struggle with sleep despite implementing these strategies, consider consulting with a healthcare provider. Sleep disorders are common and treatable, and addressing them can significantly improve your quality of life.</p>
    `,
    },
    {
      id: "2",
      title: "Understanding Preventive Healthcare",
      description: "Why regular check-ups and screenings are essential for maintaining good health.",
      author: "Dr. James Omondi",
      date: "March 19, 2025",
      readTime: "6 min read",
      image:
        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80",
      content: `
      <h2>Understanding Preventive Healthcare</h2>
      
      <p>Preventive healthcare focuses on measures taken to prevent diseases rather than curing them or treating their symptoms. Regular check-ups and screenings can detect potential health issues before they become serious problems.</p>
      
      <h3>The Importance of Regular Check-ups</h3>
      
      <p>Regular medical check-ups provide numerous benefits:</p>
      
      <ul>
        <li>Early detection of health issues when they're most treatable</li>
        <li>Reduced healthcare costs over time by preventing serious illnesses</li>
        <li>Increased lifespan and improved quality of life</li>
        <li>Opportunity to update vaccinations</li>
        <li>Chance to build a relationship with your healthcare provider</li>
      </ul>
      
      <h3>Essential Screenings by Age</h3>
      
      <p><strong>For Adults 18-39:</strong></p>
      <ul>
        <li>Blood pressure check: Every 3-5 years</li>
        <li>Cholesterol screening: Every 4-6 years</li>
        <li>Diabetes screening: If BMI > 25 or other risk factors</li>
        <li>Depression screening: Regularly</li>
        <li>STI screening: Based on risk factors</li>
      </ul>
      
      <p><strong>For Adults 40-64:</strong></p>
      <ul>
        <li>Blood pressure check: Annually</li>
        <li>Cholesterol screening: Every 1-2 years</li>
        <li>Diabetes screening: Every 3 years</li>
        <li>Colorectal cancer screening: Starting at age 45</li>
        <li>Mammogram (women): Every 1-2 years starting at age 40-50</li>
        <li>Prostate cancer screening (men): Discuss with doctor starting at age 50</li>
      </ul>
      
      <p><strong>For Adults 65+:</strong></p>
      <ul>
        <li>All of the above, plus:</li>
        <li>Bone density scan: For women at 65, men at 70</li>
        <li>Abdominal aortic aneurysm screening: Once for men who have ever smoked</li>
        <li>Hearing and vision tests: Regularly</li>
      </ul>
      
      <h3>Lifestyle as Prevention</h3>
      
      <p>Beyond medical screenings, these lifestyle choices significantly impact health:</p>
      
      <ul>
        <li>Regular physical activity</li>
        <li>Balanced nutrition</li>
        <li>Adequate sleep</li>
        <li>Stress management</li>
        <li>Avoiding tobacco and limiting alcohol</li>
      </ul>
      
      <p>Remember, preventive healthcare recommendations may vary based on your personal and family medical history. Work with your healthcare provider to develop a preventive care plan tailored to your specific needs.</p>
    `,
    },
    {
      id: "3",
      title: "Managing Chronic Pain Naturally",
      description: "Non-medication approaches to help manage and reduce chronic pain symptoms.",
      author: "Dr. Lucy Wambui",
      date: "March 15, 2025",
      readTime: "5 min read",
      image:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2060&q=80",
      content: `
      <h2>Managing Chronic Pain Naturally</h2>
      
      <p>Chronic pain—pain that persists for 12 weeks or longer—affects millions of people worldwide. While medications can be helpful, many people find relief through natural approaches that complement traditional medical care.</p>
      
      <h3>Movement Therapies</h3>
      
      <p>Regular physical activity can help reduce pain and improve function:</p>
      
      <ul>
        <li><strong>Gentle exercise:</strong> Walking, swimming, and cycling can improve mobility without straining joints</li>
        <li><strong>Yoga:</strong> Combines stretching, strengthening, and mindfulness to reduce pain and improve flexibility</li>
        <li><strong>Tai Chi:</strong> Slow, flowing movements that improve balance and reduce tension</li>
        <li><strong>Physical therapy:</strong> Targeted exercises designed for your specific condition</li>
      </ul>
      
      <h3>Mind-Body Techniques</h3>
      
      <p>The mind and body are closely connected, and mental techniques can influence physical pain:</p>
      
      <ul>
        <li><strong>Meditation:</strong> Regular practice can reduce pain intensity and improve coping skills</li>
        <li><strong>Deep breathing:</strong> Reduces tension and shifts focus away from pain</li>
        <li><strong>Guided imagery:</strong> Using mental images to promote relaxation and healing</li>
        <li><strong>Biofeedback:</strong> Learning to control bodily functions like muscle tension</li>
      </ul>
      
      <h3>Dietary Approaches</h3>
      
      <p>What you eat can influence inflammation and pain levels:</p>
      
      <ul>
        <li><strong>Anti-inflammatory diet:</strong> Rich in fruits, vegetables, whole grains, and omega-3 fatty acids</li>
        <li><strong>Turmeric:</strong> Contains curcumin, which has anti-inflammatory properties</li>
        <li><strong>Ginger:</strong> May help reduce muscle pain and inflammation</li>
        <li><strong>Avoiding trigger foods:</strong> Some people find relief by eliminating foods that worsen their symptoms</li>
      </ul>
      
      <h3>Complementary Therapies</h3>
      
      <ul>
        <li><strong>Acupuncture:</strong> Thin needles inserted at specific points may help relieve pain</li>
        <li><strong>Massage therapy:</strong> Can reduce muscle tension and improve circulation</li>
        <li><strong>Heat and cold therapy:</strong> Alternating between hot and cold treatments can reduce inflammation and numb pain</li>
        <li><strong>TENS (Transcutaneous Electrical Nerve Stimulation):</strong> Low-voltage electrical currents that can interrupt pain signals</li>
      </ul>
      
      <p>Always consult with your healthcare provider before starting any new approach to pain management, especially if you have existing health conditions or are taking medications. The most effective pain management strategies often combine multiple approaches tailored to your specific needs.</p>
    `,
    },
    {
      id: "4",
      title: "Boosting Your Immune System",
      description: "Natural ways to strengthen your body's defenses against illness.",
      author: "Dr. Peter Kipchoge",
      date: "March 10, 2025",
      readTime: "7 min read",
      image:
        "https://images.unsplash.com/photo-1494390248081-4e521a5940db?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2006&q=80",
      content: `
      <h2>Boosting Your Immune System</h2>
      
      <p>Your immune system is your body's natural defense against illness. While no single food or lifestyle change can guarantee immunity from disease, there are several evidence-based ways to strengthen your body's natural defenses.</p>
      
      <h3>Nutrition for Immunity</h3>
      
      <p>A balanced diet rich in these nutrients supports immune function:</p>
      
      <ul>
        <li><strong>Vitamin C:</strong> Found in citrus fruits, bell peppers, strawberries, and broccoli</li>
        <li><strong>Vitamin E:</strong> Present in nuts, seeds, and spinach</li>
        <li><strong>Zinc:</strong> Available in seafood, meat, legumes, and nuts</li>
        <li><strong>Vitamin D:</strong> Obtained through sunlight exposure and foods like fatty fish and fortified products</li>
        <li><strong>Probiotics:</strong> Found in fermented foods like yogurt, kefir, and sauerkraut</li>
      </ul>
      
      <h3>Lifestyle Factors</h3>
      
      <p>These habits significantly impact immune function:</p>
      
      <ul>
        <li><strong>Regular physical activity:</strong> Moderate exercise improves circulation and reduces inflammation</li>
        <li><strong>Adequate sleep:</strong> Aim for 7-9 hours per night to support immune function</li>
        <li><strong>Stress management:</strong> Chronic stress suppresses immune response</li>
        <li><strong>Hydration:</strong> Proper fluid intake supports all bodily functions, including immunity</li>
        <li><strong>Limited alcohol consumption:</strong> Excessive alcohol weakens immune defenses</li>
      </ul>
      
      <h3>Hygiene Practices</h3>
      
      <p>Preventing exposure to pathogens is a key part of immune health:</p>
      
      <ul>
        <li>Regular handwashing with soap and water</li>
        <li>Proper food handling and preparation</li>
        <li>Staying up-to-date with recommended vaccines</li>
        <li>Avoiding close contact with sick individuals when possible</li>
      </ul>
      
      <h3>Supplements: Helpful or Hype?</h3>
      
      <p>While a balanced diet is the best source of nutrients, some supplements may be beneficial:</p>
      
      <ul>
        <li>Vitamin D supplements for those with limited sun exposure</li>
        <li>Zinc lozenges may reduce the duration of colds</li>
        <li>Elderberry has shown some promise for upper respiratory symptoms</li>
      </ul>
      
      <p>However, supplements should complement, not replace, a healthy lifestyle. Always consult with a healthcare provider before starting any supplement regimen, especially if you have underlying health conditions or take medications.</p>
      
      <p>Remember, boosting your immune system is a long-term commitment to healthy habits rather than a quick fix. Consistency in these practices provides the best support for your body's natural defenses.</p>
    `,
    },
    {
      id: "5",
      title: "Mental Health: Breaking the Stigma",
      description: "Understanding mental health conditions and the importance of seeking help.",
      author: "Dr. Mary Akinyi",
      date: "March 5, 2025",
      readTime: "8 min read",
      image:
        "https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      content: `
      <h2>Mental Health: Breaking the Stigma</h2>
      
      <p>Mental health is an essential component of overall wellbeing, yet stigma and misconceptions often prevent people from seeking help. Understanding mental health conditions and promoting open conversations are crucial steps toward breaking this stigma.</p>
      
      <h3>Understanding Mental Health</h3>
      
      <p>Mental health encompasses our emotional, psychological, and social wellbeing. It affects how we think, feel, act, handle stress, relate to others, and make choices. Mental health conditions are common and treatable:</p>
      
      <ul>
        <li>Nearly 1 in 5 adults experience a mental illness each year</li>
        <li>Mental health conditions are medical conditions, not personal weaknesses</li>
        <li>With proper treatment, many people with mental health conditions lead fulfilling lives</li>
      </ul>
      
      <h3>Common Mental Health Conditions</h3>
      
      <ul>
        <li><strong>Depression:</strong> More than just feeling sad, depression involves persistent feelings of sadness and loss of interest that interfere with daily activities</li>
        <li><strong>Anxiety Disorders:</strong> Include generalized anxiety, panic disorder, and specific phobias, characterized by excessive worry or fear</li>
        <li><strong>Bipolar Disorder:</strong> Causes unusual shifts in mood, energy, activity levels, and concentration</li>
        <li><strong>Post-Traumatic Stress Disorder (PTSD):</strong> Develops after experiencing or witnessing a traumatic event</li>
        <li><strong>Schizophrenia:</strong> A serious mental disorder that affects how a person thinks, feels, and behaves</li>
      </ul>
      
      <h3>Recognizing Warning Signs</h3>
      
      <p>Early intervention can make a significant difference. Watch for:</p>
      
      <ul>
        <li>Excessive worrying or fear</li>
        <li>Feeling excessively sad or low</li>
        <li>Confused thinking or problems concentrating</li>
        <li>Extreme mood changes</li>
        <li>Withdrawal from friends and activities</li>
        <li>Significant tiredness or low energy</li>
        <li>Problems sleeping</li>
        <li>Changes in eating habits</li>
        <li>Substance abuse</li>
        <li>Thoughts of harming yourself or others</li>
      </ul>
      
      <h3>Breaking the Stigma</h3>
      
      <p>We can all help reduce stigma around mental health by:</p>
      
      <ul>
        <li>Speaking openly about mental health</li>
        <li>Educating ourselves and others about mental health conditions</li>
        <li>Being conscious of language (avoiding terms like "crazy" or "psycho")</li>
        <li>Showing compassion for those with mental health challenges</li>
        <li>Treating mental health conditions with the same importance as physical health</li>
      </ul>
      
      <h3>Seeking Help</h3>
      
      <p>If you or someone you know is struggling with mental health:</p>
      
      <ul>
        <li>Talk to a healthcare provider about your concerns</li>
        <li>Connect with a mental health professional (therapist, psychologist, psychiatrist)</li>
        <li>Reach out to support groups</li>
        <li>In crisis situations, contact emergency services or a crisis helpline</li>
      </ul>
      
      <p>Remember, seeking help is a sign of strength, not weakness. Mental health conditions are treatable, and recovery is possible with proper support and care.</p>
    `,
    },
    {
      id: "6",
      title: "Heart-Healthy Habits for Every Age",
      description: "Cardiovascular health tips that are beneficial at any stage of life.",
      author: "Dr. John Muthoni",
      date: "February 28, 2025",
      readTime: "6 min read",
      image:
        "https://images.unsplash.com/photo-1559757175-5700dde675bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
      content: `
      <h2>Heart-Healthy Habits for Every Age</h2>
      
      <p>Cardiovascular disease remains the leading cause of death globally, but many heart conditions are preventable through lifestyle choices. Adopting heart-healthy habits early and maintaining them throughout life can significantly reduce your risk of heart disease.</p>
      
      <h3>In Your 20s and 30s</h3>
      
      <p>Early adulthood is the ideal time to establish healthy habits:</p>
      
      <ul>
        <li>Develop regular exercise habits (aim for 150 minutes of moderate activity weekly)</li>
        <li>Learn to cook nutritious meals at home</li>
        <li>Avoid smoking and limit alcohol consumption</li>
        <li>Manage stress through healthy coping mechanisms</li>
        <li>Get regular sleep (7-9 hours nightly)</li>
        <li>Know your family history of heart disease</li>
      </ul>
      
      <h3>In Your 40s and 50s</h3>
      
      <p>Middle age often brings increased responsibilities and stress:</p>
      
      <ul>
        <li>Schedule regular check-ups to monitor blood pressure, cholesterol, and blood sugar</li>
        <li>Adjust exercise routines to accommodate changing bodies</li>
        <li>Maintain a healthy weight as metabolism slows</li>
        <li>Be vigilant about stress management</li>
        <li>Limit sodium intake to help control blood pressure</li>
        <li>Consider heart-healthy supplements like omega-3s (consult your doctor first)</li>
      </ul>
      
      <h3>In Your 60s and Beyond</h3>
      
      <p>Heart health remains crucial in later years:</p>
      
      <ul>
        <li>Stay physically active with appropriate exercises like walking, swimming, or tai chi</li>
        <li>Maintain social connections to support mental health</li>
        <li>Take medications as prescribed</li>
        <li>Monitor for symptoms like shortness of breath, chest discomfort, or unusual fatigue</li>
        <li>Focus on nutrient-dense foods to maintain energy and heart health</li>
        <li>Stay hydrated, as the sense of thirst diminishes with age</li>
      </ul>
      
      <h3>Heart-Healthy Eating at Any Age</h3>
      
      <p>The Mediterranean diet is widely recognized for cardiovascular benefits:</p>
      
      <ul>
        <li>Abundant fruits, vegetables, and whole grains</li>
        <li>Healthy fats from olive oil, nuts, and avocados</li>
        <li>Fish and seafood at least twice weekly</li>
        <li>Limited red meat consumption</li>
        <li>Moderate dairy intake</li>
        <li>Minimal processed foods and added sugars</li>
      </ul>
      
      <p>Remember, it's never too early or too late to adopt heart-healthy habits. Small, consistent changes can lead to significant benefits for your cardiovascular health and overall wellbeing.</p>
    `,
    },
  ]

  const filteredArticles = filterContent(articles)
  const filteredVideos = filterContent(videos)
  const filteredBlogs = filterContent(blogs)

  // Use search results if available, otherwise use filtered articles
  const displayedArticles = searchResults.length > 0 && searchQuery ? searchResults : filteredArticles

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1">
          <aside className="hidden w-64 border-r bg-[#1a2e22] md:block">
            <Sidebar />
          </aside>
          <main className="flex-1 p-4 md:p-6">
            <div className="flex flex-col gap-4 md:gap-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Health Tips</h1>
                  <p className="text-muted-foreground">Learn more about managing your health</p>
                </div>
                <div className="relative w-full md:w-64 flex">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search health tips..."
                      className="pl-8 pr-16"
                      value={searchQuery}
                      onChange={handleSearchInput}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  <Button
                    className="ml-2"
                    size="sm"
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                  >
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                  </Button>
                </div>
              </div>

              <Card className="bg-gradient-to-r from-health-green-100 to-health-mint-100 dark:from-health-green-900 dark:to-health-mint-900 border-none">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1">
                      <h2 className="text-2xl md:text-3xl font-bold mb-2">Your Health Matters</h2>
                      <p className="text-muted-foreground mb-4">
                        Explore our curated collection of health resources designed to help you live your best life.
                      </p>
                      <Button className="gap-2" asChild>
                        <Link href="/health-recommendations">
                          Get Personalized Recommendations
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                    <div className="w-full md:w-1/3 flex justify-center">
                      <div className="relative w-40 h-40">
                        <Heart className="w-full h-full text-health-green-500" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="articles">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="articles" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Articles</span>
                  </TabsTrigger>
                  <TabsTrigger value="videos" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    <span className="hidden sm:inline">Videos</span>
                  </TabsTrigger>
                  <TabsTrigger value="blogs" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">Blogs</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="articles">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    {displayedArticles.length > 0 ? (
                      displayedArticles.map((article) => (
                        <Card key={article.id} className="overflow-hidden">
                          <div className="aspect-video w-full overflow-hidden">
                            <Image
                              src={article.image || "/placeholder.svg"}
                              alt={article.title}
                              width={300}
                              height={200}
                              className="h-full w-full object-cover transition-transform hover:scale-105"
                            />
                          </div>
                          <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs bg-health-green-100 dark:bg-health-green-900 text-health-green-700 dark:text-health-green-300 px-2 py-0.5 rounded-full">
                                {article.category}
                              </span>
                              <span className="text-xs text-muted-foreground">{article.date}</span>
                            </div>
                            <CardTitle>{article.title}</CardTitle>
                            <CardDescription>{article.description}</CardDescription>
                          </CardHeader>
                          <CardFooter className="flex justify-between">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="mr-1 h-4 w-4" />
                              {article.readTime}
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedArticle(article)}>
                              Read More
                            </Button>
                          </CardFooter>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <p className="text-muted-foreground">No articles found matching your search.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="videos">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    {filteredVideos.length > 0 ? (
                      filteredVideos.map((video) => (
                        <Card key={video.id} className="overflow-hidden">
                          <div className="aspect-video w-full overflow-hidden relative">
                            <Image
                              src={video.thumbnail || "/placeholder.svg"}
                              alt={video.title}
                              width={300}
                              height={200}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="rounded-full bg-black/50 p-3">
                                <Video className="h-6 w-6 text-white" />
                              </div>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {video.duration}
                            </div>
                          </div>
                          <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs bg-health-green-100 dark:bg-health-green-900 text-health-green-700 dark:text-health-green-300 px-2 py-0.5 rounded-full">
                                {video.category}
                              </span>
                              <span className="text-xs text-muted-foreground">{video.date}</span>
                            </div>
                            <CardTitle>{video.title}</CardTitle>
                            <CardDescription>{video.description}</CardDescription>
                          </CardHeader>
                          <CardFooter>
                            <Button className="w-full" onClick={() => setSelectedVideo(video)}>
                              Watch Video
                            </Button>
                          </CardFooter>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <p className="text-muted-foreground">No videos found matching your search.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="blogs">
                  <div className="space-y-4">
                    {filteredBlogs.length > 0 ? (
                      filteredBlogs.map((blog) => (
                        <Card key={blog.id}>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row gap-4">
                              <div className="flex-shrink-0">
                                <Image
                                  src={blog.image || "/placeholder.svg"}
                                  alt={blog.author}
                                  width={100}
                                  height={100}
                                  className="rounded-full h-16 w-16 object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold mb-1">{blog.title}</h3>
                                <p className="text-muted-foreground text-sm mb-2">{blog.description}</p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                  <span className="font-medium">{blog.author}</span>
                                  <span className="text-muted-foreground">{blog.date}</span>
                                  <span className="flex items-center text-muted-foreground">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {blog.readTime}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <Button variant="outline" size="sm" onClick={() => setSelectedBlog(blog)}>
                                  Read Post
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No blog posts found matching your search.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>

      {/* Article Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl">{selectedArticle?.title}</DialogTitle>
              <DialogClose className="rounded-full hover:bg-muted p-2">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </div>
            <DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-health-green-100 dark:bg-health-green-900 text-health-green-700 dark:text-health-green-300 px-2 py-0.5 rounded-full">
                  {selectedArticle?.category}
                </span>
                <span className="text-xs text-muted-foreground">{selectedArticle?.date}</span>
                <span className="flex items-center text-xs text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  {selectedArticle?.readTime}
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="aspect-video w-full overflow-hidden rounded-lg mb-6">
              <Image
                src={selectedArticle?.image || "/placeholder.svg"}
                alt={selectedArticle?.title || "Article image"}
                width={800}
                height={450}
                className="h-full w-full object-cover"
              />
            </div>
            <div
              className="prose prose-green dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedArticle?.content || "" }}
            />
            {selectedArticle?.source && (
              <div className="mt-6 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Source:{" "}
                  {selectedArticle.url ? (
                    <a
                      href={selectedArticle.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-health-green-600 dark:text-health-green-400 hover:underline"
                    >
                      {selectedArticle.source}
                    </a>
                  ) : (
                    selectedArticle.source
                  )}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl">{selectedVideo?.title}</DialogTitle>
              <DialogClose className="rounded-full hover:bg-muted p-2">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </div>
            <DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-health-green-100 dark:bg-health-green-900 text-health-green-700 dark:text-health-green-300 px-2 py-0.5 rounded-full">
                  {selectedVideo?.category}
                </span>
                <span className="text-xs text-muted-foreground">{selectedVideo?.date}</span>
                <span className="flex items-center text-xs text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  {selectedVideo?.duration}
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              {selectedVideo?.videoUrl ? (
                <iframe
                  src={selectedVideo.videoUrl}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <p>Video not available</p>
                </div>
              )}
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">Description</h3>
              <p>{selectedVideo?.description}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Blog Dialog */}
      <Dialog open={!!selectedBlog} onOpenChange={(open) => !open && setSelectedBlog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl">{selectedBlog?.title}</DialogTitle>
              <DialogClose className="rounded-full hover:bg-muted p-2">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </div>
            <DialogDescription>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <Image
                    src={selectedBlog?.image || "/placeholder.svg"}
                    alt={selectedBlog?.author || "Author"}
                    width={40}
                    height={40}
                    className="rounded-full h-10 w-10 object-cover"
                  />
                  <span className="font-medium">{selectedBlog?.author}</span>
                </div>
                <span className="text-xs text-muted-foreground">{selectedBlog?.date}</span>
                <span className="flex items-center text-xs text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  {selectedBlog?.readTime}
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div
              className="prose prose-green dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedBlog?.content || "" }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Personalized Tips Dialog */}
      <Dialog open={showPersonalizedTips} onOpenChange={setShowPersonalizedTips}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl">Your Personalized Health Tips</DialogTitle>
              <DialogClose className="rounded-full hover:bg-muted p-2">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </div>
            <DialogDescription>
              Based on your health profile and data, we've curated these tips just for you.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {personalizedTips.length > 0 ? (
              personalizedTips.map((tip) => (
                <Card
                  key={tip.id}
                  className={`
                ${tip.priority === "high" ? "border-health-green-500" : ""}
                ${tip.priority === "medium" ? "border-yellow-500" : ""}
                ${tip.priority === "low" ? "border-blue-500" : ""}
              `}
                >
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full
                      ${tip.priority === "high" ? "bg-health-green-100 text-health-green-700 dark:bg-health-green-900 dark:text-health-green-300" : ""}
                      ${tip.priority === "medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" : ""}
                      ${tip.priority === "low" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : ""}
                    `}
                      >
                        {tip.category}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full
                      ${tip.priority === "high" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" : ""}
                      ${tip.priority === "medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" : ""}
                      ${tip.priority === "low" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : ""}
                    `}
                      >
                        {tip.priority.charAt(0).toUpperCase() + tip.priority.slice(1)} Priority
                      </span>
                    </div>
                    <CardTitle>{tip.title}</CardTitle>
                    <CardDescription>{tip.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">
                  No personalized tips available. Please complete your health profile for personalized recommendations.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  )
}

