-- Run in Supabase SQL Editor. Review before production.
create extension if not exists pgcrypto;
create table if not exists public.bookings (
 id uuid primary key default gen_random_uuid(),
 reference text not null unique default ('NZ-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
 customer_name text not null,
 phone text not null,
 email text,
 court text not null check (court in ('Court A','Court B')),
 booking_date date not null,
 start_time time not null,
 end_time time not null,
 duration_hours integer not null check (duration_hours between 1 and 18),
 total_amount numeric(10,2) not null check (total_amount >= 0),
 payment_method text not null default 'QR_TRANSFER',
 payment_status text not null default 'PENDING_VERIFICATION' check (payment_status in ('PENDING_VERIFICATION','PAID','REJECTED','REFUNDED')),
 booking_status text not null default 'PENDING' check (booking_status in ('PENDING','CONFIRMED','CANCELLED','COMPLETED','NO_SHOW')),
 payment_proof_path text not null,
 notes text,
 created_at timestamptz not null default now(),
 constraint valid_time check (end_time > start_time)
);
alter table public.bookings enable row level security;

-- Public customers can create booking requests, but cannot read personal booking data.
-- Public insert is constrained by column checks above; use a server-side RPC/function
-- for production-grade rate verification and atomic overlap prevention.
create policy "Anyone can submit booking request"
 on public.bookings for insert to anon, authenticated with check (booking_status='PENDING' and payment_status='PENDING_VERIFICATION');

-- Only authenticated admins should read/update bookings. Configure admin access using
-- Supabase Auth + an admin role/allowlist policy before exposing /admin.
-- Do not enable broad authenticated access in production.

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('payment-proofs','payment-proofs',false,5242880,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;

-- IMPORTANT: Keep the bucket private. Add storage policies for authorized admins.
-- Add a secure server-side booking RPC with an exclusion constraint/transaction to
-- prevent overlaps, and validate server-side prices before accepting real bookings.
