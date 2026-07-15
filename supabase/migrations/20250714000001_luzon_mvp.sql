-- ============================================================
-- Luzon Explore MVP Schema
-- Tables: profiles, vehicles, accommodations, places, bookings
-- ============================================================

-- --------------------------------------------------------
-- 1. profiles (extends auth.users)
-- --------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  user_type text not null default 'customer'
    check (user_type in ('customer', 'van_owner', 'hotel_owner')),
  nationality text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'User profiles extending auth.users';

alter table public.profiles enable row level security;

-- Anyone can read profiles
create policy "Profiles are publicly readable"
  on public.profiles for select
  using (true);

-- Users can insert their own profile
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- --------------------------------------------------------
-- 2. vehicles (Van Rentals)
-- --------------------------------------------------------
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  capacity int not null check (capacity > 0),
  transmission text not null default 'auto'
    check (transmission in ('auto', 'manual')),
  base_location text not null,
  daily_rate numeric not null check (daily_rate >= 0),
  driver_included boolean not null default true,
  inclusions text[] default '{}',
  images text[] default '{}',
  description text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.vehicles is 'Van rental listings with driver';

alter table public.vehicles enable row level security;

-- Public read for approved vehicles
create policy "Vehicles are publicly readable"
  on public.vehicles for select
  using (true);

-- Owners can insert their own vehicles
create policy "Owners can insert vehicles"
  on public.vehicles for insert
  with check (auth.uid() = owner_id);

-- Owners can update their own vehicles
create policy "Owners can update own vehicles"
  on public.vehicles for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Owners can delete their own vehicles
create policy "Owners can delete own vehicles"
  on public.vehicles for delete
  using (auth.uid() = owner_id);

-- --------------------------------------------------------
-- 3. accommodations (Hotels / Homestays / Resorts)
-- --------------------------------------------------------
create table public.accommodations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  type text not null default 'hotel'
    check (type in ('hotel', 'homestay', 'resort')),
  location text not null,
  price_per_night numeric not null check (price_per_night >= 0),
  amenities text[] default '{}',
  accepts_credit_card boolean not null default false,
  images text[] default '{}',
  description text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.accommodations is 'Hotel, homestay, and resort listings';

alter table public.accommodations enable row level security;

-- Public read for accommodations
create policy "Accommodations are publicly readable"
  on public.accommodations for select
  using (true);

-- Owners can insert their own accommodations
create policy "Owners can insert accommodations"
  on public.accommodations for insert
  with check (auth.uid() = owner_id);

-- Owners can update their own accommodations
create policy "Owners can update own accommodations"
  on public.accommodations for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Owners can delete their own accommodations
create policy "Owners can delete own accommodations"
  on public.accommodations for delete
  using (auth.uid() = owner_id);

-- --------------------------------------------------------
-- 4. places (Attractions / Points of Interest)
-- --------------------------------------------------------
create table public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  loop_category text not null
    check (loop_category in ('Cordillera', 'Ilocos', 'Bicol', 'Metro Manila')),
  city_province text not null,
  entrance_fee_foreigner numeric default 0,
  entrance_fee_local numeric default 0,
  coordinates jsonb,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

comment on table public.places is 'Tourist attractions and points of interest';

alter table public.places enable row level security;

-- Public read for places
create policy "Places are publicly readable"
  on public.places for select
  using (true);

-- Only authenticated users can insert places (admin/moderation later)
create policy "Authenticated users can insert places"
  on public.places for insert
  with check (auth.uid() is not null);

-- Only authenticated users can update places
create policy "Authenticated users can update places"
  on public.places for update
  using (auth.uid() is not null);

-- --------------------------------------------------------
-- 5. bookings (Core transaction)
-- --------------------------------------------------------
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  booking_type text not null
    check (booking_type in ('van', 'hotel', 'bundle')),
  reference_id uuid,
  start_date date not null,
  end_date date not null,
  total_price numeric not null check (total_price >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled')),
  special_requests text,
  bundle_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint valid_date_range check (end_date >= start_date)
);

comment on table public.bookings is 'Van, hotel, and bundle bookings';

alter table public.bookings enable row level security;

-- Users can read their own bookings
create policy "Users can read own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

-- Users can insert their own bookings
create policy "Users can insert own bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

-- Users can update their own bookings (e.g. cancel)
create policy "Users can update own bookings"
  on public.bookings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Listing owners can read bookings for their listings
create policy "Owners can read bookings for their vehicles"
  on public.bookings for select
  using (
    booking_type = 'van'
    and reference_id in (
      select id from public.vehicles where owner_id = auth.uid()
    )
  );

create policy "Owners can read bookings for their accommodations"
  on public.bookings for select
  using (
    booking_type = 'hotel'
    and reference_id in (
      select id from public.accommodations where owner_id = auth.uid()
    )
  );

-- --------------------------------------------------------
-- Indexes for common queries
-- --------------------------------------------------------
create index idx_vehicles_owner on public.vehicles(owner_id);
create index idx_vehicles_base_location on public.vehicles(base_location);
create index idx_accommodations_owner on public.accommodations(owner_id);
create index idx_accommodations_location on public.accommodations(location);
create index idx_places_loop_category on public.places(loop_category);
create index idx_bookings_user on public.bookings(user_id);
create index idx_bookings_reference on public.bookings(reference_id);
create index idx_bookings_dates on public.bookings(start_date, end_date);

-- --------------------------------------------------------
-- updated_at trigger function
-- --------------------------------------------------------
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

create trigger set_vehicles_updated_at
  before update on public.vehicles
  for each row execute procedure public.update_updated_at();

create trigger set_accommodations_updated_at
  before update on public.accommodations
  for each row execute procedure public.update_updated_at();

create trigger set_bookings_updated_at
  before update on public.bookings
  for each row execute procedure public.update_updated_at();
