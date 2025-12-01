<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationEvent
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $recipients; // Collection or array of user ids
    public $actorId;
    public $type;
    public $data;

    /**
     * Create a new event instance.
     */
    public function __construct($recipients, $actorId, $type, $data = [])
    {
        $this->recipients = $recipients;
        $this->actorId = $actorId;
        $this->type = $type;
        $this->data = $data;
    }
}
