<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FileStorage extends Model
{
    protected $table = 'file_storages';

    protected $fillable = [
        'path',
        'file_name',
        'mime_type',
        'file_size',
        'content_base64',
    ];
}
