<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Outbound;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Support\Str;

class OutboundSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Biarkan kosong - outbound akan dibuat otomatis saat admin memproses order
    }
}