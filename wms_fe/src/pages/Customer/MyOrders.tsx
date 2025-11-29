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
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Cabang</th>
                <th className="px-6 py-3">Tanggal</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Item</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4">
                    {order.branch_name}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(order.created_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    Rp {order.total_amount?.toLocaleString('id-ID') || 0}
                  </td>
                  <td className="px-6 py-4">
                    {order.items && order.items.length > 0 ? (
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                            {item.product_name} ({item.quantity}x)
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
