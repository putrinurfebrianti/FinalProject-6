import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function AdminReports() {
  const { token } = useAuth();

  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchReports = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/admin/reports", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const json = await res.json();
      console.log("DATA REPORTS:", json.data);

      setReports(json.data || []);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const generateDaily = async () => {
    setGenerating(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/admin/reports/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (res.status === 201) {
        alert("Laporan harian berhasil dibuat!");
        fetchReports(); // ⬅ refresh otomatis
      } else if (res.status === 409) {
        alert("Laporan hari ini sudah pernah dibuat!");
      } else {
        alert("Gagal membuat laporan.");
      }
    } catch (e) {
      console.error(e);
    }

    setGenerating(false);
  };

  useEffect(() => {
    if (token) fetchReports();
  }, [token]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Laporan Harian</h1>

        <button
          disabled={generating}
          onClick={generateDaily}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {generating ? "Generating..." : "Generate Laporan Harian"}
        </button>
      </div>

      {loading ? (
        <p>Memuat laporan...</p>
      ) : reports.length === 0 ? (
        <p>Belum ada laporan.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-left divide-y">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Tanggal Generate</th>
                <th className="px-4 py-2">Jenis</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>

            <tbody>
              {reports.map((item, index) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2">{index + 1}</td>

                  {/* sesuai backend → field: report_date */}
                  <td className="px-4 py-2">
                    {item.report_date || "-"}
                  </td>

                  <td className="px-4 py-2 capitalize">
                    {item.report_type}
                  </td>

                  {/* Verifikasi */}
                  <td className="px-4 py-2">
                    {item.is_verified ? (
                      <span className="px-2 py-1 text-white bg-green-600 rounded">
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-white bg-yellow-500 rounded">
                        Pending
                      </span>
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
