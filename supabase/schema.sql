-- ============================================================
-- Sanyam Chashmalaya – Supabase Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────────────────────
create extension if not exists "pg_trgm";  -- full text search
create extension if not exists "unaccent"; -- accent-insensitive search

-- ─────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────
create type badge_type       as enum ('new', 'bestseller', 'limited');
create type gender_type      as enum ('men', 'women', 'kids', 'unisex');
create type frame_shape_type as enum ('aviator', 'rectangle', 'round', 'square', 'cat-eye', 'other');
create type order_status     as enum ('pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled');
create type payment_status   as enum ('pending', 'paid', 'failed', 'refunded');
create type appt_status      as enum ('pending', 'confirmed', 'completed', 'cancelled');
create type admin_role       as enum ('superadmin', 'staff');
create type lens_type        as enum ('zeroPower', 'singleVision', 'bifocal');

-- ─────────────────────────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────────────────────────
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  phone        text,
  avatar_url   text,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- ADMIN USERS
-- ─────────────────────────────────────────────────────────────
create table public.admin_users (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       admin_role default 'staff' not null,
  created_at timestamptz default now() not null
);

-- Helper function: check if current user is admin
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (select 1 from public.admin_users where id = auth.uid());
$$;

-- ─────────────────────────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────────────────────────
create table public.categories (
  id          bigint generated always as identity primary key,
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  is_active   boolean default true not null,
  sort_order  int default 0 not null,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- Seed default categories
insert into public.categories (name, slug, description, sort_order) values
  ('Frames', 'frames', 'Stylish & durable optical frames', 1),
  ('Lenses / Glasses', 'lenses', 'Prescription and reading glasses', 2),
  ('Sunglasses', 'sunglasses', 'UV-protected sunglasses', 3),
  ('Contact Lenses', 'contact-lenses', 'Daily & monthly contact lenses', 4);

-- ─────────────────────────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────────────────────────
create table public.products (
  id                  bigint generated always as identity primary key,
  name                text not null,
  slug                text not null unique,
  description         text,
  category_id         bigint references public.categories(id) on delete set null,
  price               numeric(10,2) not null check (price >= 0),
  mrp                 numeric(10,2) not null check (mrp >= 0),
  stock_qty           int default 0 not null check (stock_qty >= 0),
  is_active           boolean default true not null,
  badge               badge_type,
  gender              gender_type default 'unisex' not null,
  frame_shape         frame_shape_type,
  frame_material      text,
  lens_width_mm       numeric(5,1),
  bridge_size_mm      numeric(5,1),
  temple_length_mm    numeric(5,1),
  weight_g            numeric(5,1),
  country_of_origin   text default 'India',
  avg_rating          numeric(3,2) default 0,
  review_count        int default 0,
  search_vector       tsvector,
  created_at          timestamptz default now() not null,
  updated_at          timestamptz default now() not null
);

-- Full-text search index
create index products_search_idx on public.products using gin(search_vector);
create index products_category_idx on public.products(category_id);
create index products_active_idx on public.products(is_active);

-- Auto-update search_vector
create or replace function public.update_product_search_vector()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.frame_material, '')), 'C');
  return new;
end;
$$;

create trigger products_search_update
  before insert or update on public.products
  for each row execute procedure public.update_product_search_vector();

-- ─────────────────────────────────────────────────────────────
-- PRODUCT IMAGES
-- ─────────────────────────────────────────────────────────────
create table public.product_images (
  id          bigint generated always as identity primary key,
  product_id  bigint not null references public.products(id) on delete cascade,
  url         text not null,
  sort_order  int default 0 not null,
  is_primary  boolean default false not null,
  created_at  timestamptz default now() not null
);

create index product_images_product_idx on public.product_images(product_id);

-- ─────────────────────────────────────────────────────────────
-- PRODUCT COLOURS
-- ─────────────────────────────────────────────────────────────
create table public.product_colors (
  id          bigint generated always as identity primary key,
  product_id  bigint not null references public.products(id) on delete cascade,
  hex_code    text not null,
  label       text
);

-- ─────────────────────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────────────────────
create table public.orders (
  id                 bigint generated always as identity primary key,
  user_id            uuid references auth.users(id) on delete set null,
  status             order_status default 'pending' not null,
  payment_status     payment_status default 'pending' not null,
  razorpay_order_id  text unique,
  payment_id         text,
  subtotal           numeric(10,2) not null,
  discount_amount    numeric(10,2) default 0,
  promo_code         text,
  delivery_charge    numeric(10,2) default 0,
  total              numeric(10,2) not null,
  shipping_name      text not null,
  shipping_phone     text not null,
  shipping_address   text not null,
  shipping_pincode   text not null,
  shipping_city      text,
  shipping_state     text,
  notes              text,
  created_at         timestamptz default now() not null,
  updated_at         timestamptz default now() not null
);

create index orders_user_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);
create index orders_created_idx on public.orders(created_at desc);

-- ─────────────────────────────────────────────────────────────
-- ORDER ITEMS
-- ─────────────────────────────────────────────────────────────
create table public.order_items (
  id                bigint generated always as identity primary key,
  order_id          bigint not null references public.orders(id) on delete cascade,
  product_id        bigint references public.products(id) on delete set null,
  product_name      text not null,
  product_image_url text,
  qty               int not null check (qty > 0),
  unit_price        numeric(10,2) not null,
  lens_type         lens_type default 'zeroPower',
  addons            jsonb default '[]'::jsonb,
  prescription_url  text,
  line_total        numeric(10,2) not null
);

create index order_items_order_idx on public.order_items(order_id);

-- ─────────────────────────────────────────────────────────────
-- APPOINTMENTS
-- ─────────────────────────────────────────────────────────────
create table public.appointments (
  id               bigint generated always as identity primary key,
  user_id          uuid references auth.users(id) on delete set null,
  name             text not null,
  phone            text not null,
  email            text,
  preferred_date   date not null,
  preferred_time   text not null,
  status           appt_status default 'pending' not null,
  notes            text,
  admin_notes      text,
  created_at       timestamptz default now() not null,
  updated_at       timestamptz default now() not null
);

create index appointments_date_idx on public.appointments(preferred_date);
create index appointments_status_idx on public.appointments(status);

-- ─────────────────────────────────────────────────────────────
-- PROMO CODES
-- ─────────────────────────────────────────────────────────────
create table public.promo_codes (
  id              bigint generated always as identity primary key,
  code            text not null unique,
  discount_type   text not null check (discount_type in ('percent', 'fixed')),
  discount_value  numeric(10,2) not null,
  min_order_value numeric(10,2) default 0,
  max_uses        int,
  used_count      int default 0,
  is_active       boolean default true,
  expires_at      timestamptz,
  created_at      timestamptz default now() not null
);

-- ─────────────────────────────────────────────────────────────
-- STORE SETTINGS (key-value)
-- ─────────────────────────────────────────────────────────────
create table public.store_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz default now() not null
);

insert into public.store_settings (key, value) values
  ('store_info', '{"name":"Sanyam Chashmalaya","phone":"+91 98765 43210","email":"info@sanyamchashmalaya.com","address":"Shop No. 12, Main Market Road, New Delhi - 110054","hours":"10 AM – 9 PM (Daily)"}'),
  ('delivery', '{"free_above":1499,"standard_charge":99,"express_charge":199}'),
  ('social', '{"facebook":"","instagram":"","twitter":"","whatsapp":"919876543210"}');

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────

-- profiles
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (public.is_admin());

-- categories — public read, admin write
alter table public.categories enable row level security;
create policy "Public can read active categories" on public.categories for select using (is_active = true);
create policy "Admins full access categories" on public.categories for all using (public.is_admin());

-- products — public read, admin write
alter table public.products enable row level security;
create policy "Public can read active products" on public.products for select using (is_active = true);
create policy "Admins full access products" on public.products for all using (public.is_admin());

-- product_images — public read, admin write
alter table public.product_images enable row level security;
create policy "Public can read product images" on public.product_images for select using (true);
create policy "Admins full access product_images" on public.product_images for all using (public.is_admin());

-- product_colors — public read, admin write
alter table public.product_colors enable row level security;
create policy "Public can read colors" on public.product_colors for select using (true);
create policy "Admins full access colors" on public.product_colors for all using (public.is_admin());

-- orders — users see own, admins see all
alter table public.orders enable row level security;
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can create orders" on public.orders for insert with check (auth.uid() = user_id);
create policy "Admins full access orders" on public.orders for all using (public.is_admin());

-- order_items
alter table public.order_items enable row level security;
create policy "Users can view own order items" on public.order_items for select
  using (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));
create policy "Users can insert order items" on public.order_items for insert
  with check (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));
create policy "Admins full access order_items" on public.order_items for all using (public.is_admin());

-- appointments — users see own, admins see all
alter table public.appointments enable row level security;
create policy "Anyone can create appointment" on public.appointments for insert with check (true);
create policy "Users can view own appointments" on public.appointments for select
  using (auth.uid() = user_id or user_id is null);
create policy "Admins full access appointments" on public.appointments for all using (public.is_admin());

-- promo codes — admin only
alter table public.promo_codes enable row level security;
create policy "Admins full access promo_codes" on public.promo_codes for all using (public.is_admin());

-- store settings — public read, admin write
alter table public.store_settings enable row level security;
create policy "Public can read store settings" on public.store_settings for select using (true);
create policy "Admins can update settings" on public.store_settings for all using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- STORAGE BUCKETS
-- ─────────────────────────────────────────────────────────────
-- Run these in Supabase Dashboard > Storage > New Bucket
-- OR via API. Shown here as reference:
--
-- Bucket: product-images (public: true)
-- Bucket: prescriptions  (public: false)
-- Bucket: avatars        (public: true)
--
-- Storage policies (product-images):
-- Allow public read: (bucket_id = 'product-images')
-- Allow admin upload: (bucket_id = 'product-images' AND public.is_admin())

-- ─────────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGER (shared)
-- ─────────────────────────────────────────────────────────────
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles for each row execute procedure public.update_updated_at();
create trigger set_updated_at before update on public.categories for each row execute procedure public.update_updated_at();
create trigger set_updated_at before update on public.products for each row execute procedure public.update_updated_at();
create trigger set_updated_at before update on public.orders for each row execute procedure public.update_updated_at();
create trigger set_updated_at before update on public.appointments for each row execute procedure public.update_updated_at();
