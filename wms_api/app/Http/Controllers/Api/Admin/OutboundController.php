<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Controller;
use App\Models\Outbound;
use App\Models\BranchStock;
use Illuminate\Http\Request;
use App\Models\ActivityLog;
use App\Events\NotificationEvent;
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

        $outbounds = Outbound::where('branch_id', $adminBranchId)
            ->with(['product', 'order.customer'])
            ->orderBy('created_at', 'desc')
            ->get();

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

            // Notify superadmins that an outbound was created by branch admin (queued)
            $superadmins = \App\Models\User::where('role', 'superadmin')->get();
            try {
                $productName = \App\Models\Product::find($outbound->product_id)->name ?? null;
                $branchName = \App\Models\Branch::find($outbound->branch_id)->name ?? null;
                event(new NotificationEvent($superadmins, $admin->id, 'outbound_created', ['outbound_id' => $outbound->id, 'branch_id' => $adminBranchId, 'branch_name' => $branchName, 'quantity' => $outbound->quantity, 'product_id' => $outbound->product_id, 'product_name' => $productName]));
            } catch (\Exception $e) {
                ActivityLog::create([
                    'user_id' => $admin->id,
                    'action' => 'NOTIFY_FAILED',
                    'description' => 'Failed to dispatch notification event for outbound ' . $outbound->id . ': ' . $e->getMessage()
                ]);
            }

            // If the outbound is linked to an order, notify the customer that their order has shipped
            if ($outbound->order_id) {
                try {
                    $order = \App\Models\Order::find($outbound->order_id);
                    if ($order) {
                        $customer = \App\Models\User::find($order->customer_id);
                        if ($customer) {
                            try {
                                $productName = \App\Models\Product::find($outbound->product_id)->name ?? null;
                                event(new NotificationEvent([$customer->id], $admin->id, 'outbound_shipped', ['outbound_id' => $outbound->id, 'order_id' => $order->id, 'order_number' => $order->order_number, 'branch_id' => $outbound->branch_id, 'product_name' => $productName]));
                            } catch (\Exception $e) {
                                ActivityLog::create([
                                    'user_id' => $admin->id,
                                    'action' => 'NOTIFY_FAILED',
                                    'description' => 'Failed to dispatch notification event for customer outbound ' . $outbound->id . ': ' . $e->getMessage()
                                ]);
                            }
                        }
                    }
                } catch (\Exception $e) {
                    ActivityLog::create([
                        'user_id' => $admin->id,
                        'action' => 'NOTIFY_FAILED',
                        'description' => 'Failed to notify customer for outbound id ' . $outbound->id . ': ' . $e->getMessage()
                    ]);
                }
            }

            return response()->json(['message' => 'Outbound berhasil dicatat', 'data' => $outbound], 201);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mencatat outbound: ' . $e->getMessage()], 400);
        }
    }
}
