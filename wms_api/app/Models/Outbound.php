<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Outbound extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'order_id',
        'branch_id',
        'admin_id',
        'product_id',
        'quantity',
        'invoice_date'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}