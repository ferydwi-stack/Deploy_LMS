<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    try {
        if (!\Illuminate\Support\Facades\Schema::hasTable('file_storages')) {
            \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        }
    } catch (\Throwable $e) {}

    return response()->json([
        'status' => 'online',
        'app' => 'EduSchool Platform LMS API',
        'version' => '1.0.0',
        'timestamp' => now()->toIso8601String()
    ]);
});

Route::get('/storage/{path}', function (string $path) {
    $response = \App\Services\PersistentStorageService::getFileResponse($path);
    if ($response) {
        return $response;
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
