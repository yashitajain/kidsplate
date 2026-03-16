import type { DayNutrition } from './nutrition'

export type GrowthSnapshot = {
  childAgeMonths: number
  ageLabel: string
  latestHeightCm: number | null
  latestWeightKg: number | null
  weightChangeKg: number | null
  heightChangeCm: number | null
}

export type ChildProfileInput = {
  birth_date?: string | null
}

export type GrowthMeasurementInput = {
  recorded_at: string
  height_cm: number | null
  weight_kg: number | null
}

export function calculateAgeMonths(birthDate?: string | null) {
  if (!birthDate) return 0
  const birth = new Date(birthDate)
  const now = new Date()
  let months = (now.getFullYear() - birth.getFullYear()) * 12
  months += now.getMonth() - birth.getMonth()
  if (now.getDate() < birth.getDate()) months -= 1
  return Math.max(0, months)
}

export function formatAgeLabel(months: number) {
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (years === 0) return `${remainingMonths} mo`
  if (remainingMonths === 0) return `${years} yr`
  return `${years} yr ${remainingMonths} mo`
}

export function summarizeGrowth(profile: ChildProfileInput, measurements: GrowthMeasurementInput[]): GrowthSnapshot {
  const sorted = [...measurements].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  )
  const latest = sorted.at(-1)
  const previous = sorted.length > 1 ? sorted.at(-2) : null
  const childAgeMonths = calculateAgeMonths(profile.birth_date)

  return {
    childAgeMonths,
    ageLabel: formatAgeLabel(childAgeMonths),
    latestHeightCm: latest?.height_cm ?? null,
    latestWeightKg: latest?.weight_kg ?? null,
    weightChangeKg:
      latest?.weight_kg != null && previous?.weight_kg != null
        ? latest.weight_kg - previous.weight_kg
        : null,
    heightChangeCm:
      latest?.height_cm != null && previous?.height_cm != null
        ? latest.height_cm - previous.height_cm
        : null,
  }
}

export function buildNutritionGapSummary(days: DayNutrition[]) {
  if (days.length === 0) return 'No intake data yet.'

  const weeklyAverage = days.reduce(
    (acc, day) => ({
      calories: acc.calories + day.calories,
      protein: acc.protein + day.protein,
      iron: acc.iron + day.iron,
      calcium: acc.calcium + day.calcium,
      vitaminC: acc.vitaminC + day.vitaminC,
      fiber: acc.fiber + day.fiber,
    }),
    { calories: 0, protein: 0, iron: 0, calcium: 0, vitaminC: 0, fiber: 0 }
  )

  const count = days.length
  return `Weekly averages: ${Math.round(weeklyAverage.calories / count)} kcal, ${Math.round(
    weeklyAverage.protein / count
  )} g protein, ${Math.round((weeklyAverage.iron / count) * 10) / 10} mg iron, ${Math.round(
    weeklyAverage.calcium / count
  )} mg calcium.`
}
