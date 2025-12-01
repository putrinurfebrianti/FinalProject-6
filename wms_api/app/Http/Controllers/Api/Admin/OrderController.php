<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function index()
    {
        $admin = Auth::user();
        $adminBranchId = $admin->branch_id;

        if (!$adminBranchId) {
            return response()->json(['message' => 'Anda tidak terhubung ke cabang manapun'], 403);
        }

        // Ambil semua order yang masuk ke cabang admin ini
        $orders = Order::where('branch_id', $adminBranchId)
            ->with(['customer:id,name,email', 'items.product'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $orders]);
    }
}
