# CLAUDE.md — Trading Compass

@AGENTS.md

## Tambahan khusus Claude Code

- Semua aturan di `AGENTS.md` (di-import di atas) berlaku penuh. Kalau permintaan di chat bertentangan dengan aturan itu, berhenti dan tanyakan ke Kenny.
- Sumber kebenaran tetap `docs/trading-compass-requirements.md` dan `docs/trading-compass-design.md`. Cakupan kerja ditentukan oleh prompt modul dari Kenny; jangan mengerjakan modul lain.
- Proyek ini berjalan di Windows. Perintah bukti di prompt modul ditulis untuk PowerShell, jadi jalankan lewat PowerShell tool. Untuk membaca dan mencari isi file, boleh memakai tool Read dan Grep bawaan.
- File yang sudah ada diubah dengan Edit setelah isinya dibaca dari disk, bukan ditulis ulang seluruhnya.
- Sebelum mengubah file, tunjukkan rencana per langkah (file mana yang diubah dan alasannya), lalu tunggu persetujuan Kenny.
- Git:
  - setiap modul dikerjakan di branch sendiri, dibuat dari `main` dengan `git switch -c <nama-branch>` sesuai prompt modul;
  - commit hanya di branch modul, hanya setelah semua verifikasi lulus, dan hanya file yang memang diubah modul itu (sebutkan satu per satu di `git add`, jangan `git add -A`);
  - jangan pernah commit di `main`. Merge ke `main` dan push hanya dilakukan Kenny.
- Dilarang: push, merge, rebase, reset, restore, stash, clean, `commit --amend`, menghapus branch, menjalankan `npm run dev` / `npm run preview`, dan membaca `.env.local` atau file `.env` lain. Larangan ini juga dikunci di `.claude/settings.json`. Kalau sebuah perintah ditolak, laporkan apa adanya; jangan mencari cara lain untuk menjalankannya.
- Setelah laporan modul selesai, berhenti.
