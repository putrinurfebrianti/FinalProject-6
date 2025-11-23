<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BranchStock extends Model
{
    use HasFactory;
    
    protected $table = 'branch_stock';

    protected $fillable = ['branch_id', 'product_id', 'stock'];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}