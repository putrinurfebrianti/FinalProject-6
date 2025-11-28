import React, { useState, useEffect } from "react";
import axios from "axios";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  branch_id: number | null;
  branch?: { name: string };
}

interface Branch {
  id: number;
  name: string;
}

const SuperadminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState({
    id: null as number | null,
    name: "",
    email: "",
    password: "",
    role: "user",
    branch_id: "" as string | number,
  });

  const API_URL = "http://127.0.0.1:8000/api";

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resUsers, resBranches] = await Promise.all([
        axios.get('/superadmin/users'),
        axios.get('/branches')
      ]);

      setUsers(resUsers.data.data || resUsers.data);
      setBranches(resBranches.data.data || resBranches.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Authorization header already set via axios.defaults
    
    try {
      if (modalMode === "create") {
        await axios.post('/superadmin/register-user', formData);
        alert("User berhasil dibuat!");
      } else {
        if (!formData.id) return;
        const payload: any = { ...formData };
        if (!payload.password) delete payload.password;

        await axios.put(`/superadmin/users/${formData.id}`, payload);
        alert("User berhasil diupdate!");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert("Gagal: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus user ini?")) return;
    try {
      await axios.delete(`/superadmin/users/${id}`);
      fetchData();
    } catch (err) {
      alert("Gagal menghapus user.");
    }
  };

  const openCreate = () => {
    setModalMode("create");
    setFormData({ id: null, name: "", email: "", password: "", role: "user", branch_id: "" });
    setIsModalOpen(true);
  };

  const openEdit = (user: User) => {
    setModalMode("edit");
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      branch_id: user.branch_id || ""
    });
    setIsModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-270">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">Manajemen User</h2>
        
        {/* TOMBOL TAMBAH USER: Pakai bg-blue-600 */}
        <button 
          onClick={openCreate} 
          className="flex items-center justify-center gap-2 rounded bg-blue-600 py-2 px-4 font-medium text-white hover:bg-blue-700 transition"
        >
          <span className="text-xl">+</span> Tambah User
        </button>
      </div>

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="py-4 px-4 font-bold text-black dark:text-white">Nama</th>
                <th className="py-4 px-4 font-bold text-black dark:text-white">Email</th>
                <th className="py-4 px-4 font-bold text-black dark:text-white">Role</th>
                <th className="py-4 px-4 font-bold text-black dark:text-white">Cabang</th>
                <th className="py-4 px-4 font-bold text-black dark:text-white text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <p className="mt-2 text-gray-500">Memuat data user...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                   <td colSpan={5} className="text-center py-5">Belum ada user.</td>
                </tr>
              ) : (
                users.map((user) => (
                    <tr key={user.id}>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-black dark:text-white">{user.name}</td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">{user.email}</td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium text-white ${
                        user.role === 'superadmin' ? 'bg-red-500' : 
                        user.role === 'admin' ? 'bg-green-500' : 
                        user.role === 'supervisor' ? 'bg-purple-500' : 'bg-blue-500'
                        }`}>
                        {user.role}
                        </span>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                        {user.branch ? user.branch.name : "-"}
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                        <div className="flex items-center justify-center space-x-3">
                            {/* TOMBOL EDIT: Kuning */}
                            <button 
                                onClick={() => openEdit(user)} 
                                className="rounded bg-amber-500 py-1 px-3 text-sm font-medium text-white hover:bg-amber-600 transition"
                            >
                                Edit
                            </button>
                            {/* TOMBOL HAPUS: Merah */}
                            <button 
                                onClick={() => handleDelete(user.id)} 
                                className="rounded bg-red-600 py-1 px-3 text-sm font-medium text-white hover:bg-red-700 transition"
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg bg-white p-8 rounded shadow-lg dark:bg-boxdark">
            <h3 className="text-xl font-bold mb-6 text-black dark:text-white">{modalMode === "create" ? "Tambah User Baru" : "Edit User"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2 font-medium dark:text-white">Nama Lengkap</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border-[1.5px] border-stroke p-2 rounded outline-none focus:border-blue-600 dark:bg-form-input" required />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-medium dark:text-white">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border-[1.5px] border-stroke p-2 rounded outline-none focus:border-blue-600 dark:bg-form-input" required />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-medium dark:text-white">Password {modalMode === 'edit' && '(Isi jika ingin ganti)'}</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full border-[1.5px] border-stroke p-2 rounded outline-none focus:border-blue-600 dark:bg-form-input" required={modalMode === "create"} />
              </div>
              
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                    <label className="block mb-2 font-medium dark:text-white">Role</label>
                    <select name="role" value={formData.role} onChange={handleInputChange} className="w-full border-[1.5px] border-stroke p-2 rounded outline-none focus:border-blue-600 dark:bg-form-input">
                    <option value="user">User</option>
                    <option value="admin">Admin Cabang</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="superadmin">Superadmin</option>
                    </select>
                </div>
                <div>
                    <label className="block mb-2 font-medium dark:text-white">Cabang</label>
                    <select name="branch_id" value={formData.branch_id} onChange={handleInputChange} className="w-full border-[1.5px] border-stroke p-2 rounded outline-none focus:border-blue-600 dark:bg-form-input">
                    <option value="">- Tidak ada / Pusat -</option>
                    {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                    </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-medium transition">Simpan</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full bg-gray-300 hover:bg-gray-400 text-black p-3 rounded font-medium transition">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperadminUsers;