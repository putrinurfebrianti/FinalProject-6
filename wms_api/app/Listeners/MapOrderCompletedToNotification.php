<?php

namespace App\Listeners;

use App\Events\OrderCompleted;
use App\Events\NotificationEvent as NotificationEventDirect;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class MapOrderCompletedToNotification
{

    public function handle(OrderCompleted $event)
    {
        $order = $event->order;

        if ($order->customer_id) {
            $payload = [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'branch_id' => $order->branch_id,
                'total_amount' => $order->total_amount
            ];

            event(new NotificationEventDirect(
                [$order->customer_id],
                null,
                'order_completed',
                $payload
            ));
        }

        if ($order->branch_id) {
            $supervisors = User::where('role', 'supervisor')
                ->where('branch_id', $order->branch_id)
                ->get();

            if ($supervisors->count() > 0) {
                $payload = [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'branch_id' => $order->branch_id,
                    'total_amount' => $order->total_amount,
                    'customer_name' => $order->customer ? $order->customer->name : 'Unknown'
                ];

                event(new NotificationEventDirect(
                    $supervisors,
                    null,
                    'order_completed_supervisor',
                    $payload
                ));
            }
        }
    }
}
