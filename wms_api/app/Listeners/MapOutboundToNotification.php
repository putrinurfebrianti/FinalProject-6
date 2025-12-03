<?php

namespace App\Listeners;

use App\Events\OutboundCreated;
use App\Events\NotificationEvent as NotificationEventDirect;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class MapOutboundToNotification
{

    public function handle(OutboundCreated $event)
    {
        $outbound = $event->outbound;
        $superadmins = User::where('role', 'superadmin')->get();
        $branchAdmins = User::where('role', 'admin')
            ->where('branch_id', $outbound->branch_id)
            ->where('id', '!=', $outbound->admin_id) // exclude the creator
            ->get();
        $recipients = $superadmins->merge($branchAdmins);

        $payload = ['outbound_id' => $outbound->id, 'branch_id' => $outbound->branch_id, 'quantity' => $outbound->quantity, 'product_id' => $outbound->product_id, 'product_name' => $outbound->product->name ?? null];
        event(new NotificationEventDirect($recipients, $outbound->admin_id ?? null, 'outbound_created', $payload));

        if ($outbound->order_id) {
            $order = $outbound->order;
            if ($order && $order->customer_id) {
                event(new NotificationEventDirect([$order->customer_id], $outbound->admin_id ?? null, 'outbound_shipped', array_merge($payload, ['order_id' => $order->id, 'order_number' => $order->order_number])));
            }
        }
    }
}
