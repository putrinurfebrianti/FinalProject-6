<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Controller;
use App\Models\Outbound;
use App\Models\BranchStock;
use Illuminate\Http\Request;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OutboundController extends Controller
{
    public function index()
    {
        $adminBranchId = Auth::user()->branch_id;
        if (!$adminBranchId) {
            return response()->json(['message' => 'Anda tidak terhubung ke cabang manapun'], 403);
        }
        
        $outbounds = Outbound::where('branch_id', $adminBranchId)->with('product')->get();
        return response()->json(['data' => $outbounds]);
    }

    public function createOutbound(Request $request)
    {
        $admin = Auth::user();
        $adminBranchId = $admin->branch_id;

        $request->validate([
            'order_number' => 'required|string',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'invoice_date' => 'required|date',
            'order_id' => 'nullable|exists:orders,id'
        ]);
        
        try {
            $outbound = Outbound::create([
                'order_number' => $request->order_number,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
                'invoice_date' => $request->invoice_date,
                'order_id' => $request->order_id,
                'branch_id' => $adminBranchId,
                'admin_id' => $admin->id,
            ]);

            ActivityLog::create([
                'user_id' => $admin->id,
                'action' => 'CREATE_OUTBOUND',
                'description' => 'Admin mencatat invoice ' . $outbound->order_number . ' (Qty: ' . $outbound->quantity . ')'
            ]);

            return response()->json(['message' => 'Outbound berhasil dicatat', 'data' => $outbound], 201);
        
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mencatat outbound: ' . $e->getMessage()], 400);
        }
    }
}