// Chart color constants
export const chartColors = {
  green: {
    primary: "rgba(34, 197, 94, 1)",
    background: "rgba(34, 197, 94, 0.2)",
  },
  mint: {
    primary: "rgba(20, 184, 166, 1)",
    background: "rgba(20, 184, 166, 0.2)",
  },
  red: {
    primary: "rgba(239, 68, 68, 1)",
    background: "rgba(239, 68, 68, 0.2)",
  },
  blue: {
    primary: "rgba(59, 130, 246, 1)",
    background: "rgba(59, 130, 246, 0.2)",
  },
  purple: {
    primary: "rgba(168, 85, 247, 1)",
    background: "rgba(168, 85, 247, 0.2)",
  },
  orange: {
    primary: "rgba(249, 115, 22, 1)",
    background: "rgba(249, 115, 22, 0.2)",
  },
  gray: {
    primary: "rgba(107, 114, 128, 1)",
    background: "rgba(107, 114, 128, 0.2)",
  },
}

// Format date for charts
export function formatChartDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// Get last n days dates
export function getLastNDays(n: number): Date[] {
  const result: Date[] = []
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    result.push(date)
  }
  return result
}

// Get formatted dates for last n days
export function getLastNDaysFormatted(n: number): string[] {
  return getLastNDays(n).map((date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" }))
}

// Generate random color
export function getRandomColor(opacity = 1): string {
  const r = Math.floor(Math.random() * 255)
  const g = Math.floor(Math.random() * 255)
  const b = Math.floor(Math.random() * 255)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

// Generate array of random colors
export function generateRandomColors(count: number, opacity = 1): string[] {
  return Array.from({ length: count }, () => getRandomColor(opacity))
}

// Get color based on value range
export function getColorForValue(value: number, min: number, max: number): string {
  if (value <= min) return chartColors.blue.primary
  if (value >= max) return chartColors.red.primary
  return chartColors.green.primary
}

// Get color for sleep quality
export function getColorForSleepQuality(quality: string): string {
  switch (quality) {
    case "poor":
      return chartColors.red.primary
    case "fair":
      return chartColors.orange.primary
    case "good":
      return chartColors.blue.primary
    case "excellent":
      return chartColors.green.primary
    default:
      return chartColors.gray.primary
  }
}

// Get background color for sleep quality
export function getBackgroundForSleepQuality(quality: string): string {
  switch (quality) {
    case "poor":
      return chartColors.red.background
    case "fair":
      return chartColors.orange.background
    case "good":
      return chartColors.blue.background
    case "excellent":
      return chartColors.green.background
    default:
      return chartColors.gray.background
  }
}

