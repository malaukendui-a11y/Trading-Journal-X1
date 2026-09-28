# Trading Compass — Requirements Specification

**Versi:** 1.2 — final. Seluruh item Asumsi & Item Terbuka (bagian 5) sudah dikonfirmasi Anda.
**Status:** Siap dipakai sebagai spec definitif untuk mulai development.
**Sumber:** Diturunkan dari aplikasi lama `journal-trading-x1-supabase.html` (dianalisis langsung dari kode) + keputusan scope hasil diskusi. Dokumen ini tool-agnostic — dipakai sebagai referensi/prompt awal untuk agent AI apa pun (Antigravity, dll.), bukan format spesifik satu tool.

---

## 1. Ringkasan Produk

**Trading Compass** (sebelumnya "Ledger — Disiplin di atas Prediksi") adalah personal trading discipline dashboard yang membantu trader menghitung risiko sebelum entry, mencatat setiap trade, dan mengevaluasi kedisiplinan eksekusi dari waktu ke waktu — dibangun ulang dari single-file HTML menjadi aplikasi React profesional dengan bahasa visual terinspirasi CoinMarketCap.

- **Target pengguna:** Kenny sendiri (personal use), sekaligus berfungsi sebagai portofolio teknis (skill: React, Supabase, product design).
- **Nilai inti yang dipertahankan:** disiplin eksekusi di atas prediksi arah pasar — tercermin dari fitur skor disiplin & analitik plan-vs-revenge.
- **Arah visual:** simple, minimalis, fungsi di atas segalanya — inspirasi CoinMarketCap dipakai secukupnya (kejelasan tipografi & disiplin warna), bukan kepadatan visualnya. Identitas warna violet/ungu dipertahankan, dukungan tema light/dark, dan logo mark orisinal (lihat 3.9).

## 2. Ruang Lingkup

### 2.1 Dalam Lingkup (Fitur Final)

| # | Modul | Status |
|---|---|---|
| 1 | Autentikasi (Supabase Auth) | Dipertahankan |
| 2 | Dashboard (Ringkasan) | Dipertahankan, disusun ulang jadi lebih interaktif |
| 3 | Kalkulator Risiko (Crypto / Forex & Gold / Saham) | Dipertahankan, logika **identik** |
| 4 | Jurnal Trading (CRUD) | Dipertahankan |
| 5 | Kalender (heatmap P&L + detail per tanggal) | **BARU** |
| 6 | Analytics (equity curve, distribusi R:R, skor disiplin) | **BARU** |
| 7 | Bilingual ID/EN | Dipertahankan, struktur identik |
| 8 | Tema Light/Dark | **BARU** (aplikasi lama hanya dark theme) |

### 2.2 Di Luar Lingkup / Dihapus dari Versi Lama

- ❌ **Tab Checklist SMC** (2 gerbang wajib + 5 kriteria + verdict box) — dihapus sepenuhnya.
- ❌ **Status Strip** (indikator aman/cooldown di bagian atas) — dihapus sepenuhnya.
- ❌ Kalender rencana/reminder untuk trade masa depan — tidak termasuk versi ini (Kalender hanya menampilkan data historis).
- ❌ Integrasi event ekonomi eksternal (NFP, rate decision, dll.) — tidak termasuk versi ini.
- ❌ Aplikasi mobile native — hanya web responsif, prioritas desktop.
- ❌ Migrasi data lama — proyek dimulai kosong (Supabase project baru).

---

## 3. Kebutuhan Fungsional

Format: **EARS** (WHEN/IF/THE SYSTEM SHALL) — format yang sama dipakai Kiro untuk `requirements.md`.

### 3.1 Autentikasi

- **FR-AUTH-1:** WHEN pengguna submit email & password valid pada form login, THE SYSTEM SHALL mengautentikasi via Supabase Auth dan mengarahkan ke Dashboard.
- **FR-AUTH-2:** WHEN pengguna submit form registrasi dengan email unik dan password ≥ 6 karakter, THE SYSTEM SHALL membuat akun baru di Supabase Auth.
- **FR-AUTH-3:** WHEN pengguna meminta reset password, THE SYSTEM SHALL mengirim link reset via Supabase Auth.
- **FR-AUTH-4:** IF sesi login valid masih ada, THEN THE SYSTEM SHALL memulihkan sesi otomatis saat halaman dimuat ulang.
- **FR-AUTH-5:** WHEN pengguna logout, THE SYSTEM SHALL menghapus sesi dan kembali ke layar Auth.

### 3.2 Dashboard (Ringkasan)

- **FR-DASH-1:** THE SYSTEM SHALL menampilkan stat grid: total trade, win rate (%), jumlah revenge trade, total P&L — dihitung dari seluruh `journal_entries` milik pengguna.
- **FR-DASH-2:** THE SYSTEM SHALL menyediakan input saldo akun yang tersimpan per pengguna dan menjadi nilai default di Kalkulator.
- **FR-DASH-3 (dikonfirmasi):** THE SYSTEM SHALL menampilkan preview mini heatmap kalender bulan berjalan yang bisa diklik menuju tab Kalender penuh.
- **FR-DASH-4 (dikonfirmasi):** THE SYSTEM SHALL menampilkan daftar 5 trade terakhir dengan tautan ke tab Jurnal.

### 3.3 Kalkulator Risiko

Logika berikut **wajib identik** dengan versi lama (regression parity) — angka input yang sama harus menghasilkan angka output yang sama persis.

**Variabel dasar (semua mode):**
```
riskAmount = balance × (riskPercent / 100)
distance   = |entryPrice − stopLossPrice|
rrRatio    = |takeProfitPrice − entryPrice| / distance   (ditampilkan "1 : X.XX", kosong jika TP tidak diisi)
```

- **FR-CALC-1 (Mode Crypto):**
  ```
  distancePercent = (distance / entryPrice) × 100
  notionalValue   = riskAmount / (distancePercent / 100)
  coinSize        = notionalValue / entryPrice
  marginRequired  = notionalValue / leverage
  ```
  WHEN `marginRequired > balance`, THE SYSTEM SHALL menampilkan peringatan margin tidak cukup.

- **FR-CALC-2 (Mode Forex & Gold) — DIPERBAIKI ke konvensi standar, lihat Asumsi #4:**
  ```
  positionSizeUnits = riskAmount / distance
  lotStandard       = positionSizeUnits / 100000   // 1 lot standar = 100.000 unit
  lotMini           = positionSizeUnits / 10000    // 1 lot mini    = 10.000 unit
  lotMicro          = positionSizeUnits / 1000     // 1 lot mikro   = 1.000 unit
  ```
  ⚠️ Ini mengubah **ketiga** angka lot (bukan cuma mikro) dibanding versi lama, karena formula lama tidak konsisten dengan konvensi ini. Hasil kalkulator mode ini akan berbeda dari aplikasi lama — sesuai instruksi Anda untuk diperbaiki, bukan penyimpangan baru yang tidak disengaja.

- **FR-CALC-3 (Mode Saham):**
  ```
  shares     = floor(riskAmount / distance)
  totalValue = shares × entryPrice
  ```

- **FR-CALC-4:** IF `entryPrice` kosong ATAU `stopLossPrice` kosong ATAU `entryPrice == stopLossPrice`, THEN THE SYSTEM SHALL menampilkan pesan error dan tidak menghitung.

### 3.4 Jurnal Trading

- **FR-JOURNAL-1:** THE SYSTEM SHALL menyediakan form tambah trade dengan field: instrumen (wajib), arah (buy/sell), entry price, SL price, exit price, P&L (wajib), status eksekusi (Sesuai Rencana / Revenge Trade — **dipertahankan**), catatan (opsional).
- **FR-JOURNAL-2:** WHEN trade baru disimpan, THE SYSTEM SHALL mencatat tanggal trade sebagai tipe data `date` asli (**bukan** string hasil format lokal — lihat Temuan Teknis #5), lalu memperbarui Dashboard, Kalender, dan Analytics.
- **FR-JOURNAL-3:** THE SYSTEM SHALL menampilkan riwayat seluruh trade milik pengguna, terbaru di atas.
- **FR-JOURNAL-4:** WHEN pengguna menghapus sebuah trade, THE SYSTEM SHALL menghapusnya dari database dan memperbarui semua tampilan turunan (Dashboard/Kalender/Analytics).

### 3.5 Kalender (BARU)

- **FR-CAL-1:** THE SYSTEM SHALL menampilkan grid kalender bulanan; tiap sel tanggal diwarnai berdasarkan total P&L hari itu (hijau untuk profit, merah untuk loss, netral untuk tidak ada trade), dengan intensitas warna mengikuti besaran P&L (gradasi, dikonfirmasi).
- **FR-CAL-2:** WHEN pengguna klik tanggal yang memiliki trade, THE SYSTEM SHALL membuka panel/modal berisi daftar trade pada tanggal tersebut (field sama seperti Jurnal).
- **FR-CAL-3:** THE SYSTEM SHALL menyediakan navigasi bulan sebelumnya/berikutnya dan tombol kembali ke bulan berjalan.
- **FR-CAL-4:** THE SYSTEM SHALL menampilkan ringkasan bulan yang sedang ditampilkan: total P&L, win rate, jumlah hari trading.
- **FR-CAL-5:** Hari tanpa trade SHALL ditampilkan netral, dibedakan visual dari hari dengan trade tapi P&L = 0.

### 3.6 Analytics (BARU)

- **FR-ANA-1 (Equity Curve):** THE SYSTEM SHALL menampilkan grafik garis P&L kumulatif, diurutkan berdasarkan `trade_date`.
- **FR-ANA-2 (Distribusi R:R):** THE SYSTEM SHALL menampilkan grafik batang/histogram dari R-multiple realisasi tiap trade, dihitung sebagai:
  ```
  // Buy:  R = (exitPrice − entryPrice) / (entryPrice − slPrice)
  // Sell: R = (entryPrice − exitPrice) / (slPrice − entryPrice)
  ```
  ✅ Formula ini dirancang khusus untuk Analytics (data lama tidak menyimpan R-multiple realisasi) dan sudah dikonfirmasi dipakai apa adanya.
- **FR-ANA-3 (Skor Disiplin — dipindah dari Dashboard):** THE SYSTEM SHALL menampilkan ring gauge dengan formula identik versi lama:
  ```
  disciplinePct = round((jumlah trade status='plan' / total trade) × 100)
  warna: ≥70% hijau sage · ≥40% ungu aksen · <40% merah brick
  ```
- **FR-ANA-4:** IF total trade = 0, THEN seluruh chart Analytics SHALL menampilkan empty state yang informatif (bukan grafik kosong/error).

### 3.7 Bilingual (ID/EN)

- **FR-I18N-1:** Seluruh teks UI, termasuk string baru dari Kalender dan Analytics, SHALL tersedia dalam dua bahasa dengan struktur kamus terjemahan yang sama seperti versi lama.
- **FR-I18N-2:** Preferensi bahasa SHALL tersimpan per akun (di tabel `user_settings`, kolom `lang`).

### 3.8 Tema Light/Dark (BARU)

- **FR-THEME-1:** THE SYSTEM SHALL menyediakan toggle tema light/dark.
- **FR-THEME-2:** Warna aksen violet/ungu (`#9179d6`) SHALL konsisten dipakai di kedua tema.
- **FR-THEME-3:** Preferensi tema SHALL tersimpan per akun (tabel `user_settings`, kolom `theme`).

### 3.9 Logo & Brand Mark (FINAL — disetujui)

- **FR-LOGO-1:** THE SYSTEM SHALL menampilkan brand mark di pojok kiri atas header pada semua halaman: ikon "Needle Mark" (bentuk kite/diamond dua-nada ungu, poros tengah) + wordmark "Trading Compass".
- **FR-LOGO-2:** Warna ikon SHALL memakai dua gradasi dari hue ungu yang sama (`#9179d6` dan `#5f4f96`) — tonal, bukan kontras tinggi — supaya konsisten di kedua tema.
- **FR-LOGO-3:** Wordmark SHALL memakai font display yang sama dengan sistem desain (Space Grotesk, fallback Inter).
- Aset final: `trading-compass-logo-icon.svg` (ikon saja, untuk favicon/app-icon) dan komponen `BrandLogo` (ikon + wordmark, theme-aware).

---

## 4. Kebutuhan Non-Fungsional

| Kategori | Kebutuhan |
|---|---|
| Performa | Interaksi utama (ganti tab, hitung kalkulator) terasa instan (<100ms); load awal wajar untuk SPA ringan |
| Responsif | Desktop-first (breakpoint utama ≥1280px), tetap dapat dipakai di tablet/mobile |
| Aksesibilitas | Kontras warna teks minimal WCAG AA di kedua tema; seluruh form bisa dioperasikan via keyboard |
| Kompatibilitas browser | Chrome, Firefox, Edge, Safari versi terbaru |
| Keamanan | RLS wajib aktif di semua tabel; kredensial Supabase sebagai environment variable (tidak di-hardcode); security headers (CSP, X-Frame-Options) di `vercel.json`; validasi input sebelum kirim ke Supabase; error Supabase tidak pernah ditampilkan mentah ke UI |
| Kualitas kode | Komponen reusable (Button, Card, Tag, dsb.), logika kalkulasi dipisah dari UI agar mudah di-unit-test |
| Deployment | Build otomatis dari GitHub ke Vercel |

---

## 5. Keputusan Final (sebelumnya "Asumsi & Item Terbuka")

Seluruh item di bawah sudah dikonfirmasi Anda — dicatat sebagai jejak keputusan, bukan lagi pertanyaan terbuka:

1. ✅ **Isi Dashboard pengganti ring disiplin** (FR-DASH-3, FR-DASH-4): preview mini kalender bulan berjalan + daftar 5 trade terakhir.
2. ✅ **Gaya warna Kalender** (FR-CAL-1): gradasi intensitas warna berdasarkan besaran P&L (bukan biner hijau/merah).
3. ✅ **Filter rentang tanggal di Analytics**: ditunda ke **v2**, di luar scope rilis pertama (deadline 1 bulan).
4. ✅ **Formula "lot mikro"** (FR-CALC-2): diperbaiki ke konvensi forex standar — lihat formula final di FR-CALC-2.
5. ✅ **Tipe data tanggal** (FR-JOURNAL-2): `trade_date` jadi kolom `date` asli, bukan string hasil `toLocaleDateString()`.
6. ✅ **Formula R-multiple di Analytics** (FR-ANA-2): dikonfirmasi dipakai sesuai rancangan.
7. ✅ **Tagline**: "Disiplin di atas Prediksi" tetap dipakai di bawah nama baru "Trading Compass".
8. ✅ **Pilihan teknis lain**: Vite (build tool), Recharts (chart), lucide-react (icon), penamaan kolom skema berbahasa Inggris — seluruhnya dikonfirmasi (menyusul Tailwind CSS & sidebar kiri yang dikonfirmasi sebelumnya).

---

## 6. Definition of Done

- [ ] Semua FR di atas terimplementasi dan lolos verifikasi manual
- [ ] Hasil Kalkulator (3 mode) diuji dengan minimal 5 skenario input dan menghasilkan angka identik dengan versi lama
- [ ] RLS diverifikasi: satu akun tidak bisa melihat/mengubah data akun lain
- [ ] Responsif diverifikasi di breakpoint desktop, tablet, dan mobile
- [ ] Kedua bahasa (ID/EN) lengkap tanpa key terjemahan yang hilang
- [ ] Kedua tema (light/dark) lolos cek kontras
- [ ] Ter-deploy otomatis dari GitHub ke Vercel, environment variable terkonfigurasi (bukan hardcode)
- [ ] README repo berisi cara menjalankan project secara lokal
