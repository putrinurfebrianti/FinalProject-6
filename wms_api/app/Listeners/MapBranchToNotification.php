<?php

namespace App\Listeners;

use App\Events\BranchCreated;
use App\Events\BranchUpdated;
use App\Events\BranchDeleted;
use App\Events\NotificationEvent as NotificationEventDirect;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class MapBranchToNotification
{

    public function handle(BranchCreated|BranchUpdated|BranchDeleted $event)
    {
        $branch = $event->branch;
        $superadmins = User::where('role', 'superadmin')->get();
        
        $type = 'branch_created';
        if ($event instanceof BranchUpdated) $type = 'branch_updated';
        if ($event instanceof BranchDeleted) $type = 'branch_deleted';
        
        $recipients = $superadmins;
        
        // If updated or deleted, notify admins and supervisors of the affected branch
        if ($event instanceof BranchUpdated || $event instanceof BranchDeleted) {
            $branchUsers = User::whereIn('role', ['admin', 'supervisor'])
                ->where('branch_id', $branch->id)
                ->get();
            $recipients = $recipients->merge($branchUsers);
        }

        $payload = ['branch_id' => $branch->id, 'name' => $branch->name];
        event(new NotificationEventDirect($recipients, null, $type, $payload));
    }
}
