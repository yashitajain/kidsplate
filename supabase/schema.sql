-- KidsBite Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

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

-- Menus table
create table if not exists menus (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text default '',
  age_group text not null check (age_group in ('1-3', '4-6', '7-12')),
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
create index if not exists menu_items_menu_id_idx on menu_items(menu_id);
create index if not exists menus_user_id_idx on menus(user_id);
create index if not exists menus_share_slug_idx on menus(share_slug);

-- Row Level Security
alter table foods enable row level security;
alter table food_ingredients enable row level security;
alter table menus enable row level security;
alter table menu_items enable row level security;

-- Foods: readable by all (public food database)
create policy "Foods are readable by everyone" on foods for select using (true);

-- Food ingredients: readable by all
create policy "Food ingredients are readable by everyone" on food_ingredients for select using (true);

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
