-- KidsBite Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists vector;

-- Foods table
create table if not exists foods (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  aliases text[] default '{}',
  category text not null check (category in ('grain', 'legume', 'vegetable', 'dairy', 'fruit', 'protein', 'snack')),
  serving_size_g int not null,
  serving_label text not null,
  calories float not null,
  protein_g float default 0,
  carbs_g float default 0,
  fat_g float default 0,
  fiber_g float default 0,
  iron_mg float default 0,
  calcium_mg float default 0,
  vitamin_c_mg float default 0
);

-- Food ingredients table
create table if not exists food_ingredients (
  id uuid primary key default uuid_generate_v4(),
  food_id uuid not null references foods(id) on delete cascade,
  ingredient_name text not null,
  quantity float not null,
  unit text not null check (unit in ('g', 'ml', 'tsp', 'tbsp', 'piece'))
);

-- User profiles and billing tier
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  plan_tier text not null default 'free' check (plan_tier in ('free', 'ai', 'nutrition')),
  onboarding_completed boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Friend connections
create table if not exists friendships (
  id uuid primary key default uuid_generate_v4(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint friendships_no_self check (requester_id <> addressee_id),
  constraint friendships_unique_direction unique (requester_id, addressee_id)
);

-- Photo-first meal posts for community sharing
create table if not exists meal_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text not null,
  caption text default '',
  notes text default '',
  meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  ai_meal_name text,
  ai_ingredients text[] not null default '{}',
  ai_nutrition jsonb not null default '{}'::jsonb,
  visibility text not null default 'friends' check (visibility in ('private', 'friends', 'public')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists meal_post_comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references meal_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

-- Child profiles
create table if not exists child_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  birth_date date not null,
  sex text not null default 'unspecified' check (sex in ('female', 'male', 'unspecified')),
  dietary_preferences text[] not null default '{}',
  allergies text[] not null default '{}',
  likes text[] not null default '{}',
  dislikes text[] not null default '{}',
  health_goals text[] not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Growth measurements
create table if not exists growth_measurements (
  id uuid primary key default uuid_generate_v4(),
  child_profile_id uuid not null references child_profiles(id) on delete cascade,
  recorded_at date not null default current_date,
  height_cm numeric(5, 2),
  weight_kg numeric(5, 2),
  notes text,
  created_at timestamptz default now()
);

-- Nutrition knowledge docs for RAG
create table if not exists nutrition_knowledge_docs (
  id text primary key,
  title text not null,
  source text not null,
  source_url text not null,
  summary text not null default '',
  tags text[] not null default '{}',
  chunk text not null,
  embedding vector(1536)
);

-- Menus table
create table if not exists menus (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text default '',
  age_group text not null check (age_group in ('1-3', '4-6', '7-12', 'mom')),
  child_profile_id uuid references child_profiles(id) on delete set null,
  dietary_constraints text[] not null default '{}',
  planning_prompt text,
  is_public bool default false,
  share_slug text unique,
  created_at timestamptz default now()
);

-- Menu items table
create table if not exists menu_items (
  id uuid primary key default uuid_generate_v4(),
  menu_id uuid not null references menus(id) on delete cascade,
  food_id uuid not null references foods(id) on delete cascade,
  day int not null check (day between 1 and 7),
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  servings float not null default 1
);

-- Indexes
create index if not exists foods_name_idx on foods using gin(to_tsvector('english', name));
create index if not exists foods_category_idx on foods(category);
create index if not exists friendships_requester_idx on friendships(requester_id);
create index if not exists friendships_addressee_idx on friendships(addressee_id);
create index if not exists meal_posts_user_id_idx on meal_posts(user_id);
create index if not exists meal_posts_visibility_idx on meal_posts(visibility);
create index if not exists meal_post_comments_post_id_idx on meal_post_comments(post_id);
create index if not exists child_profiles_user_id_idx on child_profiles(user_id);
create index if not exists growth_measurements_child_profile_id_idx on growth_measurements(child_profile_id);
create index if not exists menu_items_menu_id_idx on menu_items(menu_id);
create index if not exists menus_user_id_idx on menus(user_id);
create index if not exists menus_share_slug_idx on menus(share_slug);
create index if not exists nutrition_knowledge_docs_tags_idx on nutrition_knowledge_docs using gin(tags);

-- Row Level Security
alter table foods enable row level security;
alter table food_ingredients enable row level security;
alter table user_profiles enable row level security;
alter table friendships enable row level security;
alter table meal_posts enable row level security;
alter table meal_post_comments enable row level security;
alter table child_profiles enable row level security;
alter table growth_measurements enable row level security;
alter table nutrition_knowledge_docs enable row level security;
alter table menus enable row level security;
alter table menu_items enable row level security;

-- Foods: readable by all (public food database)
create policy "Foods are readable by everyone" on foods for select using (true);

-- Foods: authenticated users can add custom foods
create policy "Authenticated users can insert foods" on foods for insert
  with check (auth.uid() is not null);

-- Food ingredients: readable by all
create policy "Food ingredients are readable by everyone" on food_ingredients for select using (true);

-- Nutrition knowledge docs: readable by all app users and service roles
create policy "Nutrition knowledge readable by everyone" on nutrition_knowledge_docs for select using (true);

-- User profiles
create policy "Users can read own profile" on user_profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on user_profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on user_profiles for update using (auth.uid() = id);

-- Friendships
create policy "Users can read own friendships" on friendships for select using (
  auth.uid() = requester_id or auth.uid() = addressee_id
);
create policy "Users can insert own friendships" on friendships for insert with check (
  auth.uid() = requester_id
);
create policy "Users can update friendships they receive" on friendships for update using (
  auth.uid() = addressee_id or auth.uid() = requester_id
);
create policy "Users can delete own friendships" on friendships for delete using (
  auth.uid() = requester_id or auth.uid() = addressee_id
);

-- Meal posts
create policy "Users can read visible meal posts" on meal_posts for select using (
  auth.uid() = user_id
  or visibility = 'public'
  or (
    visibility = 'friends'
    and exists (
      select 1 from friendships
      where friendships.status = 'accepted'
      and (
        (friendships.requester_id = auth.uid() and friendships.addressee_id = meal_posts.user_id)
        or (friendships.addressee_id = auth.uid() and friendships.requester_id = meal_posts.user_id)
      )
    )
  )
);
create policy "Users can insert own meal posts" on meal_posts for insert with check (
  auth.uid() = user_id
);
create policy "Users can update own meal posts" on meal_posts for update using (
  auth.uid() = user_id
);
create policy "Users can delete own meal posts" on meal_posts for delete using (
  auth.uid() = user_id
);

create policy "Users can read visible meal post comments" on meal_post_comments for select using (
  exists (
    select 1 from meal_posts
    where meal_posts.id = meal_post_comments.post_id
    and (
      meal_posts.user_id = auth.uid()
      or meal_posts.visibility = 'public'
      or (
        meal_posts.visibility = 'friends'
        and exists (
          select 1 from friendships
          where friendships.status = 'accepted'
          and (
            (friendships.requester_id = auth.uid() and friendships.addressee_id = meal_posts.user_id)
            or (friendships.addressee_id = auth.uid() and friendships.requester_id = meal_posts.user_id)
          )
        )
      )
    )
  )
);
create policy "Users can insert own meal post comments" on meal_post_comments for insert with check (
  auth.uid() = user_id
);
create policy "Users can delete own meal post comments" on meal_post_comments for delete using (
  auth.uid() = user_id
);

-- Child profiles
create policy "Users can read own child profiles" on child_profiles for select using (auth.uid() = user_id);
create policy "Users can insert own child profiles" on child_profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own child profiles" on child_profiles for update using (auth.uid() = user_id);
create policy "Users can delete own child profiles" on child_profiles for delete using (auth.uid() = user_id);

-- Growth measurements
create policy "Users can read own measurements" on growth_measurements for select using (
  exists (
    select 1 from child_profiles
    where child_profiles.id = growth_measurements.child_profile_id
    and child_profiles.user_id = auth.uid()
  )
);

create policy "Users can insert own measurements" on growth_measurements for insert with check (
  exists (
    select 1 from child_profiles
    where child_profiles.id = growth_measurements.child_profile_id
    and child_profiles.user_id = auth.uid()
  )
);

create policy "Users can update own measurements" on growth_measurements for update using (
  exists (
    select 1 from child_profiles
    where child_profiles.id = growth_measurements.child_profile_id
    and child_profiles.user_id = auth.uid()
  )
);

create policy "Users can delete own measurements" on growth_measurements for delete using (
  exists (
    select 1 from child_profiles
    where child_profiles.id = growth_measurements.child_profile_id
    and child_profiles.user_id = auth.uid()
  )
);

-- Menus: users can read their own + public menus
create policy "Users can read own menus" on menus for select
  using (auth.uid() = user_id or is_public = true);

create policy "Users can insert own menus" on menus for insert
  with check (auth.uid() = user_id);

create policy "Users can update own menus" on menus for update
  using (auth.uid() = user_id);

create policy "Users can delete own menus" on menus for delete
  using (auth.uid() = user_id);

-- Menu items: accessible based on menu ownership
create policy "Users can read menu items" on menu_items for select
  using (
    exists (
      select 1 from menus
      where menus.id = menu_items.menu_id
      and (menus.user_id = auth.uid() or menus.is_public = true)
    )
  );

create policy "Users can insert menu items" on menu_items for insert
  with check (
    exists (
      select 1 from menus
      where menus.id = menu_items.menu_id
      and menus.user_id = auth.uid()
    )
  );

create policy "Users can update menu items" on menu_items for update
  using (
    exists (
      select 1 from menus
      where menus.id = menu_items.menu_id
      and menus.user_id = auth.uid()
    )
  );

create policy "Users can delete menu items" on menu_items for delete
  using (
    exists (
      select 1 from menus
      where menus.id = menu_items.menu_id
      and menus.user_id = auth.uid()
    )
  );

create or replace function match_nutrition_knowledge(
  query_embedding vector(1536),
  match_count int default 4
)
returns table (
  id text,
  title text,
  source text,
  source_url text,
  summary text,
  chunk text,
  similarity float
)
language sql
as $$
  select
    nutrition_knowledge_docs.id,
    nutrition_knowledge_docs.title,
    nutrition_knowledge_docs.source,
    nutrition_knowledge_docs.source_url,
    nutrition_knowledge_docs.summary,
    nutrition_knowledge_docs.chunk,
    1 - (nutrition_knowledge_docs.embedding <=> query_embedding) as similarity
  from nutrition_knowledge_docs
  where nutrition_knowledge_docs.embedding is not null
  order by nutrition_knowledge_docs.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;
