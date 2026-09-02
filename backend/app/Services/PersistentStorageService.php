<?php

namespace App\Services;

use App\Models\FileStorage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PersistentStorageService
{
    /**
     * Store uploaded file to disk and persist a base64 copy to MySQL database
     */
    public static function store(UploadedFile $file, string $folder = 'uploads'): string
    {
        // 1. Store to public disk
        $path = $file->store($folder, 'public');

        // 2. Backup to database for persistent cloud retention across redeploys
        try {
            $content = file_get_contents($file->getRealPath());
            if ($content !== false) {
                FileStorage::updateOrCreate(
                    ['path' => $path],
                    [
                        'file_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getClientMimeType() ?: $file->getMimeType(),
                        'file_size' => $file->getSize(),
                        'content_base64' => base64_encode($content),
                    ]
                );
            }
        } catch (\Throwable $e) {
            \Log::warning('PersistentStorageService store error: ' . $e->getMessage());
        }

        return $path;
    }

    /**
     * Get or recover file content and mime type from disk or database
     */
    public static function getFileResponse(string $path)
    {
        $cleanPath = str_replace(['../', '..\\'], '', $path);

        // 1. Try disk first
        $disk = Storage::disk('public');
        if ($disk->exists($cleanPath)) {
            return $disk->response($cleanPath);
        }

        $localPath = storage_path('app/public/' . $cleanPath);
        if (file_exists($localPath)) {
            return response()->file($localPath);
        }

        $publicPath = public_path('storage/' . $cleanPath);
        if (file_exists($publicPath)) {
            return response()->file($publicPath);
        }

        // 2. Recover from database backup
        try {
            $backup = FileStorage::where('path', $cleanPath)->orWhere('path', 'like', "%/{$cleanPath}")->first();
            if ($backup && !empty($backup->content_base64)) {
                $binary = base64_decode($backup->content_base64);
                
                // Write back to disk for fast caching
                try {
                    $disk->put($cleanPath, $binary);
                } catch (\Throwable $t) {}

                $mime = $backup->mime_type ?: 'application/octet-stream';
                return response($binary, 200, [
                    'Content-Type' => $mime,
                    'Content-Disposition' => 'inline; filename="' . ($backup->file_name ?: basename($cleanPath)) . '"',
                    'Content-Length' => strlen($binary),
                    'Cache-Control' => 'public, max-age=86400',
                ]);
            }
        } catch (\Throwable $e) {
            \Log::error('PersistentStorageService recover error: ' . $e->getMessage());
        }

        return null;
    }
}
