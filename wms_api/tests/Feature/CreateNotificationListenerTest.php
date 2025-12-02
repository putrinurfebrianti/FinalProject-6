<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Events\NotificationEvent;
use App\Listeners\CreateNotificationListener;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Support\Facades\Event;

class CreateNotificationListenerTest extends TestCase
{
    use RefreshDatabase;

    public function test_listener_creates_notification_and_broadcasts()
    {
        // arrange
        Event::fake();

        $actor = User::create(['name' => 'Actor', 'email' => 'actor@example.com', 'password' => bcrypt('password')]);
        $recipient = User::create(['name' => 'Recipient', 'email' => 'recp@example.com', 'password' => bcrypt('password')]);

        $event = new NotificationEvent([$recipient->id], $actor->id, 'test_event', ['msg' => 'hello']);

        // act
        $listener = new CreateNotificationListener();
        $listener->handle($event);

        // assert notification created
        $this->assertDatabaseHas('notifications', ['user_id' => $recipient->id, 'actor_id' => $actor->id, 'type' => 'test_event']);

        // assert broadcast was dispatched
        Event::assertDispatched('\App\Events\NotificationBroadcast');
    }
}
