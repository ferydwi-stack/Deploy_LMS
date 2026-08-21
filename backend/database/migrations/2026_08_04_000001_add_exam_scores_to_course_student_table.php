<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('course_student', function (Blueprint $table) {
            if (!Schema::hasColumn('course_student', 'uts_score')) {
                $table->integer('uts_score')->nullable()->default(null)->after('status');
            }
            if (!Schema::hasColumn('course_student', 'uas_score')) {
                $table->integer('uas_score')->nullable()->default(null)->after('uts_score');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('course_student', function (Blueprint $table) {
            $table->dropColumn(['uts_score', 'uas_score']);
        });
    }
};
