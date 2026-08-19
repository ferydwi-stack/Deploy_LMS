<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $courseId = $this->route('id') ?? $this->route('course');

        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'code' => ['sometimes', 'required', 'string', 'max:255', 'unique:courses,code,'.$courseId],
            'teacher_id' => ['nullable', 'exists:users,id'],
        ];
    }
}
