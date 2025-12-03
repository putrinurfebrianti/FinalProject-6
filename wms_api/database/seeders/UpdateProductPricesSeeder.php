<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UpdateProductPricesSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['sku' => 'HLF-001', 'price' => 150000],
            ['sku' => 'HLF-002', 'price' => 180000],
            ['sku' => 'HLF-003', 'price' => 165000],
            ['sku' => 'HLF-004', 'price' => 155000],
            ['sku' => 'HLF-005', 'price' => 160000],
            ['sku' => 'HLF-006', 'price' => 190000],
            ['sku' => 'HLF-007', 'price' => 175000],
            ['sku' => 'HLF-008', 'price' => 185000],
            ['sku' => 'HLF-009', 'price' => 120000],
            ['sku' => 'HLF-010', 'price' => 140000],
            ['sku' => 'HLF-011', 'price' => 130000],
            ['sku' => 'HLF-012', 'price' => 125000],
        ];

        foreach ($products as $productData) {
            \App\Models\Product::where('sku', $productData['sku'])
                ->update(['price' => $productData['price']]);
        }

        $this->command->info('Harga produk berhasil diupdate!');
    }
}
