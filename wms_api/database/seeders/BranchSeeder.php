<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Branch;

class BranchSeeder extends Seeder
{
    public function run(): void
    {
        Branch::create([
            'name' => 'PUC Herbalife Bogor',
            'address' => 'Jl. Sholeh Iskandar, RT.01/RW.07, Kedungbadak, Kec. Tanah Sereal, Kota Bogor, Jawa Barat 16164'
        ]);
        
        Branch::create([
            'name' => 'SC Herbalife Bandung',
            'address' => 'JJl. Gatot Subroto No.73, Malabar, Kec. Lengkong, Kota Bandung, Jawa Barat 40262'
        ]);
    }
}