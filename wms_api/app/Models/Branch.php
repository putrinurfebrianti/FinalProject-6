<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'address'];

    public function employees()
    {
        return $this->hasMany(User::class);
    }

    public function stockItems()
    {
        return $this->hasMany(BranchStock::class);
    }
}