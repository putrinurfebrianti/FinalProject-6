<?php
namespace App\Http\Controllers\Api\Superadmin;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    /**
     * Menampilkan daftar semua user.
     */
    public function index()
    {
        $users = User::with('branch:id,name')->get();
        return response()->json(['status' => 'success', 'data' => $users]);
    }

    /**
     * Menampilkan data satu user.
     */
    public function show(User $user)
    {
        $user->load('branch:id,name');
        return response()->json(['status' => 'success', 'data' => $user]);
    }

    /**
     * Update data user.
     */
    public function update(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id), 
            ],
            'role' => 'required|in:admin,supervisor,user,superadmin',
            'branch_id' => 'nullable|exists:branches,id',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $userData = $request->only('name', 'email', 'role', 'branch_id');

        if ($request->filled('password')) {
            $userData['password'] = Hash::make($request->password);
        }

        $user->update($userData);

        return response()->json(['status' => 'success', 'message' => 'User updated successfully', 'data' => $user]);
    }

    /**
     * Menghapus user.
     */
    public function destroy(User $user)
    {
        if ($user->id === Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Anda tidak bisa menghapus akun Anda sendiri.'], 403);
        }

        $user->delete();
        return response()->json(['status' => 'success', 'message' => 'User deleted successfully']);
    }
}