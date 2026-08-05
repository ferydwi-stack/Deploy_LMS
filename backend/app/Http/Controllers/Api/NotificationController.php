<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\NotificationService;
use App\Models\User;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $limit = $request->query('limit', 50);
        
        $notifications = app(NotificationService::class)->getNotifications($user, (int) $limit);
        
        return response()->json(['notifications' => $notifications]);
    }

    public function unreadCount(Request $request)
    {
        $user = $request->user();
        
        $count = app(NotificationService::class)->getUnreadCount($user);
        
        return response()->json(['unread_count' => $count]);
    }

    public function markAsRead(User $notification, Request $request)
    {
        $user = $request->user();
        
        if ($notification->user_id !== $user->id) {
            abort(403);
        }
        
        app(NotificationService::class)->markAsRead($notification);
        
        return response()->json(['message' => 'Notification marked as read']);
    }

    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        
        app(NotificationService::class)->markAllAsRead($user);
        
        return response()->json(['message' => 'All notifications marked as read']);
    }
}
