<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['nullable', 'file', 'max:10240', 'mimes:pdf,doc,docx,zip,rar,png,jpg,jpeg'],
            'note' => ['nullable', 'string'],
        ];
    }
}
