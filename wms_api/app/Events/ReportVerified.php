<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReportVerified
{
    use Dispatchable, SerializesModels;

    public $report;

    public function __construct($report)
    {
        $this->report = $report;
    }
}
