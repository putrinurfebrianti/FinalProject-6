<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Controller;
use App\Models\Outbound;
use App\Models\BranchStock;
use Illuminate\Http\Request;
use App\Models\ActivityLog;
use App\Events\OutboundCreated;
use App\Events\OrderCompleted;
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
            DB::beginTransaction();

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

            if ($outbound->order_id) {
                $order = \App\Models\Order::find($outbound->order_id);

                if ($order) {
                    $totalOutbounds = Outbound::where('order_id', $order->id)->count();
                    $totalOrderItems = $order->items()->count();

                    ActivityLog::create([
                        'user_id' => $admin->id,
                        'action' => 'ORDER_PROGRESS',
                        'description' => "Order {$order->order_number}: {$totalOutbounds}/{$totalOrderItems} items processed"
                    ]);

                    if ($totalOrderItems > 0 && $totalOutbounds >= $totalOrderItems) {
                        $order->status = 'completed';
                        $order->save();

                        ActivityLog::create([
                            'user_id' => $admin->id,
                            'action' => 'ORDER_COMPLETED',
                            'description' => 'Order ' . $order->order_number . ' telah selesai diproses'
                        ]);

                        try {
                            event(new OrderCompleted($order));
                        } catch (\Exception $e) {
                            ActivityLog::create([
                                'user_id' => $admin->id,
                                'action' => 'NOTIFY_FAILED',
                                'description' => 'Failed to dispatch OrderCompleted event: ' . $e->getMessage()
                            ]);
                        }
                    }
                }
            }

            DB::commit();

            try {
                event(new OutboundCreated($outbound));
            } catch (\Exception $e) {
                ActivityLog::create([
                    'user_id' => $admin->id,
                    'action' => 'NOTIFY_FAILED',
                    'description' => 'Failed to dispatch notification event for outbound ' . $outbound->id . ': ' . $e->getMessage()
                ]);
            }

            return response()->json(['message' => 'Outbound berhasil dicatat', 'data' => $outbound], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal mencatat outbound: ' . $e->getMessage()], 400);
        }
    }
}
