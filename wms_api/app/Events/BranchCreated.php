<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BranchCreated
{
    use Dispatchable, SerializesModels;

    public $branch;

    public function __construct($branch)
    {
        $this->branch = $branch;
    }
}
