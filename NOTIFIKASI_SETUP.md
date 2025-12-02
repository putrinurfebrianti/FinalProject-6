# Setup Sistem Notifikasi

## Cara Kerja Notifikasi

Sistem notifikasi menggunakan **Laravel Queue** dengan listener yang dijalankan secara asynchronous. Event seperti pembuatan order, inbound, outbound, report, dll akan memicu notifikasi yang dikirim ke user terkait.

## Persyaratan

Queue worker **HARUS** berjalan agar notifikasi dapat diproses dan disimpan ke database.

## Cara Menjalankan

### Option 1: Menggunakan composer dev script (RECOMMENDED)

Dari folder `wms_api`, jalankan:

```bash
composer run dev
```

Script ini akan menjalankan:
- Laravel server (port 8000)
- Queue worker (memproses notifikasi)
- Pail logs (monitoring real-time)
- Vite dev server (untuk assets)

### Option 2: Manual (per service)

Buka 3 terminal terpisah:

**Terminal 1 - Laravel Server:**
```bash
cd wms_api
php artisan serve --host=127.0.0.1 --port=8000
```

**Terminal 2 - Queue Worker:**
```bash
cd wms_api
php artisan queue:work --tries=3
```

**Terminal 3 - Frontend:**
```bash
cd wms_fe
npm run dev
```

## Cara Mengecek Notifikasi

### Via Tinker
```bash
php artisan tinker
>>> App\Models\Notification::count()
>>> App\Models\Notification::latest()->take(5)->get()
```

### Via API
GET `http://127.0.0.1:8000/api/notifications`

Header: `Authorization: Bearer {your_token}`

### Via Frontend
Buka halaman `/notifications` setelah login.

## Troubleshooting

### Notifikasi tidak muncul?

1. **Pastikan queue worker berjalan:**
   ```bash
   php artisan queue:work
   ```

2. **Cek apakah ada job di queue:**
   ```bash
   php artisan tinker
   >>> DB::table('jobs')->count()
   ```

3. **Proses job yang tertunda:**
   ```bash
   php artisan queue:work --stop-when-empty
   ```

4. **Cek failed jobs:**
   ```bash
   php artisan queue:failed
   ```

### Event tidak memicu notifikasi?

1. **Pastikan event listener terdaftar di `EventServiceProvider`:**
   - File: `app/Providers/EventServiceProvider.php`
   - Cek array `$listen`

2. **Test manual trigger notifikasi:**
   ```php
   php artisan tinker
   >>> event(new App\Events\NotificationEvent([1], null, 'test', ['message' => 'Test notification']));
   ```

## Events yang Memicu Notifikasi

### Notifikasi Branch-Specific (Hanya ke Cabang Terkait)

- **`OrderCreated`** - Customer membuat order
  - Diterima oleh: Admin cabang tujuan + Superadmin + Customer (konfirmasi)
  - Contoh: Order ke Bogor → hanya Admin Bogor yang dapat notif

- **`InboundCreated`** - Superadmin mengirim inbound
  - Diterima oleh: Admin cabang tujuan + Superadmin
  - Contoh: Inbound ke Bandung → hanya Admin Bandung yang dapat notif

- **`OutboundCreated`** - Admin membuat outbound
  - Diterima oleh: Superadmin + Admin lain di cabang yang sama (exclude pembuat)
  - Contoh: Admin Bogor A buat outbound → Admin Bogor B dapat notif, Admin Bandung tidak

- **`ReportCreated`** - Admin generate laporan
  - Diterima oleh: Supervisor cabang yang sama + Superadmin
  - Contoh: Admin Bogor buat report → Supervisor Bogor dapat notif, Supervisor Bandung tidak

- **`ReportVerified`** - Supervisor verifikasi laporan
  - Diterima oleh: Admin pembuat report + Superadmin

### Notifikasi Global

- **`ProductCreated/Updated/Deleted`** - Manajemen produk
  - Diterima oleh: Superadmin saja (produk adalah global)

- **`BranchCreated`** - Cabang baru dibuat
  - Diterima oleh: Superadmin saja

- **`BranchUpdated/Deleted`** - Informasi cabang diupdate/dihapus
  - Diterima oleh: Superadmin + Admin & Supervisor cabang yang terpengaruh

- **`UserRegistered/Updated/Deleted`** - Manajemen user
  - Diterima oleh: Superadmin + Admin & Supervisor dari cabang yang sama (exclude user itu sendiri)

## Format Notifikasi

Setiap notifikasi memiliki:
- `user_id` - penerima notifikasi
- `actor_id` - user yang melakukan aksi (nullable)
- `type` - jenis notifikasi (order_created, inbound_created, dll)
- `data` - data tambahan dalam format JSON
- `is_read` - status baca (boolean)
- `created_at` / `updated_at` - timestamp

## Development Tips

### Running queue worker saat development

Gunakan `queue:listen` untuk auto-reload saat code berubah:
```bash
php artisan queue:listen
```

### Monitoring queue jobs

Gunakan Laravel Pail untuk melihat logs real-time:
```bash
php artisan pail
```

### Clear queue (jika perlu)

```bash
php artisan queue:flush
```
