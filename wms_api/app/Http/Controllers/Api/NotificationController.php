<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        $userId = Auth::id();
        $notifications = Notification::where('user_id', $userId)->with('actor:id,name')->orderBy('created_at', 'desc')->get();
        $unread = Notification::where('user_id', $userId)->where('is_read', false)->count();
        return response()->json(['data' => $notifications, 'unread_count' => $unread]);
    }

    public function markRead($id)
    {
        $userId = Auth::id();
        $n = Notification::where('id', $id)->where('user_id', $userId)->first();
        if (!$n) return response()->json(['message' => 'Not found'], 404);
        $n->is_read = true;
        $n->save();
        return response()->json(['message' => 'Marked as read']);
    }

    public function markAllRead()
    {
        $userId = Auth::id();
        Notification::where('user_id', $userId)->update(['is_read' => true]);
        return response()->json(['message' => 'All marked as read']);
    }
}
