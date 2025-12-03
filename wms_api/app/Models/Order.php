<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;
    protected $fillable = [
        'order_number',
        'customer_id',
        'branch_id',
        'total_amount',
        'status'
    ];

    public static function generateOrderNumber(): string
    {
        $lastOrder = self::orderBy('id', 'desc')->first();

        if (!$lastOrder) {
            return 'OPH0000001';
        }

        $lastNumber = (int) substr($lastOrder->order_number, 3);
        $newNumber = $lastNumber + 1;

        return 'OPH' . str_pad($newNumber, 7, '0', STR_PAD_LEFT);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
