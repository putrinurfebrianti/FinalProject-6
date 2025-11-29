import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiGet } from "../../utils/api";

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  category: string;
  image: string | null;
  central_stock: number;
}

const ProductCard = ({ product }: { product: Product }) => {
  // Placeholder SVG sebagai data URL (tidak perlu internet)
  const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
  
  const imageUrl = product.image 
    ? `http://127.0.0.1:8000/${product.image}` 
    : placeholderImage;

  return (
    <div className="overflow-hidden transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-800 hover:shadow-md">
      {/* Product Image */}
      <div className="w-full overflow-hidden bg-gray-100 aspect-square dark:bg-gray-700">
        <img 
          src={imageUrl} 
          alt={product.name}
          className="object-cover w-full h-full"
          onError={(e) => {
            e.currentTarget.src = placeholderImage;
          }}
        />
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
          {product.name}
        </h3>
        <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
          SKU: {product.sku}
        </p>
        <p className="mb-1 text-xs font-medium text-herbalife-600 dark:text-herbalife-400">
          {product.category}
        </p>
        <p className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
          Rp {product.price?.toLocaleString('id-ID') || '-'}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Stok: <span className="font-semibold">{product.central_stock || 0}</span>
          </p>
          {product.central_stock > 0 && (
            <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded dark:bg-green-900 dark:text-green-300">
              Tersedia
            </span>
          )}
        </div>
      </div>
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
          const response = await apiGet('/products');

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
