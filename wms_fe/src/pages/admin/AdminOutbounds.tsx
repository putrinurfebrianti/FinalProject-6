import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiGet, apiPost } from "../../utils/api";

interface Outbound {
  id: number;
  order_number: string;
  product_id: number;
  quantity: number;
  invoice_date: string;
  status?: string;
  product?: {
    id: number;
    name: string;
    sku: string;
  };
}

// Normalisasi supaya aman untuk semua bentuk API backend
const normalizeOutbounds = (data: any): Outbound[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.outbounds)) return data.outbounds;
  if (Array.isArray(data.data)) return data.data;
  return [];
};

export default function AdminOutbounds() {
  const { token } = useAuth();

  const [outbounds, setOutbounds] = useState<Outbound[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    order_number: "",
    product_id: "",
    quantity: "",
    invoice_date: "",
  });

  // ---- Fetch Outbounds ----
  const loadOutbounds = async () => {
    if (!token) return;

    try {
      const res = await apiGet('/admin/outbounds');
      const data = await res.json();
      setOutbounds(normalizeOutbounds(data));
    } catch (err) {
      console.error("Error fetch outbounds:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadOutbounds();
  }, [token]);

  // ---- Submit Form ----
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      await apiPost('/admin/outbounds', {
        order_number: form.order_number,
        product_id: Number(form.product_id),
        quantity: Number(form.quantity),
        invoice_date: form.invoice_date,
      });

      alert("Outbound berhasil ditambahkan!");

      // ✔ Ambil ulang data tabel dari backend (supaya product & status lengkap)
      await loadOutbounds();

      setShowForm(false);
      setForm({
        order_number: "",
        product_id: "",
        quantity: "",
        invoice_date: "",
      });
    } catch (err) {
      alert("Gagal menambahkan outbound!");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Data Outbound</h1>

        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        >
          + Tambahkan Outbound
        </button>
      </div>

      {/* ---------------- TABLE ---------------- */}
      {loading ? (
        <p>Memuat...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">#</th>
                <th className="px-4 py-2 border">Invoice</th>
                <th className="px-4 py-2 border">Produk</th>
                <th className="px-4 py-2 border">Qty</th>
                <th className="px-4 py-2 border">Tanggal</th>
                <th className="px-4 py-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {outbounds.map((item, i) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2 border">{i + 1}</td>
                  <td className="px-4 py-2 border">{item.order_number}</td>
                  <td className="px-4 py-2 border">
                    {item.product?.name ?? `#${item.product_id}`}
                  </td>
                  <td className="px-4 py-2 border">{item.quantity}</td>
                  <td className="px-4 py-2 border">{item.invoice_date}</td>

                  <td className="px-4 py-2 border">
                    <span
                      className={`px-2 py-1 rounded text-white text-sm ${
                        item.status === "Completed"
                          ? "bg-green-600"
                          : item.status === "Cancelled"
                          ? "bg-red-600"
                          : "bg-yellow-500"
                      }`}
                    >
                      {item.status ?? "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------------- FORM POPUP ---------------- */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white shadow-lg rounded-lg p-6 w-[420px]">
            <h2 className="text-xl font-semibold mb-4">Tambah Outbound</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Order Number"
                value={form.order_number}
                onChange={(e) =>
                  setForm({ ...form, order_number: e.target.value })
                }
                className="w-full border p-2 rounded"
                required
              />

              <input
                type="number"
                placeholder="Product ID"
                value={form.product_id}
                onChange={(e) =>
                  setForm({ ...form, product_id: e.target.value })
                }
                className="w-full border p-2 rounded"
                required
              />

              <input
                type="number"
                placeholder="Quantity"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: e.target.value })
                }
                className="w-full border p-2 rounded"
                required
              />

              <input
                type="date"
                value={form.invoice_date}
                onChange={(e) =>
                  setForm({ ...form, invoice_date: e.target.value })
                }
                className="w-full border p-2 rounded"
                required
              />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
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
