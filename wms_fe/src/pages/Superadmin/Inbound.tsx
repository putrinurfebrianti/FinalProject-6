import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import DatePicker from "../../components/form/DatePicker";
import Button from "../../components/ui/button/Button";
import { CalenderIcon } from "../../icons";

interface Branch {
  id: number;
  name: string;
}

interface Product {
  id: number;
  sku: string;
  name: string;
  central_stock: number;
}

interface InboundItem {
  product_id: string;
  quantity: number;
}

const SuperadminInbound = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedBranch, setSelectedBranch] = useState("");
  const [date, setDate] = useState<Date | null>(new Date());
  const flatpickrRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<InboundItem[]>([
    { product_id: "", quantity: 1 }
  ]);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [branchesRes, productsRes] = await Promise.all([
          axios.get('/branches'),
          axios.get('/products'),
        ]);
        setBranches(branchesRes.data.data);
        setProducts(productsRes.data.data);
      } catch (error: any) {
        console.error("Error fetching master data:", error);
        alert("Gagal memuat data cabang/produk.");
      } finally {
        setLoadingData(false);
      }
    };
    fetchMasterData();
  }, []);

  const addItemRow = () => {
    setItems([...items, { product_id: "", quantity: 1 }]);
  };

  const removeItemRow = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof InboundItem, value: string | number) => {
    const newItems = [...items];
    // @ts-ignore
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) return alert("Pilih cabang tujuan!");
    if (items.some(i => !i.product_id || i.quantity <= 0)) {
      return alert("Pastikan semua produk dipilih dan jumlah > 0");
    }

    const payload = {
      branch_id: parseInt(selectedBranch),
      date: date ? new Date(date).toISOString().split('T')[0] : null,
      items: items.map(item => ({
        product_id: parseInt(item.product_id),
        quantity: item.quantity
      }))
    };

    try {
      await axios.post('/superadmin/inbounds/bulk', payload);
      
      alert("Berhasil! Stok telah dikirim ke cabang.");
      setItems([{ product_id: "", quantity: 1 }]);
      setSelectedBranch(""); 

    } catch (error: any) {
      console.error("Error submit inbound:", error);
      alert("Gagal mengirim: " + JSON.stringify(error.response?.data?.errors || error.response?.data?.message));
    }
  };

  if (loadingData) return <div className="p-6">Loading Data...</div>;

  return (
    <div className="mx-auto max-w-270">
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-semibold text-black text-title-md2 dark:text-white">
          Inbound (Kirim Stok ke Cabang)
        </h2>
        <nav>
          <ol className="flex items-center gap-2">
            <li><Link to="/superadmin/dashboard">Dashboard /</Link></li>
            <li className="text-primary">Inbound</li>
          </ol>
        </nav>
      </div>

      <div className="bg-white border rounded-sm border-stroke shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Form Surat Jalan
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6.5">
          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <label className="mb-2.5 block text-black dark:text-white">
                Cabang Tujuan
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                required
              >
                <option value="">-- Pilih Cabang --</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="w-full xl:w-1/2">
              <label className="mb-2.5 block text-black dark:text-white">
                Tanggal Pengiriman
              </label>
              <div
                className="relative w-full flatpickr-wrapper"
                onClick={() => flatpickrRef.current?.flatpickr?.open?.()}
              >
                <DatePicker
                  ref={flatpickrRef}
                  value={date}
                  onChange={(d) => setDate(d)}
                  options={{ dateFormat: "Y-m-d", allowInput: false, clickOpens: true }}
                  placeholder="Select a date"
                  className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 cursor-pointer right-3 top-1/2 dark:text-gray-400">
                  <CalenderIcon className="size-6" />
                </span>
              </div>
            </div>
          </div>

          <hr className="my-6 border-stroke dark:border-strokedark" />
          <div className="mb-6">
            <h4 className="mb-4 text-xl font-semibold text-black dark:text-white">Daftar Barang</h4>
            
            {items.map((item, index) => (
              <div key={index} className="flex items-end gap-4 mb-4">
                <div className="w-full">
                  <label className="block mb-2 text-sm text-black dark:text-white">Produk</label>
                  <select
                    value={item.product_id}
                    onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                    required
                  >
                    <option value="">-- Pilih Produk --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.sku} - {p.name} (Sisa Pusat: {p.central_stock})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-32">
                  <label className="block mb-2 text-sm text-black dark:text-white">Jumlah</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeItemRow(index)}
                  disabled={items.length === 1} // Jangan hapus jika sisa 1
                  className="h-10 px-4 text-white bg-red-500 rounded hover:bg-red-600 disabled:opacity-50"
                >
                  X
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addItemRow}
              className="mt-2 text-sm text-primary hover:underline"
            >
              + Tambah Produk Lain
            </button>
          </div>

          <div className="flex justify-center">
            <Button type="submit" className="w-full max-w-[360px]">
              Kirim Stok (Proses Inbound)
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuperadminInbound;