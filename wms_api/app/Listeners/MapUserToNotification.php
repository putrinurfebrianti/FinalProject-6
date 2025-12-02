<?php

namespace App\Listeners;

use App\Events\UserRegistered;
use App\Events\UserUpdated;
use App\Events\UserDeleted;
use App\Events\NotificationEvent as NotificationEventDirect;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class MapUserToNotification
{

    public function handle(UserRegistered|UserUpdated|UserDeleted $event)
    {
        $user = $event->user;
        // Notify superadmins
        $superadmins = User::where('role', 'superadmin')->get();
        $recipients = $superadmins;
        
        // If user has branch_id, notify supervisors and admins from the same branch
        if ($user->branch_id) {
            $branchUsers = User::whereIn('role', ['admin', 'supervisor'])
                ->where('branch_id', $user->branch_id)
                ->where('id', '!=', $user->id) // exclude the user themselves
                ->get();
            $recipients = $recipients->merge($branchUsers);
        }
        
        $payload = ['user_id' => $user->id, 'role' => $user->role, 'branch_id' => $user->branch_id, 'name' => $user->name];
        $type = 'user_registered';
        if ($event instanceof UserUpdated) $type = 'user_updated';
        if ($event instanceof UserDeleted) $type = 'user_deleted';
        event(new NotificationEventDirect($recipients, $user->id, $type, $payload));
    }
}
