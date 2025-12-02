<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OutboundCreated
{
    use Dispatchable, SerializesModels;

    public $outbound; // outbound model

    public function __construct($outbound)
    {
        $this->outbound = $outbound;
    }
}
