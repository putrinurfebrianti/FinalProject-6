<?php

namespace App\Listeners;

use App\Events\ProductCreated;
use App\Events\ProductUpdated;
use App\Events\ProductDeleted;
use App\Events\NotificationEvent as NotificationEventDirect;
use App\Models\User;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class MapProductToNotification
{
    use InteractsWithQueue, Queueable, Dispatchable;

    public function handle(ProductCreated|ProductUpdated|ProductDeleted $event)
    {
        $product = $event->product;
        // Product changes only notify superadmins (products are global)
        $recipients = User::where('role', 'superadmin')->get();

        $type = 'product_created';
        if ($event instanceof ProductUpdated) $type = 'product_updated';
        if ($event instanceof ProductDeleted) $type = 'product_deleted';

        $payload = ['product_id' => $product->id, 'sku' => $product->sku ?? null, 'name' => $product->name ?? null];
        event(new NotificationEventDirect($recipients, null, $type, $payload));
    }
}
