import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

interface DashboardStats {
  branch_name: string;
  total_stock_in_branch: string | number;
  inbounds_today: string | number;
  outbounds_today_invoice: string | number;
  pending_orders_branch: number;
}

const StatsCard = ({
  title,
  value,
  details
}: { title: string; value: string | number; details?: string }) => {
  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <p className="mb-1 text-sm font-medium text-gray-500">
        {title}
      </p>
      <h3 className="text-3xl font-semibold text-gray-900">
        {value}
      </h3>
      {details && (
        <p className="mt-2 text-sm text-gray-500">{details}</p>
      )}
    </div>
  );
};

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!token) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("http://127.0.0.1:8000/api/dashboard/stats", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data dashboard admin.");
        }

        const result = await response.json();

        // ⬇ backend pakai "data", bukan "stats"
        if (result && result.data) {
          setStats(result.data);
        } else {
          setError("Struktur API tidak sesuai.");
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi error.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, [token]);

  return (
    <div className="p-4 space-y-6 sm:p-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold">
          Selamat Datang, {user ? user.name : "Admin"}!
        </h1>
        <p className="text-gray-600">
          Berikut adalah ringkasan data cabang Anda.
        </p>
      </div>

      {isLoading && <p>Loading statistik...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {stats && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          <StatsCard
            title="Total Stok Cabang Anda"
            value={stats.total_stock_in_branch}
          />

          <StatsCard
            title="Barang Masuk Hari Ini"
            value={stats.inbounds_today}
          />

          <StatsCard
            title="Invoice Keluar Hari Ini"
            value={stats.outbounds_today_invoice}
          />

          <StatsCard
            title="Pending Orders"
            value={stats.pending_orders_branch}
          />

        </div>
      )}

      {!stats && !isLoading && !error && (
        <p>Tidak ada data statistik.</p>
      )}
    </div>
  );
}
