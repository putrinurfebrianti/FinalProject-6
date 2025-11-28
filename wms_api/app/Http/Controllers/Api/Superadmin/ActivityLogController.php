<?php
namespace App\Http\Controllers\Api\Superadmin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ActivityLog;

class ActivityLogController extends Controller
{
    public function index()
    {
        $logs = ActivityLog::with('user:id,name,role')->orderBy('created_at', 'desc')->get();
        return response()->json(['status' => 'success', 'data' => $logs]);
    }
}
