<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained('assignments')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->string('file_path')->nullable();
            $table->string('original_filename')->nullable();
            $table->text('note')->nullable();
            $table->integer('score')->nullable();
            $table->text('teacher_feedback')->nullable();
            $table->enum('status', ['submitted', 'graded', 'late'])->default('submitted');
            $table->dateTime('submitted_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
