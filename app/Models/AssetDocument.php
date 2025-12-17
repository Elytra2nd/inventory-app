<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssetDocument extends Model
{
    protected $guarded = ['id'];
    protected $casts = [
        'expiry_date' => 'date',
    ];
}
