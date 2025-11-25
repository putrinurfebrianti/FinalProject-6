import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  branch_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  items?: OrderItem[];
}

export default function MyOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("http://127.0.0.1:8000/api/user/orders/history", {
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
          throw new Error("Gagal mengambil riwayat pesanan.");
        }

        const data = await response.json();
        setOrders(data.data || data);
        
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Terjadi error yang tidak diketahui.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
    
  }, [token]);

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[status] || "bg-gray-100 text-gray-800"}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="p-4 space-y-6 sm:p-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold">
          Riwayat Pesanan Saya
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Lihat semua pesanan yang pernah Anda buat.
        </p>
      </div>

      {isLoading && <p>Loading pesanan...</p>}
      
      {error && <p className="text-red-500">Error: {error}</p>}

      {orders && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="p-6 bg-white border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Order #{order.id}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Cabang: {order.branch_name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tanggal: {new Date(order.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div>
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="mb-4">
                  <h4 className="mb-2 font-medium text-gray-900 dark:text-white">Item:</h4>
                  <ul className="space-y-1">
                    {order.items.map((item) => (
                      <li key={item.id} className="text-sm text-gray-600 dark:text-gray-400">
                        {item.product_name} - {item.quantity}x @ Rp {item.price?.toLocaleString('id-ID')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total: Rp {order.total_amount?.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && orders.length === 0 && !error && (
        <div className="p-6 text-center bg-white border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800">
          <p className="text-gray-500">Anda belum memiliki pesanan.</p>
        </div>
      )}
    </div>
  );
}
