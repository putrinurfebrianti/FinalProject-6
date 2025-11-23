<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Inbound;
use Carbon\Carbon;

class InboundSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $today = Carbon::today()->toDateString();

        Inbound::create([
            'product_id' => 1,
            'branch_id' => 1,
            'sent_by_user_id' => 1,
            'status' => 'received',
            'quantity' => 400,
            'date' => $today
        ]);

        Inbound::create([
            'product_id' => 2,
            'branch_id' => 1,
            'sent_by_user_id' => 1,
            'status' => 'received',
            'quantity' => 300,
            'date' => $today
        ]);

        Inbound::create([
            'product_id' => 1,
            'branch_id' => 1,
            'sent_by_user_id' => 1,
            'status' => 'received',
            'quantity' => 300,
            'date' => $today
        ]);
    }
}