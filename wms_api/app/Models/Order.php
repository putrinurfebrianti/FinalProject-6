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

    /**
     * Generate order number with format OPH0000001, OPH0000002, etc.
     */
    public static function generateOrderNumber(): string
    {
        // Get the last order number
        $lastOrder = self::orderBy('id', 'desc')->first();
        
        if (!$lastOrder) {
            return 'OPH0000001';
        }
        
        // Extract number from last order (OPH0000001 -> 1)
        $lastNumber = (int) substr($lastOrder->order_number, 3);
        $newNumber = $lastNumber + 1;
        
        // Format with leading zeros (7 digits total)
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