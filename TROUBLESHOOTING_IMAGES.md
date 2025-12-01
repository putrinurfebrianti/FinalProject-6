# 🔍 Diagnostic Guide - Product Images Not Showing

## Issue
Gambar produk tidak muncul dan harga Rp 0, padahal:
- ✅ Kolom `price` dan `image` sudah ada di database
- ✅ File gambar sudah ada di `public/images/products/`
- ✅ Code sudah di-pull dari Git

## 🚨 Kemungkinan Penyebab

### 1. **Database Belum Di-Seed dengan Data Baru**
Teman Anda mungkin:
- Pull code ✅
- Jalankan `migrate` ✅
- **TAPI TIDAK jalankan `db:seed`** ❌

Akibatnya: Table `products` kosong atau isi data lama (tanpa price & image).

### 2. **Migration Tidak Jalan (Kolom Tidak Ada)**
Kalau teman Anda sudah pernah migrate sebelumnya, migration baru tidak otomatis jalan.

### 3. **Backend Tidak Running / Port Salah**
Frontend expect backend di `http://127.0.0.1:8000`, tapi backend running di port lain atau tidak jalan.

---

## ✅ Solution untuk Teman Anda

### **Jalankan Script Diagnostic Ini:**

```bash
cd wms_api
php check_products.php
```

**Output yang BENAR harus seperti ini:**

```
=== PRODUCT DATABASE CHECK ===

Total Products: 13

Product ID: 1
  SKU: HLF-001
  Name: Formula 1 Shake Mix - Vanilla
  Price: 150000.00                    # ← HARUS ADA ANGKA
  Image: images/products/formula1-vanilla.jpg  # ← HARUS ADA PATH
  Stock: 1000

=== IMAGE FILES CHECK ===

JPG files found: 13
  - formula1-vanilla.jpg
  - aloe-concentrate.jpg
  ... (13 files)
```

### **Kalau Output Salah:**

#### ❌ **"Total Products: 0"**
```bash
cd wms_api
php artisan db:seed --class=ProductSeeder
```

#### ❌ **"Price: NULL/0" atau "Price: 0.00"**
```bash
cd wms_api

# Cek kolom ada atau tidak
php artisan tinker
>>> Schema::hasColumn('products', 'price')
>>> Schema::hasColumn('products', 'image')
>>> exit

# Kalau FALSE (kolom tidak ada):
php artisan migrate

# Kalau TRUE tapi data kosong:
php artisan db:seed --class=ProductSeeder
```

#### ❌ **"JPG files found: 0"**
Gambar tidak ada! Harus copy manual atau pull ulang dengan:
```bash
git pull origin main
# Pastikan gambar ada di wms_api/public/images/products/
```

---

## 🌐 Check Frontend API Call

Buka browser → Developer Tools (F12) → Console

Login sebagai customer → Buka "Katalog Produk"

**Cek di Console:**
- ❌ Error 404 → Backend tidak jalan atau port salah
- ❌ Error 500 → Ada error di backend (cek `storage/logs/laravel.log`)
- ✅ Response 200 → Cek isi data di Network tab

**Cek di Network tab:**
1. Klik request ke `/api/products`
2. Lihat Response:
   ```json
   {
     "data": [
       {
         "id": 1,
         "name": "Formula 1 Shake Mix - Vanilla",
         "price": 150000,          // ← HARUS ADA
         "image": "images/products/formula1-vanilla.jpg"  // ← HARUS ADA
       }
     ]
   }
   ```

Kalau `price: 0` atau `image: null` → **Database belum di-seed!**

---

## 🔧 Complete Setup untuk Teman (Fresh Install)

```bash
# 1. Pull latest
git pull origin main

# 2. Install dependencies
cd wms_api
composer install

# 3. Setup .env
cp .env.example .env
php artisan key:generate

# Edit .env:
# DB_DATABASE=wms_database
# DB_USERNAME=root
# DB_PASSWORD=

# 4. Create database (via phpMyAdmin atau mysql)
# CREATE DATABASE wms_database;

# 5. Migrate & Seed
php artisan migrate
php artisan db:seed

# 6. Check data (PENTING!)
php check_products.php

# 7. Start backend
php artisan serve --host=127.0.0.1 --port=8000

# Di terminal lain (frontend):
cd ../wms_fe
npm install
npm run dev
```

---

## 🎯 Quick Test

### Test 1: Image File Accessible?
Buka di browser:
```
http://127.0.0.1:8000/images/products/formula1-vanilla.jpg
```

✅ Harus muncul gambar produk
❌ Kalau 404 → File tidak ada atau backend tidak jalan

### Test 2: API Response?
Buka di browser (login dulu):
```
http://127.0.0.1:8000/api/products
```

✅ Harus muncul JSON dengan price dan image
❌ Kalau kosong atau null → Database belum di-seed

### Test 3: Frontend Display?
Login sebagai customer → "Katalog Produk"

✅ Gambar muncul, harga Rp 150.000 dst
❌ "No Image" & Rp 0 → Cek step 1 & 2

---

## 📋 Checklist untuk Teman

- [ ] Pull latest code: `git pull origin main`
- [ ] Install composer: `composer install`
- [ ] Copy .env: `cp .env.example .env`
- [ ] Generate key: `php artisan key:generate`
- [ ] Setup database di .env
- [ ] Migrate: `php artisan migrate`
- [ ] **SEED DATABASE:** `php artisan db:seed` ← **INI YANG SERING LUPA!**
- [ ] Check data: `php check_products.php`
- [ ] Cek 13 JPG files ada di `public/images/products/`
- [ ] Start backend: `php artisan serve --host=127.0.0.1 --port=8000`
- [ ] Start frontend: `npm run dev`
- [ ] Test di browser: http://localhost:5173

---

## 🐛 Masih Error?

**Kirim screenshot dari:**
1. Output `php check_products.php`
2. Browser Console (F12 → Console tab)
3. Network tab - Request `/api/products`
4. File `storage/logs/laravel.log` (baris terakhir)

**Dan info:**
- OS: Windows/Mac/Linux?
- PHP Version: `php -v`
- Laravel serve running di port berapa?
- Frontend dev server running di port berapa?
