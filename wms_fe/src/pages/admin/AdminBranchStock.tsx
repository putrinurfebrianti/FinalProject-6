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

// 🧩 Normalisasi response backend agar tidak error
const normalizeStocks = (data: any): BranchStock[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.stocks)) return data.stocks;
  if (Array.isArray(data?.data)) return data.data;
  if (data && typeof data === "object") return [data];
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
            throw new Error("Akses terlarang: Admin belum memilih cabang.");
          }
          throw new Error("Gagal mengambil data stok cabang.");
        }

        const data = await response.json();
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

          {/* ============================ */}
          {/*        TABEL ELEGAN          */}
          {/* ============================ */}

          <table className="w-full border border-gray-300 text-xs rounded-lg shadow-md">
            <thead>
              <tr className="bg-[#A7DCA5] text-black font-semibold text-center">
                <th className="border border-gray-300 px-3 py-2">NO.</th>
                <th className="border border-gray-300 px-3 py-2">SKU</th>
                <th className="border border-gray-300 px-3 py-2">DESKRIPSI JENIS</th>
                <th className="border border-gray-300 px-3 py-2">LOT</th>
                <th className="border border-gray-300 px-3 py-2">STOCK AWAL</th>

                {/* LBR D01–D08 */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <th
                    key={i}
                    className="border border-gray-300 px-3 py-2 bg-[#FFB8B8] text-black"
                  >
                    LBR D0{i + 1}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {stocks.map((item, index) => (
                <tr
                  key={item.id}
                  className="border border-gray-300"
                  style={{
                    background: index % 2 === 0 ? "#F7F7F7" : "#ECECEC",
                  }}
                >
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {index + 1}
                  </td>

                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {item.product?.sku}
                  </td>

                  <td className="border border-gray-300 px-3 py-2">
                    {item.product?.name}
                  </td>

                  <td className="border border-gray-300 px-3 py-2 text-center">
                    LOT-XXXX
                  </td>

                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {item.stock}
                  </td>

                  {/* Kolom warna pastel D01–D08 */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <td
                      key={i}
                      className="border border-gray-300 px-3 py-2 text-center font-semibold"
                      style={{
                        background: "#FFE8E8",
                        color: "#444",
                      }}
                    >
                      0
                    </td>
                  ))}
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
