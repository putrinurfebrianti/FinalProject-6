import React, { useState, useEffect } from "react";
import axios from "axios";

// Tipe Data Cabang
interface Branch {
  id: number;
  name: string;
  address: string;
}

const SuperadminBranches = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  
  // Form State
  const [formData, setFormData] = useState<Partial<Branch>>({
    name: "",
    address: "",
  });

  const API_URL = "http://127.0.0.1:8000/api";

  // --- 1. FETCH DATA ---
  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/branches');
      setBranches(response.data.data || response.data);
    } catch (err) {
      console.error("Gagal ambil data cabang:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // --- 2. HANDLE FORM & SUBMIT ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        await axios.post('/superadmin/branches', formData);
        alert("Cabang berhasil dibuat!");
      } else {
        await axios.put(`/superadmin/branches/${formData.id}`, formData);
        alert("Cabang berhasil diupdate!");
      }

      setIsModalOpen(false);
      fetchBranches(); 
    } catch (err: any) {
      alert("Gagal menyimpan: " + (err.response?.data?.message || err.message));
    }
  };

  // --- 3. HANDLE DELETE ---
  const handleDelete = async (id: number) => {
    if (!window.confirm("Yakin ingin menghapus cabang ini?")) return;

    try {
      await axios.delete(`/superadmin/branches/${id}`);
      fetchBranches();
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  // Helper Modal
  const openCreateModal = () => {
    setModalMode("create");
    setFormData({ name: "", address: "" }); 
    setIsModalOpen(true);
  };

  const openEditModal = (branch: Branch) => {
    setModalMode("edit");
    setFormData(branch);
    setIsModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-270">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Manajemen Cabang
        </h2>
        
        {/* BUTTON TAMBAH: Sekarang pakai bg-blue-600 agar pasti terlihat */}
        <button 
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded bg-blue-600 py-2 px-4 font-medium text-white hover:bg-blue-700 transition"
        >
          <span className="text-xl">+</span> Tambah Cabang
        </button>
      </div>

      {/* TABLE */}
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="py-4 px-4 font-bold text-black dark:text-white">ID</th>
                <th className="py-4 px-4 font-bold text-black dark:text-white">Nama Cabang</th>
                <th className="py-4 px-4 font-bold text-black dark:text-white">Alamat</th>
                <th className="py-4 px-4 font-bold text-black dark:text-white text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr>
              ) : branches.map((branch) => (
                <tr key={branch.id}>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">{branch.id}</td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark font-medium text-black dark:text-white">
                    {branch.name}
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">{branch.address}</td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <div className="flex items-center justify-center space-x-3">
                      {/* TOMBOL EDIT: Kuning/Amber */}
                      <button 
                        onClick={() => openEditModal(branch)} 
                        className="rounded bg-amber-500 py-1 px-3 text-sm font-medium text-white hover:bg-amber-600 transition"
                      >
                        Edit
                      </button>
                      {/* TOMBOL HAPUS: Merah */}
                      <button 
                        onClick={() => handleDelete(branch.id)} 
                        className="rounded bg-red-600 py-1 px-3 text-sm font-medium text-white hover:bg-red-700 transition"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg rounded-sm border border-stroke bg-white p-8 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h3 className="mb-6 text-xl font-bold text-black dark:text-white">
              {modalMode === "create" ? "Tambah Cabang Baru" : "Edit Cabang"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="mb-2 block font-medium text-black dark:text-white">Nama Cabang</label>
                <input 
                  type="text" name="name" required value={formData.name} onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke py-2 px-3 outline-none transition focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input"
                  placeholder="Contoh: Cabang Jakarta Pusat"
                />
              </div>
              <div className="mb-6">
                <label className="mb-2 block font-medium text-black dark:text-white">Alamat</label>
                <textarea 
                  name="address" required value={formData.address} onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded border-[1.5px] border-stroke py-2 px-3 outline-none transition focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input"
                  placeholder="Alamat lengkap cabang..."
                ></textarea>
              </div>

              <div className="flex gap-4">
                <button type="submit" className="w-full rounded bg-blue-600 p-3 font-medium text-white hover:bg-blue-700 transition">
                  Simpan
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full rounded bg-gray-300 p-3 font-medium text-black hover:bg-gray-400 transition">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperadminBranches;