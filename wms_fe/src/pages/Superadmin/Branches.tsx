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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState<Partial<Branch>>({
    name: "",
    address: "",
  });

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
    } catch {
      alert("Gagal menyimpan cabang");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Yakin ingin menghapus cabang ini?")) return;

    try {
      await axios.delete(`/superadmin/branches/${id}`);
      fetchBranches();
    } catch {
      alert("Gagal menghapus cabang");
    }
  };

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
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-semibold text-black text-title-md2 dark:text-white">
          Manajemen Cabang
        </h2>
        
        <button 
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2 font-medium text-white transition bg-blue-600 rounded hover:bg-blue-700"
        >
          <span className="text-xl">+</span> Tambah Cabang
        </button>
      </div>

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left bg-gray-2 dark:bg-meta-4">
                <th className="px-4 py-4 font-bold text-black dark:text-white">ID</th>
                <th className="px-4 py-4 font-bold text-black dark:text-white">Nama Cabang</th>
                <th className="px-4 py-4 font-bold text-black dark:text-white">Alamat</th>
                <th className="px-4 py-4 font-bold text-center text-black dark:text-white">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="py-4 text-center">Loading...</td></tr>
              ) : branches.map((branch) => (
                <tr key={branch.id}>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">{branch.id}</td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark font-medium text-black dark:text-white">
                    {branch.name}
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">{branch.address}</td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <div className="flex items-center justify-center space-x-3">
                      <button 
                        onClick={() => openEditModal(branch)} 
                        className="px-3 py-1 text-sm font-medium text-white transition rounded bg-amber-500 hover:bg-amber-600"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(branch.id)} 
                        className="px-3 py-1 text-sm font-medium text-white transition bg-red-600 rounded hover:bg-red-700"
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg p-8 bg-white border rounded-sm border-stroke shadow-default dark:border-strokedark dark:bg-boxdark">
            <h3 className="mb-6 text-xl font-bold text-black dark:text-white">
              {modalMode === "create" ? "Tambah Cabang Baru" : "Edit Cabang"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2 font-medium text-black dark:text-white">Nama Cabang</label>
                <input 
                  type="text" name="name" required value={formData.name} onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke py-2 px-3 outline-none transition focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input"
                  placeholder="Contoh: Cabang Jakarta Pusat"
                />
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-medium text-black dark:text-white">Alamat</label>
                <textarea 
                  name="address" required value={formData.address} onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded border-[1.5px] border-stroke py-2 px-3 outline-none transition focus:border-blue-600 dark:border-form-strokedark dark:bg-form-input"
                  placeholder="Alamat lengkap cabang..."
                ></textarea>
              </div>

              <div className="flex gap-4">
                <button type="submit" className="w-full p-3 font-medium text-white transition bg-blue-600 rounded hover:bg-blue-700">
                  Simpan
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full p-3 font-medium text-black transition bg-gray-300 rounded hover:bg-gray-400">
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