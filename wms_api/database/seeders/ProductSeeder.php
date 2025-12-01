<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Truncate table untuk menghindari duplikasi
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Product::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $products = [
            [
                'sku' => 'HLF-001',
                'name' => 'Formula 1 Shake Mix - Vanilla',
                'category' => 'Nutrisi',
                'price' => 150000.00,
                'image' => 'images/products/formula1-vanilla.jpg',
                'central_stock' => 1000,
            ],
            [
                'sku' => 'HLF-002',
                'name' => 'Herbal Aloe Concentrate',
                'category' => 'Minuman',
                'price' => 180000.00,
                'image' => 'images/products/aloe-concentrate.jpg',
                'central_stock' => 500,
            ],
            [
                'sku' => 'HLF-003',
                'name' => 'Tea Concentrate - Original',
                'category' => 'Minuman',
                'price' => 165000.00,
                'image' => 'images/products/tea-concentrate-original.jpg',
                'central_stock' => 750,
            ],
            [
                'sku' => 'HLF-004',
                'name' => 'Formula 1 Shake Mix – Dutch Chocolate',
                'category' => 'Nutrisi',
                'price' => 155000.00,
                'image' => 'images/products/formula1-chocolate.jpg',
                'central_stock' => 1200,
            ],
            [
                'sku' => 'HLF-005',
                'name' => 'Formula 1 Shake Mix – Wild Berry',
                'category' => 'Nutrisi',
                'price' => 152000.00,
                'image' => 'images/products/beverage-mix-wildberry.jpg',
                'central_stock' => 900,
            ],
            [
                'sku' => 'HLF-006',
                'name' => 'Herbal Aloe Concentrate – Original',
                'category' => 'Minuman',
                'price' => 178000.00,
                'image' => 'images/products/aloe-concentrate.jpg',
                'central_stock' => 700,
            ],
            [
                'sku' => 'HLF-007',
                'name' => 'Herbal Tea Concentrate – Lemon',
                'category' => 'Minuman',
                'price' => 170000.00,
                'image' => 'images/products/aloe-concentrate-lemon.jpg',
                'central_stock' => 800,
            ],
            [
                'sku' => 'HLF-008',
                'name' => 'Protein Drink Mix – Vanilla',
                'category' => 'Nutrisi',
                'price' => 145000.00,
                'image' => 'images/products/protein-drink-vanilla.jpg',
                'central_stock' => 650,
            ],
            [
                'sku' => 'HLF-009',
                'name' => 'Multivitamin Mineral & Herbal Tablets – 90 Tablets',
                'category' => 'Suplemen',
                'price' => 120000.00,
                'image' => 'images/products/multivitamin-tablets.jpg',
                'central_stock' => 500,
            ],
            [
                'sku' => 'HLF-010',
                'name' => 'High Protein Iced Coffee',
                'category' => 'Minuman',
                'price' => 185000.00,
                'image' => 'images/products/iced-coffee.jpg',
                'central_stock' => 400,
            ],
            [
                'sku' => 'HLF-011',
                'name' => 'Cell-U-Loss – 90 Tablets',
                'category' => 'Suplemen',
                'price' => 135000.00,
                'image' => 'images/products/cell-u-loss.jpg',
                'central_stock' => 550,
            ],
            [
                'sku' => 'HLF-012',
                'name' => 'Herbalifeline – 90 Capsules',
                'category' => 'Suplemen',
                'price' => 140000.00,
                'image' => 'images/products/herbalifeline-capsules.jpg',
                'central_stock' => 450,
            ],
            [
                'sku' => 'HLF-013',
                'name' => 'Protein Bars – Chocolate Peanut',
                'category' => 'Snack',
                'price' => 95000.00,
                'image' => 'images/products/protein-bars-chocolate.jpg',
                'central_stock' => 750,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
