<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Events\NotificationEvent as NotificationEventDirect;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class MapOrderToNotification
{

    public function handle(OrderCreated $event)
    {
        $order = $event->order;

        Log::info("MapOrderToNotification START for order: {$order->order_number}");

        $adminIds = User::where('role', 'admin')->where('branch_id', $order->branch_id)->pluck('id')->toArray();
        $superadminIds = User::where('role', 'superadmin')->pluck('id')->toArray();
        $recipientIds = array_unique(array_merge($adminIds, $superadminIds));

        Log::info("Sending order_created to recipients: " . implode(',', $recipientIds));

        $payload = ['order_id' => $order->id, 'order_number' => $order->order_number, 'branch_id' => $order->branch_id, 'total_amount' => $order->total_amount];

        event(new NotificationEventDirect($recipientIds, $order->customer_id ?? null, 'order_created', $payload));

        if ($order->customer_id) {
            Log::info("Sending order_confirmation to customer: {$order->customer_id}");
            event(new NotificationEventDirect([$order->customer_id], $order->customer_id, 'order_confirmation', $payload));
        }

        Log::info("MapOrderToNotification END for order: {$order->order_number}");
    }
}
