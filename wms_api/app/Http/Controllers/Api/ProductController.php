<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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
        return response()->json(['status' => 'success', 'data' => $product]);
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(['status' => 'success', 'message' => 'Product deleted successfully']);
    }
}