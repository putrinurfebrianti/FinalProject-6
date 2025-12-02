import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

interface DashboardStats {
  total_orders?: number;
  pending_orders?: number;
  role?: string;
  branch_id?: number | null;
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

export default function CustomerDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    total_orders: 0,
    pending_orders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch orders dari API
        const response = await fetch("http://127.0.0.1:8000/api/user/orders", {
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
          // Jika endpoint belum ada, set manual ke 0
          console.log("Endpoint orders belum tersedia, menggunakan nilai default");
          setStats({
            total_orders: 0,
            pending_orders: 0,
          });
          return;
        }

        const data = await response.json();
        const orders = data.data || data || [];
        
        // Hitung statistik dari orders
        const totalOrders = orders.length;
        const pendingOrders = orders.filter((order: { status: string }) => 
          order.status === 'pending'
        ).length;
        
        setStats({
          total_orders: totalOrders,
          pending_orders: pendingOrders,
        });
        
      } catch (err) {
        console.error("Error fetching orders:", err);
        // Set ke 0 jika error
        setStats({
          total_orders: 0,
          pending_orders: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserOrders();
    
  }, [token]);

  return (
    <div className="p-4 space-y-6 sm:p-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold">
          Selamat Datang, {user ? user.name : "User"}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ini adalah halaman sambutan Anda.
        </p>
      </div>

      {isLoading && token && <p>Loading statistik...</p>}
      
      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <StatsCard 
          title="Total Pesanan Saya" 
          value={stats.total_orders || 0}
          details="Jumlah seluruh pesanan yang pernah Anda buat"
        />
        <StatsCard 
          title="Pesanan Pending" 
          value={stats.pending_orders || 0}
          details={(stats.pending_orders || 0) > 0 ? "Menunggu diproses oleh admin cabang" : "Semua pesanan telah diproses"}
        />
      </div>

      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold">Mulai Berbelanja</h2>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          Lihat katalog produk kami dan buat pesanan baru.
        </p>
        <Link 
          to="/products" 
          className="inline-block px-6 py-2 text-white transition bg-herbalife-600 rounded-lg hover:bg-herbalife-700 dark:bg-herbalife-500 dark:hover:bg-herbalife-600"
        >
          Lihat Katalog Produk Sekarang →
        </Link>
      </div>
    </div>
  );
}
