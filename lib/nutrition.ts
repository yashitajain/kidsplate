import type { MenuItemWithFood } from './supabase'

export type AgeGroup = '1-3' | '4-6' | '7-12' | 'mom'

export type NutrientKey = 'calories' | 'protein_g' | 'iron_mg' | 'calcium_mg' | 'vitamin_c_mg' | 'fiber_g'

export type RDAEntry = {
  calories: number
  protein: number
  iron: number
  calcium: number
  vitaminC: number
  fiber: number
}

export const RDA: Record<AgeGroup, RDAEntry> = {
  '1-3':  { calories: 1000, protein: 16, iron: 9,  calcium: 700,  vitaminC: 40, fiber: 19 },
  '4-6':  { calories: 1200, protein: 20, iron: 13, calcium: 1000, vitaminC: 25, fiber: 20 },
  '7-12': { calories: 1800, protein: 35, iron: 22, calcium: 1200, vitaminC: 40, fiber: 25 },
  mom:    { calories: 2000, protein: 46, iron: 18, calcium: 1000, vitaminC: 75, fiber: 25 },
}

export type DayNutrition = {
  day: number
  calories: number
  protein: number
  iron: number
  calcium: number
  vitaminC: number
  fiber: number
}

export function calcItemNutrition(item: MenuItemWithFood) {
  const { food, servings } = item
  const factor = servings
  return {
    calories: food.calories * factor,
    protein: food.protein_g * factor,
    iron: food.iron_mg * factor,
    calcium: food.calcium_mg * factor,
    vitaminC: food.vitamin_c_mg * factor,
    fiber: food.fiber_g * factor,
  }
}

export function calcDayNutrition(items: MenuItemWithFood[], day: number): DayNutrition {
  const dayItems = items.filter(i => i.day === day)
  const totals = dayItems.reduce(
    (acc, item) => {
      const n = calcItemNutrition(item)
      return {
        calories: acc.calories + n.calories,
        protein: acc.protein + n.protein,
        iron: acc.iron + n.iron,
        calcium: acc.calcium + n.calcium,
        vitaminC: acc.vitaminC + n.vitaminC,
        fiber: acc.fiber + n.fiber,
      }
    },
    { calories: 0, protein: 0, iron: 0, calcium: 0, vitaminC: 0, fiber: 0 }
  )
  return { day, ...totals }
}

export function calcAllDaysNutrition(items: MenuItemWithFood[]): DayNutrition[] {
  return Array.from({ length: 7 }, (_, i) => calcDayNutrition(items, i + 1))
}

export function calcWeeklyAverage(days: DayNutrition[]): Omit<DayNutrition, 'day'> {
  const sum = days.reduce(
    (acc, d) => ({
      calories: acc.calories + d.calories,
      protein: acc.protein + d.protein,
      iron: acc.iron + d.iron,
      calcium: acc.calcium + d.calcium,
      vitaminC: acc.vitaminC + d.vitaminC,
      fiber: acc.fiber + d.fiber,
    }),
    { calories: 0, protein: 0, iron: 0, calcium: 0, vitaminC: 0, fiber: 0 }
  )
  const count = days.length || 1
  return {
    calories: sum.calories / count,
    protein: sum.protein / count,
    iron: sum.iron / count,
    calcium: sum.calcium / count,
    vitaminC: sum.vitaminC / count,
    fiber: sum.fiber / count,
  }
}

export function getPercentRDA(value: number, rdaValue: number): number {
  return Math.round((value / rdaValue) * 100)
}

export function getColorClass(percent: number): string {
  if (percent >= 80) return 'text-green-600'
  if (percent >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

export function getBarColor(percent: number): string {
  if (percent >= 80) return 'bg-green-500'
  if (percent >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

export function calcCellCalories(items: MenuItemWithFood[], day: number, mealType: string): number {
  return items
    .filter(i => i.day === day && i.meal_type === mealType)
    .reduce((sum, item) => sum + item.food.calories * item.servings, 0)
}

export const NUTRIENT_LABELS: Record<string, string> = {
  calories: 'Calories (kcal)',
  protein: 'Protein (g)',
  iron: 'Iron (mg)',
  calcium: 'Calcium (mg)',
  vitaminC: 'Vitamin C (mg)',
  fiber: 'Fiber (g)',
}

export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const
export type MealType = typeof MEAL_TYPES[number]
