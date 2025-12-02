<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;
use App\Events\NotificationEvent;
use App\Listeners\CreateNotificationListener;
use App\Events\OrderCreated;
use App\Events\InboundCreated;
use App\Events\OutboundCreated;
use App\Events\ReportCreated;
use App\Events\ReportVerified;
use App\Events\ProductCreated;
use App\Events\ProductUpdated;
use App\Events\ProductDeleted;
use App\Events\BranchCreated;
use App\Events\BranchUpdated;
use App\Events\BranchDeleted;
use App\Events\UserRegistered;
use App\Events\UserUpdated;
use App\Events\UserDeleted;
use App\Events\OrderCompleted;
use App\Listeners\MapOrderToNotification;
use App\Listeners\MapInboundToNotification;
use App\Listeners\MapOutboundToNotification;
use App\Listeners\MapReportToNotification;
use App\Listeners\MapProductToNotification;
use App\Listeners\MapBranchToNotification;
use App\Listeners\MapUserToNotification;
use App\Listeners\MapOrderCompletedToNotification;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        NotificationEvent::class => [CreateNotificationListener::class],
        OrderCreated::class => [MapOrderToNotification::class],
        OrderCompleted::class => [MapOrderCompletedToNotification::class],
        InboundCreated::class => [MapInboundToNotification::class],
        OutboundCreated::class => [MapOutboundToNotification::class],
        ReportCreated::class => [MapReportToNotification::class],
        ReportVerified::class => [MapReportToNotification::class],
        ProductCreated::class => [MapProductToNotification::class],
        ProductUpdated::class => [MapProductToNotification::class],
        ProductDeleted::class => [MapProductToNotification::class],
        BranchCreated::class => [MapBranchToNotification::class],
        BranchUpdated::class => [MapBranchToNotification::class],
        BranchDeleted::class => [MapBranchToNotification::class],
        UserRegistered::class => [MapUserToNotification::class],
        UserUpdated::class => [MapUserToNotification::class],
        UserDeleted::class => [MapUserToNotification::class],
    ];

    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
