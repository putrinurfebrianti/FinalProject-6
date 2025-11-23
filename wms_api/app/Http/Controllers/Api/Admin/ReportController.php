<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Report;
use App\Models\Outbound;
use App\Models\Inbound;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index()
    {
        $adminBranchId = Auth::user()->branch_id;
        $reports = Report::where('branch_id', $adminBranchId)
                         ->with('generator:id,name', 'verifier:id,name')
                         ->orderBy('report_date', 'desc')
                         ->get();
                         
        return response()->json(['data' => $reports]);
    }

    public function generateDailyReport(Request $request)
    {
        $admin = Auth::user();
        $adminBranchId = $admin->branch_id;
        $today = Carbon::today()->toDateString();

        $existingReport = Report::where('branch_id', $adminBranchId)
                                ->where('report_date', $today)
                                ->where('report_type', 'harian')
                                ->first();
        
        if ($existingReport) {
            return response()->json(['message' => 'Laporan harian untuk hari ini sudah dibuat.'], 409);
        }

        $outboundsToday = Outbound::where('branch_id', $adminBranchId)
                                  ->whereDate('invoice_date', $today)
                                  ->with('product:id,sku,name')
                                  ->select('product_id', DB::raw('SUM(quantity) as total_quantity'))
                                  ->groupBy('product_id')
                                  ->get();
                                  
        $inboundsToday = Inbound::where('branch_id', $adminBranchId)
                                ->whereDate('date', $today)
                                ->with('product:id,sku,name')
                                ->select('product_id', DB::raw('SUM(quantity) as total_quantity'))
                                ->groupBy('product_id')
                                ->get();
        
        $reportData = [
            'summary' => [
                'total_outbound_items' => $outboundsToday->sum('total_quantity'),
                'total_inbound_items' => $inboundsToday->sum('total_quantity'),
            ],
            'details' => [
                'outbounds' => $outboundsToday,
                'inbounds' => $inboundsToday,
            ]
        ];

        $report = Report::create([
            'report_type' => 'harian',
            'report_date' => $today,
            'branch_id' => $adminBranchId,
            'generated_by_id' => $admin->id,
            'is_verified' => false,
            'data' => $reportData
        ]);

        return response()->json(['message' => 'Laporan harian berhasil dibuat', 'data' => $report], 201);
    }
}