<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
    Schema::create('outbounds', function (Blueprint $table) {
        $table->id();
        $table->string('order_number');
        $table->foreignId('order_id')->nullable();
        $table->foreignId('branch_id');
        $table->foreignId('admin_id');
        $table->foreignId('product_id');
        $table->integer('quantity');
        $table->date('invoice_date');
        $table->timestamps();
    });
    }

    public function down(): void
    {
        Schema::dropIfExists('outbounds');
    }
};
