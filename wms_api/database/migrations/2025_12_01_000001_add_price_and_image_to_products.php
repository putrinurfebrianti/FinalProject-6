<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('products', 'price')) {
            Schema::table('products', function (Blueprint $table) {
                $table->decimal('price', 12, 2)->default(0)->after('category');
            });
        }

        if (!Schema::hasColumn('products', 'image')) {
            Schema::table('products', function (Blueprint $table) {
                $table->string('image')->nullable()->after('price');
            });
        }
    }

    public function down(): void
    {
        // Drop columns if they exist
        if (Schema::hasColumn('products', 'image')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn('image');
            });
        }
        if (Schema::hasColumn('products', 'price')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn('price');
            });
        }
    }
};
