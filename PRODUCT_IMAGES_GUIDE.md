# 📸 Product Images & Database Setup Guide

## 🔍 Problem
Ketika teman pull repository, gambar produk tidak muncul dan harga Rp 0 karena:
1. Database tidak punya kolom `price` dan `image`
2. Seeder tidak mengisi data price dan image
3. Gambar produk belum di-commit ke Git

## ✅ Solution Applied

### Database Changes:
- ✅ Created migration: `2025_12_01_000001_add_price_and_image_to_products.php`
- ✅ Added `price` column (decimal)
- ✅ Added `image` column (string, nullable)
- ✅ Updated `ProductSeeder.php` with prices and image paths

---

## 🚀 Setup Instructions

### 📌 **IMPORTANT: Untuk teman yang baru pull, baca TROUBLESHOOTING_IMAGES.md jika gambar tidak muncul!**

### 1️⃣ **Untuk Anda (yang sudah punya gambar):**

```bash
cd wms_api

# Jalankan migration baru
php artisan migrate

# Refresh database dengan seeder baru (HATI-HATI: ini hapus data lama!)
php artisan migrate:fresh --seed

# Atau kalau mau keep data lain, update manual:
php artisan db:seed --class=ProductSeeder --force
```

### 2️⃣ **Commit & Push ke Git:**

```bash
# Dari root project
git add .
git commit -m "feat: add product price, images, and database migration"
git push origin main
```

### 3️⃣ **Untuk teman yang pull:**

```bash
# Pull latest
git pull origin main

cd wms_api

# Install dependencies (kalau belum)
composer install

# Copy .env (kalau belum)
cp .env.example .env
php artisan key:generate

# Setup database config di .env
# DB_DATABASE=nama_database
# DB_USERNAME=root
# DB_PASSWORD=

# Jalankan semua migration
php artisan migrate

# Seed database
php artisan db:seed

# Start server
php artisan serve --host=127.0.0.1 --port=8000
```

---

## 📁 Product Images Mapping

**Copy 13 gambar produk** ke folder: `wms_api/public/images/products/`

**Rename file sesuai:

   | No | Produk | SKU | Nama File |
   |----|--------|-----|-----------|
   | 1 | Formula 1 Shake Mix - Vanilla | HLF-001 | `formula1-vanilla.jpg` |
   | 2 | Tea Concentrate | HLF-002 | `tea-concentrate.jpg` |
   | 3 | Tea Concentrate - Original | HLF-003 | `tea-concentrate-original.jpg` |
   | 4 | Formula 1 Shake Mix – Dutch Chocolate | HLF-004 | `formula1-chocolate.jpg` |
   | 5 | Formula 1 Shake Mix – Wild Berry | HLF-005 | `beverage-mix-wildberry.jpg` |
   | 6 | Herbal Aloe Concentrate – Original | HLF-006 | `aloe-concentrate.jpg` |
   | 7 | Herbal Aloe Concentrate – Lemon | HLF-007 | `aloe-concentrate-lemon.jpg` |
   | 8 | Protein Drink Mix – Vanilla | HLF-008 | `protein-drink-vanilla.jpg` |
   | 9 | Multivitamin Mineral & Herbal Tablets | HLF-009 | `multivitamin-tablets.jpg` |
   | 10 | High Protein Iced Coffee | HLF-010 | `iced-coffee.jpg` |
   | 11 | Cell-U-Loss – 90 Tablets | HLF-011 | `cell-u-loss.jpg` |
   | 12 | Herbalifeline Max – 90 Capsules | HLF-012 | `herbalifeline-capsules.jpg` |
   | 13 | Protein Bars – Chocolate Peanut | HLF-013 | `protein-bars-chocolate.jpg` |

## Mapping Gambar dari Screenshot:

Berdasarkan gambar yang Anda berikan:
- Gambar 1 (Shake Vanilla) → formula1-vanilla.jpg
- Gambar 2 (Aloe Max) → aloe-concentrate.jpg
- Gambar 3 (Tea Raspberry) → tea-concentrate.jpg
- Gambar 4 (Shake Chocolate) → formula1-chocolate.jpg
- Gambar 5 (Beverage Mix Wild Berry) → beverage-mix-wildberry.jpg
- Gambar 6 (Aloe Concentrate Lemon) → aloe-concentrate-lemon.jpg
- Gambar 7 (Herbal Tea - mungkin lemon tea) → tea-concentrate-original.jpg
- Gambar 8 (Protein Drink Vanilla) → protein-drink-vanilla.jpg
- Gambar 9 (Multivitamin Tablets) → multivitamin-tablets.jpg
- Gambar 10 (Iced Coffee) → iced-coffee.jpg
- Gambar 11 (Cell-U-Loss) → cell-u-loss.jpg
- Gambar 12 (Tea duplicate - gunakan untuk Herbalifeline) → herbalifeline-capsules.jpg
- Gambar 13 (Protein Bars) → protein-bars-chocolate.jpg

---

## ✅ Verification

Setelah setup, cek di frontend:
1. Login sebagai customer
2. Buka menu **"Katalog Produk"**
3. Harus terlihat:
   - ✅ Gambar produk muncul (bukan "No Image")
   - ✅ Harga produk (bukan Rp 0)
   - ✅ Stock tersedia

---

## 🐛 Troubleshooting

### **Gambar masih "No Image"?**
```bash
# 1. Cek file gambar ada di folder
ls wms_api/public/images/products/

# 2. Cek Laravel serving
# Pastikan backend running di http://127.0.0.1:8000

# 3. Test akses gambar langsung di browser
# Buka: http://127.0.0.1:8000/images/products/formula1-vanilla.jpg
```

### **Harga masih Rp 0?**
```bash
cd wms_api

# Update products dengan truncate (HAPUS products lama!)
php artisan db:seed --class=ProductSeeder

# ATAU Fresh migration (HAPUS SEMUA DATA!)
php artisan migrate:fresh --seed
```

### **Error: "Column already exists"**
```bash
# Cek kolom sudah ada atau belum
php artisan tinker
>>> Schema::hasColumn('products', 'price')
>>> Schema::hasColumn('products', 'image')

# Kalau TRUE, skip migration atau rollback
php artisan migrate:rollback --step=1
```

### **Gambar di Git?**
```bash
# Pastikan .gitignore TIDAK ignore folder products
# File .gitignore di root sudah di-update

# Check tracking
git status
# Pastikan wms_api/public/images/products/ tracked

# Force add kalau perlu
git add -f wms_api/public/images/products/*.jpg
```

---

## 📋 What's Changed

### Files Modified/Created:
1. ✅ `wms_api/database/migrations/2025_12_01_000001_add_price_and_image_to_products.php` - NEW
2. ✅ `wms_api/database/seeders/ProductSeeder.php` - UPDATED (added price & image)
3. ✅ `.gitignore` - CREATED (allow product images)
4. ✅ `PRODUCT_IMAGES_GUIDE.md` - UPDATED

### Database Schema:
```sql
-- products table now has:
- price (decimal, default 0)
- image (string, nullable)
```

### Sample Data (ProductSeeder):
```php
[
    'sku' => 'HLF-001',
    'name' => 'Formula 1 Shake Mix - Vanilla',
    'price' => 150000.00,
    'image' => 'images/products/formula1-vanilla.jpg',
    'central_stock' => 1000,
]
```
