<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Notification;

class NotificationBroadcast implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $notification;

    public function __construct(Notification $notification)
    {
        $this->notification = $notification;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('App.User.' . $this->notification->user_id);
    }

    public function broadcastWith()
    {
        $notification = $this->notification->loadMissing(['actor:id,name,email']);
        $actor = $notification->actor;
        $notification->actor_gravatar = $actor ? 'https://www.gravatar.com/avatar/' . md5(strtolower(trim($actor->email))) . '?s=80&d=identicon' : null;
        return ['notification' => $notification];
    }

    public function broadcastAs()
    {
        return 'NotificationCreated';
    }
}
