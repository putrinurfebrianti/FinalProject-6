<?php
namespace App\Http\Controllers\Api\Superadmin;
use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BranchController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'data' => Branch::all()
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:branches',
            'address' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $branch = Branch::create($request->all());
        return response()->json(['status' => 'success', 'data' => $branch], 201);
    }

    public function show(Branch $branch)
    {
        return response()->json(['status' => 'success', 'data' => $branch]);
    }

    public function update(Request $request, Branch $branch)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:branches,name,' . $branch->id,
            'address' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $branch->update($request->all());
        return response()->json(['status' => 'success', 'data' => $branch]);
    }

    public function destroy(Branch $branch)
    {
        $branch->delete();
        return response()->json(['status' => 'success', 'message' => 'Branch deleted successfully']);
    }
}