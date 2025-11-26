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
        ]);

        $branchId = $request->branch_id;
        $totalAmount = 0;

        try {
            DB::beginTransaction();

            // Validasi stok dan hitung total
            $validatedItems = [];
            foreach ($request->items as $item) {
                $productId = $item['product_id'];
                $quantity = $item['quantity'];

                // Ambil data produk
                $product = \App\Models\Product::find($productId);
                if (!$product) {
                    throw new \Exception('Produk dengan ID ' . $productId . ' tidak ditemukan.');
                }

                // Ambil stok cabang dengan lock untuk menghindari race condition
                $stock = BranchStock::where('branch_id', $branchId)
                                    ->where('product_id', $productId)
                                    ->lockForUpdate()
                                    ->first();

                // Jika stok belum ada, buat dengan stok 0
                if (!$stock) {
                    throw new \Exception('Produk ' . $product->name . ' belum tersedia di cabang ini. Stok: 0, Diminta: ' . $quantity);
                }

                // Validasi stok mencukupi
                if ($stock->stock < $quantity) {
                    throw new \Exception('Stok produk ' . $product->name . ' tidak mencukupi di cabang ini. Stok tersedia: ' . $stock->stock . ', Diminta: ' . $quantity);
                }

                // Simpan data untuk proses selanjutnya
                $validatedItems[] = [
                    'product' => $product,
                    'quantity' => $quantity,
                    'stock' => $stock
                ];

                $totalAmount += $product->price * $quantity;
            }

            // Buat order
            $order = Order::create([
                'order_number' => 'ORD-' . Str::uuid(),
                'customer_id' => Auth::id(),
                'branch_id' => $branchId,
                'total_amount' => $totalAmount,
                'status' => 'pending'
            ]);

            // Buat order items dan kurangi stok
            foreach ($validatedItems as $validatedItem) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $validatedItem['product']->id,
                    'quantity' => $validatedItem['quantity'],
                    'price' => $validatedItem['product']->price,
                ]);

                // Kurangi stok
                $validatedItem['stock']->decrement('stock', $validatedItem['quantity']);
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

    public function getMyOrders(Request $request)
    {
        try {
            $userId = Auth::id();

            // Ambil semua order milik user yang sedang login
            $orders = Order::where('customer_id', $userId)
                ->with(['items.product', 'branch'])
                ->orderBy('created_at', 'desc')
                ->get();

            // Format data untuk response
            $formattedOrders = $orders->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'branch_name' => $order->branch->name ?? 'N/A',
                    'total_amount' => $order->total_amount,
                    'status' => $order->status,
                    'created_at' => $order->created_at,
                    'items' => $order->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'product_name' => $item->product->name ?? 'N/A',
                            'quantity' => $item->quantity,
                            'price' => $item->price,
                        ];
                    })
                ];
            });

            return response()->json(['data' => $formattedOrders], 200);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengambil data order: ' . $e->getMessage()], 400);
        }
    }
}
