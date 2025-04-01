"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useApp } from "@/context/app-provider"
import { ProtectedRoute } from "@/components/protected-route"
import {
  Activity,
  Heart,
  Dumbbell,
  MonitorIcon as Running,
  SpaceIcon as Yoga,
  Clock,
  CheckCircle2,
  Calendar,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

// Define workout types
type WorkoutType = "cardio" | "strength" | "flexibility" | "recovery"

// Define workout interface
interface Workout {
  id: string
  title: string
  type: WorkoutType
  duration: number // in minutes
  intensity: "low" | "moderate" | "high"
  description: string
  exercises: {
    name: string
    sets?: number
    reps?: number
    duration?: number // in seconds
    completed: boolean
  }[]
  completed: boolean
  recommended: boolean
}

export default function WorkoutsPage() {
  const { healthData, profile, initialized } = useApp()
  const { toast } = useToast()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [completedWorkouts, setCompletedWorkouts] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<string>("recommended")

  useEffect(() => {
    // Generate personalized workouts based on health data
    if (initialized && healthData) {
      const generatedWorkouts = generateWorkouts(healthData, profile)
      setWorkouts(generatedWorkouts)

      // Count completed workouts
      const completed = generatedWorkouts.filter((w) => w.completed).length
      setCompletedWorkouts(completed)
    }
  }, [initialized, healthData, profile])

  if (!initialized) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const handleExerciseToggle = (workoutId: string, exerciseIndex: number) => {
    setWorkouts((prevWorkouts) => {
      return prevWorkouts.map((workout) => {
        if (workout.id === workoutId) {
          const updatedExercises = [...workout.exercises]
          updatedExercises[exerciseIndex] = {
            ...updatedExercises[exerciseIndex],
            completed: !updatedExercises[exerciseIndex].completed,
          }

          // Check if all exercises are completed
          const allCompleted = updatedExercises.every((ex) => ex.completed)

          return {
            ...workout,
            exercises: updatedExercises,
            completed: allCompleted,
          }
        }
        return workout
      })
    })
  }

  const handleCompleteWorkout = (workoutId: string) => {
    setWorkouts((prevWorkouts) => {
      return prevWorkouts.map((workout) => {
        if (workout.id === workoutId) {
          // Check if all exercises are completed
          const allExercisesCompleted = workout.exercises.every((ex) => ex.completed)

          if (!allExercisesCompleted) {
            // If not all exercises are completed, mark them all as completed
            const updatedExercises = workout.exercises.map((ex) => ({
              ...ex,
              completed: true,
            }))

            toast({
              title: "Workout Completed",
              description: "All exercises have been marked as completed.",
            })

            // Update completed workouts count if this is newly completed
            if (!workout.completed) {
              setCompletedWorkouts((prev) => prev + 1)
            }

            return {
              ...workout,
              exercises: updatedExercises,
              completed: true,
            }
          } else if (!workout.completed) {
            // If all exercises are already completed but workout isn't marked as completed
            toast({
              title: "Workout Completed",
              description: "Great job! Your workout has been marked as completed.",
            })

            setCompletedWorkouts((prev) => prev + 1)

            return {
              ...workout,
              completed: true,
            }
          }
        }
        return workout
      })
    })
  }

  const recommendedWorkouts = workouts.filter((w) => w.recommended)
  const cardioWorkouts = workouts.filter((w) => w.type === "cardio")
  const strengthWorkouts = workouts.filter((w) => w.type === "strength")
  const flexibilityWorkouts = workouts.filter((w) => w.type === "flexibility")

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
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Personalized Workouts</h1>
                <p className="text-muted-foreground">Workouts tailored to your health profile and fitness goals</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recommended Workouts</CardTitle>
                    <Activity className="h-4 w-4 text-health-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{recommendedWorkouts.length}</div>
                    <p className="text-xs text-muted-foreground">Personalized based on your health data</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed Workouts</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-health-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{completedWorkouts}</div>
                    <Progress value={(completedWorkouts / workouts.length) * 100} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Workout Types</CardTitle>
                    <Dumbbell className="h-4 w-4 text-health-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      >
                        Cardio
                      </Badge>
                      <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                        Strength
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      >
                        Flexibility
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                      >
                        Recovery
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
                    <Calendar className="h-4 w-4 text-health-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{completedWorkouts}/4</div>
                    <Progress value={(completedWorkouts / 4) * 100} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="recommended">Recommended</TabsTrigger>
                  <TabsTrigger value="cardio">Cardio</TabsTrigger>
                  <TabsTrigger value="strength">Strength</TabsTrigger>
                  <TabsTrigger value="flexibility">Flexibility</TabsTrigger>
                </TabsList>

                <TabsContent value="recommended">
                  <div className="grid gap-4 md:grid-cols-2">
                    {recommendedWorkouts.length > 0 ? (
                      recommendedWorkouts.map((workout) => (
                        <WorkoutCard
                          key={workout.id}
                          workout={workout}
                          onExerciseToggle={handleExerciseToggle}
                          onComplete={handleCompleteWorkout}
                        />
                      ))
                    ) : (
                      <div className="md:col-span-2 text-center py-8 text-muted-foreground">
                        No recommended workouts available
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="cardio">
                  <div className="grid gap-4 md:grid-cols-2">
                    {cardioWorkouts.length > 0 ? (
                      cardioWorkouts.map((workout) => (
                        <WorkoutCard
                          key={workout.id}
                          workout={workout}
                          onExerciseToggle={handleExerciseToggle}
                          onComplete={handleCompleteWorkout}
                        />
                      ))
                    ) : (
                      <div className="md:col-span-2 text-center py-8 text-muted-foreground">
                        No cardio workouts available
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="strength">
                  <div className="grid gap-4 md:grid-cols-2">
                    {strengthWorkouts.length > 0 ? (
                      strengthWorkouts.map((workout) => (
                        <WorkoutCard
                          key={workout.id}
                          workout={workout}
                          onExerciseToggle={handleExerciseToggle}
                          onComplete={handleCompleteWorkout}
                        />
                      ))
                    ) : (
                      <div className="md:col-span-2 text-center py-8 text-muted-foreground">
                        No strength workouts available
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="flexibility">
                  <div className="grid gap-4 md:grid-cols-2">
                    {flexibilityWorkouts.length > 0 ? (
                      flexibilityWorkouts.map((workout) => (
                        <WorkoutCard
                          key={workout.id}
                          workout={workout}
                          onExerciseToggle={handleExerciseToggle}
                          onComplete={handleCompleteWorkout}
                        />
                      ))
                    ) : (
                      <div className="md:col-span-2 text-center py-8 text-muted-foreground">
                        No flexibility workouts available
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

// Workout Card Component
function WorkoutCard({
  workout,
  onExerciseToggle,
  onComplete,
}: {
  workout: Workout
  onExerciseToggle: (workoutId: string, exerciseIndex: number) => void
  onComplete: (workoutId: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  // Get icon based on workout type
  const getWorkoutIcon = () => {
    switch (workout.type) {
      case "cardio":
        return <Running className="h-6 w-6" />
      case "strength":
        return <Dumbbell className="h-6 w-6" />
      case "flexibility":
        return <Yoga className="h-6 w-6" />
      case "recovery":
        return <Heart className="h-6 w-6" />
      default:
        return <Activity className="h-6 w-6" />
    }
  }

  // Get color based on workout type
  const getTypeColor = () => {
    switch (workout.type) {
      case "cardio":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "strength":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "flexibility":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "recovery":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  // Get intensity badge color
  const getIntensityColor = () => {
    switch (workout.intensity) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "moderate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <Card className={workout.completed ? "border-health-green-500" : ""}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full ${workout.type === "cardio" ? "bg-blue-100 dark:bg-blue-900" : workout.type === "strength" ? "bg-red-100 dark:bg-red-900" : workout.type === "flexibility" ? "bg-green-100 dark:bg-green-900" : "bg-purple-100 dark:bg-purple-900"} flex items-center justify-center ${workout.type === "cardio" ? "text-blue-500" : workout.type === "strength" ? "text-red-500" : workout.type === "flexibility" ? "text-green-500" : "text-purple-500"}`}
            >
              {getWorkoutIcon()}
            </div>
            <div>
              <CardTitle>{workout.title}</CardTitle>
              <CardDescription>
                {workout.duration} min • {workout.intensity} intensity
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className={getTypeColor()}>
              {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
            </Badge>
            <Badge variant="outline" className={getIntensityColor()}>
              {workout.intensity.charAt(0).toUpperCase() + workout.intensity.slice(1)}
            </Badge>
            {workout.recommended && (
              <Badge
                variant="outline"
                className="bg-health-green-100 text-health-green-800 dark:bg-health-green-900 dark:text-health-green-300"
              >
                Recommended
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{workout.description}</p>

        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">Exercises</h4>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Hide" : "Show all"}
          </Button>
        </div>

        <div className="space-y-2">
          {workout.exercises.slice(0, expanded ? workout.exercises.length : 3).map((exercise, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox
                id={`${workout.id}-exercise-${index}`}
                checked={exercise.completed}
                onCheckedChange={() => onExerciseToggle(workout.id, index)}
              />
              <Label
                htmlFor={`${workout.id}-exercise-${index}`}
                className={`flex-1 ${exercise.completed ? "line-through text-muted-foreground" : ""}`}
              >
                {exercise.name}
                {exercise.sets && exercise.reps && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {exercise.sets} sets × {exercise.reps} reps
                  </span>
                )}
                {exercise.duration && (
                  <span className="text-xs text-muted-foreground ml-2">{exercise.duration} sec</span>
                )}
              </Label>
            </div>
          ))}

          {!expanded && workout.exercises.length > 3 && (
            <p className="text-xs text-muted-foreground">+{workout.exercises.length - 3} more exercises</p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{workout.duration} minutes</span>
          </div>
          <Button
            onClick={() => onComplete(workout.id)}
            variant={workout.completed ? "outline" : "default"}
            disabled={workout.completed}
          >
            {workout.completed ? "Completed" : "Mark as Complete"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

// Function to generate personalized workouts based on health data
function generateWorkouts(healthData: any, profile: any): Workout[] {
  const workouts: Workout[] = []

  // Check if health data exists and has arrays
  const hasBloodPressure =
    healthData?.bloodPressure && Array.isArray(healthData.bloodPressure) && healthData.bloodPressure.length > 0
  const hasHeartRate = healthData?.heartRate && Array.isArray(healthData.heartRate) && healthData.heartRate.length > 0
  const hasWeight = healthData?.weight && Array.isArray(healthData.weight) && healthData.weight.length > 0

  // Get latest readings if available
  const latestBP = hasBloodPressure ? healthData.bloodPressure[healthData.bloodPressure.length - 1] : null
  const latestHR = hasHeartRate ? healthData.heartRate[healthData.heartRate.length - 1] : null
  const latestWeight = hasWeight ? healthData.weight[healthData.weight.length - 1] : null

  // Get user age
  const userAge = profile?.age || 30

  // Determine fitness level based on heart rate (if available)
  let fitnessLevel = "moderate"
  if (latestHR) {
    const restingHR = latestHR.value
    if (restingHR < 60) fitnessLevel = "high"
    else if (restingHR > 80) fitnessLevel = "low"
  }

  // Determine intensity based on blood pressure (if available)
  let recommendedIntensity: "low" | "moderate" | "high" = "moderate"
  if (latestBP) {
    const systolic = latestBP.systolic
    if (systolic > 140) recommendedIntensity = "low"
    else if (systolic < 110) recommendedIntensity = "high"
  }

  // Add cardio workouts
  workouts.push({
    id: crypto.randomUUID(),
    title: "Heart-Healthy Cardio",
    type: "cardio",
    duration: 30,
    intensity: recommendedIntensity,
    description: "A cardio workout designed to improve heart health and endurance.",
    exercises: [
      { name: "Warm-up: Brisk walking", duration: 300, completed: false },
      { name: "Jogging", duration: 600, completed: false },
      { name: "High knees", duration: 60, completed: false },
      { name: "Jumping jacks", duration: 60, completed: false },
      { name: "Cool down: Walking", duration: 300, completed: false },
    ],
    completed: false,
    recommended: true,
  })

  workouts.push({
    id: crypto.randomUUID(),
    title: "Interval Training",
    type: "cardio",
    duration: 25,
    intensity: "high",
    description: "High-intensity interval training to boost metabolism and cardiovascular health.",
    exercises: [
      { name: "Warm-up: Dynamic stretching", duration: 180, completed: false },
      { name: "Sprint", duration: 30, completed: false },
      { name: "Walk", duration: 60, completed: false },
      { name: "Sprint", duration: 30, completed: false },
      { name: "Walk", duration: 60, completed: false },
      { name: "Sprint", duration: 30, completed: false },
      { name: "Walk", duration: 60, completed: false },
      { name: "Cool down: Light stretching", duration: 180, completed: false },
    ],
    completed: false,
    recommended: fitnessLevel === "high",
  })

  // Add strength workouts
  workouts.push({
    id: crypto.randomUUID(),
    title: "Full Body Strength",
    type: "strength",
    duration: 45,
    intensity: "moderate",
    description: "A comprehensive strength workout targeting all major muscle groups.",
    exercises: [
      { name: "Push-ups", sets: 3, reps: 10, completed: false },
      { name: "Squats", sets: 3, reps: 15, completed: false },
      { name: "Dumbbell rows", sets: 3, reps: 12, completed: false },
      { name: "Lunges", sets: 3, reps: 10, completed: false },
      { name: "Plank", duration: 60, completed: false },
      { name: "Bicep curls", sets: 3, reps: 12, completed: false },
    ],
    completed: false,
    recommended: true,
  })

  workouts.push({
    id: crypto.randomUUID(),
    title: "Core Strengthening",
    type: "strength",
    duration: 30,
    intensity: "moderate",
    description: "Focus on building core strength for better posture and stability.",
    exercises: [
      { name: "Plank", duration: 60, completed: false },
      { name: "Side plank (left)", duration: 30, completed: false },
      { name: "Side plank (right)", duration: 30, completed: false },
      { name: "Bicycle crunches", sets: 3, reps: 15, completed: false },
      { name: "Russian twists", sets: 3, reps: 20, completed: false },
      { name: "Leg raises", sets: 3, reps: 12, completed: false },
    ],
    completed: false,
    recommended: false,
  })

  // Add flexibility workouts
  workouts.push({
    id: crypto.randomUUID(),
    title: "Yoga Flow",
    type: "flexibility",
    duration: 20,
    intensity: "low",
    description: "A gentle yoga flow to improve flexibility and reduce stress.",
    exercises: [
      { name: "Child's pose", duration: 60, completed: false },
      { name: "Cat-cow stretch", duration: 60, completed: false },
      { name: "Downward dog", duration: 60, completed: false },
      { name: "Warrior I pose", duration: 60, completed: false },
      { name: "Warrior II pose", duration: 60, completed: false },
      { name: "Triangle pose", duration: 60, completed: false },
      { name: "Seated forward bend", duration: 60, completed: false },
      { name: "Corpse pose", duration: 120, completed: false },
    ],
    completed: false,
    recommended: recommendedIntensity === "low",
  })

  workouts.push({
    id: crypto.randomUUID(),
    title: "Dynamic Stretching",
    type: "flexibility",
    duration: 15,
    intensity: "low",
    description: "Dynamic stretches to improve range of motion and prepare for other activities.",
    exercises: [
      { name: "Arm circles", duration: 60, completed: false },
      { name: "Hip circles", duration: 60, completed: false },
      { name: "Leg swings", duration: 60, completed: false },
      { name: "Walking lunges", duration: 60, completed: false },
      { name: "Torso twists", duration: 60, completed: false },
      { name: "Neck rotations", duration: 60, completed: false },
    ],
    completed: false,
    recommended: false,
  })

  // Add recovery workout
  workouts.push({
    id: crypto.randomUUID(),
    title: "Active Recovery",
    type: "recovery",
    duration: 20,
    intensity: "low",
    description: "Light activity to promote recovery and reduce muscle soreness.",
    exercises: [
      { name: "Light walking", duration: 300, completed: false },
      { name: "Foam rolling: Legs", duration: 180, completed: false },
      { name: "Foam rolling: Back", duration: 180, completed: false },
      { name: "Static stretching", duration: 300, completed: false },
      { name: "Deep breathing", duration: 120, completed: false },
    ],
    completed: false,
    recommended: false,
  })

  return workouts
}

