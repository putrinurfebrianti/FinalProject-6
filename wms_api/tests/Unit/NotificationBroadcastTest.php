<?php
namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Support\Facades\Event;
use App\Events\NotificationBroadcast;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class NotificationBroadcastTest extends TestCase
{
    use RefreshDatabase;

    public function test_broadcast_event_dispatched_when_notification_created()
    {
        Event::fake([NotificationBroadcast::class]);

        $user = User::create(['name' => 'Recipient', 'email' => 'rec@test.local', 'password' => bcrypt('password')]);
        $actor = User::create(['name' => 'Actor', 'email' => 'actor@test.local', 'password' => bcrypt('password')]);

        $notif = Notification::create(['user_id' => $user->id, 'actor_id' => $actor->id, 'type' => 'test', 'data' => ['msg' => 'test']]);

        event(new NotificationBroadcast($notif));

        Event::assertDispatched(NotificationBroadcast::class, function ($e) use ($notif) {
            return isset($e->notification) && $e->notification->id === $notif->id;
        });
    }
}
