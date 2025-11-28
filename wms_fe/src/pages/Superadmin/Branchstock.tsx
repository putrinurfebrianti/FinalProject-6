import React, { useState, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "../../icons";
import axios from "axios";
import { Link } from "react-router-dom";

// Tipe data Stok Cabang (sesuai API)
interface BranchStock {
  id: number;
  branch_id: number;
  product_id: number;
  stock: number;
  branch: { // Data relasi
    id: number;
    name: string;
  };
  product: { // Data relasi
    id: number;
    sku: string;
    name: string;
  };
}

// Tipe data untuk form edit
interface EditFormData {
  id: number | null;
  branchName: string;
  productName: string;
  stock: number;
}

const SuperadminBranchStock = () => {
  const [stockList, setStockList] = useState<BranchStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  
  // State untuk Modal/Form Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData>({
    id: null,
    branchName: "",
    productName: "",
    stock: 0,
  });

  // URL API
  const API_URL = "http://127.0.0.1:8000/api";

  // 1. FETCH DATA (READ)
  const fetchBranchStock = async () => {
    try {
      setLoading(true);
      // Panggil endpoint baru kita
      console.debug('SuperadminBranchStock fetch call - axios defaults', axios.defaults);
      const response = await axios.get('/superadmin/branch-stock');
      setStockList(response.data.data);
    } catch (error) {
      console.error("Gagal ambil data stok cabang:", error);
      if (error.response) {
        console.error('Error status/data:', error.response.status, error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranchStock();
  }, []);

  // build expanded initial state when stockList changes (open all branches by default)
  useEffect(() => {
    const initial: Record<number, boolean> = {};
    stockList.forEach((s) => {
      initial[s.branch.id] = true;
    });
    setExpanded(initial);
  }, [stockList]);

  // Handle Input Form
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({
      ...editForm,
      stock: parseInt(e.target.value) || 0 // Hanya update stok
    });
  };

  // 2. SUBMIT FORM (UPDATE)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.id) return;

    try {
      // Panggil endpoint update
      await axios.put(`${API_URL}/superadmin/branch-stock/${editForm.id}`, {
        stock: editForm.stock // Kirim hanya data stok baru
      });
      
      alert("Stok berhasil di-update manual!");
      setIsModalOpen(false);
      fetchBranchStock(); // Refresh tabel

    } catch (error: any) {
      console.error("Error update stok:", error);
      alert("Gagal update: " + JSON.stringify(error.response?.data?.errors || error.message));
    }
  };

  // Helper: Buka Modal Edit
  const openEditModal = (item: BranchStock) => {
    setEditForm({
      id: item.id,
      branchName: item.branch.name,
      productName: item.product.name,
      stock: item.stock,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-270">
      {/* Header Halaman */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Manajemen Stok Cabang
        </h2>
        <nav>
          <ol className="flex items-center gap-2">
            <li><Link to="/superadmin/dashboard">Dashboard /</Link></li>
            <li className="text-primary">Stok Cabang</li>
          </ol>
        </nav>
      </div>

      {/* --- MODAL EDIT (Muncul jika isModalOpen = true) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark w-full max-w-lg">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Edit Stok Manual (Override)
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6.5">
                {/* Info (Read-only) */}
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">Cabang</label>
                  <input type="text" value={editForm.branchName} disabled className="w-full rounded border-[1.5px] border-stroke bg-gray-200 py-3 px-5 font-medium"/>
                </div>
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">Produk</label>
                  <input type="text" value={editForm.productName} disabled className="w-full rounded border-[1.5px] border-stroke bg-gray-200 py-3 px-5 font-medium"/>
                </div>
                
                {/* Input Stok (Bisa diedit) */}
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">Jumlah Stok BARU</label>
                  <input
                    type="number"
                    name="stock"
                    value={editForm.stock}
                    onChange={handleFormChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray">
                    Update Stok
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex w-full justify-center rounded bg-gray-300 p-3 font-medium text-black">
                    Batal
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* --- TABLE SECTION --- */}
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="mb-6 flex items-center justify-between">
          <h4 className="text-xl font-semibold text-black dark:text-white">Daftar Stok di Semua Cabang</h4>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari produk (nama/SKU)..."
                className="rounded border border-stroke px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            <button onClick={() => {
                const branchIds = Array.from(new Set(stockList.map(s => s.branch.id)));
                const anyCollapsed = branchIds.some(id => !expanded[id]);
                const next: Record<number, boolean> = {};
                branchIds.forEach(id => next[id] = anyCollapsed);
                setExpanded(next);
              }}
              className="text-sm rounded border px-3 py-1 text-black bg-gray-100 hover:bg-gray-200"
            >
              {Object.keys(expanded).some(k => !expanded[parseInt(k)]) ? 'Expand All' : 'Collapse All'}
            </button>
          </div>
        </div>
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="py-4 px-4 font-medium text-black dark:text-white">ID Stok</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Cabang</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">SKU</th>
                <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white">Nama Produk</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Stok</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-5">Loading...</td></tr>
              ) : stockList.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-5">Belum ada stok di cabang manapun. (Silakan buat Inbound).</td></tr>
              ) : (
                // group the stocks by branch id
                (() => {
                  const groups = stockList.reduce((acc: Record<number, BranchStock[]>, item) => {
                    if (!acc[item.branch.id]) acc[item.branch.id] = [];
                    acc[item.branch.id].push(item);
                    return acc;
                  }, {} as Record<number, BranchStock[]>);

                  return Object.keys(groups)
                    .sort((a, b) => {
                      const aName = groups[parseInt(a)][0]?.branch?.name ?? "";
                      const bName = groups[parseInt(b)][0]?.branch?.name ?? "";
                      return aName.localeCompare(bName);
                    })
                    .map((branchIdStr) => {
                    const branchId = parseInt(branchIdStr);
                    const items = groups[branchId];
                    const sortedItems = [...items].sort((x, y) => (x.product.name || "").localeCompare(y.product.name || ""));
                    const branchName = items[0]?.branch?.name ?? "(Unknown)";
                    const totalStock = items.reduce((s, it) => s + (it.stock || 0), 0);
                    const countProducts = items.length;
                    const isExpanded = expanded[branchId];

                    return (
                      <React.Fragment key={`branch-${branchId}`}>
                        <tr className="bg-gray-50">
                          <td colSpan={6} className="py-3 px-4 border-b border-[#eee] dark:border-strokedark">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => setExpanded((prev) => ({ ...prev, [branchId]: !prev[branchId] }))}
                                  className="p-2 rounded hover:bg-gray-100"
                                >
                                  {isExpanded ? (
                                    <ChevronUpIcon className="size-4" />
                                  ) : (
                                    <ChevronDownIcon className="size-4" />
                                  )}
                                </button>
                                <div className="font-medium text-black dark:text-white">{branchName}</div>
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">{countProducts} produk &middot; Total stok: {totalStock}</div>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && sortedItems.map((item) => (
                          <tr key={item.id}>
                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                              <p className="text-black dark:text-white">{item.id}</p>
                            </td>
                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                              <p className="text-gray-500 dark:text-gray-400">{/* grouped by branch header above */}</p>
                            </td>
                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                              <p className="text-black dark:text-white">{item.product.sku}</p>
                            </td>
                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                              <p className="text-black dark:text-white">{item.product.name}</p>
                            </td>
                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                              <p className="inline-flex rounded-full bg-blue-100 text-blue-800 py-1 px-3 text-sm font-medium">
                                {item.stock}
                              </p>
                            </td>
                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                              <div className="flex items-center space-x-3.5">
                                <button 
                                  onClick={() => openEditModal(item)} 
                                  className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm transition duration-150"
                                >
                                  Edit Stok
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  });
                })()
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperadminBranchStock;