import React, { useState, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "../../icons";
import axios from "axios";
import { Link } from "react-router-dom";

interface BranchStock {
  id: number;
  branch_id: number;
  product_id: number;
  stock: number;
  branch: { 
    id: number;
    name: string;
  };
  product: { 
    id: number;
    sku: string;
    name: string;
  };
}

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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData>({
    id: null,
    branchName: "",
    productName: "",
    stock: 0,
  });

  const API_URL = "http://127.0.0.1:8000/api";

  const fetchBranchStock = async () => {
    try {
      setLoading(true);
      console.debug('SuperadminBranchStock fetch call - axios defaults', axios.defaults);
      const response = await axios.get('/superadmin/branch-stock');
      setStockList(response.data.data);
    } catch (error) {
      console.error("Gagal ambil data stok cabang:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranchStock();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchTerm(searchTerm.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    const initial: Record<number, boolean> = {};
    stockList.forEach((s) => {
      initial[s.branch.id] = true;
    });
    setExpanded(initial);
  }, [stockList]);

  const groups = stockList.reduce((acc: Record<number, BranchStock[]>, item) => {
    if (!acc[item.branch.id]) acc[item.branch.id] = [];
    acc[item.branch.id].push(item);
    return acc;
  }, {} as Record<number, BranchStock[]>);

  const filteredGroups: Record<number, BranchStock[]> = Object.keys(groups).reduce((acc, k) => {
    const key = parseInt(k);
    const items = groups[key];
    const filtered = debouncedSearchTerm
      ? items.filter((it) => {
          const name = (it.product?.name || "").toLowerCase();
          const sku = (it.product?.sku || "").toLowerCase();
          return name.includes(debouncedSearchTerm) || sku.includes(debouncedSearchTerm);
        })
      : items;
    if (filtered.length > 0) acc[key] = filtered;
    return acc;
  }, {} as Record<number, BranchStock[]>);

  const totalMatches = Object.values(filteredGroups).reduce((s, arr) => s + arr.length, 0);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({
      ...editForm,
      stock: parseInt(e.target.value) || 0
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.id) return;

    try {
      await axios.put(`${API_URL}/superadmin/branch-stock/${editForm.id}`, {
        stock: editForm.stock
      });
      
      alert("Stok berhasil di-update manual!");
      setIsModalOpen(false);
      fetchBranchStock();

    } catch (error) {
      console.error("Error update stok:", error);
      alert("Gagal update stok");
    }
  };

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
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-semibold text-black text-title-md2 dark:text-white">
          Manajemen Stok Cabang
        </h2>
        <nav>
          <ol className="flex items-center gap-2">
            <li><Link to="/superadmin/dashboard">Dashboard /</Link></li>
            <li className="text-primary">Stok Cabang</li>
          </ol>
        </nav>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg bg-white border rounded-sm border-stroke shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Edit Stok Manual (Override)
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6.5">
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">Cabang</label>
                  <input type="text" value={editForm.branchName} disabled className="w-full rounded border-[1.5px] border-stroke bg-gray-200 py-3 px-5 font-medium"/>
                </div>
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">Produk</label>
                  <input type="text" value={editForm.productName} disabled className="w-full rounded border-[1.5px] border-stroke bg-gray-200 py-3 px-5 font-medium"/>
                </div>
                
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
                  <button type="submit" className="flex justify-center w-full p-3 font-medium rounded bg-primary text-gray">
                    Update Stok
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex justify-center w-full p-3 font-medium text-black bg-gray-300 rounded">
                    Batal
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xl font-semibold text-black dark:text-white">Daftar Stok di Semua Cabang</h4>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari produk (nama/SKU)..."
                className="px-3 py-2 text-sm border rounded outline-none border-stroke focus:border-primary"
              />
              {searchTerm ? (
                <button onClick={() => setSearchTerm("")} className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2">✖</button>
              ) : (
                <span className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2">🔍</span>
              )}
            </div>
            <div className="ml-3 text-sm text-gray-600 dark:text-gray-400">
              {debouncedSearchTerm ? `${totalMatches} hasil` : `${Object.keys(groups).length} cabang`}
            </div>
            <button onClick={() => {
                const branchIds = Object.keys(filteredGroups).map(k => parseInt(k));
                const anyCollapsed = branchIds.some(id => !expanded[id]);
                const next: Record<number, boolean> = {};
                branchIds.forEach(id => next[id] = anyCollapsed);
                setExpanded(next);
              }}
              className="px-3 py-1 text-sm text-black bg-gray-100 border rounded hover:bg-gray-200"
            >
              {Object.keys(filteredGroups).some(k => !expanded[parseInt(k)]) ? 'Expand All' : 'Collapse All'}
            </button>
          </div>
        </div>
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left bg-gray-2 dark:bg-meta-4">
                <th className="px-4 py-4 font-medium text-black dark:text-white">ID Stok</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">Cabang</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">SKU</th>
                <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white">Nama Produk</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">Stok</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-5 text-center">Loading...</td></tr>
              ) : stockList.length === 0 ? (
                <tr><td colSpan={6} className="py-5 text-center">Belum ada stok di cabang manapun. (Silakan buat Inbound).</td></tr>
              ) : totalMatches === 0 ? (
                <tr><td colSpan={6} className="py-5 text-center">Tidak ditemukan produk untuk kata kunci pencarian tersebut.</td></tr>
              ) : (
                (() => {
                  const groups = stockList.reduce((acc: Record<number, BranchStock[]>, item) => {
                    if (!acc[item.branch.id]) acc[item.branch.id] = [];
                    acc[item.branch.id].push(item);
                    return acc;
                  }, {} as Record<number, BranchStock[]>);

                  const filteredGroups: Record<number, BranchStock[]> = Object.keys(groups).reduce((acc, k) => {
                    const key = parseInt(k);
                    const items = groups[key];
                    const filtered = debouncedSearchTerm
                      ? items.filter((it) => {
                          const name = (it.product?.name || "").toLowerCase();
                          const sku = (it.product?.sku || "").toLowerCase();
                          return name.includes(debouncedSearchTerm) || sku.includes(debouncedSearchTerm);
                        })
                      : items;
                    if (filtered.length > 0) acc[key] = filtered;
                    return acc;
                  }, {} as Record<number, BranchStock[]>);

                  return Object.keys(filteredGroups)
                    .sort((a, b) => {
                      const aName = filteredGroups[parseInt(a)][0]?.branch?.name ?? "";
                      const bName = filteredGroups[parseInt(b)][0]?.branch?.name ?? "";
                      return aName.localeCompare(bName);
                    })
                    .map((branchIdStr) => {
                    const branchId = parseInt(branchIdStr);
                    const items = filteredGroups[branchId];
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
                              <p className="inline-flex px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                                {item.stock}
                              </p>
                            </td>
                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                              <div className="flex items-center space-x-3.5">
                                <button 
                                  onClick={() => openEditModal(item)} 
                                  className="px-3 py-1 text-sm text-white transition duration-150 bg-blue-500 rounded hover:bg-blue-600"
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