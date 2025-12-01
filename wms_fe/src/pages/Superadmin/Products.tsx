import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

// Tipe data Produk sesuai Database Laravel
interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  central_stock: number;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category: "",
    central_stock: 0,
  });

  // URL API
  const API_URL = "http://127.0.0.1:8000/api";

  // 1. FETCH DATA (READ)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data.data);
    } catch (error: any) {
      console.error("Gagal ambil data produk:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle Input Form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 2. SUBMIT FORM (CREATE & UPDATE)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentId) {
        // --- UPDATE ---
        await axios.put(`${API_URL}/superadmin/products/${currentId}`, formData);
        alert("Produk berhasil diupdate!");
      } else {
        // --- CREATE ---
        await axios.post(`${API_URL}/superadmin/products`, formData);
        alert("Produk baru berhasil dibuat!");
      }
      
      // Reset & Refresh
      setIsFormOpen(false);
      resetForm();
      fetchProducts();

    } catch (error: any) {
      console.error("Error submit:", error);
      alert("Gagal menyimpan: " + JSON.stringify(error.response?.data?.errors || error.message));
    }
  };

  // 3. DELETE PRODUCT
  const handleDelete = async (id: number) => {
    if (confirm("Yakin ingin menghapus produk ini?")) {
      try {
        await axios.delete(`${API_URL}/superadmin/products/${id}`);
        alert("Produk dihapus.");
        fetchProducts();
      } catch (error: any) {
        alert("Gagal menghapus produk.");
      }
    }
  };

  // Helper: Buka Form Edit
  const openEditForm = (product: Product) => {
    setIsFormOpen(true);
    setIsEditing(true);
    setCurrentId(product.id);
    setFormData({
      sku: product.sku,
      name: product.name,
      category: product.category,
      central_stock: product.central_stock,
    });
  };

  // Helper: Reset Form
  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ sku: "", name: "", category: "", central_stock: 0 });
  };

  return (
    <div className="mx-auto max-w-270">
      {/* Header Halaman */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Manajemen Produk
        </h2>
        <nav>
          <ol className="flex items-center gap-2">
            <li><Link to="/superadmin/dashboard">Dashboard /</Link></li>
            <li className="text-primary">Products</li>
          </ol>
        </nav>
      </div>

      {/* Tombol Tambah */}
      <div className="mb-4">
        <button
          onClick={() => { setIsFormOpen(!isFormOpen); resetForm(); }}
          className="flex justify-center rounded bg-blue-600 py-2 px-6 font-medium text-white hover:bg-blue-700 transition duration-150"
        >
          {isFormOpen ? "Tutup Form" : "Tambah Produk Baru"}
        </button>
      </div>

      {/* --- FORM SECTION (Muncul jika isFormOpen = true) --- */}
      {isFormOpen && (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              {isEditing ? "Edit Produk" : "Input Produk Baru"}
            </h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="p-6.5">
              <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                <div className="w-full xl:w-1/2">
                  <label className="mb-2.5 block text-black dark:text-white">SKU (Kode Unik)</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="Contoh: HLF-001"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    required
                  />
                </div>

                <div className="w-full xl:w-1/2">
                  <label className="mb-2.5 block text-black dark:text-white">Nama Produk</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nama Produk Herbalife"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                <div className="w-full xl:w-1/2">
                  <label className="mb-2.5 block text-black dark:text-white">Kategori</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="Nutrisi / Minuman"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  />
                </div>

                <div className="w-full xl:w-1/2">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Stok Pusat (Superadmin)
                  </label>
                  <input
                    type="number"
                    name="central_stock"
                    value={formData.central_stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="flex w-full justify-center rounded bg-blue-600 p-3 font-medium text-white hover:bg-blue-700">
                {isEditing ? "Update Produk" : "Simpan Produk"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- TABLE SECTION --- */}
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">SKU</th>
                <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white">Nama Produk</th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Kategori</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Stok Pusat</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-5">Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-5">Tidak ada data produk.</td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                      <h5 className="font-medium text-black dark:text-white">{product.sku}</h5>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">{product.name}</p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">{product.category}</p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="inline-flex rounded-full bg-green-100 text-green-800 py-1 px-3 text-sm font-medium">
                        {product.central_stock}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <div className="flex items-center space-x-3.5">
                        {/* TOMBOL EDIT (Biru) */}
                        <button 
                          onClick={() => openEditForm(product)} 
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm transition duration-150"
                        >
                          Edit
                        </button>
                        
                        {/* TOMBOL HAPUS (Merah) */}
                        <button 
                          onClick={() => handleDelete(product.id)} 
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm transition duration-150"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;