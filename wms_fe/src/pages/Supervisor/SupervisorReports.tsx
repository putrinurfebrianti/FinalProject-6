import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";

interface Report {
  id: number;
  report_type: string;
  report_date: string;
  branch_id: number;
  generated_by_id: number;
  is_verified: boolean;
  verification_date: string | null;
  verified_by_id: number | null;
}

export default function SupervisorReports() {
  const { token } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/supervisor/reports", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Sesi Anda telah habis. Silakan login kembali.");
        } else {
          throw new Error("Gagal mengambil data laporan.");
        }
        return;
      }

      const data = await response.json();
      setReports(data.data || data);
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi error yang tidak diketahui.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleVerify = async (reportId: number) => {
    if (!token) return;

    if (!window.confirm("Apakah Anda yakin ingin memverifikasi laporan ini?")) {
      return;
    }
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/supervisor/reports/${reportId}/verify`, {
        method: "POST", 
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal memverifikasi laporan.");
      }

      alert("Laporan berhasil diverifikasi!"); 
      
      fetchReports(); 

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        alert(`Error: ${err.message}`);
      } else {
         alert("Terjadi error yang tidak diketahui.");
      }
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading data laporan...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="mb-6 text-2xl font-semibold">Verifikasi Laporan Cabang</h1>

      {reports.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-lg shadow dark:bg-gray-800">
          <p>Tidak ada laporan yang menunggu verifikasi.</p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">ID Laporan</th>
                <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Tanggal Laporan</th>
                <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Tipe</th>
                <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Status</th>
                <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">#{report.id}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{report.report_date}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{report.report_type}</td>
                  <td className="px-6 py-4">
                    {report.is_verified ? (
                      <span className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                        Verified
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {!report.is_verified && (
                      <button
                        onClick={() => handleVerify(report.id)}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Verifikasi
                      </button>
                    )}
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}