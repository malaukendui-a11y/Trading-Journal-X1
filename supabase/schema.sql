-- ============================================================
-- Trading Compass — Database Schema & Security Definition
-- Sumber: docs/trading-compass-design.md §4
--
-- Skrip DDL lengkap untuk inisialisasi database Supabase baru.
-- Jalankan skrip ini langsung di SQL Editor dashboard Supabase.
-- ============================================================

-- 1. Tabel journal_entries (Pencatatan Riwayat Transaksi Trading)
create table if not exists journal_entries (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  trade_date date not null,
  instrument text not null,
  direction text not null check (direction in ('buy','sell')),
  entry_price numeric,
  sl_price numeric,
  exit_price numeric,
  pnl numeric not null,
  status text not null check (status in ('plan','revenge')),
  note text,
  created_at timestamptz not null default now()
);

-- Aktifkan Row Level Security (RLS) pada journal_entries
alter table journal_entries enable row level security;

-- Policy kepemilikan data: pengguna hanya dapat mengakses dan memanipulasi datanya sendiri
create policy "journal_entries_owner_access"
  on journal_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Indeks komposit performa filter/agregasi per user dan trade_date
create index if not exists idx_journal_entries_user_date
  on journal_entries (user_id, trade_date);


-- 2. Tabel user_settings (Preferensi Akun & Saldo Pengguna)
create table if not exists user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text default 'Trader',
  balance numeric not null default 0,
  lang text not null default 'id' check (lang in ('id','en')),
  theme text not null default 'dark' check (theme in ('light','dark')),
  updated_at timestamptz not null default now()
);

-- Aktifkan Row Level Security (RLS) pada user_settings
alter table user_settings enable row level security;

-- Policy kepemilikan pengaturan: pengguna hanya dapat membaca dan mengubah preferensinya sendiri
create policy "user_settings_owner_access"
  on user_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
