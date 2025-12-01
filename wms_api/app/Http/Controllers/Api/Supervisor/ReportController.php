<?php
namespace App\Http\Controllers\Api\Supervisor;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Report;
use App\Models\ActivityLog;
use App\Events\NotificationEvent;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index()
    {
        $supervisorBranchId = Auth::user()->branch_id;
        
        $reports = Report::where('branch_id', $supervisorBranchId)
                         ->with('generator:id,name', 'verifier:id,name')
                         ->orderBy('report_date', 'desc')
                         ->get();
                         
        return response()->json(['data' => $reports]);
    }

    public function verifyReport(Report $report)
    {
        $supervisor = Auth::user();

        if ($report->branch_id != $supervisor->branch_id) {
            return response()->json(['message' => 'Forbidden: Anda tidak bisa memverifikasi laporan cabang lain.'], 403);
        }

        if ($report->is_verified) {
            return response()->json(['message' => 'Laporan ini sudah diverifikasi sebelumnya.'], 409);
        }

        $report->update([
            'is_verified' => true,
            'verified_by_id' => $supervisor->id,
            'verification_date' => Carbon::now(),
        ]);

        ActivityLog::create([
            'user_id' => $supervisor->id,
            'action' => 'VERIFY_REPORT',
            'description' => 'Supervisor memverifikasi laporan ID ' . $report->id . ' (Tanggal: ' . $report->report_date . ')'
        ]);

        // Notify the generator and all superadmins via queued event
        try {
            $generatorUser = \App\Models\User::find($report->generated_by_id);
            $superadmins = \App\Models\User::where('role', 'superadmin')->get();
            $recipients = $superadmins;
            if ($generatorUser) {
                $recipients = $recipients->merge(collect([$generatorUser]));
            }
            event(new NotificationEvent($recipients, $supervisor->id, 'report_verified', ['report_id' => $report->id, 'branch_id' => $report->branch_id, 'report_date' => $report->report_date, 'verified_by' => $supervisor->name]));
        } catch (\Exception $e) {
            \App\Models\ActivityLog::create([
                'user_id' => $supervisor->id,
                'action' => 'NOTIFY_FAILED',
                'description' => 'Failed to dispatch notification event for report verification id ' . $report->id . ': ' . $e->getMessage()
            ]);
        }

        return response()->json(['message' => 'Laporan berhasil diverifikasi', 'data' => $report]);
    }
}