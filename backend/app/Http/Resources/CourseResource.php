<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
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
            'title' => $this->title,
            'description' => $this->description,
            'code' => $this->code,
            'attendance_open_time' => $this->attendance_open_time?->format('H:i'),
            'attendance_close_time' => $this->attendance_close_time?->format('H:i'),
            'teacher' => new UserResource($this->whenLoaded('teacher')),
            'materials_count' => $this->when(isset($this->materials_count), $this->materials_count),
            'assignments_count' => $this->when(isset($this->assignments_count), $this->assignments_count),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
