import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import api from './api';

let echo: any = null;

export function initEcho(token?: string) {
  if (typeof window !== 'undefined' && (window as any).Pusher === undefined) {
    (window as any).Pusher = Pusher;
  }

  if (!echo) {
    const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY ?? '';
    const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER ?? '';

    try {
      echo = new Echo({
        broadcaster: 'pusher',
        key: pusherKey,
        cluster: pusherCluster,
        forceTLS: false,
        authEndpoint: `${api.API_BASE}/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${token ?? (sessionStorage.getItem('token') ?? localStorage.getItem('token'))}`,
            Accept: 'application/json',
          },
        },
      });
    } catch (e) {
      console.warn('Failed to init Echo', e);
      echo = null;
    }
  }
  return echo;
}

export default { initEcho };
