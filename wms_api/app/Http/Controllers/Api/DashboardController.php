<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Product;
use App\Models\BranchStock;
use App\Models\Branch;
use App\Models\User;
use App\Models\Order;
use App\Models\Inbound;
use App\Models\Outbound;

class DashboardController extends Controller
{
    /**
     * Memberikan data statistik berdasarkan role user.
     */
    public function getStats()
    {
        $user = Auth::user();
        $stats = [];

        // --- STATISTIK UNTUK SUPERADMIN ---
        if ($user->role == 'superadmin') {
            $stats = [
                'total_central_stock' => Product::sum('central_stock'),
                'total_branch_stock' => BranchStock::sum('stock'),
                'total_branches' => Branch::count(),
                'total_users' => User::count(),
                'pending_orders' => Order::where('status', 'pending')->count(),
            ];
        } 
        
        // --- STATISTIK UNTUK ADMIN ATAU SUPERVISOR ---
        else if ($user->role == 'admin' || $user->role == 'supervisor') {
            $branchId = $user->branch_id;
            
            if (!$branchId) {
                return response()->json(['status' => 'error', 'message' => 'Akun Anda tidak terhubung ke cabang.'], 404);
            }

            $branchName = $user->branch ? $user->branch->name : 'Cabang Tidak Terdaftar';

            $stats = [
                'branch_name' => $branchName,
                'total_stock_in_branch' => BranchStock::where('branch_id', $branchId)->sum('stock'),
                'inbounds_today' => Inbound::where('branch_id', $branchId)->whereDate('date', today())->sum('quantity'),
                'outbounds_today_invoice' => Outbound::where('branch_id', $branchId)->whereDate('invoice_date', today())->sum('quantity'),
                'pending_orders_branch' => Order::where('branch_id', $branchId)->where('status', 'pending')->count(),
            ];
            
            // Add pending reports for supervisor
            if ($user->role == 'supervisor') {
                $stats['pending_reports'] = \App\Models\Report::where('branch_id', $branchId)
                    ->where('is_verified', false)
                    ->count();
            }
        } 
        
        // --- STATISTIK UNTUK USER (CUSTOMER) ---
        else if ($user->role == 'user') {
            $stats = [
                'my_total_orders' => Order::where('customer_id', $user->id)->count(),
                'my_pending_orders' => Order::where('customer_id', $user->id)->where('status', 'pending')->count(),
            ];
        }

        return response()->json(['status' => 'success', 'data' => $stats]);
    }
}