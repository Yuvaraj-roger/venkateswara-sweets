export interface Product { id: number; name: string; description?: string; price: number; category: string; imageUrl?: string; available: boolean }
export interface OrderItem { productId: number; name: string; price: number; quantity: number }
export type OrderStatus = 'PLACED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
export interface Order { id: number; customerName: string; phone: string; address: string; note?: string; total: number; status: OrderStatus; createdAt: string; items: OrderItem[] }
export interface Session { token: string; name: string; email: string; role: 'ADMIN' | 'CUSTOMER' }

const KEY = 'sweets_session';
export const getSession = (): Session | null => {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; }
};
export const saveSession = (s: Session | null) => {
  if (s) localStorage.setItem(KEY, JSON.stringify(s)); else localStorage.removeItem(KEY);
};

export async function api<T>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const s = getSession();
  let res: Response;
  try {
    res = await fetch('/api' + path, {
      method: opts.method ?? 'GET',
      headers: { 'Content-Type': 'application/json', ...(s ? { Authorization: `Bearer ${s.token}` } : {}) },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new Error('Server-oda connect aagala. Backend run aagudha-nu check pannunga.');
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && s) { saveSession(null); window.location.href = '/login'; }
    throw new Error(data?.message || 'Something went wrong. Please try again.');
  }
  return data as T;
}

export const money = (n: number) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
