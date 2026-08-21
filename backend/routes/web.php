<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'status' => 'online',
        'app' => 'EduSchool Platform LMS API',
        'version' => '1.0.0',
        'timestamp' => now()->toIso8601String()
    ]);
});
