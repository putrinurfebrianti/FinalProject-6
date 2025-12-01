<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== PRODUCT DATABASE CHECK ===" . PHP_EOL . PHP_EOL;

$count = App\Models\Product::count();
echo "Total Products: " . $count . PHP_EOL . PHP_EOL;

if ($count > 0) {
    $products = App\Models\Product::take(3)->get();
    
    foreach ($products as $p) {
        echo "Product ID: " . $p->id . PHP_EOL;
        echo "  SKU: " . $p->sku . PHP_EOL;
        echo "  Name: " . $p->name . PHP_EOL;
        echo "  Price: " . ($p->price ?? 'NULL/0') . PHP_EOL;
        echo "  Image: " . ($p->image ?? 'NULL') . PHP_EOL;
        echo "  Stock: " . $p->central_stock . PHP_EOL;
        echo PHP_EOL;
    }
} else {
    echo "No products found! Run: php artisan db:seed --class=ProductSeeder" . PHP_EOL;
}

echo "=== IMAGE FILES CHECK ===" . PHP_EOL . PHP_EOL;
$imageDir = __DIR__ . '/public/images/products/';
if (is_dir($imageDir)) {
    $files = scandir($imageDir);
    $jpgFiles = array_filter($files, function($f) { return preg_match('/\.jpg$/i', $f); });
    echo "JPG files found: " . count($jpgFiles) . PHP_EOL;
    foreach ($jpgFiles as $file) {
        echo "  - " . $file . PHP_EOL;
    }
} else {
    echo "Directory does not exist: " . $imageDir . PHP_EOL;
}
