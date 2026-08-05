<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\MaterialController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\SubmissionController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

        Route::get('/admin/stats', [AdminController::class, 'stats']);

        Route::get('/courses', [CourseController::class, 'index']);
        Route::get('/courses/available', [EnrollmentController::class, 'available']);
        Route::get('/courses/{id}', [CourseController::class, 'show']);
        Route::post('/courses', [CourseController::class, 'store']);
        Route::put('/courses/{id}', [CourseController::class, 'update']);
        Route::delete('/courses/{id}', [CourseController::class, 'destroy']);
        Route::post('/courses/{id}/enroll', [EnrollmentController::class, 'enroll']);
        Route::post('/courses/enroll-by-code', [EnrollmentController::class, 'enrollByCode']);
        Route::post('/courses/{id}/leave', [EnrollmentController::class, 'leave']);
        Route::get('/courses/{id}/students', [EnrollmentController::class, 'students']);
        Route::delete('/courses/{id}/students/{studentId}', [EnrollmentController::class, 'kickStudent']);
        Route::put('/courses/{id}/students/{studentId}/grades', [CourseController::class, 'updateGrade']);
        Route::get('/courses/{course}/attendances', [AttendanceController::class, 'index']);
        Route::post('/courses/{course}/attendances', [AttendanceController::class, 'store']);

        Route::get('/assignments', [AssignmentController::class, 'index']);
        Route::get('/assignments/{id}', [AssignmentController::class, 'show']);
        Route::post('/assignments', [AssignmentController::class, 'store']);
        Route::delete('/assignments/{id}', [AssignmentController::class, 'destroy']);
        Route::post('/assignments/{id}/submit', [SubmissionController::class, 'submit']);
        Route::get('/assignments/{id}/submissions', [SubmissionController::class, 'assignmentSubmissions']);
        Route::get('/submissions/my', [SubmissionController::class, 'mySubmissions']);
        Route::put('/submissions/{id}/grade', [SubmissionController::class, 'grade']);

        Route::get('/materials', [MaterialController::class, 'index']);
        Route::post('/materials', [MaterialController::class, 'store']);
        Route::delete('/materials/{id}', [MaterialController::class, 'destroy']);

        Route::post('/attendances/self', [AttendanceController::class, 'selfAttend']);
        Route::get('/attendances/my', [AttendanceController::class, 'myAttendances']);

        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    });

    Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
        Route::get('/users', [AdminController::class, 'indexUsers']);
        Route::post('/users', [AdminController::class, 'storeUser']);
        Route::put('/users/{id}', [AdminController::class, 'updateUser']);
        Route::put('/users/{id}/reset-password', [AdminController::class, 'resetPassword']);
        Route::delete('/users/{id}', [AdminController::class, 'destroyUser']);
        Route::post('/users/bulk-import', [AdminController::class, 'bulkImport']);
    });
});
