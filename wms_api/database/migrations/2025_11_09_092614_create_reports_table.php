<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
    Schema::create('reports', function (Blueprint $table) {
        $table->id();
        $table->enum('report_type', ['harian', 'bulanan']);
        $table->date('report_date');
        $table->foreignId('branch_id');
        $table->foreignId('generated_by_id');
        $table->boolean('is_verified')->default(false);
        $table->foreignId('verified_by_id')->nullable();
        $table->timestamp('verification_date')->nullable();
        $table->timestamps();
    });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
