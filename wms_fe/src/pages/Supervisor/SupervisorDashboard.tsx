import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

interface DashboardStats {
  branch_name?: string;
  total_stock_in_branch?: number;
  inbounds_today?: number;
  outbounds_today_invoice?: number;
  pending_orders_branch?: number;
  pending_reports?: number;
  [key: string]: unknown;
}

const StatsCard = ({ title, value, details }: { title: string, value: string | number, details?: string }) => {
  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <p className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </p>
      <h3 className="text-3xl font-semibold text-gray-900 dark:text-white">
        {value}
      </h3>
      {details && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {details}
        </p>
      )}
    </div>
  );
};

export default function SupervisorDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      
      if (!token) {
        return;
      }

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
          if (response.status === 401) {
            throw new Error("Sesi Anda telah habis. Silakan login kembali.");
          }
          throw new Error("Gagal mengambil data dashboard.");
        }

        const data = await response.json();
        console.log('Dashboard data:', data); // Debug
        setStats(data.data || data.stats || data); 
        
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Terjadi error yang tidak diketahui.");
        }
      }
    };

    fetchDashboardStats();
    
  }, [token]); 

  return (
    <div className="p-4 space-y-6 sm:p-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold">
          Selamat Datang, {user ? user.name : "Supervisor"}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {stats?.branch_name ? `Ini adalah ringkasan untuk ${stats.branch_name}.` : "Ini adalah ringkasan untuk cabang Anda."}
        </p>
      </div>

      {isLoading && token && <p>Loading statistik...</p>}
      
      {error && <p className="text-red-500">Error: {error}</p>}

      {stats && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stats.pending_reports !== undefined && (
            <StatsCard 
              title="Laporan Menunggu Verifikasi" 
              value={stats.pending_reports}
              details="Laporan yang belum diverifikasi"
            />
          )}
          <StatsCard 
            title="Total Stok Cabang" 
            value={stats.total_stock_in_branch !== undefined ? stats.total_stock_in_branch : "N/A"}
            details="Total unit produk di cabang"
          />
          <StatsCard 
            title="Inbound Hari Ini" 
            value={stats.inbounds_today !== undefined ? stats.inbounds_today : "N/A"}
            details="Barang masuk hari ini"
          />
          <StatsCard 
            title="Outbound Hari Ini" 
            value={stats.outbounds_today_invoice !== undefined ? stats.outbounds_today_invoice : "N/A"}
            details="Barang keluar hari ini"
          />
          <StatsCard 
            title="Order Pending" 
            value={stats.pending_orders_branch !== undefined ? stats.pending_orders_branch : "N/A"}
            details="Order menunggu diproses"
          />
        </div>
      )}

      {!stats && !isLoading && !error && token && (
         <p>Berhasil terhubung, tetapi tidak ada data statistik.</p>
      )}

    </div>
  );
}