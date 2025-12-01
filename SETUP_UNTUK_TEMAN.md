# 📢 UNTUK TEMAN-TEMAN YANG PULL PROJECT INI

## ⚠️ Masalah Umum: Gambar Produk Tidak Muncul & Harga Rp 0

Kalau setelah pull dan setup, gambar produk tidak muncul dan harga masih Rp 0, **ini NORMAL dan bisa diperbaiki!**

### 🔍 Penyebab:
Anda sudah pull code ✅ dan migrate ✅, tapi **lupa seed database** ❌

---

## ✅ Quick Fix (5 Menit)

```bash
cd wms_api

# 1. Seed database dengan data lengkap (price + image)
php artisan db:seed

# 2. Check hasilnya
php check_products.php

# Harus muncul:
# Total Products: 13
# Price: 150000.00 (ada angka, bukan NULL)
# Image: images/products/formula1-vanilla.jpg
# JPG files found: 13
```

Kalau masih error, baca **TROUBLESHOOTING_IMAGES.md**

---

## 📖 Complete Setup (Fresh Install)

```bash
# 1. Clone/Pull repository
git clone <repo-url>
# atau
git pull origin main

# 2. Backend setup
cd wms_api
composer install
cp .env.example .env
php artisan key:generate

# 3. Edit .env - Setup database
# DB_DATABASE=wms_database
# DB_USERNAME=root
# DB_PASSWORD=

# 4. Create database di MySQL
# Via phpMyAdmin atau:
# mysql -u root -p
# CREATE DATABASE wms_database;
# exit

# 5. Run migrations & seed
php artisan migrate
php artisan db:seed  # ← JANGAN LUPA INI!

# 6. Verify data (PENTING!)
php check_products.php
# Output harus show: 13 products dengan price & image

# 7. Start backend server
php artisan serve --host=127.0.0.1 --port=8000

# 8. Di terminal baru - Frontend setup
cd wms_fe
npm install
npm run dev

# 9. Buka browser
# http://localhost:5173
```

---

## 🧪 Test Apakah Sudah Benar

### Test 1: Backend API
Buka di browser (setelah login):
```
http://127.0.0.1:8000/api/products
```

Harus muncul JSON seperti:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Formula 1 Shake Mix - Vanilla",
      "price": 150000,
      "image": "images/products/formula1-vanilla.jpg"
    }
  ]
}
```

### Test 2: Image File
Buka di browser:
```
http://127.0.0.1:8000/images/products/formula1-vanilla.jpg
```

Harus muncul gambar produk (bukan 404).

### Test 3: Frontend
Login sebagai customer → Katalog Produk

Harus terlihat:
- ✅ Gambar produk
- ✅ Harga: Rp 150.000, Rp 180.000, dll (bukan Rp 0)
- ✅ Stok tersedia

---

## ❌ Masih Error?

Baca file ini: **TROUBLESHOOTING_IMAGES.md**

Atau tanya dengan info:
1. Screenshot output `php check_products.php`
2. Screenshot browser Console (F12)
3. Screenshot Network tab - request `/api/products`

---

## 📁 File Penting

- `PRODUCT_IMAGES_GUIDE.md` - Setup gambar produk
- `TROUBLESHOOTING_IMAGES.md` - Debug gambar tidak muncul ← **BACA INI!**
- `wms_api/check_products.php` - Script check database & files
- `README.md` - Dokumentasi project lengkap

---

## 🎓 Default Login Credentials

Setelah seed, gunakan akun ini untuk login:

**Super Admin:**
- Email: superadmin@herbalife.com
- Password: password

**Admin Cabang (Bogor):**
- Email: admin.bogor@herbalife.com
- Password: password

**Supervisor:**
- Email: supervisor@herbalife.com
- Password: password

**Customer:**
- Email: customer@example.com
- Password: password

---

Selamat mencoba! 🚀
