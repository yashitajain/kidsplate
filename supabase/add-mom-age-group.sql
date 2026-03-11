-- Run this once in Supabase SQL Editor for existing projects
-- to allow mom menus in the menus.age_group constraint.

alter table public.menus
  drop constraint if exists menus_age_group_check;

alter table public.menus
  add constraint menus_age_group_check
  check (age_group in ('1-3', '4-6', '7-12', 'mom'));
