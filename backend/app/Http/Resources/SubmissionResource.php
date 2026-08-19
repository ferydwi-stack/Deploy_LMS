<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubmissionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'assignment_id' => $this->assignment_id,
            'student_id' => $this->student_id,
            'file_path' => $this->file_path,
            'original_filename' => $this->original_filename,
            'note' => $this->note,
            'score' => $this->score,
            'teacher_feedback' => $this->teacher_feedback,
            'status' => $this->status,
            'submitted_at' => $this->submitted_at,
            'assignment' => new AssignmentResource($this->whenLoaded('assignment')),
            'student' => new UserResource($this->whenLoaded('student')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
