<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inbound extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'product_id',
        'branch_id',
        'sent_by_user_id',
        'status',
        'quantity',
        'date'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sent_by_user_id');
    }
}