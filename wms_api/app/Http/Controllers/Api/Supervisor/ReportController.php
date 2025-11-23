<?php
namespace App\Http\Controllers\Api\Supervisor;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Report;
use App\Models\ActivityLog;
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

        return response()->json(['message' => 'Laporan berhasil diverifikasi', 'data' => $report]);
    }
}