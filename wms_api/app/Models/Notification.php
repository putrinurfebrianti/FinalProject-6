<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'actor_id', 'type', 'data', 'is_read'];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function actor() {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
