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

Route::get('/storage/{path}', function (string $path) {
    // Sanitize path to prevent directory traversal
    $path = str_replace(['../', '..\\'], '', $path);
    
    // Check in default storage/app/public
    $disk = \Illuminate\Support\Facades\Storage::disk('public');
    if ($disk->exists($path)) {
        return $disk->response($path);
    }
    
    // Check in storage_path('app/public/' . $path)
    $filePath = storage_path('app/public/' . $path);
    if (file_exists($filePath)) {
        return response()->file($filePath);
    }

    // Check in public_path('storage/' . $path)
    $publicPath = public_path('storage/' . $path);
    if (file_exists($publicPath)) {
        return response()->file($publicPath);
    }

    abort(404, 'Berkas file tidak ditemukan di server.');
})->where('path', '.*');

Route::get('/setup-db', function () {
    try {
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        $migrateOutput = \Illuminate\Support\Facades\Artisan::output();

        \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
        $seedOutput = \Illuminate\Support\Facades\Artisan::output();

        return response()->json([
            'status' => 'success',
            'message' => 'Database migrated and seeded successfully!',
            'migrate_output' => $migrateOutput,
            'seed_output' => $seedOutput,
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ], 500);
    }
});
