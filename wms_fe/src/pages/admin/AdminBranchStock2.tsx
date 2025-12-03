import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";

interface BranchStock {
  id: number;
  product_id: number;
  branch_id: number;
  stock: number;
  product?: {
    id: number;
    sku: string;
    name: string;
  };
}

const normalizeStocks = (data: unknown): BranchStock[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.stocks)) return data.stocks;
  if (Array.isArray(data?.data)) return data.data;
  if (data && typeof data === "object") return [data];
  return [];
};

export default function AdminBranchStock2() {
  const { token } = useAuth();

  const [stocks, setStocks] = useState<BranchStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewYear, setViewYear] = useState<number>(2025);
  const [viewMonth, setViewMonth] = useState<number>(10);

  const PUBLIC_HOLIDAYS: string[] = ["2025-11-12", "2025-11-25"];
  const isHolidayForDate = (date: Date) => PUBLIC_HOLIDAYS.includes(date.toISOString().split("T")[0]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const days = useMemo(
    () =>
      Array.from({ length: daysInMonth }).map((_, idx) => {
        const date = new Date(viewYear, viewMonth, idx + 1);
        const dow = date.getDay();
        return {
          day: idx + 1,
          date,
          isWeekend: dow === 0 || dow === 6,
          isHoliday: isHolidayForDate(date),
        };
      }),
    [viewYear, viewMonth, daysInMonth, isHolidayForDate]
  );

  const [perDayOutbounds, setPerDayOutbounds] = useState<Record<number, Record<number, number>>>({});
  const [visibleRows, setVisibleRows] = useState<number>(100);

  useEffect(() => {
    const fetchBranchStock = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://127.0.0.1:8000/api/admin/stock", {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (!response.ok) throw new Error("Gagal mengambil data stok cabang.");
        const data = await response.json();
        const fixed = normalizeStocks(data);
        setStocks(fixed);

        try {
          const outRes = await fetch(`http://127.0.0.1:8000/api/admin/outbounds?month=${viewMonth + 1}&year=${viewYear}`, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          });
          const outJson = await outRes.json().catch(() => ({ data: [] }));
          const arr = Array.isArray(outJson) ? outJson : outJson.data ?? [];
          const map: Record<number, Record<number, number>> = {};
          arr.forEach((o: { invoice_date: string; product_id: number; quantity: number }) => {
            const d = new Date(o.invoice_date);
            if (d.getFullYear() !== viewYear || d.getMonth() !== viewMonth) return;
            const day = d.getDate();
            const pid = o.product_id ?? o.product?.id;
            if (!pid) return;
            if (!map[pid]) map[pid] = {};
            map[pid][day] = (map[pid][day] || 0) + (o.quantity || 0);
          });
          setPerDayOutbounds(map);
        } catch (err) {
          console.warn("Failed to fetch outbounds", err);
        }
      } catch (err) {
        setError("Terjadi error");
      } finally {
        setLoading(false);
      }
    };
    fetchBranchStock();
  }, [token, viewMonth, viewYear]);

  const totalsPerDay = useMemo(() => days.map((d) => Object.values(perDayOutbounds).reduce((s, rec) => s + (rec[d.day] || 0), 0)), [perDayOutbounds, days]);
  const totalsPerMonth = useMemo(() => totalsPerDay.reduce((s, q) => s + q, 0), [totalsPerDay]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-semibold">Stok Cabang Anda</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2 py-1 bg-white border border-gray-200 rounded dark:bg-gray-800">
            <button
              className="px-1 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                const m = viewMonth - 1;
                if (m < 0) {
                  setViewYear((y) => y - 1);
                  setViewMonth(11);
                } else setViewMonth(m);
              }}
              aria-label="Previous month"
            >
              ←
            </button>
            <div className="px-2 text-sm font-medium">
              {new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long' })}
            </div>
            <button
              className="px-1 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                const m = viewMonth + 1;
                if (m > 11) {
                  setViewYear((y) => y + 1);
                  setViewMonth(0);
                } else setViewMonth(m);
              }}
              aria-label="Next month"
            >
              →
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Tahun</label>
            <select
              value={viewYear}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setViewYear(parseInt(e.target.value, 10))}
              className="rounded border border-gray-300 px-2 py-1 text-sm min-w-[90px]"
            >
              {Array.from({ length: 5 }).map((_, i) => {
                const y = 2023 + i;
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                );
              })}
            </select>
          </div>

          <button onClick={() => setVisibleRows(100)} className="px-3 py-1 text-sm bg-gray-100 rounded">
            Reset rows
          </button>
        </div>
      </div>

      {loading && <p>Memuat data stok...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && stocks.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-gray-300 rounded-lg shadow-md">
            <thead>
              <tr className="font-semibold text-center text-black">
                <th className="px-3 py-2 border border-gray-300">NO.</th>
                <th className="px-3 py-2 border border-gray-300">SKU</th>
                <th className="px-3 py-2 border border-gray-300">DESKRIPSI JENIS</th>
                <th className="px-3 py-2 border border-gray-300">LOT</th>
                <th className="px-3 py-2 border border-gray-300">STOCK AWAL</th>
                {days.map((d) => (
                  <th key={d.day} className={`border border-gray-300 px-3 py-2 text-sm ${d.isHoliday ? "bg-red-300" : d.isWeekend ? "bg-red-200" : "bg-green-200"}`}>
                    {d.day}
                  </th>
                ))}
                <th className="px-3 py-2 text-sm border border-gray-300">Total</th>
                <th className="px-3 py-2 text-sm border border-gray-300">Sisa Stok</th>
              </tr>
            </thead>
            <tbody>
              {stocks.slice(0, visibleRows).map((item, index) => {
                const palette = ["#FFFBEC", "#EEF9FF", "#F0FFF4", "#FFF0F6", "#FFF7ED"];
                const rowColor = palette[index % palette.length];
                const pid = item.product?.id ?? item.product_id;
                const total = Object.values(perDayOutbounds[pid] ?? {}).reduce((s, q) => s + q, 0);
                const remaining = Math.max(0, item.stock - total);
                return (
                  <tr key={item.id} className="border border-gray-300" style={{ background: rowColor }}>
                    <td className="px-3 py-2 text-center border border-gray-300">{index + 1}</td>
                    <td className="px-3 py-2 text-center border border-gray-300">{item.product?.sku}</td>
                    <td className="px-3 py-2 border border-gray-300">{item.product?.name}</td>
                    <td className="px-3 py-2 text-center border border-gray-300">LOT-XXXX</td>
                    <td className="px-3 py-2 text-center border border-gray-300">{item.stock}</td>
                    {days.map((d) => {
                      const dayNum = d.day;
                      const qty = perDayOutbounds[pid]?.[dayNum] ?? 0;
                      const cellStyle: React.CSSProperties = { background: qty > 0 ? "#D5E8FF" : rowColor, color: qty > 0 ? "#0b3d91" : "#444" };
                      return (
                        <td key={dayNum} className="px-3 py-2 font-semibold text-center border border-gray-300" style={cellStyle}>
                          {qty}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-sm font-semibold text-center border border-gray-300">{total}</td>
                    <td className="px-3 py-2 text-sm font-semibold text-center border border-gray-300">{remaining}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="text-sm font-semibold bg-gray-100">
                <td className="px-3 py-2 text-center border border-gray-300" colSpan={5}>
                  Total (per hari)
                </td>
                {days.map((d) => (
                  <td key={d.day} className="px-3 py-2 font-semibold text-center border border-gray-300">
                    {totalsPerDay[d.day - 1] || 0}
                  </td>
                ))}
                <td className="px-3 py-2 font-semibold text-center border border-gray-300">{totalsPerMonth}</td>
                <td className="px-3 py-2 font-semibold text-center border border-gray-300">-</td>
              </tr>
            </tfoot>
          </table>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-green-200 rounded" /> Weekday
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-red-200 rounded" /> Weekend
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-red-300 rounded" /> Holiday
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded" style={{ background: "#D5E8FF" }} /> Outbound &gt; 0
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded" style={{ background: "#FFFBEC" }} /> Product color rows
              </div>
            </div>
            <div>
              {stocks.length > visibleRows && (
                <button onClick={() => setVisibleRows((v) => v + 100)} className="px-3 py-1 text-white bg-blue-500 rounded">
                  Load more
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {!loading && !error && stocks.length === 0 && <p>Tidak ada data stok untuk cabang ini.</p>}
    </div>
  );
}
