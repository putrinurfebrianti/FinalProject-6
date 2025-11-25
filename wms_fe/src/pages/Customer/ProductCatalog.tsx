import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  central_stock: number;
}

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        {product.name}
      </h3>
      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
        SKU: {product.sku}
      </p>
      <p className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
        Rp {product.price?.toLocaleString('id-ID') || '-'}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Stok Pusat: {product.central_stock || 0}
      </p>
    </div>
  );
};

export default function ProductCatalog() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!token) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("http://127.0.0.1:8000/api/products", {
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
          throw new Error("Gagal mengambil data produk.");
        }

        const data = await response.json();
        setProducts(data.data || data);
        
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

    fetchProducts();
    
  }, [token]);

  return (
    <div className="p-4 space-y-6 sm:p-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold">
          Katalog Produk
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Lihat semua produk yang tersedia.
        </p>
      </div>

      {isLoading && <p>Loading produk...</p>}
      
      {error && <p className="text-red-500">Error: {error}</p>}

      {products && products.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {!isLoading && products.length === 0 && !error && (
        <p className="text-gray-500">Tidak ada produk tersedia.</p>
      )}
    </div>
  );
}
