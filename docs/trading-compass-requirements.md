# Trading Compass — Requirements Specification

**Versi:** 1.12 — jadwal rilis diubah 15 Okt 2026: target selesai 23 Okt, urutan modul M9, domain dibeli setelah M9e (§5 butir 10); melengkapi v1.11 (animasi FR-AUTH-8, FR-AUTH-9, FR-THEME-4), v1.10 (konfirmasi hapus FR-JOURNAL-5, syarat password FR-AUTH-7), v1.9 (font IBM Plex Sans, FR-UI-8, FR-LOGO-3), v1.8 (glass-lite & responsif HP/tablet §3.10, FR-UI, FR-NAV-1, FR-DASH-6, FR-DASH-7, vektor S5) dan v1.7 (rilis publik).
**Status:** Siap dipakai sebagai spec definitif untuk mulai development.
**Sumber:** Diturunkan dari aplikasi lama `journal-trading-x1-supabase.html` (dianalisis langsung dari kode) + keputusan scope hasil diskusi. Dokumen ini tool-agnostic — dipakai sebagai referensi/prompt awal untuk agent AI apa pun (Antigravity, dll.), bukan format spesifik satu tool.

---

## 1. Ringkasan Produk

**Trading Compass** (sebelumnya "Ledger — Disiplin di atas Prediksi") adalah personal trading discipline dashboard yang membantu trader menghitung risiko sebelum entry, mencatat setiap trade, dan mengevaluasi kedisiplinan eksekusi dari waktu ke waktu — dibangun ulang dari single-file HTML menjadi aplikasi React profesional dengan bahasa visual terinspirasi CoinMarketCap.

- **Target pengguna:** publik — siapa pun boleh mendaftar (keputusan rilis v1.7), dengan konfirmasi email aktif; sekaligus portofolio teknis (skill: React, Supabase, product design).
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
- **FR-AUTH-2:** WHEN pengguna submit form registrasi dengan email unik dan password yang memenuhi **kebijakan password** (minimal 8 karakter, mengandung huruf kecil, huruf besar, dan angka), THE SYSTEM SHALL membuat akun baru di Supabase Auth. Validasi di client harus identik dengan pengaturan Supabase Auth (Minimum password length = 8; Password requirements = lowercase, uppercase letters and digits).
- **FR-AUTH-3:** WHEN pengguna meminta reset password, THE SYSTEM SHALL mengirim link reset via Supabase Auth.
- **FR-AUTH-6:** `signUp` mengirim `emailRedirectTo = ${window.location.origin}/` sehingga link konfirmasi email kembali ke domain tempat pengguna mendaftar (lokal maupun produksi). Jika sesi tidak langsung tersedia (konfirmasi email aktif), tampil pesan "cek email Anda" (sudah ada sejak M1).
- **FR-AUTH-3b:** WHEN pengguna membuka link reset dari email, THE SYSTEM SHALL menampilkan halaman `/reset-password` berisi form password baru (kebijakan password yang sama dengan FR-AUTH-2, dengan konfirmasi), menyimpannya via Supabase Auth, lalu mengarahkan ke Dashboard. (Tanpa halaman ini link reset tidak berguna.)
- **FR-AUTH-4:** IF sesi login valid masih ada, THEN THE SYSTEM SHALL memulihkan sesi otomatis saat halaman dimuat ulang.
- **FR-AUTH-5:** WHEN pengguna logout, THE SYSTEM SHALL menghapus sesi dan kembali ke layar Auth.
- **FR-AUTH-7 (Syarat password tampil langsung — disetujui 9 Okt 2026):** Di halaman Daftar dan `/reset-password`, di bawah field password tampil empat syarat FR-AUTH-2 (minimal 8 karakter, huruf kecil, huruf besar, angka) yang diperbarui setiap kali pengguna mengetik.
  - Syarat terpenuhi: ikon centang, warna `--sage`, teks tetap sama. Belum terpenuhi: ikon lingkaran netral, warna `--text-secondary`. Status juga tersedia sebagai teks untuk pembaca layar ("terpenuhi" / "belum terpenuhi"), tidak hanya lewat warna.
  - Di `/reset-password` ada baris tambahan "Kedua password sama" untuk field konfirmasi.
  - Daftar syarat memakai fungsi pengecek yang sama dengan validasi saat submit (satu sumber aturan), sehingga daftar dan pesan error tidak pernah berbeda. Validasi saat submit tetap berjalan seperti sekarang; tombol submit tidak dinonaktifkan.
  - Field password kosong: semua syarat tampil netral, bukan merah.
  - Vektor uji: P1 `""` → 0 dari 4 · P2 `Tradings` → panjang, huruf kecil, huruf besar terpenuhi; angka belum · P3 `trading1` → huruf besar belum · P4 `Tr1` → panjang belum · P5 `Trading1` → 4 dari 4.
- **FR-AUTH-8 (Perpindahan Masuk ↔ Daftar beranimasi — disetujui 9 Okt 2026):** WHEN pengguna berpindah antara form Masuk dan Daftar, THE SYSTEM SHALL menampilkan perpindahan beranimasi sesuai design.md §5.6 A. Tidak ada tombol login pihak ketiga (Google, LinkedIn, GitHub, Facebook).
  - ≥ 1024 px: satu kartu 960 × 560 px berisi kedua form berdampingan. Panel ungu bergeser menutupi form yang tidak aktif dalam **600 ms**. Isi panel: "Belum punya akun?" + tombol "Daftar" (saat mode Masuk), atau "Sudah punya akun?" + tombol "Masuk" (saat mode Daftar).
  - < 1024 px: satu kartu dengan tab "Masuk" | "Daftar"; indikator tab dan form bergeser dalam 450 ms.
  - Judul form sama di semua ukuran layar: "Selamat datang kembali" (Masuk) dan "Buat akun baru" (Daftar). Teks penjelas di bawahnya tidak berubah.
  - Form yang tidak aktif diberi atribut `inert` (tidak terjangkau Tab, klik, maupun pembaca layar). Setelah berpindah, fokus pindah ke field Email form yang baru tampil.
  - Routing tidak diubah: kalau Masuk dan Daftar saat ini memakai URL berbeda, tetap begitu (layout yang sama tetap ter-mount supaya animasi berjalan); kalau memakai satu URL dengan state, tetap begitu. Tidak ada route baru.
  - Tidak berubah: isi field saat berpindah, pesan error login, syarat password (FR-AUTH-7), validasi, dan panggilan Supabase. Lupa password dan `/reset-password` tetap kartu tunggal tanpa panel geser.
  - Setelah daftar berhasil (FR-AUTH-6), isi sisi Daftar diganti pesan "Cek email Anda" seperti papan Cek-Email di mockup; tombol "Kembali ke halaman masuk" memindah ke mode Masuk.
  - Jika tinggi layar lebih kecil dari kartu (mis. laptop 1366 × 768), halaman boleh di-scroll vertikal; kartu tidak terpotong.
  - Reduced motion (FR-UI-6): berpindah seketika.
  - Uji manual: daftar A1–A9 di design.md §5.6 A.
- **FR-AUTH-9 (Layar loading setelah masuk — disetujui 9 Okt 2026):** WHEN login dengan email dan password berhasil, THE SYSTEM SHALL menampilkan layar loading (design.md §5.6 B) sampai Dashboard benar-benar siap, lalu memudar dalam 240 ms ke Dashboard.
  - "Siap" = sesi tersedia, baris `user_settings` sudah di-upsert dan dibaca (tema dan bahasa sudah diterapkan), pemuatan pertama `JournalContext` selesai, dan chunk lazy halaman tujuan sudah dimuat. Tidak ada jeda buatan selain batas minimum di bawah, dan tidak ada persentase progres.
  - Setelah login: tampil seketika, **minimal 800 ms**. Saat sesi dipulihkan (reload / FR-AUTH-4, atau kembali dari link email): hanya tampil jika belum siap dalam 300 ms; sekali tampil, minimal 500 ms supaya tidak berkedip. Waktu mulai: saat login berhasil (login), atau saat layar loading pertama kali dipasang (pulih).
  - Selama fase `hidden` (300 ms pertama saat pulih), halaman di belakangnya belum ditampilkan, jadi pengguna tidak melihat Dashboard setengah jadi lalu layar loading. Selama layar loading tampil, halaman di belakangnya tidak bisa dijangkau keyboard maupun pembaca layar (`inert`).
  - Belum siap setelah 10 detik: teks berubah menjadi "Masih memuat" dan muncul tombol "Coba lagi" (memuat ulang halaman).
  - Gagal memuat: "Dashboard belum bisa dimuat" dengan tombol "Coba lagi" (memuat ulang halaman) dan "Keluar" (FR-AUTH-5). Pengguna tidak pernah terjebak di layar loading.
  - Login gagal tidak memunculkan layar loading; pesan error tetap seperti sekarang.
  - Aksesibilitas: teks status di elemen `role="status"`; pesan gagal di elemen `role="alert"` terpisah (bukan di dalam status); grafik kompas dekoratif (`aria-hidden`). Setelah layar loading hilang, fokus pindah ke judul halaman.
  - Teks mengikuti bahasa yang sedang aktif (ID/EN). Reduced motion: jarum diam menghadap utara, tanpa bar berjalan, tanpa fade.
  - Logika waktu dipisah ke fungsi murni `getBootPhase` di `src/lib/bootTiming.js` (hasil: `hidden` · `loading` · `slow` · `error` · `done`), diuji dengan vektor berikut. `now` dan `readyAt` dalam ms sejak waktu mulai; `readyAt` = waktu semua tanda siap terpenuhi (`null` jika belum). Fungsi menganggap belum siap selama `now < readyAt`, jadi vektor berlaku untuk kedua cara pengisian.

  | ID | Kasus | Hasil |
  |---|---|---|
  | B1 | login, siap di 150 | now 0 / 799 → loading · 800 → done |
  | B2 | login, siap di 1200 | 800 / 1199 → loading · 1200 → done |
  | B3 | pulih, siap di 200 | 0 / 199 → hidden · 200 → done (tidak pernah tampil) |
  | B4 | pulih, siap di 450 | 299 → hidden · 300 / 799 → loading · 800 → done |
  | B5 | pulih, siap tepat di 300 | 299 → hidden · 300 → loading · 800 → done |
  | B6 | pulih, siap di 2000 | 1999 → loading · 2000 → done |
  | B7 | login, belum siap | 9999 → loading · 10000 → slow |
  | B8 | pulih, belum siap | 299 → hidden · 10000 → slow |
  | B9 | login, siap di 12000 | 11999 → slow · 12000 → done |
  | B10 | `failed = true` (login now 100 / pulih now 50) | error |

  - Uji manual: daftar L1–L7 di design.md §5.6 B.

### 3.2 Dashboard (Ringkasan)

Dashboard memakai data yang sama dengan Jurnal (`JournalContext`) dan pengaturan yang sama dengan TopBar dan Kalkulator. Ring Skor Disiplin **tidak** ada di Dashboard (pindah ke Analytics, FR-ANA-3).

- **FR-DASH-1 (Stat grid, definisi mengikuti aplikasi lama):**
  ```
  total        = jumlah seluruh trade milik pengguna
  wins         = jumlah trade dengan pnl > 0          (pnl = 0 bukan win, tetapi tetap dihitung di total)
  winRate      = total > 0 ? Math.round(wins / total × 100) : null    (persen bulat; null tampil "—")
  revengeCount = jumlah trade dengan status = 'revenge'
  totalPnl     = Σ pnl                                 (tampil 2 desimal; warna sage jika ≥ 0, brick jika < 0)
  ```
  Satu-satunya perbedaan dari aplikasi lama: saat belum ada trade, win rate tampil "—" (aplikasi lama menampilkan "0%" yang menyesatkan).
- **FR-DASH-2 (Saldo akun):** input inline. Validasi: angka finite, 0 ≤ saldo ≤ 1e12. Disimpan ke `user_settings.balance` (dengan `updated_at`) saat **blur** atau **Enter**, dilewati jika nilainya tidak berubah. Update yang mengenai 0 baris dianggap gagal. Saat gagal: nilai kembali ke nilai tersimpan dan pesan generik tampil. Setelah tersimpan, saldo di TopBar dan nilai awal Kalkulator langsung memakai nilai baru tanpa refresh (state pengaturan dipakai bersama).
- **FR-DASH-3 (Mini heatmap):** grid bulan berjalan (zona waktu lokal) memakai aturan FR-CAL-6 yang sama persis dengan halaman Kalender. Seluruh kartu adalah satu tautan ke `/calendar`.
- **FR-DASH-4 (5 trade terakhir):** lima entri teratas dengan urutan yang sama dengan Jurnal (`trade_date desc, created_at desc, id desc`), dengan tautan ke `/journal`. Saat belum ada trade, tampil state kosong dengan tautan ke Jurnal.
- **FR-DASH-6 (Ringkasan bulan berjalan — disetujui M9):** kartu berisi P&L, win rate, dan jumlah hari trading bulan berjalan (zona waktu lokal), dihitung dengan `monthSummary` yang sama dengan halaman Kalender (FR-CAL-4), sehingga angkanya selalu identik dengan Kalender untuk bulan yang sama.
- **FR-DASH-7 (Aksi cepat — disetujui M9):** empat kartu tautan: Hitung Risiko → `/calculator`; Catat Trade → membuka form tambah trade di Jurnal (mekanisme FR-NAV-1); Lihat Kalender → `/calendar`; Analisis → `/analytics`. Setiap kartu satu elemen tautan/tombol dengan nama aksesibel.
- **FR-DASH-5 (Golden test vectors):**

  | ID | Data | Hasil |
  |---|---|---|
  | S0 | tanpa trade | total 0; winRate null ("—"); revenge 0; totalPnl 0 |
  | S1 | pnl [100, −50, 0, 25.5, −10], status [plan, revenge, plan, plan, revenge] | total 5; wins 2; winRate 40; revenge 2; totalPnl 65.5 |
  | S2 | pnl [0.1, 0.2] | totalPnl ≈ 0.30000000000000004 → tampil $0.30 (EN); winRate 100 |
  | S3 | 2 menang dari 3 | winRate 67 |
  | S4 | 1 menang dari 8 | winRate 13 (`Math.round(12.5)` = 13) |
  | S5 | data uji M5 (1 Okt +60 dan +40, 2 Okt −25 dan 0, 30 Sep +500), bulan Okt 2026 | ringkasan bulan (FR-DASH-6): P&L 75; win rate 50; hari trading 2 |

### 3.3 Kalkulator Risiko

Rumus dasar mengikuti aplikasi lama, dengan dua koreksi yang disengaja: konvensi lot (FR-CALC-2) dan pembulatan lembar saham terhadap galat floating-point (FR-CALC-3). Semua fungsi kalkulasi murni (tanpa JSX, tanpa akses jaringan) dan **tidak pernah melempar exception**: hasilnya selalu `{ ok: false, errors }` atau `{ ok: true, ... }`. Kalkulator tidak menulis apa pun ke database.

**Variabel dasar (semua mode):**
```
riskAmount = balance × (riskPercent / 100)
distance   = |entryPrice − stopLossPrice|
rrRatio    = |takeProfitPrice − entryPrice| / distance   (null jika TP tidak diisi; tampil "1 : X.XX")
```
Input yang sama dipakai bersama oleh ketiga mode (saldo, risiko %, entry, SL, TP). Mode default: Crypto.

- **FR-CALC-1 (Mode Crypto):**
  ```
  distancePercent = (distance / entryPrice) × 100
  notionalValue   = riskAmount / (distancePercent / 100)
  coinSize        = notionalValue / entryPrice
  marginRequired  = notionalValue / leverage            (leverage ≥ 1)
  ```
  WHEN `marginRequired > balance`, THE SYSTEM SHALL menampilkan peringatan margin tidak cukup (hasil tetap ditampilkan).

- **FR-CALC-2 (Mode Forex & Emas) — dikoreksi v1.3:**
  ```
  contractSize      = ukuran kontrak per 1 lot standar
                      preset Forex = 100000 unit, preset Emas (XAUUSD) = 100 oz; bisa diedit (> 0)
  positionSizeUnits = riskAmount / distance
  lotStandard       = positionSizeUnits / contractSize
  lotMini           = lotStandard × 10
  lotMicro          = lotStandard × 100
  ```
  - Preset default: Forex. Memilih preset mengisi `contractSize`; mengedit `contractSize` manual mengubah preset menjadi "Kustom".
  - THE SYSTEM SHALL menampilkan catatan: perhitungan hanya akurat untuk instrumen yang **mata uang kutipannya USD** (mis. EURUSD, GBPUSD, AUDUSD, NZDUSD, XAUUSD), dan ukuran kontrak berbeda antar broker (cek *Specification* simbol di MetaTrader).
  - Alasan koreksi: aplikasi lama memakai `/100` (benar untuk emas, salah untuk forex), sedangkan v1.2 memakai `/100000` (benar untuk forex, salah ×1000 untuk emas). Satu konstanta tidak bisa benar untuk keduanya.

- **FR-CALC-3 (Mode Saham):**
  ```
  rawShares  = riskAmount / distance
  shares     = floor(rawShares × (1 + 1e-9))   // toleransi galat floating-point
  totalValue = shares × entryPrice
  ```
  Tanpa toleransi, saldo 1000, risiko 1%, entry 100.2, SL 100.1 menghasilkan `rawShares = 99.99999999999147` sehingga `floor` memberi 99 (seharusnya 100). WHEN `shares = 0`, THE SYSTEM SHALL menampilkan pesan bahwa risiko terlalu kecil untuk 1 lembar.

- **FR-CALC-4 (Validasi):** saldo > 0; 0 < risiko % ≤ 100; entry > 0; SL > 0; entry ≠ SL; TP opsional, jika diisi > 0; leverage ≥ 1 (Crypto); `contractSize` > 0 (Forex & Emas); semua angka finite dan |nilai| ≤ 1e12. Field wajib yang masih **kosong** ditampilkan sebagai petunjuk netral ("isi saldo, risiko, entry, dan SL"); field yang **terisi tetapi tidak valid** ditampilkan sebagai error per field. Selama tidak valid, hasil tidak dihitung dan tidak terjadi crash.

- **FR-CALC-5 (Tampilan angka):** lewat `Intl.NumberFormat` sesuai bahasa aktif — uang 2 desimal (USD), lot 4 desimal, jumlah koin maks. 8 desimal, persen 2 desimal, unit maks. 4 desimal, lembar bilangan bulat, RR `1 : X.XX`.

- **FR-CALC-6 (Saldo awal):** field saldo diisi dari `user_settings.balance` satu kali setelah termuat, hanya jika field belum disentuh pengguna. Nilai di kalkulator adalah simulasi lokal dan tidak pernah ditulis balik.

- **FR-CALC-7 (Golden test vectors — wajib lolos sebagai unit test dan uji manual):**

  | ID | Mode | Saldo, risiko %, entry, SL, TP, lain | Hasil |
  |---|---|---|---|
  | V1 | Crypto | 10000, 1, 100, 98, TP 106, leverage 10 | risiko 100; jarak 2,00%; notional 5000; koin 50; margin 500; tanpa peringatan; RR 3 |
  | V2 | Crypto | 1000, 2, 60000, 59700, tanpa TP, leverage 2 | risiko 20; jarak 0,50%; notional 4000; koin 0,06666667; margin 2000; **peringatan margin**; RR null |
  | V3 | Crypto (short) | 10000, 1, 98, 100, TP 92, leverage 10 | jarak 2,04%; notional 4900; koin 50; margin 490; RR 3 |
  | V4 | Forex (100000) | 5000, 2, 1.1000, 1.0950, TP 1.1100 | unit ≈ 20000; lot 0,2000; mini 2,0000; mikro 20,0000; RR 2 |
  | V5 | Emas (100) | 5000, 1, 2350, 2340, TP 2380 | unit 5; lot 0,0500; mini 0,5000; mikro 5,0000; RR 3 |
  | V6 | Saham | 10000, 1, 50, 48 | 50 lembar; nilai 2500 |
  | V7 | Saham | 1000, 1, 100.2, 100.1 | **100 lembar** (bukan 99); nilai 10020 |
  | V8 | Saham | 100, 1, 50, 48 | 0 lembar + pesan risiko terlalu kecil |
  | V9 | Forex, kustom 5000 | 5000, 1, 30, 29.5 | unit 100; lot 0,0200; mini 0,2000; mikro 2,0000 |
  | E1 | semua | entry = SL | error di field SL |
  | E2 | semua | entry kosong | petunjuk netral, tanpa hasil |
  | E3 | semua | risiko 0 atau 150 | error di field risiko |
  | E4 | Crypto | leverage 0.5 | error di field leverage |
  | E5 | Forex & Emas | ukuran kontrak 0 | error di field ukuran kontrak |

  Ditambah tes invarian (input acak ber-seed): `koin × jarak ≈ risiko`, `margin × leverage ≈ notional`, `lot × contractSize ≈ unit`, `mini = 10 × lot`, `mikro = 100 × lot`, `lembar × jarak ≤ risiko < (lembar + 1) × jarak` (toleransi relatif 1e-9).

### 3.4 Jurnal Trading

- **FR-JOURNAL-1:** THE SYSTEM SHALL menyediakan form tambah trade dengan field: instrumen (wajib), arah (buy/sell), entry price, SL price, exit price, P&L (wajib), status eksekusi (Sesuai Rencana / Revenge Trade — **dipertahankan**), catatan (opsional).
- **FR-JOURNAL-2:** WHEN trade baru disimpan, THE SYSTEM SHALL mencatat tanggal trade sebagai tipe data `date` asli (**bukan** string hasil format lokal — lihat Temuan Teknis #5), lalu memperbarui Dashboard, Kalender, dan Analytics.
- **FR-JOURNAL-3:** THE SYSTEM SHALL menampilkan riwayat seluruh trade milik pengguna, terbaru di atas.
- **FR-JOURNAL-4:** WHEN pengguna menghapus sebuah trade, THE SYSTEM SHALL menghapusnya dari database dan memperbarui semua tampilan turunan (Dashboard/Kalender/Analytics).
- **FR-JOURNAL-5 (Konfirmasi sebelum hapus — disetujui 9 Okt 2026):** WHEN pengguna menekan tombol hapus pada sebuah trade, THE SYSTEM SHALL menampilkan dialog konfirmasi (`role="alertdialog"`) sebelum data dihapus.
  - Isi: judul "Hapus trade ini?", penjelasan bahwa trade tidak bisa dikembalikan serta Dashboard, Kalender, dan Analytics ikut diperbarui, dan ringkasan trade (instrumen, arah, tanggal, status, P&L).
  - Tombol "Batal" (fokus awal, pilihan aman) dan "Hapus trade" (latar `--brick`, teks `--on-danger`). Escape atau klik di luar dialog = Batal. Setelah dialog tertutup, fokus kembali ke tombol hapus yang memicunya.
  - Selama proses hapus berjalan, tombol "Hapus trade" nonaktif supaya permintaan tidak terkirim dua kali. Jika gagal: dialog tertutup, trade tetap ada, dan pesan error generik tampil.
  - Di bawah 768 px dialog tampil sebagai bottom sheet (FR-UI-4).
  - Uji: Batal → trade tetap ada · Escape → sama dengan Batal · konfirmasi → trade hilang dari Jurnal dan angka Dashboard, Kalender, Analytics ikut berubah tanpa reload · klik "Hapus trade" dua kali cepat → hanya satu permintaan hapus.

### 3.5 Kalender (BARU)

- **FR-CAL-1:** THE SYSTEM SHALL menampilkan grid kalender bulanan; tiap sel tanggal diwarnai berdasarkan total P&L hari itu (hijau untuk profit, merah untuk loss, netral untuk tidak ada trade), dengan intensitas warna mengikuti besaran P&L (gradasi, dikonfirmasi).
- **FR-CAL-2:** WHEN pengguna klik tanggal yang memiliki trade, THE SYSTEM SHALL membuka panel/modal berisi daftar trade pada tanggal tersebut (field sama seperti Jurnal; urutan `created_at desc, id desc`). Modal hanya untuk melihat (tanpa tambah/hapus). Tanggal tanpa trade tidak bisa diklik. Escape atau tombol tutup menutup modal dan fokus kembali ke sel tanggal.
- **FR-CAL-3:** THE SYSTEM SHALL menyediakan navigasi bulan sebelumnya/berikutnya dan tombol kembali ke bulan berjalan.
- **FR-CAL-4:** THE SYSTEM SHALL menampilkan ringkasan bulan yang sedang ditampilkan, dihitung dari trade yang `trade_date`-nya berada di bulan itu dengan definisi yang **sama** dengan FR-DASH-1: total P&L = Σ pnl; win rate = `Math.round(menang / total × 100)` dengan menang = pnl > 0 ("—" jika belum ada trade); jumlah hari trading = jumlah tanggal berbeda yang punya trade.
- **FR-CAL-5:** Hari tanpa trade SHALL ditampilkan netral, dibedakan visual dari hari dengan trade tapi P&L = 0.
- **FR-CAL-6 (Aturan grid & skala warna — dipakai bersama Kalender dan mini heatmap Dashboard, satu modul `src/lib/calendarAggregations.js`):**
  ```
  dailyPnl   : kelompokkan trade per string trade_date 'YYYY-MM-DD' (tanpa konversi zona waktu) -> { pnl, count }
  grid bulan : minggu dimulai SENIN; sel sebelum tanggal 1 dan setelah tanggal terakhir kosong; jumlah minggu 4-6
  maxAbs     : max |pnl harian| di antara hari yang punya trade pada bulan yang ditampilkan
  level hari : tidak ada trade -> 'none'
               ada trade, pnl = 0 -> 'flat' (netral + penanda, beda dari 'none')
               lainnya -> 'profit-N' / 'loss-N', N = clamp(ceil(|pnl| / maxAbs × 4), 1, 4)
  ```
  Warna: sage (profit) dan brick (loss) dengan 4 tingkat intensitas, terbaca di tema terang dan gelap. Warna bukan satu-satunya penanda (tooltip/label berisi tanggal dan P&L).

  | ID | Data | Hasil |
  |---|---|---|
  | C1 | Okt 2026 | 1 Okt = Kamis; 3 sel kosong di depan; 31 hari; 5 minggu; 1 sel kosong di belakang |
  | C2 | Feb 2027 / Feb 2028 / Nov 2026 | 4 minggu (mulai Senin) / 5 minggu, 29 hari (kabisat) / 6 minggu |
  | C3 | Okt 2026: 1 Okt pnl 60+40, 2 Okt −25, 5 Okt 0, 7 Okt 10, 8 Okt −60, 30 Sep 500 | maxAbs 100 (30 Sep tidak dihitung); 1 Okt profit-4; 2 Okt loss-1; 5 Okt flat; 7 Okt profit-1; 8 Okt loss-3; hari lain none |

- **FR-CAL-7 (Navigasi & golden test vectors halaman Kalender):** perpindahan bulan dihitung dengan aritmetika tahun-bulan (bukan objek `Date` yang digeser), sehingga Desember → Januari dan Januari → Desember berpindah tahun dengan benar. Bulan awal = bulan berjalan (lokal).

  | ID | Data / aksi | Hasil |
  |---|---|---|
  | K1 | data C3, Okt 2026 | total P&L 25; win rate 50; hari trading 5 |
  | K2 | data C3, Sep 2026 | total P&L 500; win rate 100; hari trading 1 |
  | K3 | data C3, Nov 2026 | total P&L 0; win rate "—" (null); hari trading 0 |
  | N1 | Des 2026 + 1 bulan / Jan 2026 − 1 bulan | Jan 2027 / Des 2025 |
  | N2 | Okt 2026 − 12 bulan / Okt 2026 + 15 bulan | Okt 2025 / Jan 2028 |
  | D1 | 1 Okt: trade pnl 60 dibuat lebih dulu, lalu trade pnl 40 | daftar di modal: 40, lalu 60 |

### 3.6 Analytics (BARU)

Analytics memakai data yang sama dengan Jurnal (`JournalContext`), seluruh riwayat (filter tanggal = v2). Logika di `src/lib/analyticsCalculations.js` (murni, tidak pernah throw). Halaman dimuat secara *lazy* (code-splitting) agar library chart tidak membebani muatan awal aplikasi.

- **FR-ANA-1 (Equity Curve):** satu titik per **hari trading**: P&L harian dijumlahkan (pakai `groupDailyPnl` dari FR-CAL-6), diurutkan naik berdasarkan string `trade_date`, lalu dijumlah kumulatif. Sumbu X = tanggal, sumbu Y = P&L kumulatif. Tersedia ringkasan teks (P&L akhir, jumlah hari) untuk pembaca layar.
- **FR-ANA-2 (Distribusi R-multiple):** R per trade:
  ```
  Buy:  risk = entry − sl ;  R = (exit − entry) / risk
  Sell: risk = sl − entry ;  R = (entry − exit) / risk
  Dikecualikan jika sl atau exit kosong, atau risk ≤ 0 (entry = SL, atau SL di sisi yang salah dari entry).
  Bin  = clamp(Math.round(R), −3, 5); hasil −0 dinormalkan menjadi 0.
         Label: "≤ −3R", "−2R", "−1R", "0R", "1R", "2R", "3R", "4R", "≥ 5R" (9 bin, selalu tampil walau 0).
  ```
  Pembulatan ke bilangan bulat terdekat membuat galat floating-point (mis. R = 1,9999999999999556) tetap masuk bin "2R". `Math.round` membulatkan .5 ke atas (2,5 → 3; −1,5 → −1). THE SYSTEM SHALL menampilkan jumlah trade yang dikecualikan beserta alasannya secara singkat. Trade yang dikecualikan tetap dihitung di Equity Curve dan Skor Disiplin.
- **FR-ANA-3 (Skor Disiplin — dipindah dari Dashboard):** ring gauge dengan formula identik versi lama:
  ```
  disciplinePct = round((jumlah trade status='plan' / total trade) × 100)   (null jika total 0)
  warna: ≥ 70 sage · ≥ 40 ungu aksen · < 40 brick   (ambang inklusif: 70 = sage, 40 = aksen)
  ```
  Angka persen selalu tampil sebagai teks (warna bukan satu-satunya penanda).
- **FR-ANA-4 (State kosong):** jika total trade = 0, setiap kartu menampilkan state kosong yang informatif. Jika ada trade tetapi semuanya dikecualikan dari FR-ANA-2, kartu histogram menampilkan state kosong khusus ("belum ada trade dengan SL dan exit lengkap").
- **FR-ANA-5 (Golden test vectors):**

  | ID | Data | Hasil |
  |---|---|---|
  | R1 / R2 | buy 100 / SL 95 / exit 110 · sell 100 / SL 105 / exit 90 | R 2 → bin "2R" (keduanya) |
  | R3 | buy 100 / 95 / 95 | R −1 → "−1R" |
  | R4 | buy 1.1 / 1.095 / 1.11 | R ≈ 1,9999999999999556 → "2R" |
  | R5 / R6 | buy 100 / 95 / 112.5 · buy 100 / 95 / 92.5 | R 2,5 → "3R" · R −1,5 → "−1R" |
  | R7 / R8 | buy 100 / 95 / 130 · buy 100 / 95 / 80 | R 6 → "≥ 5R" · R −4 → "≤ −3R" |
  | R9–R12 | exit kosong · buy dengan SL 101 · sell dengan SL 99 · entry = SL | dikecualikan (4 kasus) |
  | R13 | buy 100 / 95 / 97.5 | R −0,5 → "0R" (bukan −0) |
  | G1–G7 | status: [P,P,R,P] · [P,R] · [P,R,R] · 7P+3R · 2P+3R · [P,P,R] · kosong | 75 sage · 50 aksen · 33 brick · 70 sage · 40 aksen · 67 aksen · null |
  | EQ1 | data C3 (FR-CAL-6) | titik: 30 Sep 500 · 1 Okt 600 · 2 Okt 575 · 5 Okt 575 · 7 Okt 585 · 8 Okt 525 |

### 3.7 Bilingual (ID/EN)

- **FR-I18N-1:** Seluruh teks UI, termasuk string baru dari Kalender dan Analytics, SHALL tersedia dalam dua bahasa dengan struktur kamus terjemahan yang sama seperti versi lama.
- **FR-I18N-2:** Preferensi bahasa SHALL tersimpan per akun (di tabel `user_settings`, kolom `lang`).

### 3.8 Tema Light/Dark (BARU)

- **FR-THEME-1:** THE SYSTEM SHALL menyediakan toggle tema light/dark.
- **FR-THEME-2:** Warna aksen violet/ungu (`#9179d6`) SHALL konsisten dipakai di kedua tema.
- **FR-THEME-3:** Preferensi tema SHALL tersimpan per akun (tabel `user_settings`, kolom `theme`).
- **FR-THEME-4 (Transisi ganti tema — disetujui 9 Okt 2026):** WHEN pengguna menekan tombol tema, THE SYSTEM SHALL menampilkan tema baru yang terbuka melingkar dari tengah tombol tema dalam **600 ms** memakai View Transitions API (design.md §5.6 C).
  - Titik awal selalu tengah tombol, sehingga klik dan keyboard (Tab + Enter) berperilaku sama.
  - Browser tanpa View Transitions, atau reduced motion aktif: tema berganti seketika seperti sekarang, tanpa error di console.
  - Penyimpanan tema (FR-THEME-3) dan `theme-init.js` tidak berubah. Tidak ada dependency baru.
  - Fungsi murni di `src/lib/themeTransition.js`, diuji dengan vektor berikut (rect = posisi tombol: left, top, width, height; layar = lebar × tinggi viewport; r dibulatkan ke atas).

  | ID | Masukan | Hasil |
  |---|---|---|
  | T1 | `getRevealCircle` rect 1152, 26, 44, 44 · layar 1440 × 840 | x 1174, y 48, r 1417 |
  | T2 | rect 16, 16, 44, 44 · layar 390 × 844 | x 38, y 38, r 880 |
  | T3 | rect 328, 8, 44, 44 · layar 390 × 844 | x 350, y 30, r 887 |
  | T4 | `shouldAnimateTheme` View Transitions ada, reduced motion tidak | true |
  | T5 | View Transitions tidak ada | false |
  | T6 | View Transitions ada, reduced motion aktif | false |

  - Uji manual: daftar TM1–TM5 di design.md §5.6 C.

### 3.10 Tampilan & Responsif (M9 — disetujui, masuk v1)

- **FR-UI-1:** Tampilan memakai gaya **glass-lite** sesuai design.md §5.1 dan §5.5 (latar gradien bercahaya, kartu semi-transparan, blur hanya pada panel navigasi dan modal), di tema gelap maupun terang.
- **FR-UI-2 (Navigasi):** < 768 px bottom tab bar 5 menu; 768–1023 px sidebar ikon (rail); ≥ 1024 px sidebar penuh. Keluar tersedia di semua ukuran (di HP lewat menu avatar). Drawer hamburger M2 dihapus.
- **FR-UI-3:** Di bawah 768 px, daftar Jurnal tampil sebagai kartu per trade (data dan aksi sama dengan baris tabel, termasuk hapus).
- **FR-UI-4:** Di bawah 768 px, modal tampil sebagai bottom sheet; fokus tetap terkunci di dalam modal, Escape menutup, dan fokus kembali ke pemicu.
- **FR-UI-5:** Tidak ada scroll horizontal halaman pada lebar 360 px; area sentuh ≥ 44×44 px; huruf input ≥ 16 px di bawah 768 px.
- **FR-UI-6:** Jika browser tidak mendukung `backdrop-filter`, atau pengguna memilih *reduced transparency*, tampilan memakai panel solid. Jika pengguna memilih *reduced motion*, tidak ada animasi maupun transisi gerak (termasuk FR-AUTH-8, FR-AUTH-9, FR-THEME-4).
- **FR-UI-7:** M9 tidak mengubah rumus, struktur data, validasi, maupun perilaku fitur, kecuali tambahan yang disetujui 9 Okt 2026: FR-JOURNAL-5 (konfirmasi hapus), FR-AUTH-7 (syarat password tampil langsung), FR-AUTH-8 (perpindahan Masuk ↔ Daftar beranimasi), FR-AUTH-9 (layar loading setelah masuk), dan FR-THEME-4 (transisi ganti tema). Seluruh tes Vitest yang ada harus tetap lulus tanpa diubah (kecuali tes tampilan yang memang memeriksa markup layout); tes baru untuk tambahan-tambahan itu boleh ditambahkan, dan vektor B1–B10 (FR-AUTH-9) serta T1–T6 (FR-THEME-4) **wajib** ditulis sebagai tes Vitest. Jika waktu tidak cukup sebelum go/no-go, FR-THEME-4 yang pertama ditunda.
- **FR-UI-8 (Tipografi — disetujui 8 Okt 2026):** Seluruh teks memakai IBM Plex Sans sesuai design.md §5.2. Semua angka uang, persen, lot, dan jumlah di kartu dan tabel memakai `tabular-nums` sehingga digit sejajar per kolom. Space Grotesk, Inter, dan IBM Plex Mono tidak dimuat lagi (tidak ada di `index.html`, CSS, maupun komponen). Jika Google Fonts gagal dimuat, teks tetap tampil dengan font sistem (`display=swap` + fallback `system-ui`).
- **FR-NAV-1 (Tombol "Tambah Trade" global — disetujui M9):** di top bar (≥ 768 px). Menekan tombol membawa ke `/journal` dengan state router `{ openAdd: true }`; JournalPage membuka form tambah sekali, lalu membersihkan state (`navigate(..., { replace: true, state: null })`) sehingga refresh atau tombol Back tidak membuka form lagi. Jika sudah berada di `/journal`, form langsung terbuka.

### 3.9 Logo & Brand Mark (FINAL — disetujui)

- **FR-LOGO-1:** THE SYSTEM SHALL menampilkan brand mark di pojok kiri atas header pada semua halaman: ikon "Needle Mark" (bentuk kite/diamond dua-nada ungu, poros tengah) + wordmark "Trading Compass".
- **FR-LOGO-2:** Warna ikon SHALL memakai dua gradasi dari hue ungu yang sama (`#9179d6` dan `#5f4f96`) — tonal, bukan kontras tinggi — supaya konsisten di kedua tema.
- **FR-LOGO-3:** Wordmark SHALL memakai font display yang sama dengan sistem desain (IBM Plex Sans 600, fallback `system-ui`; design.md §5.2).
- Aset final: `trading-compass-logo-icon.svg` (ikon saja, untuk favicon/app-icon) dan komponen `BrandLogo` (ikon + wordmark, theme-aware).

---

## 4. Kebutuhan Non-Fungsional

| Kategori | Kebutuhan |
|---|---|
| Performa | Interaksi utama (ganti tab, hitung kalkulator) terasa instan (<100ms). Semua halaman terproteksi dimuat secara lazy; chunk JS utama < 500 kB (tanpa peringatan ukuran chunk dari Vite). Lighthouse (build produksi, mode desktop): Performance ≥ 90. Animasi (FR-AUTH-8, FR-THEME-4) mulai < 100 ms setelah klik. Jeda yang disengaja dan diterima: layar loading minimal 800 ms setelah login dan minimal 500 ms saat pulih bila sempat tampil (FR-AUTH-9); selama transisi tema (600 ms) klik tidak diproses, perilaku bawaan View Transitions (FR-THEME-4) |
| Responsif | Didukung penuh dari 360 px sampai 1920 px sesuai design.md §5.3 (HP, tablet, desktop). Diuji minimal di lebar 360, 390, 768, 1024, 1280, 1440 px dan di satu HP sungguhan |
| Aksesibilitas | Kontras warna teks minimal WCAG AA (4,5:1) di kedua tema memakai token di design.md §5.1 (sudah dihitung); seluruh form bisa dioperasikan via keyboard. Lighthouse Accessibility ≥ 95 |
| Kompatibilitas browser | Chrome, Firefox, Edge, Safari versi terbaru |
| Keamanan | RLS wajib aktif di semua tabel; kredensial Supabase sebagai environment variable (tidak di-hardcode); security headers sesuai design.md §8.1 di `vercel.json` (sumber tunggal: `security-headers.json`); validasi input sebelum kirim ke Supabase; error Supabase tidak pernah ditampilkan mentah ke UI; kebijakan password FR-AUTH-2 |
| Kualitas kode | Komponen reusable (Button, Card, Tag, dsb.), logika kalkulasi dipisah dari UI agar mudah di-unit-test |
| Deployment | Build otomatis dari GitHub ke Vercel |

---

### 4.1 Konfigurasi produksi (dikerjakan manual di dashboard, bukan oleh agent)

| Tempat | Pengaturan |
|---|---|
| Supabase → Authentication → Sign In / Providers → Email | Confirm email **ON**; Minimum password length **8**; Password requirements **lowercase, uppercase letters and digits** |
| Supabase → Authentication → Emails → SMTP Settings | SMTP kustom aktif (layanan bawaan hanya untuk development, batas kirimnya sangat kecil) |
| Supabase → Authentication → URL Configuration | Site URL = URL produksi; Redirect URLs = `https://<domain-produksi>/**` dan `http://localhost:5173/**` |
| Vercel → Project → Settings → Environment Variables | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (Production + Preview) |

Catatan: peringatan Security Advisor "Leaked Password Protection Disabled" tidak bisa ditindaklanjuti di paket Free (fitur ini khusus Pro ke atas) dan diterima sebagai risiko yang diketahui. CAPTCHA untuk pendaftaran ditunda ke v2.

## 5. Keputusan Final (sebelumnya "Asumsi & Item Terbuka")

Seluruh item di bawah sudah dikonfirmasi Anda — dicatat sebagai jejak keputusan, bukan lagi pertanyaan terbuka:

1. ✅ **Isi Dashboard pengganti ring disiplin** (FR-DASH-3, FR-DASH-4): preview mini kalender bulan berjalan + daftar 5 trade terakhir.
2. ✅ **Gaya warna Kalender** (FR-CAL-1): gradasi intensitas warna berdasarkan besaran P&L (bukan biner hijau/merah).
3. ✅ **Filter rentang tanggal di Analytics**: ditunda ke **v2**, di luar scope rilis pertama (deadline 1 bulan).
4. ✅ **Konvensi lot** (FR-CALC-2), **direvisi v1.3**: preset Forex (100.000 unit) / Emas XAUUSD (100 oz) dengan ukuran kontrak yang bisa diedit. Menggantikan keputusan sebelumnya (forex 100.000 saja) yang salah ×1000 untuk emas.
5. ✅ **Tipe data tanggal** (FR-JOURNAL-2): `trade_date` jadi kolom `date` asli, bukan string hasil `toLocaleDateString()`.
6. ✅ **Formula R-multiple di Analytics** (FR-ANA-2): dikonfirmasi dipakai sesuai rancangan.
7. ✅ **Tagline**: "Disiplin di atas Prediksi" tetap dipakai di bawah nama baru "Trading Compass".
8. ✅ **Pilihan teknis lain**: Vite (build tool), Recharts (chart), lucide-react (icon), penamaan kolom skema berbahasa Inggris — seluruhnya dikonfirmasi (menyusul Tailwind CSS & sidebar kiri yang dikonfirmasi sebelumnya).
9. ✅ **Animasi (9 Okt 2026)**: "ubah tampilan" mencakup keduanya, yaitu perpindahan Masuk ↔ Daftar (panel geser 0,6 detik, tanpa login Google/LinkedIn/GitHub/Facebook) dan ganti tema (transisi melingkar). Layar loading setelah login minimal 0,8 detik. Prototipe: kanvas mockup, halaman "Animasi".
10. ✅ **Jadwal rilis (diubah 15 Okt 2026)**: target selesai **23 Okt 2026**. Urutan M9, satu modul per sesi agent dan masing-masing di-merge sendiri: **M9a** fondasi visual (token §5.1, font FR-UI-8, FR-LOGO-3, efek kaca FR-UI-1) → **M9c** FR-JOURNAL-5 + FR-AUTH-7 → **M9b** layout responsif (FR-UI-2 s.d. FR-UI-5, FR-NAV-1, FR-DASH-6, FR-DASH-7) → **M9d** FR-AUTH-8 + FR-AUTH-9 → **M9e** FR-THEME-4. Keputusan lanjut/tunda fitur: 20 Okt; modul yang belum ter-merge saat itu pindah ke v1.1. Domain dibeli setelah M9e, lalu SMTP kustom dan konfigurasi produksi (§4.1), deploy, dan smoke test produksi.

---

## 6. Definition of Done

- [ ] Semua FR di atas terimplementasi dan lolos verifikasi manual
- [ ] Kalkulator lolos seluruh golden test vectors FR-CALC-7 (V1–V9, E1–E5) dan tes invarian, sebagai unit test maupun uji manual di UI
- [ ] RLS diverifikasi: satu akun tidak bisa melihat/mengubah data akun lain
- [ ] Responsif diverifikasi di breakpoint desktop, tablet, dan mobile
- [ ] Kedua bahasa (ID/EN) lengkap tanpa key terjemahan yang hilang
- [ ] Kedua tema (light/dark) lolos cek kontras
- [ ] Animasi FR-AUTH-8, FR-AUTH-9, FR-THEME-4 mati saat reduced motion, dan tidak ada error console di browser tanpa View Transitions
- [ ] Tes Vitest vektor B1–B10 (FR-AUTH-9) dan T1–T6 (FR-THEME-4) lulus
- [ ] Ter-deploy otomatis dari GitHub ke Vercel, environment variable terkonfigurasi (bukan hardcode)
- [ ] README repo berisi cara menjalankan project secara lokal
