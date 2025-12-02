<?php

namespace App\Listeners;

use App\Events\NotificationEvent;
use App\Models\Notification;
use App\Models\User;
use App\Models\ActivityLog;
use App\Events\NotificationBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class CreateNotificationListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(NotificationEvent $event)
    {
        $recipientsList = is_array($event->recipients) ? $event->recipients : $event->recipients->all();
        $uniqueId = md5($event->type . json_encode($event->data) . implode(',', array_map(fn($r) => is_object($r) ? $r->id : $r, $recipientsList)));
        Log::info("CreateNotificationListener triggered for type: {$event->type}, recipients: " . count($recipientsList) . ", uniqueId: {$uniqueId}");
        
        try {
            $recipients = $recipientsList;
            // $recipients can be Eloquent collection or array of user models/ids
            foreach ($recipients as $r) {
                $userId = is_object($r) ? $r->id : $r;
                
                // Check if notification already exists in last 5 seconds (prevent duplicates)
                $recentDuplicate = Notification::where('user_id', $userId)
                    ->where('type', $event->type)
                    ->where('created_at', '>=', now()->subSeconds(5))
                    ->where('data', json_encode($event->data))
                    ->exists();
                
                if ($recentDuplicate) {
                    Log::warning("DUPLICATE PREVENTED: notification for user {$userId}, type {$event->type}");
                    continue;
                }
                
                $notif = Notification::create([
                    'user_id' => $userId,
                    'actor_id' => $event->actorId,
                    'type' => $event->type,
                    'data' => $event->data,
                    'is_read' => false,
                ]);
                Log::info("Created notification ID: {$notif->id} for user: {$userId}");
                try {
                    event(new NotificationBroadcast($notif));
                } catch (\Exception $e) {
                    ActivityLog::create([
                        'user_id' => $event->actorId ?? null,
                        'action' => 'BROADCAST_FAILED',
                        'description' => 'Failed to broadcast notification id ' . ($notif->id ?? 'n/a') . ': ' . $e->getMessage()
                    ]);
                }
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
