<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_type',
        'report_date',
        'branch_id',
        'generated_by_id',
        'is_verified',
        'verified_by_id',
        'verification_date',
        'data',
    ];
    
    protected $casts = [
        'data' => 'array', 
    ];

    public function branch() {
        return $this->belongsTo(Branch::class);
    }
    
    public function generator() {
        return $this->belongsTo(User::class, 'generated_by_id');
    }
    
    public function verifier() {
        return $this->belongsTo(User::class, 'verified_by_id');
    }
}