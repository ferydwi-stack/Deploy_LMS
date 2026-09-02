<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('file_storages')) {
            Schema::create('file_storages', function (Blueprint $table) {
                $table->id();
                $table->string('path')->unique()->index();
                $table->string('file_name')->nullable();
                $table->string('mime_type')->nullable();
                $table->unsignedBigInteger('file_size')->default(0);
                $table->longText('content_base64');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('file_storages');
    }
};
