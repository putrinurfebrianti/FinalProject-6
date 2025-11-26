import { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

type Notification = {
  id: string;
  type: "outbound" | "report";
  message: string;
  url: string;
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { user, token } = useAuth();
  const navigate = useNavigate();

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const fetchNotifications = async () => {
    try {
      if (!token || !user) return;

      let outboundURL = "";
      let reportURL = "";
      let redirectURL = "";

      // =====================================
      // ROLE BASED API SETUP
      // =====================================

      if (user.role === "admin" || user.role === "superadmin") {
        outboundURL = "http://127.0.0.1:8000/api/outbounds";
        reportURL = "http://127.0.0.1:8000/api/admin/reports";
        redirectURL = "/admin";
      }

      if (user.role === "supervisor") {
        // Kalau supervisor punya API sendiri → pakai ini
        outboundURL = "http://127.0.0.1:8000/api/supervisor/outbounds";
        reportURL = "http://127.0.0.1:8000/api/supervisor/reports";
        redirectURL = "/supervisor";

        // Kalau API supervisor belum dibuat → aktifkan fallback berikut:
        // outboundURL = "http://127.0.0.1:8000/api/outbounds";
        // reportURL = "http://127.0.0.1:8000/api/admin/reports";
      }

      if (user.role === "user") {
        outboundURL = "http://127.0.0.1:8000/api/user/outbounds";
        reportURL = "http://127.0.0.1:8000/api/user/reports";
        redirectURL = "/";
      }

      if (!outboundURL || !reportURL) return;

      const [outboundRes, reportRes] = await Promise.all([
        fetch(outboundURL, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(reportURL, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      let outboundData: any[] = [];
      let reportData: any[] = [];

      if (outboundRes.ok) outboundData = (await outboundRes.json()).data ?? [];
      if (reportRes.ok) reportData = (await reportRes.json()).data ?? [];

      const notifList: Notification[] = [];

      // Outbound notifications
      outboundData.forEach((o) => {
        notifList.push({
          id: `out-${o.id}`,
          type: "outbound",
          message:
            o.status === "pending"
              ? `Invoice ${o.invoice_no} masih pending.`
              : `Invoice ${o.invoice_no} telah diverifikasi.`,
          url: `${redirectURL}/outbounds`,
        });
      });

      // Report notifications
      reportData.forEach((r) => {
        const type = r.report_type === "harian" ? "Harian" : "Bulanan";

        notifList.push({
          id: `rep-${r.id}`,
          type: "report",
          message: r.is_verified
            ? `Laporan ${type} ${r.report_date} telah diverifikasi.`
            : `Laporan ${type} ${r.report_date} menunggu verifikasi.`,
          url: `${redirectURL}/reports`,
        });
      });

      setNotifications(notifList);
      setNotifying(notifList.length > 0);
    } catch (e) {
      console.error("Notif fetch error:", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleClickNotif = (url: string) => {
    closeDropdown();
    navigate(url);
  };

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full h-11 w-11 hover:bg-gray-100"
        onClick={() => {
          toggleDropdown();
          setNotifying(false);
        }}
      >
        {notifying && (
          <span className="absolute right-0 top-0.5 h-2.5 w-2.5 rounded-full bg-orange-500">
            <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
          </span>
        )}

        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2C7.2 2 5 4.2 5 7v4.3L3.7 13v1h12.6v-1l-1.3-1.7V7c0-2.8-2.2-5-5-5zm1 14H9c0 .6.4 1 1 1s1-.4 1-1z" />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] w-[90vw] max-w-sm rounded-2xl border bg-white shadow-xl p-4"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b">
          <h5 className="text-lg font-semibold">Notifikasi</h5>
          <button onClick={toggleDropdown}>✕</button>
        </div>

        <ul className="flex flex-col h-[380px] overflow-y-auto">
          {notifications.length === 0 && (
            <p className="text-gray-500 text-center py-6">
              Tidak ada notifikasi.
            </p>
          )}

          {notifications.map((n) => (
            <li key={n.id}>
              <DropdownItem
                onItemClick={() => handleClickNotif(n.url)}
                className="flex gap-3 border-b py-3 hover:bg-gray-100"
              >
                <span className="block mt-1 text-sm font-medium">{n.message}</span>
              </DropdownItem>
            </li>
          ))}
        </ul>
      </Dropdown>
    </div>
  );
}
