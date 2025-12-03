<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
    Schema::create('inbounds', function (Blueprint $table) {
        $table->id();
        $table->foreignId('product_id')->constrained('products');
        $table->foreignId('branch_id');
        $table->foreignId('sent_by_user_id');
        $table->enum('status', ['pending', 'shipped', 'received'])->default('pending');
        $table->integer('quantity');
        $table->date('date');
        $table->timestamps();
    });
    }

    public function down(): void
    {
        Schema::dropIfExists('inbounds');
    }
};
