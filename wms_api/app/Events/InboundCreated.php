<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InboundCreated
{
    use Dispatchable, SerializesModels;

    public $inbound; // inbound model

    public function __construct($inbound)
    {
        $this->inbound = $inbound;
    }
}
