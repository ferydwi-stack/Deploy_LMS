<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations to reset operational data while keeping user accounts.
     */
    public function up(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        if (Schema::hasTable('notifications')) {
            DB::table('notifications')->truncate();
        }
        if (Schema::hasTable('submissions')) {
            DB::table('submissions')->truncate();
        }
        if (Schema::hasTable('assignments')) {
            DB::table('assignments')->truncate();
        }
        if (Schema::hasTable('materials')) {
            DB::table('materials')->truncate();
        }
        if (Schema::hasTable('attendances')) {
            DB::table('attendances')->truncate();
        }
        if (Schema::hasTable('course_student')) {
            DB::table('course_student')->truncate();
        }
        if (Schema::hasTable('courses')) {
            DB::table('courses')->truncate();
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op
    }
};
