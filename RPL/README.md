# 🏠 KostLife
> **"Your Life, Your Budget, Your Space"**  
> *Sistem Manajemen Keuangan, Tagihan, dan Jadwal Harian Khusus Anak Kos.*

---

## 🌟 Fitur Utama

1. **Autentikasi Aman & Cepat**
   - Registrasi dan Login akun berbasis HTTP-Only Cookie + JSON Web Token (JWT).
   - Dilengkapi tombol **"Gunakan Akun Demo (1-Klik)"** untuk kemudahan pengujian.
   - Proteksi rute menggunakan Next.js Middleware.

2. **Dashboard Interaktif & Real-Time**
   - **4 Kartu Ringkasan:**
     - 💰 **Total Saldo** (Akumulasi Pemasukan - Pengeluaran)
     - 📉 **Pengeluaran Bulan Ini** (Lengkap dengan komparasi pemasukan)
     - 🧾 **Tagihan Terdekat** (Status *unpaid* terdekat)
     - 📅 **Jadwal Kos Hari Ini** (Jumlah agenda hari ini)
   - **Alert Pengingat Jatuh Tempo (H-3):** Banner peringatan otomatis berwarna kuning/merah jika ada tagihan yang mendekati tanggal jatuh tempo atau lewat tempo, dilengkapi tombol cepat **"Tandai Lunas"**.
   - **Grafik Distribusi Pengeluaran:** Visualisasi donat/pie chart interaktif dari Recharts.
   - **Daftar Transaksi Terbaru** dan **Agenda Hari Ini**.

3. **Menu Keuangan (CRUD Transaksi)**
   - Form pencatatan Pemasukan (*Income*) dan Pengeluaran (*Expense*).
   - Kategori khusus anak kos: Makan, Kos, Transport, Hiburan, Belanja, Laundry, Kuota/Internet, Kiriman Ortu, Beasiswa, Freelance, dll.
   - Filter transaksi berdasarkan Tipe (*All / Income / Expense*) dan Periode Bulan.
   - Pencarian cepat (*search*) berdasarkan keterangan atau kategori.
   - Grafik komposisi pengeluaran periode aktif.
   - Aksi **Edit** dan **Hapus** transaksi dengan konfirmasi modal.

4. **Menu Tagihan (CRUD Bills)**
   - Form pencatatan tagihan (Kos, Listrik, Internet, Air, Laundry, dll).
   - Indikator visual pintar:
     - 🔴 **Merah:** Lewat jatuh tempo (*Overdue*) / Hari ini
     - 🟡 **Kuning:** Mendekati jatuh tempo (H-1 s/d H-3)
     - 🟢 **Hijau:** Sudah lunas (*Paid*)
     - ⚪ **Netral:** Tagihan mendatang aman
   - Tombol instan **"Tandai Lunas"** & **"Batalkan Lunas"** dengan pembaruan data real-time.
   - Tab filter: *Semua*, *Belum Lunas*, dan *Sudah Lunas*.
   - Aksi **Edit** dan **Hapus** tagihan.

5. **Menu Jadwal (CRUD Schedules)**
   - Pencatatan rutinitas harian anak kos lengkap dengan tanggal, jam (WIB), dan toggle pengingat (*reminder*).
   - **Template Cepat 1-Klik**: Piket Dapur Kos, Ambil/Antar Laundry, Beli Galon & Token Listrik, Bayar Uang Kos.
   - Tab filter: *Semua Jadwal*, *Hari Ini*, dan *Mendatang*.
   - Aksi **Edit** dan **Hapus** jadwal.

6. **Menu Profil & Pengaturan**
   - Informasi detail user dan statistik total aktivitas di KostLife.
   - Form ubah nama profil dan ganti password.
   - Tombol aman **Logout**.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router) dengan JavaScript (ES6+)
- **Styling:** Tailwind CSS + Lucide React (Ikon modern & minimalis)
- **Database & ORM:** MariaDB / MySQL lokal dengan Prisma ORM (`provider = "mysql"`)
- **Autentikasi:** JWT (`jose`) + `bcryptjs` + HTTP-Only Cookies
- **Visualisasi Data:** Recharts (Interactive Donut & Pie Chart)

---

## 📁 Struktur Folder Project

```text
RPL/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.js        # API login & set cookie
│   │   │   ├── logout/route.js       # API logout & clear cookie
│   │   │   ├── me/route.js           # API get current session
│   │   │   └── register/route.js     # API registrasi user baru
│   │   ├── bills/
│   │   │   ├── [id]/route.js         # API PATCH (toggle lunas) & DELETE bill
│   │   │   └── route.js              # API GET & POST bills
│   │   ├── dashboard/route.js        # API agregasi metrik dashboard
│   │   ├── profile/route.js          # API update profil & statistik user
│   │   ├── schedules/
│   │   │   ├── [id]/route.js         # API PUT & DELETE schedule
│   │   │   └── route.js              # API GET & POST schedules
│   │   └── transactions/
│   │       ├── [id]/route.js         # API PUT & DELETE transaction
│   │       └── route.js              # API GET (filter) & POST transaction
│   ├── jadwal/page.jsx               # Halaman Menu Jadwal Kos
│   ├── keuangan/page.jsx             # Halaman Menu Keuangan
│   ├── login/page.jsx                # Halaman Login
│   ├── profil/page.jsx               # Halaman Profil User
│   ├── register/page.jsx             # Halaman Registrasi
│   ├── tagihan/page.jsx              # Halaman Menu Tagihan
│   ├── globals.css                   # Tailwind base & custom styles
│   ├── layout.jsx                    # Root Layout & AuthProvider
│   └── page.jsx                      # Halaman Dashboard Utama
├── components/
│   └── LayoutShell.jsx               # Sidebar Desktop & Bottom-bar Mobile
├── context/
│   └── AuthContext.jsx               # Context State & Auth Hook
├── lib/
│   ├── auth.js                       # Enkripsi bcrypt & JWT helpers
│   ├── prisma.js                     # Prisma client singleton
│   └── utils.js                      # Helper format Rupiah & tanggal Indonesia
├── prisma/
│   ├── schema.prisma                 # Schema DB MySQL (Users, Transactions, Bills, Schedules)
│   └── seed.js                       # Seeding data dummy anak kos
├── .env                              # Environment variables lokal
├── .env.example                      # Template environment variables
├── jsconfig.json                     # Path alias configuration (@/*)
├── package.json                      # Dependency dan scripts
└── tailwind.config.js                # Konfigurasi Tailwind CSS
```

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### 1. Prasyarat
Pastikan Anda telah mengaktifkan server MariaDB / MySQL lokal:
- **XAMPP**: Buka XAMPP Control Panel lalu klik **Start** pada modul **MySQL**.
- **Laragon**: Buka Laragon lalu klik **Start All** (MySQL otomatis berjalan pada port 3306).

Buat database baru bernama `kostlife_db` di MySQL/MariaDB Anda (atau biarkan Prisma membuatnya otomatis).

### 2. Konfigurasi Environment Variables
Pastikan file `.env` sudah sesuai dengan koneksi database lokal Anda:
```env
DATABASE_URL="mysql://root:@localhost:3306/kostlife_db"
JWT_SECRET="kostlife_secret_key_super_aman_untuk_session_12345"
NEXT_PUBLIC_APP_NAME="KostLife"
```
*(Sesuaikan password jika MySQL/MariaDB Anda menggunakan password, contoh: `mysql://root:passwordmu@localhost:3306/kostlife_db`)*.

### 3. Install Dependensi
```bash
npm install
```

### 4. Sinkronisasi Schema ke MariaDB / MySQL
Jalankan perintah berikut untuk membuat tabel `users`, `transactions`, `bills`, dan `schedules`:
```bash
npx prisma db push
```

### 5. Seeding Data Dummy Awal
Isi database dengan data contoh transaksi, tagihan yang mendekati jatuh tempo (H-2), dan jadwal harian:
```bash
npx prisma db seed
```
> Atau langsung jalankan: `node prisma/seed.js`

### 6. Jalankan Server Development
```bash
npm run dev
```

Buka browser dan akses alamat:
```
http://localhost:3000
```

---

## 🔑 Akun Demo Pengujian

Saat pertama kali membuka halaman login, Anda dapat langsung mengklik tombol **"Gunakan Akun Demo (1-Klik)"** atau memasukkan kredensial berikut:

- **Email:** `anak.kos@kostlife.com`
- **Password:** `password123`
