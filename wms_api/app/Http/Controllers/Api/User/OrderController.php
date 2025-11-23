<?php
namespace App\Http\Controllers\Api\User;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\BranchStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function createOrder(Request $request)
    {
        $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        $branchId = $request->branch_id;
        $totalAmount = 0;

        try {
            DB::beginTransaction();

            foreach ($request->items as $item) {
                $stock = BranchStock::where('branch_id', $branchId)
                                    ->where('product_id', $item['product_id'])
                                    ->first();

                if (!$stock || $stock->stock < $item['quantity']) {
                    throw new \Exception('Stok produk ID ' . $item['product_id'] . ' tidak mencukupi di cabang ini.');
                }
                $totalAmount += $item['price'] * $item['quantity'];
            }

            $order = Order::create([
                'order_number' => 'ORD-' . Str::uuid(),
                'customer_id' => Auth::id(),
                'branch_id' => $branchId,
                'total_amount' => $totalAmount,
                'status' => 'pending'
            ]);

            foreach ($request->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);

                BranchStock::where('branch_id', $branchId)
                           ->where('product_id', $item['product_id'])
                           ->decrement('stock', $item['quantity']);
            }

            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'CREATE_ORDER',
                'description' => 'User membuat order ' . $order->order_number . ' ke Cabang ' . $order->branch_id . ' (Total: ' . $order->total_amount . ')'
            ]);

            DB::commit();
            return response()->json(['message' => 'Order berhasil dibuat', 'data' => $order], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal membuat order: ' . $e->getMessage()], 400);
        }
    }
}