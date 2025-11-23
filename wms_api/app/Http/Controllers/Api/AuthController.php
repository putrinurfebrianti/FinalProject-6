<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ];
        
        $role = 'user';
        $branch_id = null;

        if (Auth::guard('sanctum')->check() && Auth::user()->role == 'superadmin') {
            $rules['role'] = 'required|in:admin,supervisor,user';
            $rules['branch_id'] = 'nullable|exists:branches,id';
            
            $role = $request->role;
            $branch_id = $request->branch_id;
        } else {
            $role = 'user';
        }

        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $role,
            'branch_id' => $branch_id,
        ]);

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'REGISTER',
            'description' => 'User ' . $user->name . ' berhasil terdaftar dengan role ' . $user->role
        ]);

        return response()->json(['status' => 'success', 'message' => 'User registered successfully', 'user' => $user], 201);
    }

    /**
     * Login (Semua role)
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 400);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['status' => 'error', 'message' => 'Email or password incorrect.'], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token_for_' . $user->name)->plainTextToken;

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'LOGIN',
            'description' => 'User ' . $user->name . ' berhasil login.'
        ]);

        return response()->json([
            'status' => 'success',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }
}