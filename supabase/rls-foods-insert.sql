-- Run this once in Supabase SQL Editor if adding custom foods fails with
-- "new row violates row-level security policy for table foods"

alter table public.foods enable row level security;

drop policy if exists "Authenticated users can insert foods" on public.foods;
create policy "Authenticated users can insert foods" on public.foods
  for insert
  with check (auth.uid() is not null);
