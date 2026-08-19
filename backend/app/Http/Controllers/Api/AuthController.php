<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Auth\UpdateProfileRequest;
use App\Models\User;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $throttleKey = strtolower($request->input('email')).'|'.$request->ip();
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            return response()->json([
                'message' => 'Terlalu banyak percobaan login. Silakan coba lagi nanti.',
            ], 429)->header('Retry-After', RateLimiter::availableIn($throttleKey));
        }

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            RateLimiter::hit($throttleKey, 60);

            return response()->json([
                'message' => 'Email atau password salah.',
            ], 401);
        }

        RateLimiter::clear($throttleKey);
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'nisn_or_nip' => $user->nisn_or_nip,
                'subject' => $user->subject,
                'specialization' => $user->specialization,
                'phone' => $user->phone,
                'bio' => $user->bio,
            ],
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Berhasil logout',
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = $request->user();
        $user->update($request->validated());
        $user->refresh();

        return response()->json([
            'message' => 'Profile berhasil diperbarui',
            'user' => $user,
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $setting = Setting::where('key', 'allow_user_reset_password')->first();
        if ($setting && $setting->value === 'false') {
            return response()->json([
                'message' => 'Reset password is not allowed by administrator.'
            ], 403);
        }

        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => __($status)
            ]);
        }

        return response()->json([
            'message' => __($status)
        ], 400);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => __($status)
            ]);
        }

        return response()->json([
            'message' => __($status)
        ], 400);
    }
}
