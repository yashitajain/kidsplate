import { createBrowserClient } from '@supabase/ssr'

type FoodRow = {
  id: string
  name: string
  aliases: string[]
  category: 'grain' | 'legume' | 'vegetable' | 'dairy' | 'fruit' | 'protein' | 'snack'
  serving_size_g: number
  serving_label: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  iron_mg: number
  calcium_mg: number
  vitamin_c_mg: number
}

type FoodIngredientRow = {
  id: string
  food_id: string
  ingredient_name: string
  quantity: number
  unit: string
}

type MenuRow = {
  id: string
  user_id: string
  title: string
  description: string
  age_group: '1-3' | '4-6' | '7-12'
  is_public: boolean
  share_slug: string | null
  created_at: string
}

type MenuItemRow = {
  id: string
  menu_id: string
  food_id: string
  day: number
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  servings: number
}

export type Database = {
  public: {
    Tables: {
      foods: {
        Row: FoodRow
        Insert: Omit<FoodRow, 'id'>
        Update: Partial<Omit<FoodRow, 'id'>>
        Relationships: []
      }
      food_ingredients: {
        Row: FoodIngredientRow
        Insert: Omit<FoodIngredientRow, 'id'>
        Update: Partial<Omit<FoodIngredientRow, 'id'>>
        Relationships: []
      }
      menus: {
        Row: MenuRow
        Insert: Omit<MenuRow, 'id' | 'created_at'>
        Update: Partial<Omit<MenuRow, 'id' | 'created_at'>>
        Relationships: []
      }
      menu_items: {
        Row: MenuItemRow
        Insert: Omit<MenuItemRow, 'id'>
        Update: Partial<Omit<MenuItemRow, 'id'>>
        Relationships: [
          {
            foreignKeyName: 'menu_items_food_id_fkey'
            columns: ['food_id']
            isOneToOne: false
            referencedRelation: 'foods'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'menu_items_menu_id_fkey'
            columns: ['menu_id']
            isOneToOne: false
            referencedRelation: 'menus'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Food = Database['public']['Tables']['foods']['Row']
export type FoodIngredient = Database['public']['Tables']['food_ingredients']['Row']
export type Menu = Database['public']['Tables']['menus']['Row']
export type MenuItem = Database['public']['Tables']['menu_items']['Row']

export type MenuItemWithFood = MenuItem & { food: Food }

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
