<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;
use App\Events\NotificationEvent;
use App\Listeners\CreateNotificationListener;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        NotificationEvent::class => [
            CreateNotificationListener::class,
        ],
    ];

    public function boot()
    {
        parent::boot();
    }
}
