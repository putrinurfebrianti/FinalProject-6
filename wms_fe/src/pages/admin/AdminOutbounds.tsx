import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiGet, apiPost } from "../../utils/api";
import DatePicker from "../../components/form/DatePicker";

interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  branch_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  customer?: {
    id: number;
    name: string;
    email: string;
  };
  items?: Array<{
    id: number;
    product_id: number;
    quantity: number;
    price: number;
    product?: {
      id: number;
      name: string;
      sku: string;
    };
  }>;
}

interface Outbound {
  id: number;
  order_number: string;
  order_id?: number;
  product_id: number;
  quantity: number;
  invoice_date: string;
  product?: {
    id: number;
    name: string;
    sku: string;
  };
  order?: {
    id: number;
    order_number: string;
    customer?: {
      name: string;
    };
  };
}

export default function AdminOutbounds() {
  const { token } = useAuth();

  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [outbounds, setOutbounds] = useState<Outbound[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [processing, setProcessing] = useState<number | null>(null);

  const [form, setForm] = useState({
    order_number: "",
    product_id: "",
    quantity: "",
    invoice_date: null as Date | null,
  });

  const loadData = async () => {
    if (!token) return;

    try {
      const timestamp = new Date().getTime();
      const ordersRes: Response = await apiGet(`/admin/orders?_t=${timestamp}`);
      const ordersData = await ordersRes.json();
      const orders = Array.isArray(ordersData.data) ? ordersData.data : [];
      const pending = orders.filter((order: Order) => order.status === 'pending');
      setPendingOrders(pending);
      const outboundsRes: Response = await apiGet(`/admin/outbounds?_t=${timestamp}`);
      const outboundsData = await outboundsRes.json();
      setOutbounds(Array.isArray(outboundsData.data) ? outboundsData.data : []);
    } catch (err) {
      console.error("Error loading data:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleProcessOrder = async (order: Order) => {
    if (!confirm(`Proses order ${order.order_number} dari ${order.customer?.name}?`)) {
      return;
    }

    setProcessing(order.id);

    try {
      const today = new Date().toISOString().split("T")[0];
      
      if (!order.items || order.items.length === 0) {
        alert("Order tidak memiliki item!");
        setProcessing(null);
        return;
      }

      for (const item of order.items) {
        await apiPost("/admin/outbounds", {
          order_number: order.order_number,
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          invoice_date: today,
        });
      }

      alert(`✅ Order ${order.order_number} berhasil diproses!`);
      await loadData();
    } catch (err) {
      console.error("Error processing order:", err);
      alert("❌ Gagal memproses order! Silakan coba lagi.");
    }

    setProcessing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await apiPost("/admin/outbounds", {
        order_number: form.order_number,
        product_id: Number(form.product_id),
        quantity: Number(form.quantity),
        invoice_date: form.invoice_date
          ? form.invoice_date.toISOString().split("T")[0]
          : "",
      });

      alert("Outbound berhasil ditambahkan!");

      await loadData();

      setShowForm(false);
      setForm({
        order_number: "",
        product_id: "",
        quantity: "",
        invoice_date: null,
      });
    } catch {
      alert("Gagal menambahkan outbound!");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Input Invoice (Outbound)</h1>

        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 text-white transition-colors rounded-md bg-herbalife-600 hover:bg-herbalife-700"
        >
          + Tambahkan Outbound
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600">Memuat data...</p>
      ) : (
        <div className="space-y-6">
          {pendingOrders.length > 0 && (
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">
                Order Masuk ({pendingOrders.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300">
                  <thead className="bg-herbalife-50">
                    <tr>
                      <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700 border">#</th>
                      <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700 border">Order Number</th>
                      <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700 border">Customer</th>
                      <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700 border">Items</th>
                      <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700 border">Total</th>
                      <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700 border">Tanggal</th>
                      <th className="px-4 py-3 text-sm font-semibold text-center text-gray-700 border">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.map((order, i) => (
                      <tr key={order.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 border">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-900 border">{order.order_number}</td>
                        <td className="px-4 py-3 text-gray-700 border">{order.customer?.name}</td>
                        <td className="px-4 py-3 border">
                          <div className="text-sm">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="text-gray-600">
                                {item.product?.name} (x{item.quantity})
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700 border">
                          Rp {order.total_amount.toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 border">
                          {new Date(order.created_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-4 py-3 text-center border">
                          <button
                            onClick={() => handleProcessOrder(order)}
                            disabled={processing === order.id}
                            className="px-4 py-2 text-sm text-white transition-colors bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            {processing === order.id ? "Memproses..." : "Proses"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Data Outbound ({outbounds.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700 border">#</th>
                    <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700 border">Invoice</th>
                    <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700 border">Produk</th>
                    <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700 border">Qty</th>
                    <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700 border">Tanggal</th>
                    <th className="px-4 py-3 text-sm font-semibold text-left text-gray-700 border">Customer</th>
                  </tr>
                </thead>
                <tbody>
                  {outbounds.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                        Belum ada outbound yang tercatat
                      </td>
                    </tr>
                  ) : (
                    outbounds.map((item, i) => (
                      <tr key={item.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 border">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-900 border">{item.order_number}</td>
                        <td className="px-4 py-3 text-gray-700 border">
                          {item.product?.name ?? `#${item.product_id}`}
                        </td>
                        <td className="px-4 py-3 text-gray-700 border">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 border">
                          {new Date(item.invoice_date).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-4 py-3 text-gray-600 border">
                          {item.order?.customer?.name ?? '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white shadow-lg rounded-lg p-6 w-[420px]">
            <h2 className="mb-4 text-xl font-semibold">Tambah Outbound Manual</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Order Number"
                value={form.order_number}
                onChange={(e) =>
                  setForm({ ...form, order_number: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded"
                required
              />

              <input
                type="number"
                placeholder="Product ID"
                value={form.product_id}
                onChange={(e) =>
                  setForm({ ...form, product_id: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded"
                required
              />

              <input
                type="number"
                placeholder="Quantity"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded"
                required
              />

              <DatePicker
                value={form.invoice_date}
                onChange={(date) => setForm({ ...form, invoice_date: date })}
                className="w-full p-2 border border-gray-300 rounded"
                options={{ dateFormat: "Y-m-d" }}
                placeholder="Pilih Tanggal"
                required
              />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-white transition-colors bg-gray-400 rounded hover:bg-gray-500"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 text-white transition-colors rounded bg-herbalife-600 hover:bg-herbalife-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
