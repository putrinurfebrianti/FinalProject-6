import { useState, useEffect } from "react";
import { apiGet } from '../../utils/api';

// Tipe Data Log
interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  description: string;
  created_at: string;
  user?: {
    name: string;
    role: string;
  };
}

const SuperadminActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiGet('/superadmin/activity-logs');
      const json = await res.json();
      setLogs(json.data || json);
    } catch (err) {
      console.error("Gagal ambil logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mx-auto max-w-270">
      <div className="mb-6">
        <h2 className="font-semibold text-black text-title-md2 dark:text-white">
          Activity Logs (Riwayat Aktivitas)
        </h2>
        <p className="text-sm text-gray-500">
          Memantau semua aktivitas penting yang terjadi di dalam sistem.
        </p>
      </div>

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left bg-gray-2 dark:bg-meta-4">
                <th className="px-4 py-4 font-bold text-black dark:text-white">Waktu</th>
                <th className="px-4 py-4 font-bold text-black dark:text-white">User</th>
                <th className="px-4 py-4 font-bold text-black dark:text-white">Aksi</th>
                <th className="px-4 py-4 font-bold text-black dark:text-white">Deskripsi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center">
                    <p className="mt-2 text-gray-500">Memuat riwayat aktivitas...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                   <td colSpan={4} className="py-5 text-center">Belum ada aktivitas tercatat.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark whitespace-nowrap text-sm">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                      <p className="text-sm font-medium text-black dark:text-white">
                        {log.user ? log.user.name : "Unknown User"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {log.user?.role || "-"}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                      <span className={`inline-flex rounded px-2 py-1 text-xs font-medium ${
                        log.action === 'MANUAL_STOCK_UPDATE' ? 'bg-amber-100 text-amber-700' :
                        log.action === 'LOGIN' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark text-sm">
                      {log.description}
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

export default SuperadminActivityLogs;