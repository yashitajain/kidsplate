import type { MenuItemWithFood, FoodIngredient } from './supabase'

export type GroceryItem = {
  ingredient_name: string
  quantity: number
  unit: string
  category: string
}

export type GroceryGroup = {
  category: string
  items: GroceryItem[]
}

// Normalize unit for aggregation (convert all to base where possible)
function normalizeQuantity(quantity: number, unit: string): { quantity: number; unit: string } {
  // Keep as-is for now; just aggregate same unit+ingredient combos
  return { quantity, unit }
}

export function aggregateGroceries(
  menuItems: MenuItemWithFood[],
  ingredientsByFood: Record<string, FoodIngredient[]>
): GroceryGroup[] {
  // Map: "ingredient_name:::unit" -> { quantity, category }
  const aggregated: Record<string, { quantity: number; unit: string; category: string; ingredient_name: string }> = {}

  for (const item of menuItems) {
    const ingredients = ingredientsByFood[item.food_id] ?? []
    for (const ing of ingredients) {
      const key = `${ing.ingredient_name}:::${ing.unit}`
      const qty = ing.quantity * item.servings
      if (aggregated[key]) {
        aggregated[key].quantity += qty
      } else {
        aggregated[key] = {
          ingredient_name: ing.ingredient_name,
          quantity: qty,
          unit: ing.unit,
          category: item.food.category,
        }
      }
    }
  }

  // Group by category
  const groups: Record<string, GroceryItem[]> = {}
  for (const entry of Object.values(aggregated)) {
    const cat = entry.category
    if (!groups[cat]) groups[cat] = []
    groups[cat].push({
      ingredient_name: entry.ingredient_name,
      quantity: Math.round(entry.quantity * 10) / 10,
      unit: entry.unit,
      category: cat,
    })
  }

  const CATEGORY_ORDER = ['grain', 'legume', 'vegetable', 'dairy', 'fruit', 'protein', 'snack']
  const CATEGORY_LABELS: Record<string, string> = {
    grain: 'Grains & Cereals',
    legume: 'Lentils & Legumes',
    vegetable: 'Vegetables',
    dairy: 'Dairy',
    fruit: 'Fruits',
    protein: 'Protein',
    snack: 'Snacks & Others',
  }

  return CATEGORY_ORDER
    .filter(cat => groups[cat] && groups[cat].length > 0)
    .map(cat => ({
      category: CATEGORY_LABELS[cat] ?? cat,
      items: groups[cat].sort((a, b) => a.ingredient_name.localeCompare(b.ingredient_name)),
    }))
}

export function formatGroceryList(groups: GroceryGroup[]): string {
  const lines: string[] = ['🛒 Weekly Grocery List (KidsBite)', '']
  for (const group of groups) {
    lines.push(`📌 ${group.category}`)
    for (const item of group.items) {
      lines.push(`  • ${item.ingredient_name}: ${item.quantity} ${item.unit}`)
    }
    lines.push('')
  }
  return lines.join('\n')
}
