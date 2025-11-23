<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;
    
    protected $fillable = ['sku', 'name', 'category', 'central_stock'];

    public function branchStocks()
    {
        return $this->hasMany(BranchStock::class);
    }
}