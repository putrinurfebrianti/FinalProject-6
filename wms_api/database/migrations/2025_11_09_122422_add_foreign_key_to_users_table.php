<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('branch_id')
                  ->references('id')
                  ->on('branches')
                  ->onDelete('set null');
        });

        Schema::table('inbounds', function (Blueprint $table) {
            $table->foreign('branch_id')
                  ->references('id')
                  ->on('branches');

            $table->foreign('sent_by_user_id')
                  ->references('id')
                  ->on('users');
        });

        Schema::table('outbounds', function (Blueprint $table) {
            $table->foreign('order_id')
                  ->references('id')
                  ->on('orders')
                  ->onDelete('set null');

            $table->foreign('branch_id')
                  ->references('id')
                  ->on('branches');

            $table->foreign('admin_id')
                  ->references('id')
                  ->on('users');

            $table->foreign('product_id')
                  ->references('id')
                  ->on('products');
        });

        Schema::table('reports', function (Blueprint $table) {
            $table->foreign('branch_id')
                  ->references('id')
                  ->on('branches');

            $table->foreign('generated_by_id')
                  ->references('id')
                  ->on('users');

            $table->foreign('verified_by_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['branch_id']);
        });

        Schema::table('inbounds', function (Blueprint $table) {
            $table->dropForeign(['branch_id']);
            $table->dropForeign(['sent_by_user_id']);
        });

        Schema::table('outbounds', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
            $table->dropForeign(['branch_id']);
            $table->dropForeign(['admin_id']);
            $table->dropForeign(['product_id']);
        });

        Schema::table('reports', function (Blueprint $table) {
            $table->dropForeign(['branch_id']);
            $table->dropForeign(['generated_by_id']);
            $table->dropForeign(['verified_by_id']);
        });
    }
};
