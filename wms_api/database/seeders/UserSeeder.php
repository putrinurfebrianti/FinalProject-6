<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@herbalife.com',
            'password' => Hash::make('password123'),
            'role' => 'superadmin'
        ]);

        User::create([
            'name' => 'Admin Bogor',
            'email' => 'admin.bogor@herbalife.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'branch_id' => 1
        ]);

        User::create([
            'name' => 'Supervisor Bogor',
            'email' => 'supervisor.bogor@herbalife.com',
            'password' => Hash::make('password123'),
            'role' => 'supervisor',
            'branch_id' => 1
        ]);

        User::create([
            'name' => 'Admin Bandung',
            'email' => 'admin.bandung@herbalife.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'branch_id' => 2
        ]);

        User::create([
            'name' => 'Supervisor Bandung',
            'email' => 'supervisor.bandung@herbalife.com',
            'password' => Hash::make('password123'),
            'role' => 'supervisor',
            'branch_id' => 2
        ]);

        User::create([
            'name' => 'Fajar Muhamad',
            'email' => 'fajar123@gmail.com',
            'password' => Hash::make('password123'),
            'role' => 'user'
        ]);
    }
}