-- Initial schema: profiles, vehicles, builds (showcase), comments, chat, mod catalog with embeddings.
create extension if not exists vector;

-- Profiles: one row per auth user
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  city text,
  state text check (state in ('TN','KL','KA','AP','TG','PY','other')),
  preferred_language text default 'en' check (preferred_language in ('en','ta','ml','kn','te')),
  created_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('car','bike','scooter','suv','other')),
  make text not null,
  model text not null,
  year int,
  created_at timestamptz not null default now()
);

-- Build showcases
create table public.builds (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  vehicle_id uuid references public.vehicles (id) on delete set null,
  title text not null,
  description text,
  image_paths text[] not null default '{}', -- Supabase Storage paths in the "builds" bucket
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  build_id uuid not null references public.builds (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table public.build_likes (
  build_id uuid references public.builds (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete cascade,
  primary key (build_id, user_id)
);

-- Community chat (Supabase Realtime)
create table public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, -- e.g. 'chennai', 'kochi', 're-owners'
  name text not null
);

create table public.chat_messages (
  id bigint generated always as identity primary key,
  room_id uuid not null references public.chat_rooms (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index on public.chat_messages (room_id, created_at desc);

-- Mod catalog for AI retrieval (embedding size matches your embedding model)
create table public.mod_parts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  fits text[] not null default '{}',
  price_min_inr int,
  price_max_inr int,
  legal_notes text,
  embedding vector(1024),
  created_at timestamptz not null default now()
);

-- Auto-create a profile on sign-up
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url');
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.builds enable row level security;
alter table public.comments enable row level security;
alter table public.build_likes enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.chat_messages enable row level security;
alter table public.mod_parts enable row level security;

create policy "profiles readable" on public.profiles for select using (true);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

create policy "vehicles readable" on public.vehicles for select using (true);
create policy "own vehicles write" on public.vehicles for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "published builds readable" on public.builds for select using (is_published or auth.uid() = owner_id);
create policy "own builds write" on public.builds for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "comments readable" on public.comments for select using (true);
create policy "signed-in comment" on public.comments for insert with check (auth.uid() = author_id);
create policy "own comment delete" on public.comments for delete using (auth.uid() = author_id);

create policy "likes readable" on public.build_likes for select using (true);
create policy "own likes" on public.build_likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "rooms readable" on public.chat_rooms for select using (true);
create policy "messages readable by signed-in" on public.chat_messages for select using (auth.role() = 'authenticated');
create policy "signed-in post" on public.chat_messages for insert with check (auth.uid() = author_id);

create policy "parts readable" on public.mod_parts for select using (true);

-- Realtime for chat and comments
alter publication supabase_realtime add table public.chat_messages, public.comments;

insert into public.chat_rooms (slug, name) values
  ('general', 'General'), ('chennai', 'Chennai'), ('bengaluru', 'Bengaluru'),
  ('kochi', 'Kochi'), ('hyderabad', 'Hyderabad');
