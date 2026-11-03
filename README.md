# MoneyTrack - Personal Finance Tracker

Aplikasi manajemen keuangan pribadi yang modern dan profesional.

## ✨ Fitur

- **Dashboard** - Statistik keuangan real-time dengan grafik interaktif
- **Transaksi** - Catat pemasukan dan pengeluaran dengan kategori
- **Budget** - Atur anggaran bulanan per kategori
- **Target Tabungan** - Buat dan pantau progress tabungan
- **Laporan** - Analisis keuangan harian, mingguan, bulanan, tahunan
- **Kategori** - Kelola kategori income/expense
- **Settings** - Profil, tema light/dark, notifikasi
- **Auth** - Login dan register (siap integrasi Supabase)

## 🚀 Cara Test Aplikasi

### 1. Install Dependencies
```bash
cd D:/HERMES-TEST/moneytrack
npm install
```

### 2. Jalankan Development Server
```bash
npm run dev
```
Aplikasi akan berjalan di: **http://localhost:3000**

### 3. Build Production (Opsional)
```bash
npm run build
npm start
```

## 📱 Halaman yang Tersedia

- `/` - Redirect ke dashboard
- `/login` - Halaman login
- `/register` - Halaman register
- `/dashboard` - Dashboard utama dengan statistik dan grafik
- `/transactions` - Manajemen transaksi (CRUD + filter + pagination)
- `/categories` - Manajemen kategori
- `/budgets` - Manajemen anggaran bulanan
- `/savings-goals` - Target tabungan
- `/reports` - Laporan dan analisis
- `/settings` - Pengaturan profil dan tema

## 🎨 Teknologi

- Next.js 15, TypeScript, Tailwind CSS, Recharts, Supabase (ready), Lucide React

## 📝 Catatan Test

- Semua fitur menggunakan **dummy data** (hilang saat refresh)
- Untuk data persisten: setup Supabase dan ubah API calls
- Login/Register: saat ini hanya UI, console.log saat submit
- Dark mode: klik icon di header untuk toggle
