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
            'file' => ['nullable', 'file', 'max:51200', 'mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,zip,rar,png,jpg,jpeg,txt,csv'],
            'note' => ['nullable', 'string', 'max:5000'],
        ];
    }
}

