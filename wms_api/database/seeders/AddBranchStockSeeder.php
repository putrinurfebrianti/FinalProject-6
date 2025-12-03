<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AddBranchStockSeeder extends Seeder
{
    public function run(): void
    {
        $branches = \App\Models\Branch::all();
        $products = \App\Models\Product::all();

        foreach ($branches as $branch) {
            foreach ($products as $product) {
                $existingStock = \App\Models\BranchStock::where('branch_id', $branch->id)
                    ->where('product_id', $product->id)
                    ->first();

                if (!$existingStock) {
                    \App\Models\BranchStock::create([
                        'branch_id' => $branch->id,
                        'product_id' => $product->id,
                        'stock' => rand(50, 200)
                    ]);
                } else {
                    if ($existingStock->stock == 0) {
                        $existingStock->update(['stock' => rand(50, 200)]);
                    }
                }
            }
        }

        $this->command->info('Stok cabang berhasil ditambahkan!');
    }
}
