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

    protected $appends = ['message'];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function actor() {
        return $this->belongsTo(User::class, 'actor_id');
    }

    public function getMessageAttribute()
    {
        $actorName = $this->actor ? $this->actor->name : 'Sistem';
        $data = $this->data ?? [];

        return match($this->type) {
            'order_created' => "{$actorName} membuat order baru #{$data['order_number']} dengan total Rp" . number_format($data['total_amount'] ?? 0, 0, ',', '.'),
            'order_confirmation' => "Order Anda #{$data['order_number']} telah diterima dan sedang diproses",
            'order_completed' => "Order Anda #{$data['order_number']} telah selesai diproses dan siap dikirim",
            'order_completed_supervisor' => "Order #{$data['order_number']} dari {$data['customer_name']} telah selesai diproses",
            'inbound_created' => "{$actorName} mengirim inbound {$data['quantity']} unit {$data['product_name']} ke cabang Anda",
            'outbound_created' => "{$actorName} membuat outbound {$data['quantity']} unit {$data['product_name']} dari cabang Anda",
            'outbound_shipped' => "Order Anda #{$data['order_number']} telah dikirim",
            'report_created' => "{$actorName} membuat laporan {$data['report_type']} untuk cabang Anda",
            'report_verified' => "{$actorName} telah memverifikasi laporan Anda",
            'product_created' => "{$actorName} menambahkan produk baru: {$data['name']}",
            'product_updated' => "{$actorName} mengupdate produk: {$data['name']}",
            'product_deleted' => "{$actorName} menghapus produk: {$data['name']}",
            'branch_created' => "Cabang baru dibuat: {$data['name']}",
            'branch_updated' => "Informasi cabang {$data['name']} telah diupdate",
            'branch_deleted' => "Cabang {$data['name']} telah dihapus",
            'user_registered' => "{$actorName} ({$data['role']}) telah terdaftar di cabang Anda",
            'user_updated' => "Informasi user {$actorName} ({$data['role']}) telah diupdate",
            'user_deleted' => "User {$actorName} ({$data['role']}) telah dihapus",
            default => "Notifikasi baru: {$this->type}",
        };
    }
}
