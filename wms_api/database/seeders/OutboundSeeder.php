<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Outbound;
use Carbon\Carbon;
use Illuminate\Support\Str;

class OutboundSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $today = Carbon::today()->toDateString();
        for ($i = 0; $i < 10; $i++) {
            Outbound::create([
                'order_number' => 'INV-JNE-' . Str::random(5),
                'order_id' => null,
                'branch_id' => 1,
                'admin_id' => 2,
                'product_id' => rand(1, 14),
                'quantity' => rand(1, 5),
                'invoice_date' => $today
            ]);
        }
    }
}