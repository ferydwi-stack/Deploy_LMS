<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $userRole = is_object($user->role) && isset($user->role->value) ? $user->role->value : (string) $user->role;

        if (!in_array($userRole, $roles, true)) {
            return response()->json(['message' => 'Forbidden: Akses ditolak untuk peran akun ini.'], 403);
        }

        return $next($request);
    }
}

