# Trading Compass

> **Disiplin di atas Prediksi** — Personal Trading Discipline Dashboard & Risk Calculator

Trading Compass adalah aplikasi web jurnal trading personal yang dirancang untuk membantu trader menghitung risiko posisi sebelum melakukan entry pasar, mencatat transaksi secara terstruktur, dan mengevaluasi komitmen eksekusi rencana trading (*plan* vs *revenge trading*) dari waktu ke waktu.

---

## 🚀 Fitur Utama

- **Ringkasan Disiplin (Dashboard):**
  - Metrik performa inti: Total Trades, Win Rate, Revenge Trades, dan Total Net P&L.
  - Saldo akun interaktif yang tersimpan otomatis dan menjadi simulasi awal kalkulator.
  - Pratinjau mini heatmap kalender bulan berjalan dan daftar 5 trade terakhir.
- **Kalkulator Risiko Multi-Aset:**
  - **Crypto:** Perhitungan ukuran koin, *notional value*, dan margin leverage dengan deteksi peringatan margin.
  - **Forex & Emas:** Konvensi lot standar, mini, dan mikro dengan ukuran kontrak fleksibel (*contractSize*).
  - **Saham:** Perhitungan lembar saham presisi dengan toleransi galat *floating-point*.
  - Golden test vectors teruji akurat untuk seluruh instrumen.
- **Jurnal Trading:**
  - Pencatatan transaksi lengkap dengan tanggal kalender (`trade_date`), instrumen, arah (`buy`/`sell`), harga entry/SL/exit, P&L, dan status kedisiplinan (`plan`/`revenge`).
  - Validasi ketat dan konfirmasi penghapusan aman.
- **Kalender Trading:**
  - Tampilan heatmap P&L harian bulanan dengan intensitas warna bertingkat berdasarkan nominal profit/loss.
  - Dialog rincian transaksi per hari.
- **Analytics:**
  - Grafik pertumbuhan modal kumulatif (*Equity Curve*).
  - Histogram distribusi R-multiple dengan rentang tetap (-3R hingga +5R).
  - Indikator skor kedisiplinan (*Discipline Ring*) berbasis persentase eksekusi terencana.
- **Antarmuka Modern, Aksesibel, & Aman:**
  - Dukungan dwibahasa penuh: **Bahasa Indonesia (ID)** dan **English (EN)** via kamus `i18n.js`.
  - Toggle tema **Light** & **Dark** yang memenuhi rasio kontras WCAG AA (≥ 4,5:1).
  - Navigasi sidebar responsif desktop-first.

---

## 🛠 Arsitektur & Teknologi

- **Frontend:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) + [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first, design tokens di `src/styles/tokens.css`).
- **Visualisasi Data:** [Recharts](https://recharts.org/) (grafik kurva modal dan histogram R-multiple).
- **Ikonografi:** [lucide-react](https://lucide.dev/).
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL dengan Row Level Security aktif di setiap tabel).
- **Routing:** [React Router DOM v7](https://reactrouter.com/) dengan *code splitting* (*lazy loading*) untuk semua rute terproteksi.
- **Keamanan Runtime:** Single source of truth security headers (`security-headers.json`), CSP ketat tanpa skrip *inline*, proteksi clickjacking (`X-Frame-Options: DENY`), dan sanitasi input.
- **Testing:** [Vitest](https://vitest.dev/) untuk pengujian unit kalkulasi, agregasi kalender, analitik, dan validasi keamanan.

---

## 💻 Panduan Setup Lokal

### 1. Prasyarat
- [Node.js](https://nodejs.org/) versi 18 atau lebih baru.
- Akun dan project [Supabase](https://supabase.com/).

### 2. Instalasi Dependensi
```bash
git clone https://github.com/username/trading-compass.git
cd trading-compass
npm install
```

### 3. Konfigurasi Environment Variables
Salin template environment variables:
```bash
cp .env.example .env.local
```

Buka `.env.local` dan isi URL serta Publishable Key Supabase Anda:
```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

> **Keamanan Penting:** Hanya gunakan Publishable / Anon Key. **Jangan pernah** memasukkan Secret Key atau Service Role Key ke dalam lingkungan frontend.

### 4. Menjalankan Server Development
```bash
npm run dev
```
Aplikasi akan tersedia di `http://localhost:5173`.

---

## 🗄 Setup Database Supabase

Untuk menyiapkan database dari project kosong:

1. Buka dashboard proyek Anda di [Supabase](https://app.supabase.com/).
2. Masuk ke menu **SQL Editor** di sidebar kiri.
3. Buka file [`supabase/schema.sql`](supabase/schema.sql) dari repositori ini, salin seluruh isinya, lalu tempel ke SQL Editor Supabase.
4. Klik **Run** untuk mengeksekusi skrip DDL:
   - Membuat tabel `journal_entries` dan `user_settings`.
   - Mengaktifkan Row Level Security (RLS) dengan kebijakan akses data berbasis `auth.uid()`.
   - Membuat indeks komposit untuk optimasi query.
5. Konfigurasi Autentikasi di dashboard Supabase (**Authentication** → **Providers** → **Email**):
   - Aktifkan **Confirm email**.
   - Set **Minimum password length** ke `8`.
   - Aktifkan syarat password: huruf kecil, huruf besar, dan angka (*lowercase, uppercase letters and digits*).
6. Di menu **URL Configuration**, tambahkan URL domain aplikasi Anda ke **Site URL** dan **Redirect URLs** (mis. `http://localhost:5173/**` untuk pengembangan lokal).

---

## 🧪 Pengujian & Build

### Menjalankan Unit Test
```bash
npx vitest run
```
Menjalankan seluruh rangkaian tes otomatis mencakup:
- Formula kalkulator risiko dan golden test vectors (FR-CALC-7).
- Logika statistik dashboard dan agregasi kalender.
- Analisis equity curve, pembagian bin R-multiple, dan skor disiplin.
- Validasi kebijakan password baru dan pemetaan error autentikasi.
- Verifikasi keselarasan security headers antara `security-headers.json` dan `vercel.json`.

### Build untuk Produksi
```bash
npm run build
```
Menghasilkan aset statis yang dioptimasi di direktori `dist/` dengan pemisahan chunk terisolasi di bawah 500 kB.

### Preview Build Produksi Lokal
```bash
npm run preview
```
Menjalankan server preview dengan header keamanan runtime yang aktif di `http://localhost:5173`.

---

## 🚀 Panduan Deployment ke Vercel

1. Buat repository baru di GitHub dan lakukan push branch proyek Anda.
2. Buka dashboard [Vercel](https://vercel.com/) lalu klik **Add New** → **Project**.
3. Import repository GitHub Trading Compass.
4. Pada bagian **Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL`: URL project Supabase Anda.
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: Publishable key Supabase Anda.
5. Biarkan framework preset default (**Vite**), lalu klik **Deploy**.
6. Konfigurasi [`vercel.json`](vercel.json) di root repository secara otomatis menangani:
   - SPA rewrite ke `/index.html`.
   - HTTP Security Headers runtime identik dengan `security-headers.json`.

---

## 📄 Lisensi
Hak Cipta © 2026 Kenny. Seluruh hak cipta dilindungi undang-undang.

