# Instruksi Upload Gambar Produk

## Langkah-langkah:

1. **Copy 13 gambar produk** yang sudah Anda download dari Pinterest ke folder:
   ```
   wms_api/public/images/products/
   ```

2. **Rename file gambar** sesuai mapping berikut:

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

## Setelah Upload:

1. Refresh halaman Product Catalog di browser
2. Gambar produk akan muncul otomatis
3. Jika ada gambar yang tidak muncul, cek nama file dan path-nya

## Troubleshooting:

- Pastikan format gambar adalah JPG/PNG
- Pastikan nama file sesuai persis (case-sensitive)
- Pastikan folder `wms_api/public/images/products/` sudah ada
- Jika gambar tidak muncul, cek console browser untuk error
