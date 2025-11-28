import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

interface BranchStock {
  id: number;
  product_id: number;
  branch_id: number;
  stock: number;
  product?: {
    id: number;
    sku: string;
    name: string;
  };
}

// 🧩 Fungsi normalisasi agar FE tidak error apapun bentuk response backend-nya
const normalizeStocks = (data: any): BranchStock[] => {
  console.log("NORMALIZE INPUT:", data);

  // Case: array langsung
  if (Array.isArray(data)) return data;

  // Case: { stocks: [...] }
  if (Array.isArray(data?.stocks)) return data.stocks;

  // Case: { data: [...] }
  if (Array.isArray(data?.data)) return data.data;

  // Case: single object → buat jadi array
  if (data && typeof data === "object") return [data];

  // Default jika aneh
  return [];
};

export default function AdminBranchStock() {
  const { token } = useAuth();

  const [stocks, setStocks] = useState<BranchStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranchStock = async () => {
      if (!token) return;

      try {
        const response = await fetch("http://127.0.0.1:8000/api/admin/stock", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('Akses terlarang: Admin belum memilih cabang.');
          }
          throw new Error('Gagal mengambil data stok cabang.');
        }
        const data = await response.json();
        console.log("DATA API STOCK:", data);

        // 🟦 FIX: normalisasi supaya stocks selalu array
        const fixedStocks = normalizeStocks(data);

        setStocks(fixedStocks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi error.");
      } finally {
        setLoading(false);
      }
    };

    fetchBranchStock();
  }, [token]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Stok Cabang Anda</h1>

      {loading && <p>Memuat data stok...</p>}

      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && stocks.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border border-gray-300 divide-y divide-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Produk</th>
                <th className="px-4 py-2">SKU</th>
                <th className="px-4 py-2">Stok</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((item, index) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{item.product?.name || "-"}</td>
                  <td className="px-4 py-2">{item.product?.sku || "-"}</td>
                  <td className="px-4 py-2">{item.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && stocks.length === 0 && (
        <p>Tidak ada data stok untuk cabang ini.</p>
      )}
    </div>
  );
}
