<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Order;

echo "=== Orders di Database ===\n\n";

$totalOrders = Order::count();
echo "Total Orders: {$totalOrders}\n\n";

if ($totalOrders > 0) {
    $orders = Order::with(['customer:id,name', 'branch:id,name'])
        ->orderBy('created_at', 'desc')
        ->limit(10)
        ->get();

    foreach ($orders as $order) {
        echo "Order: {$order->order_number}\n";
        echo "  Customer: " . ($order->customer ? $order->customer->name : 'N/A') . "\n";
        echo "  Branch: " . ($order->branch ? $order->branch->name : "Branch #{$order->branch_id}") . "\n";
        echo "  Status: {$order->status}\n";
        echo "  Total: Rp " . number_format($order->total_amount, 0, ',', '.') . "\n";
        echo "  Created: {$order->created_at}\n";
        echo "  ---\n";
    }
} else {
    echo "Tidak ada order di database.\n";
}
