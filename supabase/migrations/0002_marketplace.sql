-- Marketplace core: owners post jobs, shops/creators bid with renders and quotes.
create table public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null default 'shop' check (kind in ('shop','creator')),
  name text not null,
  city text,
  is_verified boolean not null default false, -- KSTM Pro badge, set by admins only
  created_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  vehicle_id uuid references public.vehicles (id) on delete set null,
  title text not null,
  description text,
  city text,
  budget_min_inr int,
  budget_max_inr int,
  photo_paths text[] not null default '{}',
  status text not null default 'open' check (status in ('open','awarded','in_progress','completed','cancelled')),
  closes_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.bids (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  shop_id uuid not null references public.shops (id) on delete cascade,
  render_paths text[] not null default '{}',
  price_inr int not null check (price_inr > 0),
  days_estimate int,
  notes text,
  status text not null default 'pending' check (status in ('pending','accepted','rejected','withdrawn')),
  created_at timestamptz not null default now(),
  unique (job_id, shop_id)
);

alter table public.shops enable row level security;
alter table public.jobs enable row level security;
alter table public.bids enable row level security;

create policy "shops readable" on public.shops for select using (true);
create policy "own shop insert" on public.shops for insert with check (auth.uid() = owner_id and is_verified = false);
create policy "own shop update" on public.shops for update using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id and is_verified = (select s.is_verified from public.shops s where s.id = shops.id));

create policy "jobs readable" on public.jobs for select using (true);
create policy "own jobs write" on public.jobs for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Bids are visible to the job owner and the bidding shop
create policy "bids visible to parties" on public.bids for select using (
  auth.uid() = (select owner_id from public.jobs j where j.id = job_id)
  or auth.uid() = (select owner_id from public.shops s where s.id = shop_id)
);
create policy "shop places bid" on public.bids for insert with check (
  auth.uid() = (select owner_id from public.shops s where s.id = shop_id)
);
create policy "shop edits own bid" on public.bids for update using (
  auth.uid() = (select owner_id from public.shops s where s.id = shop_id)
);
-- Accepting a bid (owner side) should go through a server route using the service role, so it can
-- update job status and start the escrow flow atomically.
