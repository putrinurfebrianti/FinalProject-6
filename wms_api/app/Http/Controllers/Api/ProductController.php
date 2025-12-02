<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use App\Models\ActivityLog;
use App\Events\ProductCreated;
use App\Events\ProductUpdated;
use App\Events\ProductDeleted;

class ProductController extends Controller
{
    public function index()
    {
        return response()->json(['status' => 'success', 'data' => Product::all()]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'sku' => 'required|string|unique:products',
            'name' => 'required|string|max:255',
            'category' => 'nullable|string',
            'stock' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $product = Product::create($request->all());

        // Notify superadmins and branch admins about new product (queued via domain event)
        try {
            $superadmins = \App\Models\User::where('role', 'superadmin')->get();
            $admins = \App\Models\User::where('role', 'admin')->get();
            $recipients = $superadmins->merge($admins);
            event(new ProductCreated($product));
        } catch (\Exception $e) {
            ActivityLog::create([
                'user_id' => Auth::id() ?? null,
                'action' => 'NOTIFY_FAILED',
                'description' => 'Failed to notify product creation for product ' . $product->id . ': ' . $e->getMessage()
            ]);
        }
        return response()->json(['status' => 'success', 'data' => $product], 201);
    }

    public function show(Product $product)
    {
        return response()->json(['status' => 'success', 'data' => $product]);
    }

    public function update(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            'sku' => 'required|string|unique:products,sku,' . $product->id,
            'name' => 'required|string|max:255',
            'category' => 'nullable|string',
            'central_stock' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $product->update($request->all());

        // Notify superadmins and branch admins about updated product (queued)
        try {
            $superadmins = \App\Models\User::where('role', 'superadmin')->get();
            $admins = \App\Models\User::where('role', 'admin')->get();
            $recipients = $superadmins->merge($admins);
            event(new ProductUpdated($product));
        } catch (\Exception $e) {
            ActivityLog::create([
                'user_id' => Auth::id() ?? null,
                'action' => 'NOTIFY_FAILED',
                'description' => 'Failed to notify product update for product ' . $product->id . ': ' . $e->getMessage()
            ]);
        }
        return response()->json(['status' => 'success', 'data' => $product]);
    }

    public function destroy(Product $product)
    {
        $product->delete();

        // Notify superadmins and branch admins about deleted product (queued)
        try {
            $superadmins = \App\Models\User::where('role', 'superadmin')->get();
            $admins = \App\Models\User::where('role', 'admin')->get();
            $recipients = $superadmins->merge($admins);
            event(new ProductDeleted($product));
        } catch (\Exception $e) {
            ActivityLog::create([
                'user_id' => Auth::id() ?? null,
                'action' => 'NOTIFY_FAILED',
                'description' => 'Failed to notify product deletion for product ' . $product->id . ': ' . $e->getMessage()
            ]);
        }
        return response()->json(['status' => 'success', 'message' => 'Product deleted successfully']);
    }
}