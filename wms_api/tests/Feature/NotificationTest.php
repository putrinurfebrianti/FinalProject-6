<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Branch;
use App\Models\Product;
use App\Models\BranchStock;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Notification;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_creation_notifies_admins_and_customer()
    {
        // Seed roles and setup
        $branch = Branch::create(['name' => 'Test Branch']);

        $admin = User::create(['name' => 'Admin', 'email' => 'admin@test.local', 'password' => bcrypt('password'), 'role' => 'admin', 'branch_id' => $branch->id]);
        $superadmin = User::create(['name' => 'Super', 'email' => 'super@test.local', 'password' => bcrypt('password'), 'role' => 'superadmin']);
        $customer = User::create(['name' => 'Customer', 'email' => 'cust@test.local', 'password' => bcrypt('password'), 'role' => 'user']);

        $product = Product::create(['sku' => 'SKU123', 'name' => 'Test Product', 'central_stock' => 100, 'price' => 10]);

        // ensure branch stock
        BranchStock::create(['branch_id' => $branch->id, 'product_id' => $product->id, 'stock' => 10]);

        $this->actingAs($customer, 'sanctum');

        $payload = [
            'branch_id' => $branch->id,
            'items' => [[ 'product_id' => $product->id, 'quantity' => 1 ]]
        ];

        $res = $this->postJson('/api/user/orders', $payload);
        $res->assertStatus(201);

        // check notification for admin
        $this->assertDatabaseHas('notifications', ['type' => 'order_created', 'user_id' => $admin->id]);

        // check notification for superadmin
        $this->assertDatabaseHas('notifications', ['type' => 'order_created', 'user_id' => $superadmin->id]);

        // check confirmation for customer
        $this->assertDatabaseHas('notifications', ['type' => 'order_confirmation', 'user_id' => $customer->id]);
    }

    public function test_inbound_bulk_notifies_branch_admins_and_superadmins()
    {
        $branch = Branch::create(['name' => 'Test Branch']);

        $admin = User::create(['name' => 'Admin', 'email' => 'admin2@test.local', 'password' => bcrypt('password'), 'role' => 'admin', 'branch_id' => $branch->id]);
        $superadmin = User::create(['name' => 'Super', 'email' => 'super2@test.local', 'password' => bcrypt('password'), 'role' => 'superadmin']);

        $product = Product::create(['sku' => 'SKU1234', 'name' => 'Test Product 2', 'central_stock' => 100, 'price' => 10]);

        $this->actingAs($superadmin, 'sanctum');

        $payload = [
            'branch_id' => $branch->id,
            'date' => now()->toDateString(),
            'items' => [['product_id' => $product->id, 'quantity' => 2]]
        ];

        $res = $this->postJson('/api/superadmin/inbounds/bulk', $payload);
        $res->assertStatus(201);

        $this->assertDatabaseHas('notifications', ['type' => 'inbound_created', 'user_id' => $admin->id]);
        $this->assertDatabaseHas('notifications', ['type' => 'inbound_created', 'user_id' => $superadmin->id]);
    }

    public function test_outbound_notifies_customer_when_order_shipped()
    {
        $branch = Branch::create(['name' => 'Test Branch']);

        $admin = User::create(['name' => 'Admin', 'email' => 'admin3@test.local', 'password' => bcrypt('password'), 'role' => 'admin', 'branch_id' => $branch->id]);
        $customer = User::create(['name' => 'Customer2', 'email' => 'cust2@test.local', 'password' => bcrypt('password'), 'role' => 'user']);

        $product = Product::create(['sku' => 'SKU567', 'name' => 'Test Product 3', 'central_stock' => 100, 'price' => 10]);

        // Create order for customer
        $order = Order::create(['order_number' => 'ORD-123456', 'customer_id' => $customer->id, 'branch_id' => $branch->id, 'total_amount' => 10, 'status' => 'pending']);
        OrderItem::create(['order_id' => $order->id, 'product_id' => $product->id, 'quantity' => 1, 'price' => 10]);

        $this->actingAs($admin, 'sanctum');

        $payload = [
            'order_number' => 'INV-123',
            'product_id' => $product->id,
            'quantity' => 1,
            'invoice_date' => now()->toDateString(),
            'order_id' => $order->id
        ];

        $res = $this->postJson('/api/admin/outbounds', $payload);
        $res->assertStatus(201);

        $this->assertDatabaseHas('notifications', ['type' => 'outbound_shipped', 'user_id' => $customer->id]);
    }

    public function test_report_generation_notifies_supervisors_and_superadmins()
    {
        $branch = Branch::create(['name' => 'Report Branch']);
        $admin = User::create(['name' => 'AdminReport', 'email' => 'admin.r@test.local', 'password' => bcrypt('password'), 'role' => 'admin', 'branch_id' => $branch->id]);
        $superadmin = User::create(['name' => 'SuperReport', 'email' => 'super.r@test.local', 'password' => bcrypt('password'), 'role' => 'superadmin']);
        $supervisor = User::create(['name' => 'Supv', 'email' => 'supv@test.local', 'password' => bcrypt('password'), 'role' => 'supervisor', 'branch_id' => $branch->id]);

        $product = Product::create(['sku' => 'REP1', 'name' => 'Report Product', 'central_stock' => 100, 'price' => 10]);
        // Create outbound and inbound data for the day so the report contains some data
        \App\Models\Outbound::create(['order_number' => 'OUT-1', 'product_id' => $product->id, 'quantity' => 1, 'invoice_date' => now()->toDateString(), 'branch_id' => $branch->id, 'admin_id' => $admin->id]);
        \App\Models\Inbound::create(['product_id' => $product->id, 'quantity' => 2, 'branch_id' => $branch->id, 'date' => now()->toDateString(), 'sent_by_user_id' => $superadmin->id, 'status' => 'received']);

        $this->actingAs($admin, 'sanctum');
        $res = $this->postJson('/api/admin/reports/generate');
        $res->assertStatus(201);

        $this->assertDatabaseHas('notifications', ['type' => 'report_created', 'user_id' => $supervisor->id]);
        $this->assertDatabaseHas('notifications', ['type' => 'report_created', 'user_id' => $superadmin->id]);
    }

    public function test_notification_index_returns_unread_count_and_actor()
    {
        $branch = Branch::create(['name' => 'Index Branch']);
        $admin = User::create(['name' => 'AdminIndex', 'email' => 'admin.i@test.local', 'password' => bcrypt('password'), 'role' => 'admin', 'branch_id' => $branch->id]);
        $superadmin = User::create(['name' => 'SuperIndex', 'email' => 'super.i@test.local', 'password' => bcrypt('password'), 'role' => 'superadmin']);

        // Create a notification manually for admin
        \App\Models\Notification::create(['user_id' => $admin->id, 'actor_id' => $superadmin->id, 'type' => 'test', 'data' => json_encode(['msg' => 'hello'])]);

        $this->actingAs($admin, 'sanctum');
        $res = $this->getJson('/api/notifications');
        $res->assertStatus(200);
        $res->assertJsonStructure(['data', 'unread_count']);

        $payload = $res->json();
        $this->assertEquals(1, $payload['unread_count']);
        $this->assertArrayHasKey('actor', $payload['data'][0]);
    }

    public function test_mark_read_endpoint_updates_notification()
    {
        $branch = Branch::create(['name' => 'MarkRead Branch']);
        $admin = User::create(['name' => 'AdminMark', 'email' => 'admin.m@test.local', 'password' => bcrypt('password'), 'role' => 'admin', 'branch_id' => $branch->id]);
        $superadmin = User::create(['name' => 'SuperMark', 'email' => 'super.m@test.local', 'password' => bcrypt('password'), 'role' => 'superadmin']);

        $notification = \App\Models\Notification::create(['user_id' => $admin->id, 'actor_id' => $superadmin->id, 'type' => 'test_mark', 'data' => ['msg' => 'hi']]);

        $this->actingAs($admin, 'sanctum');
        $res = $this->patchJson('/api/notifications/' . $notification->id . '/read');
        $res->assertStatus(200);
        $this->assertDatabaseHas('notifications', ['id' => $notification->id, 'is_read' => 1]);
    }

    public function test_mark_unread_endpoint_updates_notification()
    {
        $branch = Branch::create(['name' => 'MarkRead Branch']);
        $admin = User::create(['name' => 'AdminMark', 'email' => 'admin.m@test.local', 'password' => bcrypt('password'), 'role' => 'admin', 'branch_id' => $branch->id]);
        $superadmin = User::create(['name' => 'SuperMark', 'email' => 'super.m@test.local', 'password' => bcrypt('password'), 'role' => 'superadmin']);

        $notification = \App\Models\Notification::create(['user_id' => $admin->id, 'actor_id' => $superadmin->id, 'type' => 'test_mark', 'data' => ['msg' => 'hi']]);

        $this->actingAs($admin, 'sanctum');
        $res = $this->patchJson('/api/notifications/' . $notification->id . '/read');
        $res->assertStatus(200);

        $res = $this->patchJson('/api/notifications/' . $notification->id . '/unread');
        $res->assertStatus(200);
        $this->assertDatabaseHas('notifications', ['id' => $notification->id, 'is_read' => 0]);
    }
}
