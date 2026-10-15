# Trading Compass — Aturan untuk Agent AI

Project: aplikasi web jurnal & disiplin trading (React + Vite + Tailwind v4 + Supabase), dideploy ke Vercel.
Pemilik: Kenny. Balas selalu dalam **Bahasa Indonesia** (nama variabel/kode tetap Inggris).

## Sumber kebenaran
- `docs/trading-compass-requirements.md` = APA yang dibangun (fitur, formula, acceptance criteria).
- `docs/trading-compass-design.md` = BAGAIMANA membangunnya (stack, skema DB, token, struktur folder).
- Kalau dua dokumen bertentangan dengan kondisi kode sekarang atau dengan aturan ini: **berhenti dan tanya**, jangan memilih sendiri.
- Jangan menambah fitur di luar requirements. Fitur "v2" (filter tanggal Analytics, dsb.) TIDAK dikerjakan.

## Fitur yang sengaja DIHAPUS (jangan dibuat ulang)
Checklist SMC (tab gerbang + kriteria + verdict) dan Status Strip.

## Stack & aturan teknis
- JavaScript + JSX (bukan TypeScript). Pakai versi React bawaan template; jangan downgrade.
- **Tailwind CSS v4, CSS-first.** Jangan buat `tailwind.config.js` atau `postcss.config.js`. Token di `src/styles/tokens.css`, entry di `src/index.css`, dark mode lewat class `.dark` di `<html>`.
- Dependency yang BOLEH: react, react-dom, react-router-dom, @supabase/supabase-js, recharts, lucide-react, tailwindcss, @tailwindcss/vite, vitest (dev). Paket lain: minta izin dulu (prioritas project = cepat & ringan).
- Struktur folder & nama file mengikuti bagian 3 design.md. Logika kalkulasi murni di `src/lib/*.js` (tanpa JSX) supaya bisa di-unit-test.
- Sidebar kiri untuk navigasi desktop; desktop-first, lalu responsif ke tablet/mobile.
- UI dua bahasa ID/EN: semua teks lewat kamus di `src/lib/i18n.js`, tidak ada string UI hardcoded.
- Desain simple & minimalis; fungsi di atas dekorasi. Pakai `BrandLogo.jsx` untuk logo (jangan didesain ulang).

## Keamanan (wajib)
- Supabase client hanya memakai `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY`. **Jangan pernah** memakai/menulis secret key atau service_role key.
- Jangan membaca, menampilkan, atau meng-commit isi `.env.local`. Jangan hardcode kredensial.
- RLS sudah aktif di database; semua query mengandalkan `auth.uid()`. Jangan menonaktifkan RLS.
- Error mentah dari Supabase tidak boleh tampil di UI (petakan ke pesan aman).
- Validasi input di client sebelum kirim ke Supabase.

## Akurasi formula (paling kritis)
- Rumus Kalkulator (FR-CALC-1..7) dan skor disiplin harus PERSIS seperti di requirements.md: konvensi lot memakai `contractSize` (preset Forex 100.000 / Emas 100 oz, bisa diedit), dan lembar saham memakai `floor(raw × (1 + 1e-9))`. Golden test vectors FR-CALC-7 wajib ada sebagai tes.
- Fungsi kalkulasi tidak pernah melempar exception: kembalikan `{ ok: false, errors }` atau `{ ok: true, ... }`.
- Untuk setiap fungsi kalkulasi, tulis unit test (Vitest) dengan minimal 5 skenario input/output.
- Kolom tanggal jurnal = `trade_date` bertipe `date`, bukan string terformat.

## Cara kerja
- Kerjakan **satu modul per permintaan**, lalu BERHENTI dan ringkas apa yang berubah + cara mengetesnya. Jangan lanjut ke modul berikutnya tanpa diminta.
- Sebelum menjalankan perintah terminal yang mengubah banyak hal (install paket, hapus file, git), jelaskan dulu alasannya.
- Git (berlaku mulai M9): agent membuat branch modul dari `main` dengan `git switch -c <nama-branch>` dan boleh commit di branch itu setelah semua verifikasi lulus (setiap commit disetujui Kenny). Merge ke `main` dan push hanya dilakukan Kenny. Jangan menjalankan `git push`, `git push --force`, `git merge`, `git rebase`, atau `git reset`.
- Jangan mengubah file di luar cakupan modul yang sedang dikerjakan.
- JANGAN menjalankan `npm run dev` atau server jangka panjang apa pun. Hanya Kenny yang menjalankan dev server. Untuk verifikasi pakai `npm run build` dan `npx vitest run`.
- DILARANG memakai aksi create/write-file pada path yang SUDAH ADA. Di M1, M3, M4, dan M5, setiap file yang sudah ada lalu ditulis dengan aksi "Created" tidak bertahan di disk (kembali ke versi lama atau rusak), sedangkan file yang "Edited" bertahan. Untuk file yang sudah ada SELALU pakai aksi edit, walaupun seluruh isinya berubah. Baca dulu isi terbaru dari disk dan pertahankan semua perilaku modul sebelumnya.
- Setelah mengubah file yang sudah ada, buktikan isinya di disk dengan `Select-String` atau `Get-Content` pada pola yang khas dari perubahan itu, dan tempel output-nya di laporan.
- Selain `git switch -c`, `git add`, dan `git commit` di branch modul, perintah git hanya yang read-only (`status`, `diff`, `log`, `show`, `grep`, `branch --show-current`). Jangan `restore`, `reset`, `stash`, `clean`, `merge`, `rebase`, `push`, `commit --amend`, menghapus branch, atau commit di `main`.
- Kalau hasil verifikasi tidak cocok dengan dugaan awal, katakan apa adanya dan tunjukkan buktinya (isi file, output perintah). Jangan menebak penyebab lalu mengklaimnya sebagai fakta.
