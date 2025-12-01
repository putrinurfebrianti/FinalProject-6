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
      // Load pending orders
      const ordersRes = await apiGet("/admin/orders");
      const ordersData = await ordersRes.json();
      const orders = Array.isArray(ordersData.data) ? ordersData.data : [];
      
      // Filter orders yang belum diproses (pending)
      const pending = orders.filter((order: Order) => order.status === 'pending');
      setPendingOrders(pending);

      // Load existing outbounds
      const outboundsRes = await apiGet("/admin/outbounds");
      const outboundsData = await outboundsRes.json();
      setOutbounds(Array.isArray(outboundsData.data) ? outboundsData.data : []);
    } catch (err) {
      console.error("Error loading data:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleProcessOrder = async (order: Order) => {
    if (!confirm(`Proses order ${order.order_number} dari ${order.customer?.name}?`)) {
      return;
    }

    setProcessing(order.id);

    try {
      // Buat outbound untuk setiap item dalam order
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

      alert(`Order ${order.order_number} berhasil diproses!`);
      await loadData();
    } catch (err) {
      console.error("Error processing order:", err);
      alert("Gagal memproses order!");
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Input Invoice (Outbound)</h1>

        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-herbalife-600 hover:bg-herbalife-700 text-white rounded-md transition-colors"
        >
          + Tambahkan Outbound
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600">Memuat data...</p>
      ) : (
        <div className="space-y-6">
          {/* Pending Orders Section */}
          {pendingOrders.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Order Masuk ({pendingOrders.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300">
                  <thead className="bg-herbalife-50">
                    <tr>
                      <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">#</th>
                      <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Order Number</th>
                      <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Customer</th>
                      <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Items</th>
                      <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Total</th>
                      <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Tanggal</th>
                      <th className="px-4 py-3 border text-center text-sm font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.map((order, i) => (
                      <tr key={order.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 border">{i + 1}</td>
                        <td className="px-4 py-3 border font-medium text-gray-900">{order.order_number}</td>
                        <td className="px-4 py-3 border text-gray-700">{order.customer?.name}</td>
                        <td className="px-4 py-3 border">
                          <div className="text-sm">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="text-gray-600">
                                {item.product?.name} (x{item.quantity})
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 border text-gray-700">
                          Rp {order.total_amount.toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3 border text-gray-600 text-sm">
                          {new Date(order.created_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-4 py-3 border text-center">
                          <button
                            onClick={() => handleProcessOrder(order)}
                            disabled={processing === order.id}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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

          {/* Existing Outbounds Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Data Outbound ({outbounds.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">#</th>
                    <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Invoice</th>
                    <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Produk</th>
                    <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Qty</th>
                    <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Tanggal</th>
                    <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Customer</th>
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
                        <td className="px-4 py-3 border font-medium text-gray-900">{item.order_number}</td>
                        <td className="px-4 py-3 border text-gray-700">
                          {item.product?.name ?? `#${item.product_id}`}
                        </td>
                        <td className="px-4 py-3 border text-gray-700">{item.quantity}</td>
                        <td className="px-4 py-3 border text-gray-600 text-sm">
                          {new Date(item.invoice_date).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-4 py-3 border text-gray-600">
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white shadow-lg rounded-lg p-6 w-[420px]">
            <h2 className="text-xl font-semibold mb-4">Tambah Outbound Manual</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Order Number"
                value={form.order_number}
                onChange={(e) =>
                  setForm({ ...form, order_number: e.target.value })
                }
                className="w-full border border-gray-300 p-2 rounded"
                required
              />

              <input
                type="number"
                placeholder="Product ID"
                value={form.product_id}
                onChange={(e) =>
                  setForm({ ...form, product_id: e.target.value })
                }
                className="w-full border border-gray-300 p-2 rounded"
                required
              />

              <input
                type="number"
                placeholder="Quantity"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: e.target.value })
                }
                className="w-full border border-gray-300 p-2 rounded"
                required
              />

              <DatePicker
                value={form.invoice_date}
                onChange={(date) => setForm({ ...form, invoice_date: date })}
                className="w-full border border-gray-300 p-2 rounded"
                options={{ dateFormat: "Y-m-d" }}
                placeholder="Pilih Tanggal"
                required
              />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-herbalife-600 hover:bg-herbalife-700 text-white rounded transition-colors"
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
