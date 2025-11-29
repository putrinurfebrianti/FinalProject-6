# Script untuk copy gambar produk
# Ganti path ini dengan folder tempat Anda download gambar dari Pinterest
$sourceFolder = "C:\Users\admin\Downloads"

# Folder tujuan (jangan diubah)
$destFolder = "c:\xampp\htdocs\SIB-WMS\FinalProject-6\wms_api\public\images\products"

Write-Host "=== Copy Gambar Produk Herbalife ===" -ForegroundColor Green
Write-Host ""
Write-Host "INSTRUKSI:" -ForegroundColor Yellow
Write-Host "1. Edit file ini (copy-images.ps1)" -ForegroundColor White
Write-Host "2. Ganti `$sourceFolder dengan folder tempat Anda simpan 13 gambar" -ForegroundColor White
Write-Host "3. Rename 13 gambar sesuai nama di bawah:" -ForegroundColor White
Write-Host ""

# Daftar gambar yang dibutuhkan
$images = @(
    "formula1-vanilla.jpg",
    "tea-concentrate.jpg", 
    "tea-concentrate-original.jpg",
    "formula1-chocolate.jpg",
    "beverage-mix-wildberry.jpg",
    "aloe-concentrate.jpg",
    "aloe-concentrate-lemon.jpg",
    "protein-drink-vanilla.jpg",
    "multivitamin-tablets.jpg",
    "iced-coffee.jpg",
    "cell-u-loss.jpg",
    "herbalifeline-capsules.jpg",
    "protein-bars-chocolate.jpg"
)

Write-Host "Daftar nama file yang dibutuhkan:" -ForegroundColor Cyan
$images | ForEach-Object { Write-Host "  - $_" }
Write-Host ""

# Cek apakah folder source ada
if (-Not (Test-Path $sourceFolder)) {
    Write-Host "ERROR: Folder source tidak ditemukan: $sourceFolder" -ForegroundColor Red
    Write-Host "Silakan edit script ini dan ganti `$sourceFolder" -ForegroundColor Yellow
    pause
    exit
}

# Buat folder tujuan jika belum ada
if (-Not (Test-Path $destFolder)) {
    New-Item -ItemType Directory -Path $destFolder -Force | Out-Null
    Write-Host "✓ Folder tujuan dibuat: $destFolder" -ForegroundColor Green
}

# Copy gambar
$copied = 0
$missing = 0

foreach ($image in $images) {
    $sourcePath = Join-Path $sourceFolder $image
    $destPath = Join-Path $destFolder $image
    
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath $destPath -Force
        Write-Host "✓ Copied: $image" -ForegroundColor Green
        $copied++
    } else {
        Write-Host "✗ Missing: $image" -ForegroundColor Red
        $missing++
    }
}

Write-Host ""
Write-Host "=== HASIL ===" -ForegroundColor Cyan
Write-Host "Berhasil dicopy: $copied gambar" -ForegroundColor Green
Write-Host "Belum ada: $missing gambar" -ForegroundColor $(if ($missing -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($missing -gt 0) {
    Write-Host "CATATAN: Pastikan semua gambar sudah di-rename sesuai nama di atas" -ForegroundColor Yellow
}

Write-Host "Setelah selesai, refresh browser untuk melihat gambar!" -ForegroundColor Cyan
pause
