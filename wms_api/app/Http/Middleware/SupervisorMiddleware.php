<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class SupervisorMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check() && (Auth::user()->role == 'supervisor' || Auth::user()->role == 'superadmin')) {
            return $next($request);
        }
        
        return response()->json(['message' => 'Forbidden: Supervisor access required.'], 403);
    }
}