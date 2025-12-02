<?php

namespace App\Listeners;

use App\Events\InboundCreated;
use App\Events\NotificationEvent as NotificationEventDirect;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class MapInboundToNotification
{

    public function handle(InboundCreated $event)
    {
        $inbound = $event->inbound;
        $recipients = User::where('role', 'admin')->where('branch_id', $inbound->branch_id)->get();
        $superadmins = User::where('role', 'superadmin')->get();
        $recipients = $recipients->merge($superadmins);

        $payload = ['inbound_id' => $inbound->id, 'branch_id' => $inbound->branch_id, 'quantity' => $inbound->quantity, 'product_id' => $inbound->product_id, 'product_name' => $inbound->product->name ?? null];
        event(new NotificationEventDirect($recipients, $inbound->sent_by_user_id ?? null, 'inbound_created', $payload));
    }
}
