<?php
namespace App\Http\Controllers\Api\Superadmin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BranchStock;
use App\Models\ActivityLog;
use App\Events\NotificationEvent;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class BranchStockController extends Controller
{
    public function index()
    {
        $stocks = BranchStock::with('branch', 'product')->get();
        $debugUser = null;
        if (Auth::check()) {
            $user = Auth::user();
            $debugUser = [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role,
                'branch_id' => $user->branch_id,
            ];
        }
        return response()->json(['status' => 'success', 'data' => $stocks, 'debug_user' => $debugUser]);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'stock' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $stock = BranchStock::findOrFail($id);
        $stock->stock = $request->stock;
        $stock->save();

        ActivityLog::create([
            'user_id' => Auth::user()->id,
            'action' => 'MANUAL_STOCK_UPDATE',
            'description' => 'Manual stock override by ' . Auth::user()->name . ' for branch ' . $stock->branch_id . ' product ' . $stock->product_id
        ]);

        try {
            $admins = \App\Models\User::where('role', 'admin')->where('branch_id', $stock->branch_id)->get();
            $branchName = \App\Models\Branch::find($stock->branch_id)->name ?? null;
            $productName = \App\Models\Product::find($stock->product_id)->name ?? null;
            event(new NotificationEvent($admins, Auth::user()->id, 'stock_manual_update', ['branch_id' => $stock->branch_id, 'branch_name' => $branchName, 'product_id' => $stock->product_id, 'product_name' => $productName, 'stock' => $stock->stock]));
        } catch (\Exception $e) {
            ActivityLog::create([
                'user_id' => Auth::user()->id,
                'action' => 'NOTIFY_FAILED',
                'description' => 'Failed to notify branch admins of stock manual update for branch ' . $stock->branch_id . ': ' . $e->getMessage()
            ]);
        }

        return response()->json(['status' => 'success', 'data' => $stock]);
    }
}
