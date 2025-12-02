import { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import { initEcho } from "../../utils/echo";

type Notification = {
  id: number;
  type: string;
  data: any;
  is_read: boolean;
  created_at?: string;
  // optional computed fields for frontend usage
  message?: string;
  url?: string;
  actor?: { id: number; name?: string, email?: string };
  actor_gravatar?: string | null;
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

      const res = await api.apiGet('/notifications');
      if (!res.ok) {
        console.warn('Failed to fetch notifications', await res.text());
        setNotifications([]);
        setNotifying(false);
        return;
      }

      const payload = await res.json();
      const notifList = (payload.data ?? []) as Notification[];

      // compute messages & URLs based on type
      const computeEnhanced = (n: Notification) => {
        let message = '';
        let url = '/';
        switch (n.type) {
          case 'order_created':
            message = `Order ${n.data?.order_number ?? n.data?.order_id ?? ''} dibuat oleh ${n.actor?.name ?? 'user'}`;
            url = user.role === 'admin' ? '/admin/outbounds' : user.role === 'superadmin' ? '/superadmin' : '/my-orders';
            break;
          case 'inbound_created':
            message = `Inbound ${n.data?.quantity ?? ''} item (Cabang ${n.data?.branch_id ?? ''})`;
            url = user.role === 'admin' ? '/admin/stock' : '/superadmin/inbound';
            break;
          case 'report_created':
            message = `Laporan ${n.data?.report_type ?? 'harian'} (${n.data?.report_date ?? ''}) dibuat oleh ${n.actor?.name ?? 'user'}`;
            url = user.role === 'supervisor' ? '/supervisor/reports' : '/superadmin/inbound';
            break;
          case 'report_verified':
            message = `Laporan ${n.data?.report_type ?? ''} (${n.data?.report_date ?? ''}) telah diverifikasi oleh ${n.actor?.name ?? ''}.`;
            url = user.role === 'admin' ? '/admin/reports' : user.role === 'supervisor' ? '/supervisor/reports' : '/superadmin/activitylogs';
            break;
          case 'user_registered':
            message = `User baru terdaftar: ${n.data?.role ?? 'user'} (ID: ${n.data?.user_id ?? ''})`;
            url = '/superadmin/users';
            break;
          case 'product_created':
            message = `Produk baru: ${n.data?.name ?? n.data?.sku ?? ''}`;
            url = '/superadmin/products';
            break;
          case 'product_updated':
            message = `Produk diperbarui: ${n.data?.name ?? n.data?.sku ?? ''}`;
            url = '/superadmin/products';
            break;
          case 'product_deleted':
            message = `Produk dihapus: ${n.data?.name ?? n.data?.sku ?? ''}`;
            url = '/superadmin/products';
            break;
          case 'branch_created':
            message = `Cabang baru: ${n.data?.name ?? ''}`;
            url = '/superadmin/branches';
            break;
          case 'branch_updated':
            message = `Cabang diperbarui: ${n.data?.name ?? ''}`;
            url = '/superadmin/branches';
            break;
          case 'branch_deleted':
            message = `Cabang dihapus: ${n.data?.name ?? ''}`;
            url = '/superadmin/branches';
            break;
          case 'stock_manual_update':
            message = `Stok cabang diperbarui: Cabang ${n.data?.branch_id ?? ''} Produk ${n.data?.product_id ?? ''} (${n.data?.stock ?? ''})`;
            url = user.role === 'admin' ? '/admin/stock' : '/superadmin/branchstock';
            break;
          case 'outbound_shipped':
            message = `Order #${n.data?.order_id ?? ''} dikirim (Outbound ${n.data?.outbound_id ?? ''})`;
            url = '/my-orders';
            break;
          case 'order_confirmation':
            message = `Order ${n.data?.order_number ?? ''} berhasil dibuat.`;
            url = '/my-orders';
            break;
          case 'outbound_created':
            message = `Outbound tercatat (Qty: ${n.data?.quantity ?? ''})`;
            url = user.role === 'superadmin' ? '/superadmin' : '/admin/outbounds';
            break;
          default:
            message = `Aktivitas: ${n.type}`;
            url = user.role === 'admin' ? '/admin' : user.role === 'superadmin' ? '/superadmin' : '/';
        }
        return {...n, message, url };
      };

      const enhanced = notifList.map((n) => computeEnhanced(n));

      setNotifications(enhanced);
      setNotifying((payload.unread_count ?? enhanced.filter(n => !n.is_read).length) > 0);
    } catch (e) {
      console.error("Notif fetch error:", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    // Setup echo subscription for real-time notifications
    let echo: any = null;
    let channel: any = null;
    try {
      echo = initEcho(token);
      if (echo && user) {
        channel = echo.private(`App.User.${user.id}`);
        channel.listen('NotificationCreated', (e: any) => {
          const n = computeEnhanced(e.notification as Notification);
          setNotifications((prev) => [n, ...prev]);
          setNotifying(true);
        });
      }
    } catch (e) {
      console.warn('Echo setup failed', e);
    }
    return () => {
      clearInterval(interval);
      try {
        if (channel) channel.stopListening('.NotificationCreated');
      } catch (e) {
        // ignore
      }
    };
  }, [user]);

  const handleClickNotif = async (n: Notification) => {
    closeDropdown();
    try {
      await api.apiFetch(`/notifications/${n.id}/read`, { method: 'PATCH' });
      // update local state
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      setNotifying((prev) => prev === true ? (notifications.some(x => x.id !== n.id && !x.is_read)) : false);
    } catch (err) {
      console.warn('Failed to mark notification as read', err);
    }
    navigate(n.url ?? '/');
  };

  const handleMarkAllRead = async () => {
    try {
      await api.apiFetch(`/notifications/read-all`, { method: 'PATCH' });
      setNotifications((prev) => prev.map((x) => ({ ...x, is_read: true })));
      setNotifying(false);
    } catch (err) {
      console.warn('Failed to mark all notifications as read', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full h-11 w-11 hover:bg-gray-100"
        onClick={() => {
          toggleDropdown();
          setNotifying(false);
        }}
      >
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0.5 flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-orange-500 text-xs text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
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
          <div className="flex items-center gap-2">
            <button onClick={handleMarkAllRead} className="text-sm text-gray-500 hover:underline">Tandai semua dibaca</button>
            <button onClick={toggleDropdown}>✕</button>
          </div>
        </div>

        <ul className="flex flex-col h-[340px] overflow-y-auto">
          {notifications.length === 0 && (
            <p className="text-gray-500 text-center py-6">
              Tidak ada notifikasi.
            </p>
          )}

          {notifications.map((n) => (
            <li key={n.id}>
              <DropdownItem
                onItemClick={() => handleClickNotif(n)}
                className={`flex gap-3 border-b py-3 hover:bg-gray-100 ${n.is_read ? 'opacity-70' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div>
                    {n.actor_gravatar ? (
                      <img src={n.actor_gravatar} className="rounded-full h-8 w-8 object-cover" alt={n.actor?.name ?? "actor"} />
                    ) : (
                      <div className="flex items-center justify-center rounded-full h-8 w-8 bg-gray-100 text-xs font-semibold text-gray-700">
                        {n.actor?.name ? n.actor.name.charAt(0).toUpperCase() : '•'}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{n.message}</div>
                  {n.actor?.name && (
                    <div className="text-xs text-gray-500 mt-1">oleh {n.actor.name}</div>
                  )}
                </div>
                <span className="text-xs text-gray-400 ml-auto">{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</span>
              </DropdownItem>
            </li>
          ))}
        </ul>
        <div className="mt-2 pt-2 border-t text-center">
          <button onClick={() => { closeDropdown(); navigate('/notifications'); }} className="text-sm text-blue-500 hover:underline">Lihat semua notifikasi</button>
        </div>
      </Dropdown>
    </div>
  );
}
