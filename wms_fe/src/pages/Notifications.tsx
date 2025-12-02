import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface NotificationActor {
  id: number;
  name: string;
  email: string;
}

interface Notification {
  id: number;
  user_id: number;
  actor_id: number | null;
  type: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  actor?: NotificationActor;
  actor_gravatar?: string;
  message?: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await api.apiGet('/notifications');
      if (res.ok) {
        const payload = await res.json();
        setNotifications(payload.data ?? []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const markAsRead = async (id: number) => {
    try {
      await api.apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.warn(e);
    }
  };

  const markAsUnread = async (id: number) => {
    try {
      await api.apiFetch(`/notifications/${id}/unread`, { method: 'PATCH' });
      setNotifications((prev) => prev.map(n => n.id === id ? { ...n, is_read: false } : n));
    } catch (e) {
      console.warn(e);
    }
  };

  const markAllRead = async () => {
    try {
      await api.apiFetch(`/notifications/read-all`, { method: 'PATCH' });
      setNotifications((prev) => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Notifikasi</h1>
        <div className="flex gap-2">
          <button className="text-sm px-3 py-1 bg-blue-500 text-white rounded" onClick={markAllRead}>Tandai semua dibaca</button>
        </div>
      </div>
      {loading && <p>Memuat...</p>}
      {!loading && notifications.length === 0 && <p>Tidak ada notifikasi.</p>}
      <ul className="space-y-2">
        {notifications.map((n) => (
          <li key={n.id} className={`p-3 border rounded ${n.is_read ? 'bg-white' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <div>
                {n.actor_gravatar ? (
                  <img src={n.actor_gravatar} className="rounded-full h-8 w-8 object-cover" alt={n.actor?.name ?? ''} />
                ) : (
                  <div className="rounded-full h-8 w-8 bg-gray-200 flex items-center justify-center">{n.actor?.name ? n.actor.name.charAt(0) : '•'}</div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{n.message ?? n.type}</div>
                <div className="text-xs text-gray-500">{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</div>
              </div>
              <div className="flex gap-2">
                {n.is_read ? (
                  <button className="text-sm text-blue-500" onClick={() => markAsUnread(n.id)}>Unread</button>
                ) : (
                  <button className="text-sm text-gray-500" onClick={() => markAsRead(n.id)}>Mark read</button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
