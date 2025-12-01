<?php
namespace App\Http\Controllers\Api\Superadmin;
use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use App\Events\NotificationEvent;

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

        // Notify superadmins that a new branch has been created (queued)
        try {
            $superadmins = \App\Models\User::where('role', 'superadmin')->get();
            event(new NotificationEvent($superadmins, Auth::id() ?? null, 'branch_created', ['branch_id' => $branch->id, 'name' => $branch->name]));
        } catch (\Exception $e) {
            ActivityLog::create([
                'user_id' => Auth::id() ?? null,
                'action' => 'NOTIFY_FAILED',
                'description' => 'Failed to notify branch creation for branch ' . $branch->id . ': ' . $e->getMessage()
            ]);
        }
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

        // Notify superadmins that branch was updated (queued)
        try {
            $superadmins = \App\Models\User::where('role', 'superadmin')->get();
            event(new NotificationEvent($superadmins, Auth::id() ?? null, 'branch_updated', ['branch_id' => $branch->id, 'name' => $branch->name]));
        } catch (\Exception $e) {
            ActivityLog::create([
                'user_id' => Auth::id() ?? null,
                'action' => 'NOTIFY_FAILED',
                'description' => 'Failed to notify branch update for branch ' . $branch->id . ': ' . $e->getMessage()
            ]);
        }
        return response()->json(['status' => 'success', 'data' => $branch]);
    }

    public function destroy(Branch $branch)
    {
        $branch->delete();

        // Notify superadmins that branch was deleted (queued)
        try {
            $superadmins = \App\Models\User::where('role', 'superadmin')->get();
            event(new NotificationEvent($superadmins, Auth::id() ?? null, 'branch_deleted', ['branch_id' => $branch->id, 'name' => $branch->name]));
        } catch (\Exception $e) {
            ActivityLog::create([
                'user_id' => Auth::id() ?? null,
                'action' => 'NOTIFY_FAILED',
                'description' => 'Failed to notify branch deletion for branch ' . $branch->id . ': ' . $e->getMessage()
            ]);
        }
        return response()->json(['status' => 'success', 'message' => 'Branch deleted successfully']);
    }
}