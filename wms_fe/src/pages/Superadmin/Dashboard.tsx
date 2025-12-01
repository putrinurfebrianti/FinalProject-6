import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

// Icons (Inline SVG biar ga ribet import)
const IconBox = () => <svg className="fill-primary dark:fill-white" width="22" height="22" viewBox="0 0 24 24"><path d="M20 7L12 3L4 7M20 7V17L12 21M20 7L12 11M4 7V17L12 21M4 7L12 11M12 11V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconUsers = () => <svg className="fill-primary dark:fill-white" width="22" height="22" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconBranch = () => <svg className="fill-primary dark:fill-white" width="22" height="22" viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l8-4 8 4v14M8 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconTruck = () => <svg className="fill-primary dark:fill-white" width="22" height="22" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>;

interface DashboardStats {
  total_central_stock: number;
  total_branches: number;
  total_users: number;
  total_branch_stock: number;
}

interface ActivityLog {
  id: number;
  action: string;
  description: string;
  created_at: string;
  user?: { name: string; role: string };
}

const SuperadminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

    // axios defaults already configured with baseURL and Authorization

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Ambil Statistik Angka
        const statsRes = await axios.get('/dashboard/stats');
        setStats(statsRes.data.data);

        // 2. Ambil Activity Logs (untuk tabel recent activity)
        const logsRes = await axios.get('/superadmin/activity-logs');
        // Ambil 5 data terbaru saja
        setLogs(logsRes.data.data.slice(0, 5));
        
    } catch (error: any) {
        console.error("Gagal load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
      return (
          <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-boxdark">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
          </div>
      );
  }

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h2 className="text-title-md2 font-bold text-black dark:text-white">
                    Dashboard Overview
                </h2>
                <p className="text-sm font-medium text-gray-500">
                    Selamat datang kembali, {user?.name} 👋
                </p>
            </div>
            <div className="flex gap-2">
                 <Link to="/superadmin/inbound" className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90 lg:px-6 xl:px-8">
                    <span>+</span> Inbound Stok
                 </Link>
            </div>
        </div>

        {/* --- GRID KARTU STATISTIK (4 KARTU) --- */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
            
            {/* Card 1: Stok Pusat */}
            <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4 text-primary">
                    <IconBox />
                </div>
                <div className="mt-4 flex items-end justify-between">
                    <div>
                        <h4 className="text-title-md font-bold text-black dark:text-white">
                            {stats?.total_central_stock.toLocaleString()}
                        </h4>
                        <span className="text-sm font-medium text-gray-500">Stok Gudang Pusat</span>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-medium text-meta-3">
                       Unit
                    </span>
                </div>
            </div>

            {/* Card 2: Total Cabang */}
            <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4 text-primary">
                    <IconBranch />
                </div>
                <div className="mt-4 flex items-end justify-between">
                    <div>
                        <h4 className="text-title-md font-bold text-black dark:text-white">
                            {stats?.total_branches}
                        </h4>
                        <span className="text-sm font-medium text-gray-500">Total Cabang Aktif</span>
                    </div>
                </div>
            </div>

            {/* Card 3: Stok Tersebar */}
            <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4 text-primary">
                    <IconTruck />
                </div>
                <div className="mt-4 flex items-end justify-between">
                    <div>
                        <h4 className="text-title-md font-bold text-black dark:text-white">
                            {stats?.total_branch_stock.toLocaleString()}
                        </h4>
                        <span className="text-sm font-medium text-gray-500">Stok di Cabang</span>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-medium text-meta-5">
                       Unit
                    </span>
                </div>
            </div>

            {/* Card 4: Total Users */}
            <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4 text-primary">
                    <IconUsers />
                </div>
                <div className="mt-4 flex items-end justify-between">
                    <div>
                        <h4 className="text-title-md font-bold text-black dark:text-white">
                            {stats?.total_users}
                        </h4>
                        <span className="text-sm font-medium text-gray-500">Total Pengguna</span>
                    </div>
                </div>
            </div>
        </div>

        {/* --- SECTION TENGAH (GRID 12 KOLOM) --- */}
        <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
            
            {/* BAGIAN KIRI: Recent Activity Logs (8 Kolom) */}
            <div className="col-span-12 xl:col-span-8">
                <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                    <div className="mb-6 flex justify-between">
                        <h4 className="text-xl font-semibold text-black dark:text-white">
                            Aktivitas Terbaru
                        </h4>
                        <Link to="/superadmin/activitylogs" className="text-sm font-medium text-primary hover:underline">
                            Lihat Semua
                        </Link>
                    </div>
                    <div className="flex flex-col">
                        <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-4">
                            <div className="p-2.5 xl:p-5"><h5 className="text-sm font-medium uppercase xsm:text-base">User</h5></div>
                            <div className="p-2.5 text-center xl:p-5"><h5 className="text-sm font-medium uppercase xsm:text-base">Aksi</h5></div>
                            <div className="hidden p-2.5 text-center sm:block xl:p-5"><h5 className="text-sm font-medium uppercase xsm:text-base">Waktu</h5></div>
                            <div className="p-2.5 text-center xl:p-5"><h5 className="text-sm font-medium uppercase xsm:text-base">Detail</h5></div>
                        </div>

                        {logs.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">Belum ada aktivitas.</div>
                        ) : (
                            logs.map((log, key) => (
                                <div className={`grid grid-cols-3 sm:grid-cols-4 ${key === logs.length - 1 ? "" : "border-b border-stroke dark:border-strokedark"}`} key={key}>
                                    <div className="flex items-center gap-3 p-2.5 xl:p-5">
                                        <div className="flex-shrink-0">
                                            {/* Avatar Initials */}
                                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                                {log.user?.name.substring(0, 2).toUpperCase()}
                                            </div>
                                        </div>
                                        <p className="hidden text-black dark:text-white sm:block">{log.user?.name}</p>
                                    </div>

                                    <div className="flex items-center justify-center p-2.5 xl:p-5">
                                        <span className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                                            log.action.includes('LOGIN') ? 'bg-success text-success' : 
                                            log.action.includes('UPDATE') ? 'bg-warning text-warning' : 
                                            'bg-primary text-primary'
                                        }`}>
                                            {log.action}
                                        </span>
                                    </div>

                                    <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                                        <p className="text-meta-5 text-sm">{formatDate(log.created_at)}</p>
                                    </div>

                                    <div className="flex items-center justify-center p-2.5 xl:p-5">
                                        <p className="text-sm text-gray-500 truncate w-32" title={log.description}>
                                            {log.description}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* BAGIAN KANAN: Ringkasan Stok (4 Kolom) */}
            <div className="col-span-12 xl:col-span-4">
                <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="mb-4 justify-between gap-4 sm:flex">
                        <div>
                            <h4 className="text-xl font-bold text-black dark:text-white">
                                Distribusi Stok
                            </h4>
                        </div>
                    </div>

                    <div className="mb-2">
                        <div id="chartThree" className="mx-auto flex justify-center">
                            {/* Visualisasi Sederhana menggunakan Progress Bar CSS */}
                            <div className="w-full space-y-6 mt-4">
                                
                                {/* Item 1: Pusat */}
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-black dark:text-white">Gudang Pusat</span>
                                        <span className="text-sm font-medium text-black dark:text-white">{stats?.total_central_stock} Unit</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                        <div className="bg-primary h-2.5 rounded-full" style={{ width: '70%' }}></div>
                                    </div>
                                </div>

                                {/* Item 2: Cabang */}
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-black dark:text-white">Tersebar di Cabang</span>
                                        <span className="text-sm font-medium text-black dark:text-white">{stats?.total_branch_stock} Unit</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                        <div className="bg-meta-5 h-2.5 rounded-full" style={{ width: '30%' }}></div>
                                    </div>
                                </div>

                                <div className="mt-6 border-t border-stroke pt-4 dark:border-strokedark">
                                    <p className="text-xs text-gray-500">
                                        Visualisasi perbandingan total stok yang ada di Gudang Pusat vs Total stok yang sudah didistribusikan ke seluruh cabang.
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Quick Actions Card */}
                <div className="mt-6 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                     <h4 className="text-md font-bold text-black dark:text-white mb-4">Aksi Cepat</h4>
                     <div className="flex flex-col gap-3">
                        <Link to="/superadmin/users" className="w-full rounded border border-stroke py-2 px-4 text-center font-medium text-black hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4">
                            Kelola User
                        </Link>
                        <Link to="/superadmin/branches" className="w-full rounded border border-stroke py-2 px-4 text-center font-medium text-black hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4">
                            Lihat Cabang
                        </Link>
                     </div>
                </div>
            </div>

        </div>
    </div>
  );
};

export default SuperadminDashboard;