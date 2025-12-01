<?php

namespace App\Listeners;

use App\Events\NotificationEvent;
use App\Models\Notification;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class CreateNotificationListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(NotificationEvent $event)
    {
        try {
            $recipients = $event->recipients;
            // $recipients can be Eloquent collection or array of user models/ids
            foreach ($recipients as $r) {
                $userId = is_object($r) ? $r->id : $r;
                Notification::create([
                    'user_id' => $userId,
                    'actor_id' => $event->actorId,
                    'type' => $event->type,
                    'data' => $event->data,
                    'is_read' => false,
                ]);
            }
        } catch (\Exception $e) {
            // Log as activity log so we don't hide exceptions
            try {
                ActivityLog::create([
                    'user_id' => $event->actorId ?? null,
                    'action' => 'NOTIFY_FAILED',
                    'description' => 'Failed creating notifications: ' . $e->getMessage()
                ]);
            } catch (\Exception $inner) {
                // swallow to avoid infinite loops
            }
        }
    }
}
