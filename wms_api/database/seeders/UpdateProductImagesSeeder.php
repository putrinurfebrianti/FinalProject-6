<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;

class UpdateProductImagesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Mapping SKU produk ke nama file gambar
        $imageMapping = [
            'HLF-001' => 'formula1-vanilla.jpg',
            'HLF-002' => 'tea-concentrate.jpg',
            'HLF-003' => 'tea-concentrate-original.jpg',
            'HLF-004' => 'formula1-chocolate.jpg',
            'HLF-005' => 'beverage-mix-wildberry.jpg',
            'HLF-006' => 'aloe-concentrate.jpg',
            'HLF-007' => 'aloe-concentrate-lemon.jpg',
            'HLF-008' => 'protein-drink-vanilla.jpg',
            'HLF-009' => 'multivitamin-tablets.jpg',
            'HLF-010' => 'iced-coffee.jpg',
            'HLF-011' => 'cell-u-loss.jpg',
            'HLF-012' => 'herbalifeline-capsules.jpg',
            'HLF-013' => 'protein-bars-chocolate.jpg',
        ];

        foreach ($imageMapping as $sku => $imageName) {
            Product::where('sku', $sku)->update([
                'image' => 'images/products/' . $imageName
            ]);
        }

        $this->command->info('Product images updated successfully!');
    }
}
