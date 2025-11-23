<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'sku' => 'HLF-001',
                'name' => 'Formula 1 Shake Mix - Vanilla',
                'category' => 'Nutrisi',
                'central_stock' => 1000,
            ],
            [
                'sku' => 'HLF-002',
                'name' => 'Herbal Aloe Concentrate',
                'category' => 'Minuman',
                'central_stock' => 500,
            ],
            [
                'sku' => 'HLF-003',
                'name' => 'Tea Concentrate - Original',
                'category' => 'Minuman',
                'central_stock' => 750,
            ],
            [
                'sku' => 'HLF-004',
                'name' => 'Formula 1 Shake Mix – Dutch Chocolate',
                'category' => 'Nutrisi',
                'central_stock' => 1200,
            ],
            [
                'sku' => 'HLF-005',
                'name' => 'Formula 1 Shake Mix – Wild Berry',
                'category' => 'Nutrisi',
                'central_stock' => 900,
            ],
            [
                'sku' => 'HLF-006',
                'name' => 'Herbal Aloe Concentrate – Original',
                'category' => 'Minuman',
                'central_stock' => 700,
            ],
            [
                'sku' => 'HLF-007',
                'name' => 'Herbal Tea Concentrate – Lemon',
                'category' => 'Minuman',
                'central_stock' => 800,
            ],
            [
                'sku' => 'HLF-008',
                'name' => 'Protein Drink Mix – Vanilla',
                'category' => 'Nutrisi',
                'central_stock' => 650,
            ],
            [
                'sku' => 'HLF-009',
                'name' => 'Multivitamin Mineral & Herbal Tablets – 90 Tablets',
                'category' => 'Suplemen',
                'central_stock' => 500,
            ],
            [
                'sku' => 'HLF-010',
                'name' => 'High Protein Iced Coffee',
                'category' => 'Minuman',
                'central_stock' => 400,
            ],
            [
                'sku' => 'HLF-011',
                'name' => 'Cell-U-Loss – 90 Tablets',
                'category' => 'Suplemen',
                'central_stock' => 550,
            ],
            [
                'sku' => 'HLF-012',
                'name' => 'Herbalifeline – 90 Capsules',
                'category' => 'Suplemen',
                'central_stock' => 450,
            ],
            [
                'sku' => 'HLF-013',
                'name' => 'Protein Bars – Chocolate Peanut',
                'category' => 'Snack',
                'central_stock' => 750,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
