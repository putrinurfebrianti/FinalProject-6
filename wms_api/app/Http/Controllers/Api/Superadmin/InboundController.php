<?php
namespace App\Http\Controllers\Api\Superadmin;
use App\Http\Controllers\Controller;
use App\Models\Inbound;
use App\Models\Product;
use App\Models\BranchStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use App\Models\ActivityLog;
use App\Events\InboundCreated;

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

            // Notify branch admins and superadmins via queued event (includes names)
            $recipients = \App\Models\User::where('role', 'admin')->where('branch_id', $request->branch_id)->get();
            $superadmins = \App\Models\User::where('role', 'superadmin')->get();
            $recipients = $recipients->merge($superadmins);
            try {
                event(new InboundCreated($inbound));
            } catch (\Exception $e) {
                ActivityLog::create([
                    'user_id' => Auth::id(),
                    'action' => 'NOTIFY_FAILED',
                    'description' => 'Failed to dispatch InboundCreated event for inbound id ' . $inbound->id
                ]);
            }

            DB::commit();
            return response()->json(['message' => 'Inbound berhasil dibuat dan stok cabang diupdate', 'data' => $inbound], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal membuat inbound: ' . $e->getMessage()], 500);
        }
    }

    public function bulk(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'branch_id' => 'required|exists:branches,id',
            'date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $created = [];
            foreach ($request->items as $item) {
                $product = Product::find($item['product_id']);

                if ($product->central_stock < $item['quantity']) {
                    DB::rollBack();
                    return response()->json(['status' => 'error', 'message' => 'Stok gudang pusat tidak mencukupi untuk SKU ' . $product->sku], 400);
                }

                $inbound = Inbound::create([
                    'product_id' => $item['product_id'],
                    'branch_id' => $request->branch_id,
                    'quantity' => $item['quantity'],
                    'date' => $request->date,
                    'sent_by_user_id' => Auth::id(),
                    'status' => 'received'
                ]);

                $product->decrement('central_stock', $item['quantity']);

                $branchStock = BranchStock::firstOrCreate(
                    ['branch_id' => $request->branch_id, 'product_id' => $item['product_id']],
                    ['stock' => 0]
                );
                $branchStock->increment('stock', $item['quantity']);

                ActivityLog::create([
                    'user_id' => Auth::id(),
                    'action' => 'CREATE_INBOUND',
                    'description' => 'Superadmin mengirim ' . $item['quantity'] . ' unit SKU ' . $product->sku . ' ke Cabang ' . $request->branch_id
                ]);

                    // Notify branch admins and superadmins for each created inbound
                    try {
                        $recipients = \App\Models\User::where('role', 'admin')->where('branch_id', $request->branch_id)->get();
                        $superadmins = \App\Models\User::where('role', 'superadmin')->get();
                        $recipients = $recipients->merge($superadmins);
                        try {
                            event(new InboundCreated($inbound));
                        } catch (\Exception $nex) {
                            ActivityLog::create([
                                'user_id' => Auth::id(),
                                'action' => 'NOTIFY_FAILED',
                                'description' => 'Failed to dispatch notification event for inbound id ' . $inbound->id . ': ' . $nex->getMessage()
                            ]);
                        }
                    } catch (\Exception $nex) {
                        // don't break the bulk creation if notification fails, but log to activity
                        ActivityLog::create([
                            'user_id' => Auth::id(),
                            'action' => 'NOTIFY_FAILED',
                            'description' => 'Failed to notify for inbound id ' . $inbound->id . ': ' . $nex->getMessage()
                        ]);
                    }

                    $created[] = $inbound;
            }

            DB::commit();
            return response()->json(['status' => 'success', 'message' => 'Bulk inbound berhasil dibuat', 'data' => $created], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => 'Gagal membuat bulk inbound: ' . $e->getMessage()], 500);
        }
    }
}