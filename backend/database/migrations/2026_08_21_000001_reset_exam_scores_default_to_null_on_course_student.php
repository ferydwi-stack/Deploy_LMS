<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('course_student', function (Blueprint $table) {
            $table->integer('uts_score')->nullable()->default(null)->change();
            $table->integer('uas_score')->nullable()->default(null)->change();
        });
    }

    public function down(): void
    {
        Schema::table('course_student', function (Blueprint $table) {
            $table->integer('uts_score')->nullable()->default(null)->change();
            $table->integer('uas_score')->nullable()->default(null)->change();
        });
    }
};
