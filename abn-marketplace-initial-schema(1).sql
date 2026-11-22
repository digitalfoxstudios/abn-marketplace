-- ABN Marketplace: initial Supabase schema
-- Apply this file in Supabase Dashboard > SQL Editor.
-- COD only at launch. Do not put service-role keys in the browser.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text unique,
  preferred_language text not null default 'hi',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('customer','admin','warehouse_manager','delivery_partner','vendor')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete set null,
  business_name text not null,
  contact_name text,
  phone text,
  email text,
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified','pending','verified','rejected')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete set null,
  name text not null,
  description text,
  category text,
  phone text,
  address text,
  block_name text,
  district text not null default 'Mau',
  state text not null default 'Uttar Pradesh',
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified','pending','verified','rejected')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  vertical text not null check (vertical in ('store','daily_needs','business')),
  name text not null,
  slug text not null,
  parent_id uuid references public.categories(id) on delete set null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  unique (vertical, slug)
);

create table if not exists public.warehouses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  address text not null,
  block_name text,
  district text not null default 'Mau',
  state text not null default 'Uttar Pradesh',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  vertical text not null check (vertical in ('store','daily_needs')),
  name text not null,
  slug text not null unique,
  description text,
  sku text unique,
  unit text,
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= price),
  image_url text,
  is_organic boolean not null default false,
  organic_certification text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0 and reserved_quantity <= quantity),
  reorder_level integer not null default 0 check (reorder_level >= 0),
  updated_at timestamptz not null default now(),
  unique (product_id, warehouse_id)
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id),
  warehouse_id uuid not null references public.warehouses(id),
  movement_type text not null check (movement_type in ('procurement','sale','return','adjustment','transfer_in','transfer_out','damage')),
  quantity integer not null check (quantity > 0),
  reference text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid not null references auth.users(id),
  status text not null default 'placed'
    check (status in ('placed','confirmed','packed','out_for_delivery','delivered','cancelled','returned')),
  payment_method text not null default 'cod' check (payment_method = 'cod'),
  payment_status text not null default 'pending'
    check (payment_status in ('pending','collected','failed','refunded')),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  delivery_fee numeric(12,2) not null default 0 check (delivery_fee >= 0),
  discount numeric(12,2) not null default 0 check (discount >= 0),
  total numeric(12,2) not null check (total >= 0),
  customer_name text not null,
  customer_phone text not null,
  delivery_address text not null,
  block_name text,
  district text not null default 'Mau',
  state text not null default 'Uttar Pradesh',
  delivery_instructions text,
  placed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  sku text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  line_total numeric(12,2) not null check (line_total >= 0)
);

create table if not exists public.delivery_assignments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  delivery_partner_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending','assigned','picked_up','delivered','failed')),
  assigned_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz,
  delivery_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.app_releases (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('web','android')),
  version text not null,
  build_number integer not null default 1,
  minimum_supported_version text,
  force_update boolean not null default false,
  store_url text,
  release_notes text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  unique (platform, version, build_number)
);

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  promotion_type text not null check (promotion_type in ('banner','coupon','referral','free_delivery')),
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references auth.users(id) on delete cascade,
  referred_user_id uuid references auth.users(id) on delete set null,
  referral_code text not null unique,
  status text not null default 'created' check (status in ('created','qualified','rewarded','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.referral_rewards (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references public.referrals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending','approved','paid','cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists products_vertical_active_idx on public.products(vertical, is_active);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists inventory_product_warehouse_idx on public.inventory(product_id, warehouse_id);
create index if not exists orders_customer_created_idx on public.orders(customer_id, placed_at desc);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists stock_movements_product_created_idx on public.stock_movements(product_id, created_at desc);
create index if not exists businesses_district_active_idx on public.businesses(district, is_active);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
drop trigger if exists vendors_set_updated_at on public.vendors;
create trigger vendors_set_updated_at before update on public.vendors
for each row execute function public.set_updated_at();
drop trigger if exists businesses_set_updated_at on public.businesses;
create trigger businesses_set_updated_at before update on public.businesses
for each row execute function public.set_updated_at();
drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();
drop trigger if exists inventory_set_updated_at on public.inventory;
create trigger inventory_set_updated_at before update on public.inventory
for each row execute function public.set_updated_at();
drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders
for each row execute function public.set_updated_at();

-- Create a profile automatically when a new Supabase Auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Role helper avoids policies querying user_roles recursively.
create or replace function public.has_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = required_role
  );
$$;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.vendors enable row level security;
alter table public.businesses enable row level security;
alter table public.categories enable row level security;
alter table public.warehouses enable row level security;
alter table public.products enable row level security;
alter table public.inventory enable row level security;
alter table public.stock_movements enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.delivery_assignments enable row level security;
alter table public.app_releases enable row level security;
alter table public.promotions enable row level security;
alter table public.referrals enable row level security;
alter table public.referral_rewards enable row level security;

create policy "profiles read own or admin" on public.profiles
for select to authenticated using (id = auth.uid() or public.has_role('admin'));
create policy "profiles update own" on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "users read own roles" on public.user_roles
for select to authenticated using (user_id = auth.uid() or public.has_role('admin'));
create policy "admins manage roles" on public.user_roles
for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy "vendors visible when active" on public.vendors
for select to anon, authenticated using (is_active = true or owner_user_id = auth.uid() or public.has_role('admin'));
create policy "vendor owners and admins update vendor" on public.vendors
for update to authenticated using (owner_user_id = auth.uid() or public.has_role('admin'))
with check (owner_user_id = auth.uid() or public.has_role('admin'));

create policy "active businesses public read" on public.businesses
for select to anon, authenticated using (is_active = true or owner_user_id = auth.uid() or public.has_role('admin'));
create policy "business owners and admins update" on public.businesses
for update to authenticated using (owner_user_id = auth.uid() or public.has_role('admin'))
with check (owner_user_id = auth.uid() or public.has_role('admin'));

create policy "active categories public read" on public.categories
for select to anon, authenticated using (is_active = true or public.has_role('admin'));
create policy "active warehouses public read" on public.warehouses
for select to anon, authenticated using (is_active = true or public.has_role('admin'));

create policy "active products public read" on public.products
for select to anon, authenticated using (is_active = true or public.has_role('admin') or (vendor_id is not null and exists (
  select 1 from public.vendors v where v.id = vendor_id and v.owner_user_id = auth.uid()
)));
create policy "admins manage products" on public.products
for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy "inventory public read" on public.inventory
for select to anon, authenticated using (true);
create policy "admins manage inventory" on public.inventory
for all to authenticated using (public.has_role('admin') or public.has_role('warehouse_manager'))
with check (public.has_role('admin') or public.has_role('warehouse_manager'));
create policy "admins manage stock movements" on public.stock_movements
for all to authenticated using (public.has_role('admin') or public.has_role('warehouse_manager'))
with check (public.has_role('admin') or public.has_role('warehouse_manager'));

create policy "customers read own orders" on public.orders
for select to authenticated using (customer_id = auth.uid() or public.has_role('admin') or public.has_role('warehouse_manager') or public.has_role('delivery_partner'));
create policy "customers place own COD orders" on public.orders
for insert to authenticated with check (customer_id = auth.uid() and payment_method = 'cod' and payment_status = 'pending' and status = 'placed');
create policy "admins and warehouse managers update orders" on public.orders
for update to authenticated using (public.has_role('admin') or public.has_role('warehouse_manager'))
with check (public.has_role('admin') or public.has_role('warehouse_manager'));

create policy "customers read own order items" on public.order_items
for select to authenticated using (exists (
  select 1 from public.orders o where o.id = order_id and
  (o.customer_id = auth.uid() or public.has_role('admin') or public.has_role('warehouse_manager') or public.has_role('delivery_partner'))
));
create policy "customers add items to own new order" on public.order_items
for insert to authenticated with check (exists (
  select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid() and o.status = 'placed'
));

create policy "delivery users read assigned jobs" on public.delivery_assignments
for select to authenticated using (delivery_partner_id = auth.uid() or public.has_role('admin') or public.has_role('warehouse_manager'));
create policy "admins manage delivery assignments" on public.delivery_assignments
for all to authenticated using (public.has_role('admin') or public.has_role('warehouse_manager'))
with check (public.has_role('admin') or public.has_role('warehouse_manager'));
create policy "delivery partners update assigned jobs" on public.delivery_assignments
for update to authenticated using (delivery_partner_id = auth.uid())
with check (delivery_partner_id = auth.uid());

create policy "active app releases public read" on public.app_releases
for select to anon, authenticated using (is_active = true or public.has_role('admin'));
create policy "admins manage app releases" on public.app_releases
for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
create policy "active promotions public read" on public.promotions
for select to anon, authenticated using (is_active = true or public.has_role('admin'));
create policy "admins manage promotions" on public.promotions
for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create policy "users read own referrals" on public.referrals
for select to authenticated using (referrer_user_id = auth.uid() or referred_user_id = auth.uid() or public.has_role('admin'));
create policy "users create own referrals" on public.referrals
for insert to authenticated with check (referrer_user_id = auth.uid());
create policy "users read own rewards" on public.referral_rewards
for select to authenticated using (user_id = auth.uid() or public.has_role('admin'));
create policy "admins manage rewards" on public.referral_rewards
for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

-- IMPORTANT: After your first admin account signs up, assign admin role manually
-- from the Supabase SQL Editor using the authenticated user's UUID:
-- insert into public.user_roles (user_id, role)
-- values ('YOUR-AUTH-USER-UUID', 'admin');
