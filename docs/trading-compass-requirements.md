# Trading Compass — Requirements Specification

**Versi:** 1.6 — Analytics: equity curve harian, bin histogram R-multiple, ambang skor disiplin, state kosong, golden vectors (FR-ANA-1..5); melengkapi v1.5 (Kalender), v1.4 (Dashboard), dan v1.3 (FR-CALC).
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
- **FR-AUTH-3b:** WHEN pengguna membuka link reset dari email, THE SYSTEM SHALL menampilkan halaman `/reset-password` berisi form password baru (≥ 6 karakter, dengan konfirmasi), menyimpannya via Supabase Auth, lalu mengarahkan ke Dashboard. (Tanpa halaman ini link reset tidak berguna.)
- **FR-AUTH-4:** IF sesi login valid masih ada, THEN THE SYSTEM SHALL memulihkan sesi otomatis saat halaman dimuat ulang.
- **FR-AUTH-5:** WHEN pengguna logout, THE SYSTEM SHALL menghapus sesi dan kembali ke layar Auth.

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
- **FR-DASH-5 (Golden test vectors):**

  | ID | Data | Hasil |
  |---|---|---|
  | S0 | tanpa trade | total 0; winRate null ("—"); revenge 0; totalPnl 0 |
  | S1 | pnl [100, −50, 0, 25.5, −10], status [plan, revenge, plan, plan, revenge] | total 5; wins 2; winRate 40; revenge 2; totalPnl 65.5 |
  | S2 | pnl [0.1, 0.2] | totalPnl ≈ 0.30000000000000004 → tampil $0.30 (EN); winRate 100 |
  | S3 | 2 menang dari 3 | winRate 67 |
  | S4 | 1 menang dari 8 | winRate 13 (`Math.round(12.5)` = 13) |

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
4. ✅ **Konvensi lot** (FR-CALC-2), **direvisi v1.3**: preset Forex (100.000 unit) / Emas XAUUSD (100 oz) dengan ukuran kontrak yang bisa diedit. Menggantikan keputusan sebelumnya (forex 100.000 saja) yang salah ×1000 untuk emas.
5. ✅ **Tipe data tanggal** (FR-JOURNAL-2): `trade_date` jadi kolom `date` asli, bukan string hasil `toLocaleDateString()`.
6. ✅ **Formula R-multiple di Analytics** (FR-ANA-2): dikonfirmasi dipakai sesuai rancangan.
7. ✅ **Tagline**: "Disiplin di atas Prediksi" tetap dipakai di bawah nama baru "Trading Compass".
8. ✅ **Pilihan teknis lain**: Vite (build tool), Recharts (chart), lucide-react (icon), penamaan kolom skema berbahasa Inggris — seluruhnya dikonfirmasi (menyusul Tailwind CSS & sidebar kiri yang dikonfirmasi sebelumnya).

---

## 6. Definition of Done

- [ ] Semua FR di atas terimplementasi dan lolos verifikasi manual
- [ ] Kalkulator lolos seluruh golden test vectors FR-CALC-7 (V1–V9, E1–E5) dan tes invarian, sebagai unit test maupun uji manual di UI
- [ ] RLS diverifikasi: satu akun tidak bisa melihat/mengubah data akun lain
- [ ] Responsif diverifikasi di breakpoint desktop, tablet, dan mobile
- [ ] Kedua bahasa (ID/EN) lengkap tanpa key terjemahan yang hilang
- [ ] Kedua tema (light/dark) lolos cek kontras
- [ ] Ter-deploy otomatis dari GitHub ke Vercel, environment variable terkonfigurasi (bukan hardcode)
- [ ] README repo berisi cara menjalankan project secara lokal
