<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\User\OrderController;
use App\Http\Controllers\Api\Admin\OutboundController;
use App\Http\Controllers\Api\Admin\BranchStockController;
use App\Http\Controllers\Api\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Api\Supervisor\ReportController as SupervisorReportController;
use App\Http\Controllers\Api\Superadmin\InboundController;
use App\Http\Controllers\Api\Superadmin\BranchController;
use App\Http\Controllers\Api\Superadmin\BranchStockController as SuperadminBranchStockController;
use App\Http\Controllers\Api\Superadmin\ActivityLogController;
use App\Http\Controllers\Api\Superadmin\UserManagementController;
use App\Http\Controllers\Api\DashboardController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
        Route::get('/notifications', [App\Http\Controllers\Api\NotificationController::class, 'index']);
        Route::patch('/notifications/{id}/read', [App\Http\Controllers\Api\NotificationController::class, 'markRead']);
        Route::patch('/notifications/{id}/unread', [App\Http\Controllers\Api\NotificationController::class, 'markUnread']);
        Route::patch('/notifications/read-all', [App\Http\Controllers\Api\NotificationController::class, 'markAllRead']);

    Route::get('/user', fn(Request $request) => $request->user());
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{product}', [ProductController::class, 'show']);
    Route::get('/branches', [BranchController::class, 'index']);
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
});

Route::middleware(['auth:sanctum', 'user'])->prefix('user')->group(function () {
    Route::post('/orders', [OrderController::class, 'createOrder']);
    Route::get('/orders', [OrderController::class, 'getMyOrders']);
});

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/orders', [App\Http\Controllers\Api\Admin\OrderController::class, 'index']);
    Route::get('/outbounds', [OutboundController::class, 'index']);
    Route::post('/outbounds', [OutboundController::class, 'createOutbound']);
    Route::get('/reports', [AdminReportController::class, 'index']);
    Route::post('/reports/generate', [AdminReportController::class, 'generateDailyReport']);
    Route::get('/stock', [BranchStockController::class, 'getMyBranchStock']);
});

Route::middleware(['auth:sanctum', 'supervisor'])->prefix('supervisor')->group(function () {
    Route::get('/reports', [SupervisorReportController::class, 'index']);
    Route::post('/reports/{report}/verify', [SupervisorReportController::class, 'verifyReport']);
});

Route::middleware(['auth:sanctum', 'superadmin'])->prefix('superadmin')->group(function () {
    Route::post('/inbounds', [InboundController::class, 'createInbound']);
    Route::post('/inbounds/bulk', [InboundController::class, 'bulk']);
    Route::apiResource('/products', ProductController::class)->except(['index', 'show']);
    Route::apiResource('/branches', BranchController::class)->except(['index', 'show']);
    Route::post('/register-user', [AuthController::class, 'register']);
    Route::get('/users', [UserManagementController::class, 'index']);
    Route::get('/users/{user}', [UserManagementController::class, 'show']);
    Route::put('/users/{user}', [UserManagementController::class, 'update']);
    Route::delete('/users/{user}', [UserManagementController::class, 'destroy']);
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);
    Route::get('/branch-stock', [SuperadminBranchStockController::class, 'index']);
    Route::put('/branch-stock/{id}', [SuperadminBranchStockController::class, 'update']);
});
