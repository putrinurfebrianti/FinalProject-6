<?php
namespace App\Http\Controllers\Api\Superadmin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BranchStock;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class BranchStockController extends Controller
{
    public function index()
    {
        $stocks = BranchStock::with('branch', 'product')->get();
        // Debug: include auth user pointers to help debugging on client
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

        // log activity
        ActivityLog::create([
            'user_id' => Auth::user()->id,
            'action' => 'MANUAL_STOCK_UPDATE',
            'description' => 'Manual stock override by ' . Auth::user()->name . ' for branch ' . $stock->branch_id . ' product ' . $stock->product_id
        ]);

        return response()->json(['status' => 'success', 'data' => $stock]);
    }
}
