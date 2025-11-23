<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BranchStock;
use Illuminate\Support\Facades\Auth;

class BranchStockController extends Controller
{
    public function getMyBranchStock()
    {
        $adminBranchId = Auth::user()->branch_id;

        if (!$adminBranchId) {
            return response()->json(['message' => 'Anda tidak terhubung ke cabang manapun'], 403);
        }

        $stock = BranchStock::where('branch_id', $adminBranchId)
                            ->with('product')
                            ->get();
                            
        return response()->json(['data' => $stock]);
    }
}