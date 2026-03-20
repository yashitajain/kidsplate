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

type UserProfileRow = {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  plan_tier: 'free' | 'ai' | 'nutrition'
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

type FriendshipRow = {
  id: string
  requester_id: string
  addressee_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
}

type MealPostRow = {
  id: string
  user_id: string
  image_url: string
  caption: string
  notes: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null
  ai_meal_name: string | null
  ai_ingredients: string[]
  ai_nutrition: Record<string, string | number | null>
  visibility: 'private' | 'friends' | 'public'
  created_at: string
  updated_at: string
}

type MealPostCommentRow = {
  id: string
  post_id: string
  user_id: string
  body: string
  created_at: string
}

type ChildProfileRow = {
  id: string
  user_id: string
  name: string
  birth_date: string
  sex: 'female' | 'male' | 'unspecified'
  dietary_preferences: string[]
  allergies: string[]
  likes: string[]
  dislikes: string[]
  health_goals: string[]
  created_at: string
  updated_at: string
}

type GrowthMeasurementRow = {
  id: string
  child_profile_id: string
  recorded_at: string
  height_cm: number | null
  weight_kg: number | null
  notes: string | null
  created_at: string
}

type NutritionKnowledgeDocRow = {
  id: string
  title: string
  source: string
  source_url: string
  summary: string
  tags: string[]
  chunk: string
}

type MenuRow = {
  id: string
  user_id: string
  title: string
  description: string
  age_group: '1-3' | '4-6' | '7-12' | 'mom'
  child_profile_id: string | null
  dietary_constraints: string[]
  planning_prompt: string | null
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
      user_profiles: {
        Row: UserProfileRow
        Insert: Omit<UserProfileRow, 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserProfileRow, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      friendships: {
        Row: FriendshipRow
        Insert: Omit<FriendshipRow, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<FriendshipRow, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      meal_posts: {
        Row: MealPostRow
        Insert: Omit<MealPostRow, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<MealPostRow, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      meal_post_comments: {
        Row: MealPostCommentRow
        Insert: Omit<MealPostCommentRow, 'id' | 'created_at'>
        Update: Partial<Omit<MealPostCommentRow, 'id' | 'created_at'>>
        Relationships: []
      }
      child_profiles: {
        Row: ChildProfileRow
        Insert: Omit<ChildProfileRow, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ChildProfileRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      growth_measurements: {
        Row: GrowthMeasurementRow
        Insert: Omit<GrowthMeasurementRow, 'id' | 'created_at'>
        Update: Partial<Omit<GrowthMeasurementRow, 'id' | 'created_at'>>
        Relationships: []
      }
      nutrition_knowledge_docs: {
        Row: NutritionKnowledgeDocRow
        Insert: Omit<NutritionKnowledgeDocRow, 'id'>
        Update: Partial<Omit<NutritionKnowledgeDocRow, 'id'>>
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
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type Friendship = Database['public']['Tables']['friendships']['Row']
export type MealPost = Database['public']['Tables']['meal_posts']['Row']
export type MealPostComment = Database['public']['Tables']['meal_post_comments']['Row']
export type ChildProfile = Database['public']['Tables']['child_profiles']['Row']
export type GrowthMeasurement = Database['public']['Tables']['growth_measurements']['Row']
export type NutritionKnowledgeDoc = Database['public']['Tables']['nutrition_knowledge_docs']['Row']
export type Menu = Database['public']['Tables']['menus']['Row']
export type MenuItem = Database['public']['Tables']['menu_items']['Row']

export type MenuItemWithFood = MenuItem & { food: Food }

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
