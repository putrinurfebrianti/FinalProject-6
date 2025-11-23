<?php
namespace App\Http\Controllers\Api\Superadmin;
use App\Http\Controllers\Controller;
use App\Models\Inbound;
use App\Models\Product;
use App\Models\BranchStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\ActivityLog;

class InboundController extends Controller
{
    public function createInbound(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'branch_id' => 'required|exists:branches,id',
            'quantity' => 'required|integer|min:1',
            'date' => 'required|date',
        ]);

        $product = Product::find($request->product_id);

        if ($product->central_stock < $request->quantity) {
            return response()->json(['message' => 'Stok gudang pusat tidak mencukupi'], 400);
        }

        try {
            DB::beginTransaction();
            $inbound = Inbound::create([
                'product_id' => $request->product_id,
                'branch_id' => $request->branch_id,
                'quantity' => $request->quantity,
                'date' => $request->date,
                'sent_by_user_id' => Auth::id(),
                'status' => 'received'
            ]);

            $product->decrement('central_stock', $request->quantity);

            $branchStock = BranchStock::firstOrCreate(
                ['branch_id' => $request->branch_id, 'product_id' => $request->product_id],
                ['stock' => 0]
            );
            $branchStock->increment('stock', $request->quantity);

            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'CREATE_INBOUND',
                'description' => 'Superadmin mengirim ' . $request->quantity . ' unit SKU ' . $product->sku . ' ke Cabang ' . $request->branch_id
            ]);

            DB::commit();
            return response()->json(['message' => 'Inbound berhasil dibuat dan stok cabang diupdate', 'data' => $inbound], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal membuat inbound: ' . $e->getMessage()], 500);
        }
    }
}