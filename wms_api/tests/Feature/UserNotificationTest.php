<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Events\UserUpdated;
use App\Events\NotificationEvent;
use App\Models\User;
use Illuminate\Support\Facades\Event;

class UserNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_update_triggers_notification_event()
    {
        Event::fake([NotificationEvent::class]);

        // create superadmin recipient
        $superadmin = User::create(['name' => 'Super Admin', 'email' => 'sup@admin.test', 'password' => bcrypt('password'), 'role' => 'superadmin']);

        // create a user to update
        $user = User::create(['name' => 'Some User', 'email' => 'user@test', 'password' => bcrypt('password'), 'role' => 'user']);

        // dispatch domain event
        event(new UserUpdated($user));

        // assert NotificationEvent dispatched and includes superadmin as recipient
        Event::assertDispatched(NotificationEvent::class, function ($e) use ($superadmin) {
            $recipients = $e->recipients;
            if (is_array($recipients)) {
                return in_array($superadmin->id, $recipients);
            }
            // If it's a collection
            if (method_exists($recipients, 'contains')) {
                return $recipients->contains($superadmin->id);
            }
            return false;
        });
    }
}
