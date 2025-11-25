import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

interface Branch {
  id: number;
  name: string;
  address: string;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
}

interface OrderItem {
  product_id: number;
  quantity: number;
}

export default function OrderForm() {
  const { token } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      if (!token) return;

      try {
        const response = await fetch("http://127.0.0.1:8000/api/branches", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
        });

        if (!response.ok) throw new Error("Gagal mengambil data cabang.");

        const data = await response.json();
        setBranches(data.data || data);
      } catch (err) {
        console.error("Error fetching branches:", err);
      } finally {
        setIsLoadingBranches(false);
      }
    };

    fetchBranches();
  }, [token]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!token) return;

      try {
        const response = await fetch("http://127.0.0.1:8000/api/products", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
        });

        if (!response.ok) throw new Error("Gagal mengambil data produk.");

        const data = await response.json();
        setProducts(data.data || data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [token]);

  const handleAddProduct = () => {
    setOrderItems([...orderItems, { product_id: 0, quantity: 1 }]);
  };

  const handleRemoveProduct = (index: number) => {
    const newItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(newItems);
  };

  const handleProductChange = (index: number, productId: number) => {
    const newItems = [...orderItems];
    newItems[index].product_id = productId;
    setOrderItems(newItems);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...orderItems];
    newItems[index].quantity = quantity;
    setOrderItems(newItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.product_id);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setError(null);
    setSuccess(null);
    
    // Validasi cabang
    if (!selectedBranchId || selectedBranchId === "") {
      setError("Pilih cabang tujuan terlebih dahulu.");
      return;
    }

    // Validasi produk
    if (orderItems.length === 0) {
      setError("Tambahkan minimal satu produk.");
      return;
    }

    // Validasi setiap item
    const hasInvalidItem = orderItems.some(item => !item.product_id || item.product_id === 0);
    if (hasInvalidItem) {
      setError("Pastikan semua produk telah dipilih.");
      return;
    }

    // Validasi quantity
    const hasInvalidQuantity = orderItems.some(item => !item.quantity || item.quantity < 1);
    if (hasInvalidQuantity) {
      setError("Pastikan semua kuantitas minimal 1.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data untuk dikirim - backend akan ambil price dari database
      const orderData = {
        branch_id: parseInt(selectedBranchId),
        items: orderItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      };

      console.log("Sending order data:", orderData);

      const response = await fetch("http://127.0.0.1:8000/api/user/orders", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const responseData = await response.json();
      console.log("Response:", responseData);

      if (!response.ok) {
        // Handle specific error messages from backend
        if (responseData.message) {
          throw new Error(responseData.message);
        } else if (responseData.error) {
          throw new Error(responseData.error);
        } else if (responseData.errors) {
          // Handle validation errors
          const errorMessages = Object.values(responseData.errors).flat().join(", ");
          throw new Error(errorMessages);
        } else {
          throw new Error("Gagal membuat pesanan. Silakan coba lagi.");
        }
      }

      setSuccess("Pesanan berhasil dibuat!");
      // Reset form
      setSelectedBranchId("");
      setOrderItems([]);
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (err) {
      console.error("Error submitting order:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi error yang tidak diketahui.");
      }
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-6 sm:p-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold">
          Form Pemesanan (Fitur #2)
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Pilih cabang, tentukan produk, dan jumlah yang ingin dipesan.
        </p>
      </div>

      <div className="max-w-4xl p-8 bg-white border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">Buat Pesanan Baru</h2>

        {error && (
          <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 mb-6 text-sm text-green-700 bg-green-100 border border-green-400 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Branch Selection */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Pilih Cabang Tujuan (Branch)
            </label>
            {isLoadingBranches ? (
              <p className="text-sm text-gray-500">Loading cabang...</p>
            ) : (
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">-- Pilih Cabang --</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Product List */}
          <div className="mb-8">
            <label className="block mb-3 text-sm font-medium text-gray-900 dark:text-white">
              Daftar Produk
            </label>

            {orderItems.length === 0 && (
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Belum ada produk ditambahkan. Klik tombol "+ Tambah Produk" untuk menambahkan.
              </p>
            )}

            {orderItems.map((item, index) => (
              <div key={index} className="grid grid-cols-1 gap-4 p-4 mb-4 border border-gray-200 rounded-lg md:grid-cols-12 dark:border-gray-600">
                <div className="md:col-span-7">
                  <label className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                    Produk
                  </label>
                  <select
                    value={item.product_id}
                    onChange={(e) => handleProductChange(index, parseInt(e.target.value))}
                    className="w-full p-2.5 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  >
                    <option value="0">-- Pilih Produk --</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - Rp {(product.price || 0).toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                    Kuantitas
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                    placeholder="1"
                    className="w-full p-2.5 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                <div className="flex items-end md:col-span-2">
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(index)}
                    className="w-full px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddProduct}
              className="px-5 py-2.5 text-sm font-medium text-white bg-herbalife-600 rounded-lg hover:bg-herbalife-700 focus:outline-none focus:ring-2 focus:ring-herbalife-500 dark:bg-herbalife-500 dark:hover:bg-herbalife-600"
              disabled={isLoadingProducts}
            >
              + Tambah Produk
            </button>
          </div>

          {/* Total */}
          <div className="pb-6 mb-6 border-b border-gray-200 dark:border-gray-700">
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              Total: Rp {calculateTotal().toLocaleString('id-ID')}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || orderItems.length === 0}
            className="w-full px-6 py-3 text-base font-medium text-white transition bg-herbalife-600 rounded-lg hover:bg-herbalife-700 focus:outline-none focus:ring-4 focus:ring-herbalife-300 disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-herbalife-500 dark:hover:bg-herbalife-600"
          >
            {isSubmitting ? "Menyimpan..." : "Submit Pemesanan (Potong Stok)"}
          </button>
        </form>
      </div>
    </div>
  );
}
