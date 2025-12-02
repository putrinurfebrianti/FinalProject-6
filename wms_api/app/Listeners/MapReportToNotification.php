<?php

namespace App\Listeners;

use App\Events\ReportCreated;
use App\Events\ReportVerified;
use App\Events\NotificationEvent as NotificationEventDirect;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class MapReportToNotification
{

    public function handle(ReportCreated|ReportVerified $event)
    {
        $report = $event->report;

        if ($event instanceof ReportCreated) {
            // Notifikasi untuk report yang baru dibuat
            $supervisors = User::where('role', 'supervisor')->where('branch_id', $report->branch_id)->get();
            $superadmins = User::where('role', 'superadmin')->get();
            $recipients = $supervisors->merge($superadmins);

            $payload = [
                'report_id' => $report->id,
                'branch_id' => $report->branch_id,
                'report_date' => $report->report_date,
                'report_type' => $report->report_type,
                'generated_by' => $report->generated_by_id
            ];
            event(new NotificationEventDirect($recipients, $report->generated_by_id ?? null, 'report_created', $payload));
        } elseif ($event instanceof ReportVerified) {
            // Notifikasi untuk report yang diverifikasi
            $generator = User::find($report->generated_by_id);
            $superadmins = User::where('role', 'superadmin')->get();
            $recipients = $superadmins;
            if ($generator) {
                $recipients = $recipients->merge(collect([$generator]));
            }
            $payload = [
                'report_id' => $report->id,
                'branch_id' => $report->branch_id,
                'report_date' => $report->report_date,
                'verified_by' => $report->verified_by_id
            ];
            event(new NotificationEventDirect($recipients, $report->verified_by_id ?? null, 'report_verified', $payload));
        }
    }
}
